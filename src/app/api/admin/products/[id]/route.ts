import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serializers";

interface UpdateProductBody {
  name?: string;
  brand?: string;
  category?: string;
  price?: number;
  oldPrice?: number | null;
  images?: string[];
}

// Deliberately scoped to product-level fields (name/brand/category/price/
// discount/images) — not kind, colors, sizes, or stock. Those are fixed at
// creation time or managed via the Ombor page; changing them post-creation
// would require reconciling existing Stock/ProductSize/OrderLine rows,
// which is a separate, larger change than "edit a product's details".
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json()) as Partial<UpdateProductBody>;

  if (body.name !== undefined && !body.name.trim()) {
    return NextResponse.json({ error: "Nom bo'sh bo'lishi mumkin emas" }, { status: 400 });
  }
  if (body.price !== undefined && !body.price) {
    return NextResponse.json({ error: "Narxni kiriting" }, { status: 400 });
  }

  let categoryId: string | undefined;
  if (body.category !== undefined) {
    const category = await prisma.category.findFirst({ where: { name: body.category } });
    if (!category) return NextResponse.json({ error: "Kategoriya topilmadi" }, { status: 400 });
    categoryId = category.id;
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name.trim() }),
      ...(body.brand !== undefined && { brand: body.brand.trim() || "Perfect" }),
      ...(categoryId !== undefined && { categoryId }),
      ...(body.price !== undefined && { price: body.price }),
      ...(body.oldPrice !== undefined && { oldPrice: body.oldPrice || null }),
      ...(body.images !== undefined && { images: body.images }),
    },
    include: { category: true, colors: true, sizes: true },
  });

  return NextResponse.json(serializeProduct(product));
}

// Soft delete — a product may have order-history references (order_lines
// has no cascade), so a hard delete would violate that foreign key for any
// product that's ever been ordered. This matches the original prototype's
// own behavior, which also only ever hid deleted products rather than
// truly removing them.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.product.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
