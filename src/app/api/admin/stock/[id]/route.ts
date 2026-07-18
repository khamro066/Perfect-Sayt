import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { quantity } = (await req.json()) as { quantity?: number };
  if (typeof quantity !== "number") {
    return NextResponse.json({ error: "quantity is required" }, { status: 400 });
  }
  const stock = await prisma.stock.update({
    where: { id },
    data: { quantity: Math.max(0, Math.floor(quantity)) },
  });
  return NextResponse.json({ id: stock.id, quantity: stock.quantity });
}
