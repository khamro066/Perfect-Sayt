import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

/** Keeps Product.rating/ratingCount in sync with its approved reviews. */
async function recomputeProductRating(tx: Prisma.TransactionClient, productId: string) {
  const approved = await tx.review.findMany({ where: { productId, status: "approved" }, select: { rating: true } });
  const ratingCount = approved.length;
  const rating = ratingCount > 0 ? approved.reduce((sum, r) => sum + r.rating, 0) / ratingCount : 0;
  await tx.product.update({
    where: { id: productId },
    data: { rating: Math.round(rating * 10) / 10, ratingCount },
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = (await req.json()) as { status?: "approved" | "rejected" };
  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const review = await prisma.$transaction(async (tx) => {
    const updated = await tx.review.update({ where: { id }, data: { status } });
    await recomputeProductRating(tx, updated.productId);
    return updated;
  });

  return NextResponse.json({ id: review.id, status: review.status });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.$transaction(async (tx) => {
    const review = await tx.review.delete({ where: { id } });
    await recomputeProductRating(tx, review.productId);
  });
  return NextResponse.json({ ok: true });
}
