import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, image } = (await req.json()) as { name?: string; image?: string | null };
  const trimmed = name?.trim();
  if (!trimmed) return NextResponse.json({ error: "Kategoriya nomini kiriting" }, { status: 400 });

  const duplicate = await prisma.category.findFirst({
    where: { id: { not: id }, name: { equals: trimmed, mode: "insensitive" } },
  });
  if (duplicate) return NextResponse.json({ error: "Bunday kategoriya allaqachon mavjud" }, { status: 409 });

  // Products reference categoryId, not the name, so this rename cascades
  // automatically — no need to touch the products table.
  const category = await prisma.category.update({
    where: { id },
    data: {
      name: trimmed,
      slug: trimmed.toLowerCase().replace(/\s+/g, "-"),
      ...(image !== undefined ? { image: image || null } : {}),
    },
  });
  return NextResponse.json({ id: category.id, name: category.name, image: category.image });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productCount = await prisma.product.count({ where: { categoryId: id, deletedAt: null } });
  if (productCount > 0) {
    return NextResponse.json(
      { error: "Bu kategoriyada mahsulotlar mavjud — avval ularni boshqa kategoriyaga o'tkazing" },
      { status: 409 }
    );
  }
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
