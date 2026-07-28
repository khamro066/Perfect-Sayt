import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Favorites are local-first (see FavoritesProvider) — these routes only
// matter once a customer's phone is known (after their first order), so
// a missing Customer row just means "nothing to sync yet", not an error.

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone");
  if (!phone) return NextResponse.json({ error: "phone is required" }, { status: 400 });

  const customer = await prisma.customer.findUnique({ where: { phone } });
  if (!customer) return NextResponse.json({ productIds: [] });

  const favorites = await prisma.favorite.findMany({
    where: { customerId: customer.id },
    select: { productId: true },
  });

  return NextResponse.json({ productIds: favorites.map((f) => f.productId) });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { phone?: string; productId?: string };
  if (!body.phone || !body.productId) {
    return NextResponse.json({ error: "phone and productId are required" }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({ where: { phone: body.phone } });
  if (!customer) return NextResponse.json({ error: "Unknown customer" }, { status: 404 });

  await prisma.favorite.upsert({
    where: { customerId_productId: { customerId: customer.id, productId: body.productId } },
    update: {},
    create: { customerId: customer.id, productId: body.productId },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const body = (await req.json()) as { phone?: string; productId?: string };
  if (!body.phone || !body.productId) {
    return NextResponse.json({ error: "phone and productId are required" }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({ where: { phone: body.phone } });
  if (!customer) return NextResponse.json({ ok: true });

  await prisma.favorite.deleteMany({
    where: { customerId: customer.id, productId: body.productId },
  });

  return NextResponse.json({ ok: true });
}
