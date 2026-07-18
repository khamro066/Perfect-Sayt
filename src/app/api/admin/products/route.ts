import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serializers";

const ACTIVE_STATUSES = ["Yangi", "Tasdiqlandi", "Tayyorlanmoqda", "Yolda"] as const;

export async function GET() {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    include: {
      category: true,
      colors: true,
      sizes: true,
      stock: true,
      orderLines: {
        where: { order: { status: { in: [...ACTIVE_STATUSES] } } },
        select: { orderId: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    products.map((p) => ({
      ...serializeProduct(p),
      totalStock: p.stock.reduce((sum, s) => sum + s.quantity, 0),
      activeOrderCount: new Set(p.orderLines.map((l) => l.orderId)).size,
    }))
  );
}

interface StockEntryInput {
  colorHex: string;
  size: number;
  quantity: number;
}

interface CreateProductBody {
  name: string;
  brand?: string;
  gender: string;
  category: string;
  material?: string;
  price: number;
  oldPrice?: number;
  description?: string;
  productionDays?: number;
  images?: string[];
  colors: string[];
  sizes: number[];
  stockEntries?: StockEntryInput[];
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<CreateProductBody>;

  if (!body.name?.trim() || !body.price) {
    return NextResponse.json({ error: "Nom va narxni kiriting" }, { status: 400 });
  }
  if (!body.colors?.length) {
    return NextResponse.json({ error: "Kamida bitta rangni tanlang" }, { status: 400 });
  }
  if (!body.sizes?.length) {
    return NextResponse.json({ error: "Kamida bitta o'lchamni tanlang" }, { status: 400 });
  }

  const category = await prisma.category.findFirst({ where: { name: body.category } });
  if (!category) return NextResponse.json({ error: "Kategoriya topilmadi" }, { status: 400 });

  const stockEntries =
    body.stockEntries && body.stockEntries.length > 0
      ? body.stockEntries
      : body.colors.flatMap((colorHex) => body.sizes!.map((size) => ({ colorHex, size, quantity: 0 })));

  const product = await prisma.product.create({
    data: {
      name: body.name.trim(),
      brand: body.brand?.trim() || "Perfect",
      gender: body.gender || "Erkaklar",
      categoryId: category.id,
      material: body.material || "Charm",
      price: body.price,
      oldPrice: body.oldPrice || null,
      rating: 0,
      ratingCount: 0,
      description: body.description || "",
      productionDays: body.productionDays || null,
      images: body.images ?? [],
      colors: { create: body.colors.map((hex) => ({ hex })) },
      sizes: { create: body.sizes.map((size) => ({ size })) },
      stock: {
        create: stockEntries.map((s) => ({
          colorHex: s.colorHex,
          size: s.size,
          quantity: Math.max(0, Math.floor(s.quantity)),
        })),
      },
    },
    include: { category: true, colors: true, sizes: true },
  });

  return NextResponse.json(serializeProduct(product));
}
