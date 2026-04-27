import { NextRequest, NextResponse } from "next/server";
import { stat, readFile } from "fs/promises";
import { join, extname } from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR || join(process.cwd(), "uploads");

const FALLBACK_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

function getContentType(filename: string): string {
  const ext = extname(filename).toLowerCase();
  return FALLBACK_TYPES[ext] || "application/octet-stream";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params;
    const filename = segments.join("/");
    
    // Security: prevent path traversal
    if (filename.includes("..") || filename.includes("\0") || filename.startsWith("/")) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const filepath = join(UPLOAD_DIR, filename);
    
    try {
      const fileStat = await stat(filepath);
      if (!fileStat.isFile()) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    } catch {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const buffer = await readFile(filepath);
    const contentType = getContentType(filename);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
