// app/api/download-proxy/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fileUrl = searchParams.get("url");
  const filename = searchParams.get("filename") || "gram-grabberz-video.mp4"; // Default filename

  if (!fileUrl) {
    return NextResponse.json(
      { error: "missingUrl", message: "url is required" },
      { status: 400 }
    );
  }

  try {
    // Validate the URL slightly (optional but recommended)
    if (!fileUrl.startsWith("https://")) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Fetch the media from the external URL
    const videoResponse = await fetch(fileUrl);

    if (!videoResponse.ok) {
      throw new Error(`Failed to fetch media: ${videoResponse.statusText}`);
    }

    // Get the media data as a ReadableStream
    const videoStream = videoResponse.body;

    if (!videoStream) {
      throw new Error("Media stream is not available");
    }

    // Set headers to force download
    const headers = new Headers();
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    // Try to get Content-Type from original response, fallback by extension
    const fallbackType = filename.endsWith(".jpg") || filename.endsWith(".jpeg")
      ? "image/jpeg"
      : filename.endsWith(".png")
        ? "image/png"
        : filename.endsWith(".webp")
          ? "image/webp"
          : "video/mp4";
    headers.set(
      "Content-Type",
      videoResponse.headers.get("Content-Type") || fallbackType
    );
    // Optionally set Content-Length if available
    if (videoResponse.headers.get("Content-Length")) {
      headers.set(
        "Content-Length",
        videoResponse.headers.get("Content-Length")!
      );
    }

    // Return the stream response
    return new NextResponse(videoStream, {
      status: 200,
      headers: headers,
    });
  } catch (error: any) {
    console.error("Download proxy error:", error);
    return NextResponse.json(
      { error: "serverError", message: error.message },
      { status: 500 }
    );
  }
}
