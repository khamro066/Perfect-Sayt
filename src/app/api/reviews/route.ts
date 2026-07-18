import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { productId, orderNumber, phone, rating, text } = body as {
    productId?: string; orderNumber?: string; phone?: string; rating?: number; text?: string;
  };

  if (!productId || !orderNumber || !phone || !rating) {
    return NextResponse.json({ error: "Ma'lumotlar to'liq emas" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { customer: true, lines: true },
  });

  if (!order || order.customer.phone !== phone) {
    return NextResponse.json({ error: "Buyurtma topilmadi" }, { status: 404 });
  }
  if (order.status !== "Yetkazildi") {
    return NextResponse.json({ error: "Faqat yetkazilgan buyurtmalar uchun sharh qoldirish mumkin" }, { status: 403 });
  }
  if (!order.lines.some((l) => l.productId === productId)) {
    return NextResponse.json({ error: "Bu mahsulot ushbu buyurtmada mavjud emas" }, { status: 403 });
  }

  const existing = await prisma.review.findFirst({ where: { orderId: order.id, productId } });
  if (existing) {
    return NextResponse.json({ error: "Siz bu mahsulotga allaqachon sharh qoldirgansiz" }, { status: 409 });
  }

  await prisma.review.create({
    data: {
      productId,
      customerId: order.customerId,
      orderId: order.id,
      rating: Math.min(5, Math.max(1, Math.round(rating))),
      text: text?.trim() || "",
      status: "pending",
    },
  });

  return NextResponse.json({ ok: true });
}
