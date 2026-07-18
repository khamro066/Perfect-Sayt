import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toOrderStatusEnum } from "@/lib/serializers";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = (await req.json()) as { status?: string };
  if (!status) return NextResponse.json({ error: "status is required" }, { status: 400 });

  const nextStatus = toOrderStatusEnum(status);

  const order = await prisma.$transaction(async (tx) => {
    const current = await tx.order.findUniqueOrThrow({ where: { id }, include: { lines: true } });

    // Rule 3.1 — stock decrements exactly once, the moment an order reaches
    // "Tasdiqlandi", and is restored exactly once if it's then cancelled.
    // stockApplied guards against double-decrementing on repeated clicks.
    if (nextStatus === "Tasdiqlandi" && !current.stockApplied) {
      for (const line of current.lines) {
        await tx.stock.updateMany({
          where: { productId: line.productId, colorHex: line.colorHex, size: line.size },
          data: { quantity: { decrement: line.qty } },
        });
      }
      // Clamp at 0 in case of a race — never go negative.
      for (const line of current.lines) {
        const s = await tx.stock.findUnique({
          where: { productId_colorHex_size: { productId: line.productId, colorHex: line.colorHex, size: line.size } },
        });
        if (s && s.quantity < 0) {
          await tx.stock.update({ where: { id: s.id }, data: { quantity: 0 } });
        }
      }
    } else if (nextStatus === "BekorQilindi" && current.stockApplied) {
      for (const line of current.lines) {
        await tx.stock.updateMany({
          where: { productId: line.productId, colorHex: line.colorHex, size: line.size },
          data: { quantity: { increment: line.qty } },
        });
      }
    }

    const stockApplied =
      nextStatus === "Tasdiqlandi" ? true : nextStatus === "BekorQilindi" ? false : current.stockApplied;

    return tx.order.update({
      where: { id },
      data: {
        status: nextStatus,
        stockApplied,
        statusHistory: { create: [{ status: nextStatus }] },
      },
    });
  }, { timeout: 15000 });

  return NextResponse.json({ id: order.id, status: status });
}
