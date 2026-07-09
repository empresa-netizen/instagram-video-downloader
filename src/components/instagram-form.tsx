"use client";

import React from "react";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormItem,
  FormLabel,
  FormField,
  FormControl,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Download, Loader2, X } from "lucide-react";

import { cn, getPostShortcode, isShortcodePresent, buildDownloadBasename } from "@/lib/utils";
import { useGetInstagramPostMutation } from "@/features/react-query/mutations/instagram";
import { HTTP_CODE_ENUM } from "@/features/api/http-codes";

// 5 minutes
const CACHE_TIME = 5 * 60 * 1000;

type DownloadFile = {
  url: string;
  type: "image" | "video";
  index: number;
};

type DownloadMeta = {
  username: string;
  caption: string;
  basename: string;
};

const useFormSchema = () => {
  const t = useTranslations("components.instagramForm.inputs");

  return z.object({
    url: z
      .string({ required_error: t("url.validation.required") })
      .trim()
      .min(1, {
        message: t("url.validation.required"),
      })
      .startsWith("https://www.instagram.com", t("url.validation.invalid"))
      .refine(
        (value) => {
          return isShortcodePresent(value);
        },
        { message: t("url.validation.invalid") }
      ),
  });
};

function triggerDownload(
  fileUrl: string,
  type: "image" | "video",
  basename: string,
  index?: number
) {
  // Ensure we are in a browser environment
  if (typeof window === "undefined") return;

  const extension = type === "image" ? "jpg" : "mp4";
  const suffix = typeof index === "number" ? `_${String(index + 1).padStart(2, "0")}` : "";
  const filename = `${basename}${suffix}.${extension}`;

  // Construct the URL to your proxy API route
  const proxyUrl = new URL("/api/download-proxy", window.location.origin); // Use relative path + origin
  proxyUrl.searchParams.append("url", fileUrl);
  proxyUrl.searchParams.append("filename", filename);

  const link = document.createElement("a");
  // Set href to your proxy route
  link.href = proxyUrl.toString();
  link.target = "_blank";

  // The 'download' attribute here is less critical because the proxy
  // sets the Content-Disposition header, but it can still be helpful
  // as a fallback or hint for the browser. Keep the desired filename.
  link.setAttribute("download", filename);

  // Append link to the body temporarily
  document.body.appendChild(link);

  // Programmatically click the link to trigger the download
  link.click();

  // Clean up and remove the link
  document.body.removeChild(link);
}

