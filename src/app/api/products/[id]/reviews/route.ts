import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeReview } from "@/lib/serializers";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reviews = await prisma.review.findMany({
    where: { productId: id, status: "approved" },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(reviews.map(serializeReview));
}
