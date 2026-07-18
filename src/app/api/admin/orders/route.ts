import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeOrder } from "@/lib/serializers";

export async function GET() {
  const orders = await prisma.order.findMany({
    include: { customer: true, lines: { include: { product: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders.map(serializeOrder));
}
