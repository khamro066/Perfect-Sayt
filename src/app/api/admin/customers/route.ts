import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const customers = await prisma.customer.findMany({
    include: { orders: { select: { total: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    customers.map((c) => ({
      id: c.id,
      ism: c.ism,
      familiya: c.familiya ?? undefined,
      phone: c.phone,
      viloyat: c.viloyat ?? undefined,
      manzil: c.manzil ?? undefined,
      totalSpent: c.orders.reduce((sum, o) => sum + Number(o.total), 0),
      orderCount: c.orders.length,
    }))
  );
}
