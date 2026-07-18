import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const stock = await prisma.stock.findMany({
    where: { product: { deletedAt: null } },
    include: { product: { select: { id: true, name: true } } },
    orderBy: [{ product: { name: "asc" } }, { size: "asc" }],
  });

  return NextResponse.json(
    stock.map((s) => ({
      id: s.id,
      productId: s.productId,
      productName: s.product.name,
      colorHex: s.colorHex,
      size: s.size,
      quantity: s.quantity,
    }))
  );
}
