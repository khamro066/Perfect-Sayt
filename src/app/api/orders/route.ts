import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deliveryFeeFor, PAYMENT_LABELS } from "@/lib/delivery";
import { serializeOrder } from "@/lib/serializers";

interface CheckoutLine {
  productId: string;
  colorHex: string;
  size: number;
  qty: number;
}

interface CheckoutBody {
  ism: string;
  familiya?: string;
  phone: string;
  viloyat: string;
  tuman?: string;
  manzil: string;
  deliveryMethod: string;
  payment: string;
  lines: CheckoutLine[];
}

function randomOrderNumber(prefix: string, digits: number) {
  const max = 10 ** digits;
  const min = 10 ** (digits - 1);
  return `${prefix}-${Math.floor(min + Math.random() * (max - min))}`;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<CheckoutBody>;

  if (!body.ism?.trim()) return NextResponse.json({ error: "Ismingizni kiriting" }, { status: 400 });
  if (!body.phone?.trim()) return NextResponse.json({ error: "Telefon raqamini kiriting" }, { status: 400 });
  if (!body.manzil?.trim()) return NextResponse.json({ error: "Yetkazib berish manzilini kiriting" }, { status: 400 });
  if (!body.lines?.length) return NextResponse.json({ error: "Savatcha bo'sh" }, { status: 400 });

  const productIds = [...new Set(body.lines.map((l) => l.productId))];
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productById = new Map(products.map((p) => [p.id, p]));

  for (const line of body.lines) {
    if (!productById.has(line.productId) || line.qty < 1) {
      return NextResponse.json({ error: "Noto'g'ri mahsulot ma'lumoti" }, { status: 400 });
    }
  }

  // Authoritative pricing — never trust a client-supplied total.
  const subtotal = body.lines.reduce((sum, l) => sum + Number(productById.get(l.productId)!.price) * l.qty, 0);
  const deliveryFee = deliveryFeeFor(body.deliveryMethod ?? "");
  const total = subtotal + deliveryFee;
  const address = body.tuman ? `${body.viloyat}, ${body.tuman}, ${body.manzil}` : `${body.viloyat}, ${body.manzil}`;
  const paymentLabel = PAYMENT_LABELS[body.payment ?? ""] ?? "Naqd pul";

  const result = await prisma.$transaction(async (tx) => {
    // Rule 3.2: if ANY line requests more than available stock, the WHOLE
    // order becomes a pre-order — never split.
    let isPreorder = false;
    for (const line of body.lines!) {
      const stock = await tx.stock.findUnique({
        where: { productId_colorHex_size: { productId: line.productId, colorHex: line.colorHex, size: line.size } },
      });
      if (line.qty > (stock?.quantity ?? 0)) {
        isPreorder = true;
        break;
      }
    }

    // Rule 3.4: dedupe customers by phone in the same transaction as order creation.
    const customer = await tx.customer.upsert({
      where: { phone: body.phone!.trim() },
      update: { ism: body.ism!.trim(), familiya: body.familiya?.trim() || null, viloyat: body.viloyat, manzil: body.manzil },
      create: {
        ism: body.ism!.trim(), familiya: body.familiya?.trim() || null, phone: body.phone!.trim(),
        viloyat: body.viloyat, manzil: body.manzil,
      },
    });

    let order;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        order = await tx.order.create({
          data: {
            orderNumber: randomOrderNumber("PS", 6),
            customerId: customer.id,
            total,
            status: "Yangi",
            isPreorder,
            kind: isPreorder ? "preorder" : "order",
            stockApplied: false,
            address,
            payment: paymentLabel,
            lines: {
              create: body.lines!.map((l) => ({
                productId: l.productId,
                colorHex: l.colorHex,
                size: l.size,
                qty: l.qty,
                unitPrice: productById.get(l.productId)!.price,
              })),
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
        productSummary: order.lines.map((l) => l.product.name).join(", "),
        amount: total,
        kind: isPreorder ? "preorder" : "order",
      },
    });

    return order;
  }, { timeout: 15000 }); // default 5s is too tight for this multi-step transaction under Neon's serverless connection latency

  return NextResponse.json({
    orderNumber: result.orderNumber,
    isPreorder: result.isPreorder,
    order: serializeOrder(result),
  });
}

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone");
  if (!phone) return NextResponse.json({ error: "phone is required" }, { status: 400 });

  const orders = await prisma.order.findMany({
    where: { customer: { phone } },
    include: {
      customer: true,
      lines: { include: { product: { select: { name: true } } } },
      reviews: { select: { productId: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders.map(serializeOrder));
}
