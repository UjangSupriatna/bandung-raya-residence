import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { location: { contains: search } },
      ];
    }
    if (status) where.status = status;
    if (category) where.category = category;

    const [properties, total] = await Promise.all([
      db.property.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.property.count({ where }),
    ]);

    return NextResponse.json({ properties, total, page, limit });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name, slug, type, category, price, location,
      bedrooms, bathrooms, landArea, buildingArea,
      status, description, features, images, isFeatured,
      tag, installment, financingTypes, dpOptions, tenorOptions, installments,
      kprDpOptions, kprTenorOptions, kprInstallments,
      syariahMargin, kprInterestRate, kprInterestType,
      videoUrl,
    } = body;

    // For kavling, type is optional (will be set to empty string)
    if (!name || !slug || !category || !price) {
      return NextResponse.json({ error: "Name, slug, category, and price are required" }, { status: 400 });
    }
    // For non-kavling, type is required
    if (category !== "kavling" && !type) {
      return NextResponse.json({ error: "Type wajib diisi untuk kategori selain kavling" }, { status: 400 });
    }

    const slugExists = await db.property.findUnique({ where: { slug } });
    if (slugExists) {
      return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 409 });
    }

    const property = await db.property.create({
      data: {
        name,
        slug,
        type,
        category,
        price: parseFloat(price),
        location: location || "",
        bedrooms: parseInt(bedrooms) || 2,
        bathrooms: parseInt(bathrooms) || 1,
        landArea: parseFloat(landArea) || 0,
        buildingArea: parseFloat(buildingArea) || 0,
        status: status || "available",
        description: description || "",
        features: typeof features === "string" ? features : JSON.stringify(features || []),
        images: images || "[]",
        tag: tag || "",
        installment: installment || "",
        financingTypes: financingTypes || '["syariah","kpr"]',
        dpOptions: dpOptions || "[30,35,40,45,50]",
        tenorOptions: tenorOptions || "[1,2,3,4,5]",
        installments: installments || "{}",
        syariahMargin: syariahMargin !== undefined ? parseFloat(syariahMargin) : 15,
        kprDpOptions: kprDpOptions || "[0,10,15,20,25,30]",
        kprTenorOptions: kprTenorOptions || "[5,10,15,20,25]",
        kprInstallments: kprInstallments || "{}",
        kprInterestRate: kprInterestRate !== undefined ? parseFloat(kprInterestRate) : 7.5,
        kprInterestType: kprInterestType || "annuity",
        videoUrl: videoUrl || "",
        isFeatured: !!isFeatured,
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
