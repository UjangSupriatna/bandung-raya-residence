import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public API — no auth required
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const featured = searchParams.get("featured");

    const where: Record<string, unknown> = {};
    if (featured === "true") {
      where.featured = true;
    }

    const testimonials = await db.testimonial.findMany({
      where,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: limit,
    });

    return NextResponse.json({ testimonials });
  } catch (err) {
    console.error("GET /api/testimonials error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
