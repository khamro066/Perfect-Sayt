import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeOrder } from "@/lib/serializers";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { customer: true, lines: { include: { product: { select: { name: true } } } } },
  });
  if (!order) return NextResponse.json({ error: "Buyurtma topilmadi" }, { status: 404 });
  return NextResponse.json(serializeOrder(order));
}

// Customer-facing "To'ladim" click on the card-payment QR screen. Public and
// unauthenticated, so it only allows the one narrow transition it exists
// for — a "Karta orqali" order still in "Yangi" moving to
// "To'lov tekshirilmoqda" — never an arbitrary status change.
export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order) return NextResponse.json({ error: "Buyurtma topilmadi" }, { status: 404 });

  if (order.payment !== "Karta orqali" || order.status !== "Yangi") {
    return NextResponse.json({ error: "Bu buyurtma uchun amal bajarib bo'lmaydi" }, { status: 409 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const o = await tx.order.update({
      where: { id: order.id },
      data: { status: "TolovTekshirilmoqda", statusHistory: { create: [{ status: "TolovTekshirilmoqda" }] } },
      include: { customer: true, lines: { include: { product: { select: { name: true } } } } },
    });
    await tx.notification.create({
      data: {
        orderId: o.id,
        customerName: `${o.customer.ism} ${o.customer.familiya ?? ""}`.trim(),
        phone: o.customer.phone,
        productSummary: o.lines.map((l) => l.product.name).join(", "),
        amount: o.total,
        kind: "payment",
      },
    });
    return o;
  }, { timeout: 15000 });

  return NextResponse.json(serializeOrder(updated));
}
