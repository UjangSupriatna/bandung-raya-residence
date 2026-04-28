import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public API — no auth required
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";
    const slug = searchParams.get("slug") || "";

    const where: Record<string, unknown> = { status: "available" };
    if (category && category !== "all") where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { type: { contains: search } },
        { location: { contains: search } },
      ];
    }
    if (slug) where.slug = slug;

    const properties = await db.property.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });

    // Parse JSON strings for the frontend
    const safeParse = (str: string, fallback: unknown) => {
      try { return JSON.parse(str); } catch { return fallback; }
    };
    // Features can be CSV text ("Taman, Kanopi") or JSON (["Taman","Kanopi"])
    const safeParseFeatures = (str: string): string[] => {
      try {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed)) return parsed.map(String);
        if (typeof parsed === "string" && parsed.trim()) return parsed.split(",").map((s: string) => s.trim()).filter(Boolean);
        return [];
      } catch {
        if (str && str.trim()) return str.split(",").map((s) => s.trim()).filter(Boolean);
        return [];
      }
    };
    const parsed = properties.map((p) => ({
      ...p,
      features: safeParseFeatures(p.features),
      images: safeParse(p.images, []),
      financingTypes: safeParse(p.financingTypes, ["syariah", "kpr"]),
      dpOptions: safeParse(p.dpOptions, [30,35,40,45,50]),
      tenorOptions: safeParse(p.tenorOptions, [1,2,3,4,5]),
      installments: safeParse(p.installments, {}),
      syariahMargin: p.syariahMargin ?? 15,
      kprDpOptions: safeParse(p.kprDpOptions, [0,10,15,20,25,30]),
      kprTenorOptions: safeParse(p.kprTenorOptions, [5,10,15,20,25]),
      kprInstallments: safeParse(p.kprInstallments, {}),
      kprInterestRate: p.kprInterestRate ?? 7.5,
      kprInterestType: p.kprInterestType ?? "annuity",
      videoUrl: p.videoUrl || "",
      id: p.id,
    }));

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
