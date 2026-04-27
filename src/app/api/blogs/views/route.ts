import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const updated = await db.blogPost.update({
      where: { slug },
      data: { views: { increment: 1 } },
      select: { slug: true, views: true },
    });

    return NextResponse.json({ views: updated.views });
  } catch (err) {
    console.error("POST /api/blogs/views error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
