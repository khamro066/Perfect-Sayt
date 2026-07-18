import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serializers";

export async function GET() {
  const [products, stock] = await Promise.all([
    prisma.product.findMany({
      where: { deletedAt: null },
      include: { category: true, colors: true, sizes: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.stock.findMany({ where: { product: { deletedAt: null } } }),
  ]);

  return NextResponse.json({
    products: products.map(serializeProduct),
    stock: stock.map((s) => ({
      productId: s.productId,
      colorHex: s.colorHex,
      size: s.size,
      quantity: s.quantity,
    })),
  });
}
