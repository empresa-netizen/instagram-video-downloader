"use client";

import React from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function InstagramForm(props: { className?: string }) {
  const [url, setUrl] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  function saveResponse(response: Response, blob: Blob) {
    const disposition = response.headers.get("content-disposition");
    const filename = disposition?.match(/filename="?([^";]+)"?/i)?.[1] || "mgteam-download";
    const fileUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(fileUrl);
  }

  async function downloadInstagram(value: string) {
    const parsed = new URL(value);
    const match = parsed.pathname.match(/^\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
    if (!match) throw new Error("Use um link público de post, Reel ou carrossel do Instagram.");

    const infoResponse = await fetch(`/api/instagram/p/${match[1]}`);
    const info = await infoResponse.json().catch(() => ({}));
    if (!infoResponse.ok) throw new Error(info.message || "Não foi possível ler esta publicação do Instagram.");
    const media = info?.data?.downloadable_media as Array<{ url: string; type: "image" | "video"; index: number }> | undefined;
    if (!media?.length) throw new Error("Nenhuma mídia disponível nesta publicação.");

    const meta = info.data.download_meta || {};
    if (media.length > 1) {
      const response = await fetch("/api/download-zip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: media, shortcode: match[1], basename: meta.basename, username: meta.username, caption: meta.caption }),
      });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).message || "Não foi possível criar o ZIP do carrossel.");
      saveResponse(response, await response.blob());
      return;
    }

    const item = media[0];
    const extension = item.type === "video" ? "mp4" : "jpg";
    const filename = `${meta.basename || `instagram_${match[1]}`}.${extension}`;
    const response = await fetch(`/api/download-proxy?url=${encodeURIComponent(item.url)}&filename=${encodeURIComponent(filename)}`);
    if (!response.ok) throw new Error((await response.json().catch(() => ({}))).message || "Não foi possível baixar a mídia.");
    saveResponse(response, await response.blob());
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const isInstagram = new URL(url).hostname.toLowerCase().includes("instagram") || new URL(url).hostname.toLowerCase() === "instagr.am";
      if (isInstagram) {
        await downloadInstagram(url);
        toast.success("Seu download está pronto.");
        return;
      }
      throw new Error("O YouTube precisa de um runtime com suporte a binários; a hospedagem compartilhada atual bloqueia o yt-dlp.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Download failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className={cn("w-full space-y-3", props.className)}>
      <Input value={url} onChange={(event) => setUrl(event.target.value)} type="url" required placeholder="Paste a public YouTube or Instagram URL" />
      <Button disabled={busy} type="submit" className="w-full rounded-none bg-[#24332D] px-6 font-extrabold tracking-[0.08em] text-[#F6F5F0] uppercase hover:bg-[#314039]">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {busy ? "Preparing download…" : "Download media"}
      </Button>
      <p className="text-muted-foreground text-center text-xs">Baixa posts, Reels, fotos e carrosséis públicos do Instagram. Carrosséis são entregues em ZIP.</p>
    </form>
  );
}
