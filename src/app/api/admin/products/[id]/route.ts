import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
