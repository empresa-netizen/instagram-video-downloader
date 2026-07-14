import { cookieName, isSessionValid } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const hosts = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "instagram.com",
  "www.instagram.com",
  "m.instagram.com",
  "instagr.am",
]);

function authorize(request: Request) {
  const session = request.headers.get("cookie")?.match(new RegExp(`${cookieName}=([^;]+)`))?.[1];
  if (!isSessionValid(session)) throw new Error("Unauthorized");
}

function safeUrl(value: unknown) {
  if (typeof value !== "string" || value.length > 2048 || /\s/.test(value)) throw new Error("Invalid URL");
  const url = new URL(value);
  if (
    !hosts.has(url.hostname.toLowerCase()) ||
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname === "/"
  ) {
    throw new Error("Only public YouTube and Instagram URLs are supported");
  }
  return url.toString();
}

export async function POST(request: Request) {
  try {
    authorize(request);
    const url = safeUrl((await request.json()).url);
    const workerUrl = process.env.DOWNLOADER_WORKER_URL?.replace(/\/$/, "");
    const apiKey = process.env.DOWNLOADER_WORKER_API_KEY;

    if (!workerUrl || !apiKey) throw new Error("Downloader service is not configured");

    const upstream = await fetch(`${workerUrl}/v1/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
      body: JSON.stringify({ url }),
      cache: "no-store",
    });

    if (!upstream.ok || !upstream.body) {
      const payload = await upstream.json().catch(() => null) as { detail?: string } | null;
      throw new Error(payload?.detail || "The downloader could not retrieve this media");
    }

    return new Response(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/octet-stream",
        "Content-Disposition": upstream.headers.get("content-disposition") || 'attachment; filename="download"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Download failed";
    return Response.json({ error: message }, { status: message === "Unauthorized" ? 401 : 422 });
  }
}
