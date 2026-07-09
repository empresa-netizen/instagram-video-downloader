import { NextRequest, NextResponse } from "next/server";

import {
  getInstagramPostGraphQL,
  mapWebInfoToLegacyGraphQL,
} from "./utils";
import { buildDownloadBasename } from "@/lib/utils";

interface RouteContext {
  params: Promise<{
    shortcode: string;
  }>;
}

type WebInfoResponse = {
  data?: {
    xdt_api__v1__media__shortcode__web_info?: {
      items?: Array<Record<string, unknown>>;
    };
    xdt_shortcode_media?: Record<string, unknown> | null;
  } | null;
  errors?: Array<{ message?: string }>;
  status?: string;
};

export async function GET(_: NextRequest, context: RouteContext) {
  const { shortcode } = await context.params;

  if (!shortcode) {
    return NextResponse.json(
      { error: "noShortcode", message: "shortcode is required" },
      { status: 400 }
    );
  }

  try {
    const response = await getInstagramPostGraphQL({
      shortcode,
    });

    const status = response.status;
    const contentType = response.headers.get("content-type") ?? "";

    if (status === 200) {
      if (!contentType.includes("json") && !contentType.includes("javascript")) {
        return NextResponse.json(
          {
            error: "tooManyRequests",
            message: "instagram blocked the request, try again later",
          },
          { status: 429 }
        );
      }

      const payload = (await response.json()) as WebInfoResponse;

      if (!payload?.data) {
        return NextResponse.json(
          {
            error: "tooManyRequests",
            message: "instagram returned empty data, try again later",
          },
          { status: 429 }
        );
      }

      const webInfoItem =
        payload.data.xdt_api__v1__media__shortcode__web_info?.items?.[0];

      if (webInfoItem) {
        const mapped = mapWebInfoToLegacyGraphQL(webInfoItem as never);
        const downloadable = mapped.data.downloadable_media ?? [];

        if (!downloadable.length) {
          return NextResponse.json(
            { error: "notFound", message: "no downloadable media found" },
            { status: 404 }
          );
        }

        // Frontend expects { data: { xdt_shortcode_media, downloadable_media } }
        return NextResponse.json({ data: mapped.data }, { status: 200 });
      }

      // Legacy shape fallback (older Instagram responses)
      if (!payload.data.xdt_shortcode_media) {
        return NextResponse.json(
          { error: "notFound", message: "post not found" },
          { status: 404 }
        );
      }

      const legacyMedia = payload.data.xdt_shortcode_media as {
        is_video?: boolean;
        video_url?: string;
        display_url?: string;
        owner?: { username?: string };
        edge_media_to_caption?: {
          edges?: Array<{ node?: { text?: string } }>;
        };
      };

      const legacyDownloadable = legacyMedia.is_video && legacyMedia.video_url
        ? [{ url: legacyMedia.video_url, type: "video" as const, index: 0 }]
        : legacyMedia.display_url
          ? [{ url: legacyMedia.display_url, type: "image" as const, index: 0 }]
          : [];

      if (!legacyDownloadable.length) {
        return NextResponse.json(
          { error: "notFound", message: "no downloadable media found" },
          { status: 404 }
        );
      }

      const username = legacyMedia.owner?.username ?? "";
      const caption =
        legacyMedia.edge_media_to_caption?.edges?.[0]?.node?.text ?? "";

      return NextResponse.json(
        {
          data: {
            ...payload.data,
            downloadable_media: legacyDownloadable,
            download_meta: {
              username,
              caption,
              basename: buildDownloadBasename(username, caption),
            },
          },
        },
        { status: 200 }
      );
    }

    if (status === 404) {
      return NextResponse.json(
        { error: "notFound", message: "post not found" },
        { status: 404 }
      );
    }

    if (status === 429 || status === 401 || status === 403) {
      return NextResponse.json(
        {
          error: "tooManyRequests",
          message: "too many requests, try again later",
        },
        { status: 429 }
      );
    }

    throw new Error("Failed to fetch post data");
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : "unknown error";
    return NextResponse.json(
      { error: "serverError", message },
      { status: 500 }
    );
  }
}
