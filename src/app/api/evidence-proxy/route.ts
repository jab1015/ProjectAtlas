import { NextRequest, NextResponse } from "next/server";

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const ALLOWED_CONVEX_HOSTS = new Set(["agile-seahorse-379.convex.cloud", "agile-seahorse-379.convex.site"]);

export async function POST(request: NextRequest) {
  const uploadUrl = request.headers.get("x-convex-upload-url");
  if (!uploadUrl) return NextResponse.json({ error: "Missing upload target." }, { status: 400 });

  let target: URL;
  try {
    target = new URL(uploadUrl);
  } catch {
    return NextResponse.json({ error: "Invalid upload target." }, { status: 400 });
  }

  if (target.protocol !== "https:" || !ALLOWED_CONVEX_HOSTS.has(target.hostname)) {
    return NextResponse.json({ error: "Upload target is not allowed." }, { status: 400 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Files must be 25 MB or smaller." }, { status: 413 });
  }

  const body = await request.arrayBuffer();
  if (body.byteLength > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Files must be 25 MB or smaller." }, { status: 413 });
  }

  let response: Response;
  try {
    response = await fetch(target, {
      method: "POST",
      headers: {
        "Content-Type": request.headers.get("content-type") ?? "application/octet-stream",
        "Content-Length": String(body.byteLength),
      },
      body,
      cache: "no-store",
    });
  } catch (error) {
    console.error("Convex evidence upload proxy failed", error);
    return NextResponse.json({ error: "The server could not reach the Convex upload service." }, { status: 502 });
  }


  const responseBody = await response.arrayBuffer();
  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
    },
  });
}
