import crypto from "node:crypto";
import { createReadStream, promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import ffmpegPath from "ffmpeg-static";
import YTDlpWrapModule from "yt-dlp-wrap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const hosts = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "instagram.com", "www.instagram.com", "m.instagram.com", "instagr.am"]);
const YTDlpWrap = (YTDlpWrapModule as unknown as { default: typeof YTDlpWrapModule }).default;

function authorize(value: string | null) {
  const expected = process.env.DOWNLOADER_API_KEY;
  if (!expected || !value || value.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(value), Buffer.from(expected))) throw new Error("Unauthorized");
}

function safeUrl(value: unknown) {
  if (typeof value !== "string" || value.length > 2048 || /\s/.test(value)) throw new Error("Invalid URL");
  const url = new URL(value);
  if (!hosts.has(url.hostname.toLowerCase()) || !["http:", "https:"].includes(url.protocol) || url.username || url.password || url.pathname === "/") throw new Error("Only public YouTube and Instagram URLs are supported");
  return url.toString();
}

export async function POST(request: Request) {
  let directory: string | undefined;
  try {
    authorize(request.headers.get("X-API-Key"));
    const url = safeUrl((await request.json()).url);
    directory = await fs.mkdtemp(path.join(os.tmpdir(), "mgteam-download-"));
    const output = path.join(directory, "%(id)s.%(ext)s");
    const binary = path.join(process.cwd(), "bin", "yt-dlp");
    const args = [url, "--no-playlist", "--no-part", "--restrict-filenames", "-f", "bv*+ba/b", "--merge-output-format", "mp4", "--ffmpeg-location", ffmpegPath || "", "-o", output, "--no-warnings", "--quiet"];
    if (process.env.DATAIMPULSE_PROXY_URL) args.push("--proxy", process.env.DATAIMPULSE_PROXY_URL);
    await new YTDlpWrap(binary).execPromise(args);
    const name = (await fs.readdir(directory)).find((file) => /\.(mp4|mkv|webm|mov)$/i.test(file));
    if (!name) throw new Error("No media file produced");
    const file = path.join(directory, name);
    const stream = Readable.toWeb(createReadStream(file)) as ReadableStream;
    return new Response(stream, { headers: { "Content-Type": "application/octet-stream", "Content-Disposition": `attachment; filename="${name}"` } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Download failed";
    return Response.json({ error: message }, { status: message === "Unauthorized" ? 401 : 422 });
  }
}
