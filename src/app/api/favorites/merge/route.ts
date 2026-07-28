import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Called once per session when a customer's phone becomes known (or is
// re-confirmed on page load) — pushes up whatever was favorited locally
// while anonymous, then returns the union so other devices' favorites
// (if any) get pulled down into this browser too.
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { phone?: string; productIds?: string[] };
  if (!body.phone || !Array.isArray(body.productIds)) {
    return NextResponse.json({ error: "phone and productIds are required" }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({ where: { phone: body.phone } });
  if (!customer) return NextResponse.json({ productIds: body.productIds });

  if (body.productIds.length > 0) {
    await prisma.favorite.createMany({
      data: body.productIds.map((productId) => ({ customerId: customer.id, productId })),
      skipDuplicates: true,
    });
  }

  const favorites = await prisma.favorite.findMany({
    where: { customerId: customer.id },
    select: { productId: true },
  });

  return NextResponse.json({ productIds: favorites.map((f) => f.productId) });
}
