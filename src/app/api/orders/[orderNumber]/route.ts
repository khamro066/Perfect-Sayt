import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeOrder } from "@/lib/serializers";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { customer: true, lines: { include: { product: { select: { name: true } } } } },
  });
  if (!order) return NextResponse.json({ error: "Buyurtma topilmadi" }, { status: 404 });
  return NextResponse.json(serializeOrder(order));
}
