import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serializers";
import { ALL_MATERIALS } from "@/lib/materials";

interface StockEntryInput {
  colorHex: string;
  size: number;
  quantity: number;
}

interface UpdateProductBody {
  name?: string;
  brand?: string;
  category?: string;
  price?: number;
  oldPrice?: number | null;
  images?: string[];
  material?: string;
  // Both optional and only reconciled when colors is present — sizes stay
  // fixed at creation time (adding/removing a size isn't exposed by the
  // edit UI), but the color list and its per-size stock quantities are.
  colors?: string[];
  stockEntries?: StockEntryInput[];
}

// Product-level fields (name/brand/category/price/discount/images) plus,
// when provided, a full reconciliation of the product's colors and their
// per-size Stock rows. Sizes themselves stay fixed post-creation — only
// colors and quantities are editable here. OrderLine snapshots its own
// colorHex/size (no FK to ProductColor/Stock), so removing a color a
// product used to offer can never violate order history.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json()) as Partial<UpdateProductBody>;

  if (body.name !== undefined && !body.name.trim()) {
    return NextResponse.json({ error: "Nom bo'sh bo'lishi mumkin emas" }, { status: 400 });
  }
  if (body.price !== undefined && !body.price) {
    return NextResponse.json({ error: "Narxni kiriting" }, { status: 400 });
  }
  if (body.colors !== undefined && body.colors.length === 0) {
    return NextResponse.json({ error: "Kamida bitta rangni tanlang" }, { status: 400 });
  }
  if (body.material !== undefined && !ALL_MATERIALS.includes(body.material)) {
    return NextResponse.json({ error: "Noma'lum material" }, { status: 400 });
  }

  let categoryId: string | undefined;
  if (body.category !== undefined) {
    const category = await prisma.category.findFirst({ where: { name: body.category } });
    if (!category) return NextResponse.json({ error: "Kategoriya topilmadi" }, { status: 400 });
    categoryId = category.id;
  }

  if (body.colors !== undefined) {
    const [existingColors, sizes] = await Promise.all([
      prisma.productColor.findMany({ where: { productId: id } }),
      prisma.productSize.findMany({ where: { productId: id } }),
    ]);
    const existingHexes = new Set(existingColors.map((c) => c.hex));
    const newHexes = new Set(body.colors);
    const toAdd = body.colors.filter((hex) => !existingHexes.has(hex));
    const toRemove = existingColors.filter((c) => !newHexes.has(c.hex));

    await prisma.$transaction([
      ...toRemove.map((c) => prisma.stock.deleteMany({ where: { productId: id, colorHex: c.hex } })),
      ...toRemove.map((c) => prisma.productColor.delete({ where: { id: c.id } })),
      ...toAdd.map((hex) => prisma.productColor.create({ data: { productId: id, hex } })),
      ...toAdd.flatMap((hex) =>
        sizes.map((s) =>
          prisma.stock.upsert({
            where: { productId_colorHex_size: { productId: id, colorHex: hex, size: s.size } },
            create: { productId: id, colorHex: hex, size: s.size, quantity: 0 },
            update: {},
          })
        )
      ),
    ]);
  }

  if (body.stockEntries !== undefined) {
    await prisma.$transaction(
      body.stockEntries.map((entry) =>
        prisma.stock.upsert({
          where: { productId_colorHex_size: { productId: id, colorHex: entry.colorHex, size: entry.size } },
          create: { productId: id, colorHex: entry.colorHex, size: entry.size, quantity: Math.max(0, Math.floor(entry.quantity)) },
          update: { quantity: Math.max(0, Math.floor(entry.quantity)) },
        })
      )
    );
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
      ...(body.material !== undefined && { material: body.material }),
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
