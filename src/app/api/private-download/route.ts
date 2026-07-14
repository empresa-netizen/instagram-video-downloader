import { createReadStream, promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import ffmpegPath from "ffmpeg-static";
import JSZip from "jszip";
import YTDlpWrapImport from "yt-dlp-wrap";
import { cookieName, isSessionValid } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const hosts = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "instagram.com", "www.instagram.com", "m.instagram.com", "instagr.am"]);
const YTDlpWrap = (typeof YTDlpWrapImport === "function"
  ? YTDlpWrapImport
  : (YTDlpWrapImport as unknown as { default: typeof YTDlpWrapImport }).default) as unknown as new (binary: string) => {
  execPromise(args: string[]): Promise<void>;
};
const mediaExtensions = /\.(mp4|mkv|webm|mov|jpg|jpeg|png|webp|gif)$/i;

function authorize(request: Request) {
  const session = request.headers.get("cookie")?.match(new RegExp(`${cookieName}=([^;]+)`))?.[1];
  if (!isSessionValid(session)) throw new Error("Unauthorized");
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
    authorize(request);
    const url = safeUrl((await request.json()).url);
    directory = await fs.mkdtemp(path.join(os.tmpdir(), "mgteam-download-"));
    const output = path.join(directory, "%(playlist_index&{} - |)s%(id)s.%(ext)s");
    const binary = path.join(process.cwd(), "bin", "yt-dlp");
    // Shared hosting can restore uploaded binaries without their executable bit.
    await fs.chmod(binary, 0o755);
    const isInstagram = new URL(url).hostname.toLowerCase().includes("instagram") || new URL(url).hostname.toLowerCase() === "instagr.am";
    const args = [url, "--no-part", "--restrict-filenames", "--ffmpeg-location", ffmpegPath || "", "-o", output, "--no-warnings", "--quiet"];
    if (isInstagram) {
      // Instagram carousel posts are playlists: keeping the playlist downloads every slide.
      args.push("--yes-playlist");
    } else {
      args.push("--no-playlist", "-f", "bv*+ba/b", "--merge-output-format", "mp4");
    }
    if (process.env.DATAIMPULSE_PROXY_URL) args.push("--proxy", process.env.DATAIMPULSE_PROXY_URL);
    await new YTDlpWrap(binary).execPromise(args);
    const names = (await fs.readdir(directory)).filter((file) => mediaExtensions.test(file));
    if (!names.length) throw new Error("No media file produced");

    if (names.length > 1) {
      const zip = new JSZip();
      await Promise.all(names.map(async (name) => zip.file(name, await fs.readFile(path.join(directory!, name)))));
      const archive = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 6 } });
      return new Response(archive, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": 'attachment; filename="instagram-carousel.zip"',
          "Cache-Control": "no-store",
        },
      });
    }

    const name = names[0];
    const file = path.join(directory, name);
    const stream = Readable.toWeb(createReadStream(file)) as ReadableStream;
    return new Response(stream, { headers: { "Content-Type": "application/octet-stream", "Content-Disposition": `attachment; filename="${name}"`, "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Download failed";
    return Response.json({ error: message }, { status: message === "Unauthorized" ? 401 : 422 });
  }
}
