import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";

import { buildDownloadBasename } from "@/lib/utils";
import { cookieName, isSessionValid } from "@/lib/auth";
import { proxyFetch } from "@/lib/proxy-fetch";

type ZipFileInput = {
  url: string;
  type: "image" | "video";
  index: number;
};

function isValidHttpsUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function getExtension(type: "image" | "video", contentType: string | null) {
  if (type === "video") return "mp4";
  if (contentType?.includes("png")) return "png";
  if (contentType?.includes("webp")) return "webp";
  return "jpg";
}

export async function POST(request: NextRequest) {
  try {
    if (!isSessionValid(request.cookies.get(cookieName)?.value)) {
      return NextResponse.json({ error: "unauthorized", message: "Login required" }, { status: 401 });
    }
    const body = (await request.json()) as {
      files?: ZipFileInput[];
      shortcode?: string;
      basename?: string;
      username?: string;
      caption?: string;
    };

    const files = body.files ?? [];
    if (!files.length) {
      return NextResponse.json(
        { error: "missingFiles", message: "files are required" },
        { status: 400 }
      );
    }

    if (files.length > 20) {
      return NextResponse.json(
        { error: "tooManyFiles", message: "maximum of 20 files allowed" },
        { status: 400 }
      );
    }

    for (const file of files) {
      if (!file?.url || !isValidHttpsUrl(file.url)) {
        return NextResponse.json(
          { error: "invalidUrl", message: "all file urls must be https" },
          { status: 400 }
        );
      }
    }

    const basename =
      body.basename ||
      buildDownloadBasename(body.username, body.caption) ||
      (body.shortcode ? `instagram_${body.shortcode}` : "instagram_post");

    const zip = new JSZip();

    await Promise.all(
      files.map(async (file) => {
        const response = await proxyFetch(file.url);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch file ${file.index + 1}: ${response.statusText}`
          );
        }

        const contentType = response.headers.get("content-type");
        const extension = getExtension(file.type, contentType);
        const filename = `${basename}_${String(file.index + 1).padStart(2, "0")}.${extension}`;
        const buffer = Buffer.from(await response.arrayBuffer());
        zip.file(filename, buffer);
      })
    );

    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    const filename = `${basename}.zip`;

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(zipBuffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    console.error("ZIP download error:", error);
    const message = error instanceof Error ? error.message : "unknown error";
    return NextResponse.json(
      { error: "serverError", message },
      { status: 500 }
    );
  }
}
