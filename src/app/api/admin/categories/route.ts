import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: { where: { deletedAt: null } } } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(
    categories.map((c) => ({ id: c.id, name: c.name, image: c.image, productCount: c._count.products }))
  );
}

export async function POST(req: NextRequest) {
  const { name, image } = (await req.json()) as { name?: string; image?: string | null };
  const trimmed = name?.trim();
  if (!trimmed) return NextResponse.json({ error: "Kategoriya nomini kiriting" }, { status: 400 });

  const existing = await prisma.category.findFirst({
    where: { name: { equals: trimmed, mode: "insensitive" } },
  });
  if (existing) return NextResponse.json({ error: "Bunday kategoriya allaqachon mavjud" }, { status: 409 });

  const category = await prisma.category.create({
    data: { name: trimmed, slug: trimmed.toLowerCase().replace(/\s+/g, "-"), image: image || null },
  });
  return NextResponse.json({ id: category.id, name: category.name, image: category.image, productCount: 0 });
}