async function triggerZipDownload(
  files: DownloadFile[],
  meta: DownloadMeta,
  shortcode?: string
) {
  if (typeof window === "undefined") return;

  const response = await fetch("/api/download-zip", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      files,
      shortcode,
      basename: meta.basename,
      username: meta.username,
      caption: meta.caption,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create zip download");
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const filename = `${meta.basename}.zip`;

  const link = document.createElement("a");
  link.href = objectUrl;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}

async function triggerDownloads(
  files: DownloadFile[],
  meta: DownloadMeta,
  shortcode?: string
) {
  if (files.length > 1) {
    await triggerZipDownload(files, meta, shortcode);
    return;
  }

  const [file] = files;
  if (file) {
    triggerDownload(file.url, file.type, meta.basename, file.index);
  }
}

type CachedUrl = {
  files?: DownloadFile[];
  meta?: DownloadMeta;
  expiresAt: number;
  invalid?: {
    messageKey: string;
  };
};

export function InstagramForm(props: { className?: string }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const cachedUrls = React.useRef(new Map<string, CachedUrl>());

  const t = useTranslations("components.instagramForm");

  const {
    isError,
    isPending,
    mutateAsync: getInstagramPost,
  } = useGetInstagramPostMutation();

  const formSchema = useFormSchema();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });

  const errorMessage = form.formState.errors.url?.message;

  const isDisabled = isPending || !form.formState.isDirty;
  const isShowClearButton = form.watch("url").length > 0;

  function getSuccessToast(count: number) {
    if (count > 1 && t.has("toasts.successCarousel")) {
      return t("toasts.successCarousel", { count });
    }
    if (count > 1) {
      return `Downloading ${count} files as ZIP...`;
    }
    return t("toasts.success");
  }

  function clearUrlField() {
    form.setValue("url", "");
    form.clearErrors("url");
    inputRef.current?.focus();
  }

  function setCachedUrl(
    shortcode: string,
    files?: CachedUrl["files"],
    meta?: DownloadMeta,
    invalid?: CachedUrl["invalid"]
  ) {
    cachedUrls.current?.set(shortcode, {
      files,
      meta,
      expiresAt: Date.now() + CACHE_TIME,
      invalid,
    });
  }

  function getCachedUrl(shortcode: string) {
    const cachedUrl = cachedUrls.current?.get(shortcode);

    if (!cachedUrl) {
      return null;
    }

    if (cachedUrl.expiresAt < Date.now()) {
      cachedUrls.current.delete(shortcode);
      return null;
    }

    return cachedUrl;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isError) {
      toast.dismiss("toast-error");
    }

    const shortcode = getPostShortcode(values.url);

    if (!shortcode) {
      form.setError("url", { message: t("inputs.url.validation.invalid") });
      return;
    }

    const cachedUrl = getCachedUrl(shortcode);
    if (cachedUrl?.invalid) {
      form.setError("url", { message: t(cachedUrl.invalid.messageKey) });
      return;
    }

    if (cachedUrl?.files?.length && cachedUrl.meta) {
      await triggerDownloads(cachedUrl.files, cachedUrl.meta, shortcode);
      toast.success(getSuccessToast(cachedUrl.files.length), {
        id: "toast-success",
        position: "top-center",
        duration: 2000,
      });
      return;
    }

    try {
      const { data, status } = await getInstagramPost({ shortcode });

      if (status === HTTP_CODE_ENUM.OK) {
        const media = data.data.xdt_shortcode_media;
        const files =
          data.data.downloadable_media?.length
            ? data.data.downloadable_media
            : media.video_url
              ? [
                  {
                    url: media.video_url,
                    type: "video" as const,
                    index: 0,
                  },
                ]
              : media.display_url
                ? [
                    {
                      url: media.display_url,
                      type: "image" as const,
                      index: 0,
                    },
                  ]
                : [];

        const username =
          data.data.download_meta?.username || media.owner?.username || "";
        const caption =
          data.data.download_meta?.caption ||
          media.edge_media_to_caption?.edges?.[0]?.node?.text ||
          "";
        const meta: DownloadMeta = {
          username,
          caption,
          basename:
            data.data.download_meta?.basename ||
            buildDownloadBasename(username, caption),
        };

        if (files.length) {
          await triggerDownloads(files, meta, shortcode);
          setCachedUrl(shortcode, files, meta);
          toast.success(getSuccessToast(files.length), {
            id: "toast-success",
            position: "top-center",
            duration: 2000,
          });
        } else {
          throw new Error("Media URL not found");
        }
      } else if (
        status === HTTP_CODE_ENUM.NOT_FOUND ||
        status === HTTP_CODE_ENUM.BAD_REQUEST ||
        status === HTTP_CODE_ENUM.TOO_MANY_REQUESTS ||
        status === HTTP_CODE_ENUM.INTERNAL_SERVER_ERROR
      ) {
        const errorMessageKey = `serverErrors.${data.error}`;
        form.setError("url", { message: t(errorMessageKey) });
        if (
          status === HTTP_CODE_ENUM.BAD_REQUEST ||
          status === HTTP_CODE_ENUM.NOT_FOUND
        ) {
          setCachedUrl(shortcode, undefined, undefined, {
            messageKey: errorMessageKey,
          });
        }
      } else {
        throw new Error("Failed to fetch media");
      }
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.error"), {
        dismissible: true,
        id: "toast-error",
        position: "top-center",
      });
    }
  }

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className={cn("w-full space-y-2", props.className)}>
      {errorMessage ? (
        <p className="h-4 text-sm text-red-500 sm:text-start">{errorMessage}</p>
      ) : (
        <div className="h-4"></div>
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col gap-2 sm:flex-row sm:items-end"
        >
          <FormField
            control={form.control}
            name="url"
            rules={{ required: true }}
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="sr-only">
                  {t("inputs.url.label")}
                </FormLabel>
                <FormControl>
                  <div className="relative w-full">
                    <Input
                      {...field}
                      type="url"
                      ref={inputRef}
                      minLength={1}
                      maxLength={255}
                      placeholder={t("inputs.url.placeholder")}
                    />
                    {isShowClearButton && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={clearUrlField}
                        className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 cursor-pointer"
                      >
                        <X className="text-red-500" />
                      </Button>
                    )}
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            disabled={isDisabled}
            type="submit"
            className="bg-teal-500 text-white hover:bg-teal-600 dark:bg-teal-700 dark:hover:bg-teal-600"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {t("submit")}
          </Button>
        </form>
      </Form>
      <p className="text-muted-foreground text-center text-xs">{t("hint")}</p>
    </div>
  );
}
