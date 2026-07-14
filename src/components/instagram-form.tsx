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

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await fetch("/api/private-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Unable to start the download.");
      }
      const blob = await response.blob();
      const fileUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = "mgteam-download.mp4";
      link.click();
      URL.revokeObjectURL(fileUrl);
      toast.success("Your download is ready.");
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
        {busy ? "Preparing download…" : "Download video"}
      </Button>
      <p className="text-muted-foreground text-center text-xs">Private downloader for public YouTube and Instagram media.</p>
    </form>
  );
}
