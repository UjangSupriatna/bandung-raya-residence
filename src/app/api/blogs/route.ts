import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public API — no auth required
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || "";
    const category = searchParams.get("category") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: Record<string, unknown> = { published: true };
    if (slug) where.slug = slug;
    if (category && category !== "all") where.category = category;

    const [blogs, total] = await Promise.all([
      db.blogPost.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.blogPost.count({ where }),
    ]);

    const parsed = blogs.map((b) => {
      // Parse image field (can be JSON array or comma-separated URLs)
      let images: string[] = [];
      try {
        const imgRaw = typeof b.image === "string" ? JSON.parse(b.image) : b.image;
        images = Array.isArray(imgRaw) ? imgRaw : [];
      } catch {
        if (b.image && String(b.image).trim()) {
          images = String(b.image).split(",").map((s: string) => s.trim()).filter(Boolean);
        }
      }

      const createdDate = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);

      return {
        id: b.id,
        title: b.title?.replace(/&nbsp;/g, " "),
        slug: b.slug,
        excerpt: b.excerpt?.replace(/&nbsp;/g, " "),
        content: b.content?.replace(/&nbsp;/g, " "),
        category: b.category,
        author: b.author,
        images,
        published: b.published,
        readTime: b.readTime,
        views: b.views || 0,
        createdAt: createdDate.toISOString(),
        updatedAt: b.updatedAt instanceof Date ? b.updatedAt.toISOString() : String(b.updatedAt),
        dateFormatted: createdDate.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      };
    });

    return NextResponse.json({ blogs: parsed, total, page, limit });
  } catch (err) {
    console.error("GET /api/blogs error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
