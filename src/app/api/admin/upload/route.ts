import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Maximum output file size (default 300KB, configurable via query param)
const DEFAULT_MAX_KB = 300;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Hanya file gambar yang diperbolehkan" }, { status: 400 });
    }

    const maxKB = parseInt(new URL(req.url).searchParams.get("maxKB") || String(DEFAULT_MAX_KB));
    const maxBytes = maxKB * 1024;

    const bytes = await file.arrayBuffer();
    const originalSize = bytes.byteLength;

    // Process image with sharp
    const sharp = (await import("sharp")).default;

    let processedBuffer: Buffer;

    // Read original image
    const originalImage = sharp(Buffer.from(bytes));

    // Get metadata
    const metadata = await originalImage.metadata();
    const width = metadata.width || 1200;
    const height = metadata.height || 900;

    // Resize if too large (max 1600px on longest side)
    let pipeline = sharp(Buffer.from(bytes));
    if (width > 1600 || height > 1600) {
      pipeline = pipeline.resize(1600, 1600, { fit: "inside", withoutEnlargement: true });
    }

    // Try to compress to target size
    // Start with quality 80 and reduce if needed
    let quality = 80;
    processedBuffer = await pipeline
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();

    // If still too large, reduce quality progressively
    while (processedBuffer.length > maxBytes && quality > 20) {
      quality -= 10;
      pipeline = sharp(Buffer.from(bytes));
      if (width > 1600 || height > 1600) {
        pipeline = pipeline.resize(1600, 1600, { fit: "inside", withoutEnlargement: true });
      }
      processedBuffer = await pipeline
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();
    }

    // If still too large, resize down more aggressively
    if (processedBuffer.length > maxBytes) {
      quality = 50;
      pipeline = sharp(Buffer.from(bytes));
      pipeline = pipeline.resize(1024, 1024, { fit: "inside", withoutEnlargement: true });
      processedBuffer = await pipeline
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();
    }

    const compressedSize = processedBuffer.length;

    // Generate filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = "jpg";
    const filename = `${timestamp}-${randomStr}.${ext}`;

    // Save to public/uploads directory
    const uploadDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filepath = join(uploadDir, filename);
    await writeFile(filepath, processedBuffer);

    const url = `/uploads/${filename}`;

    return NextResponse.json({
      url,
      originalSize,
      compressedSize,
      width: metadata.width,
      height: metadata.height,
      quality,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat upload" }, { status: 500 });
  }
}
