import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeReview } from "@/lib/serializers";

export async function GET() {
  const reviews = await prisma.review.findMany({
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(reviews.map(serializeReview));
}
