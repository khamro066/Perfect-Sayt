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

  // Products reference categoryId with no cascade (RESTRICT), and that
  // FK is enforced by Postgres regardless of a product's soft-delete
  // status — so the guard has to count ALL products, not just active
  // ones, or the delete below fails with a raw, unhandled DB error.
  const [activeCount, totalCount] = await Promise.all([
    prisma.product.count({ where: { categoryId: id, deletedAt: null } }),
    prisma.product.count({ where: { categoryId: id } }),
  ]);

  if (activeCount > 0) {
    return NextResponse.json(
      { error: `Bu kategoriyada ${activeCount} ta mahsulot bor — avval ularni boshqa kategoriyaga o'tkazing yoki o'chiring` },
      { status: 409 }
    );
  }
  if (totalCount > 0) {
    // Only soft-deleted products remain, referencing this category. They're
    // kept (not hard-deleted) for order-history integrity and have no
    // restore/reassign UI, so this can't be resolved from the admin panel
    // today — surface that honestly instead of a generic message.
    return NextResponse.json(
      {
        error: `Bu kategoriyada oldin o'chirilgan ${totalCount} ta mahsulot hali ham bog'langan (buyurtma tarixi saqlanishi uchun) — shu sababli hozircha o'chirib bo'lmaydi`,
      },
      { status: 409 }
    );
  }

  try {
    await prisma.category.delete({ where: { id } });
  } catch {
    // Defense in depth for any constraint we haven't accounted for above —
    // never leak a raw 500 to the admin UI.
    return NextResponse.json(
      { error: "Kategoriyani o'chirib bo'lmadi — u hali biror joyda ishlatilmoqda" },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true });
}
