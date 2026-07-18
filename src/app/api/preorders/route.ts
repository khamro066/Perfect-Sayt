import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface PreorderBody {
  productId: string;
  colorHex: string;
  size: number;
  qty: number;
  ism: string;
  familiya?: string;
  phone: string;
  manzil: string;
  payType: "full" | "deposit";
}

function randomOrderNumber(prefix: string, digits: number) {
  const max = 10 ** digits;
  const min = 10 ** (digits - 1);
  return `${prefix}-${Math.floor(min + Math.random() * (max - min))}`;
}

// Per README section 4: pre-orders are written through the SAME `orders`
// table as regular checkout (is_preorder=true), not a separate store — the
// spec explicitly warns against two disconnected lists going out of sync.
export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<PreorderBody>;

  if (!body.ism?.trim() || !body.phone?.trim() || body.size === undefined) {
    return NextResponse.json({ error: "Ism, telefon va o'lchamni to'ldiring" }, { status: 400 });
  }
  if (!body.productId || !body.colorHex || !body.qty || body.qty < 1) {
    return NextResponse.json({ error: "Noto'g'ri mahsulot ma'lumoti" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: body.productId } });
  if (!product) return NextResponse.json({ error: "Mahsulot topilmadi" }, { status: 404 });

  const total = Number(product.price) * body.qty;
  const paymentLabel = body.payType === "full" ? "To'liq to'lov" : "Oldindan to'lov (30%)";

  const result = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.upsert({
      where: { phone: body.phone!.trim() },
      update: { ism: body.ism!.trim(), familiya: body.familiya?.trim() || null, manzil: body.manzil },
      create: { ism: body.ism!.trim(), familiya: body.familiya?.trim() || null, phone: body.phone!.trim(), manzil: body.manzil },
    });

    let order;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        order = await tx.order.create({
          data: {
            orderNumber: randomOrderNumber("PRE", 5),
            customerId: customer.id,
            total,
            status: "Yangi",
            isPreorder: true,
            kind: "preorder",
            stockApplied: false,
            address: body.manzil,
            payment: paymentLabel,
            lines: {
              create: [{ productId: product.id, colorHex: body.colorHex!, size: body.size!, qty: body.qty!, unitPrice: product.price }],
            },
            statusHistory: { create: [{ status: "Yangi" }] },
          },
          include: { lines: { include: { product: { select: { name: true } } } }, customer: true },
        });
        break;
      } catch (e: unknown) {
        if (e instanceof Error && "code" in e && (e as { code?: string }).code === "P2002") continue;
        throw e;
      }
    }
    if (!order) throw new Error("Could not generate a unique order number");

    await tx.notification.create({
      data: {
        orderId: order.id,
        customerName: `${customer.ism} ${customer.familiya ?? ""}`.trim(),
        phone: customer.phone,
        productSummary: product.name,
        amount: total,
        kind: "preorder",
      },
    });

    return order;
  });

  return NextResponse.json({ orderNumber: result.orderNumber });
}
