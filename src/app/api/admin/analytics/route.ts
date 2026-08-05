import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const WEEKDAY_LABELS = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"]; // Date#getDay(): 0=Sunday
const MONTH_LABELS = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
const LOW_STOCK_THRESHOLD = 5; // matches /admin/ombor's "Kam qoldi" threshold
// Prisma returns the raw enum key (e.g. "BekorQilindi"), not the @map'd
// display string with spaces/apostrophes -- that translation only happens
// in serializeOrder(), which this route doesn't go through.
const CANCELLED = "BekorQilindi" as const;
const DELIVERED = "Yetkazildi" as const;
const STATUS_DISPLAY: Record<string, string> = {
  Yolda: "Yo'lda",
  BekorQilindi: "Bekor qilindi",
  TolovTekshirilmoqda: "To'lov tekshirilmoqda",
};
function statusDisplay(status: string): string {
  return STATUS_DISPLAY[status] ?? status;
}

type Bucket = { label: string; from: Date; to: Date };

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function resolveRange(req: NextRequest): { key: string; from: Date; to: Date } {
  const key = req.nextUrl.searchParams.get("range") ?? "7d";
  const now = new Date();

  if (key === "custom") {
    const fromParam = req.nextUrl.searchParams.get("from");
    const toParam = req.nextUrl.searchParams.get("to");
    const from = fromParam ? startOfDay(new Date(fromParam)) : startOfDay(new Date(now.getTime() - 7 * 86_400_000));
    const toDay = toParam ? startOfDay(new Date(toParam)) : startOfDay(now);
    const to = new Date(toDay.getTime() + 86_400_000); // inclusive of the whole "to" day
    return { key, from, to };
  }
  if (key === "today") return { key, from: startOfDay(now), to: now };
  if (key === "30d") return { key, from: new Date(now.getTime() - 30 * 86_400_000), to: now };
  return { key: "7d", from: new Date(now.getTime() - 7 * 86_400_000), to: now };
}

function bucketsFor(key: string, from: Date, to: Date): Bucket[] {
  if (key === "today") {
    const buckets: Bucket[] = [];
    const dayStart = startOfDay(from);
    for (let h = 0; h < 24; h += 3) {
      buckets.push({
        label: String(h).padStart(2, "0"),
        from: new Date(dayStart.getTime() + h * 3600_000),
        to: new Date(dayStart.getTime() + (h + 3) * 3600_000),
      });
    }
    return buckets;
  }

  const totalDays = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000));

  if (totalDays <= 31) {
    const buckets: Bucket[] = [];
    for (let d = 0; d < totalDays; d++) {
      const bFrom = new Date(from.getTime() + d * 86_400_000);
      buckets.push({
        label: key === "7d" ? WEEKDAY_LABELS[bFrom.getDay()] : String(bFrom.getDate()),
        from: bFrom,
        to: new Date(bFrom.getTime() + 86_400_000),
      });
    }
    return buckets;
  }
  if (totalDays <= 180) {
    const buckets: Bucket[] = [];
    for (let d = 0; d < totalDays; d += 7) {
      const bFrom = new Date(from.getTime() + d * 86_400_000);
      const bTo = new Date(Math.min(bFrom.getTime() + 7 * 86_400_000, to.getTime()));
      buckets.push({ label: `${bFrom.getDate()}.${bFrom.getMonth() + 1}`, from: bFrom, to: bTo });
    }
    return buckets;
  }
  // Long custom range — monthly buckets.
  const buckets: Bucket[] = [];
  const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
  while (cursor < to) {
    const bFrom = new Date(cursor);
    const bTo = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    buckets.push({ label: MONTH_LABELS[bFrom.getMonth()], from: bFrom, to: bTo });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return buckets;
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? null : 0; // null = "new" (no baseline to compare against)
  return ((current - previous) / previous) * 100;
}

export async function GET(req: NextRequest) {
  const { key, from, to } = resolveRange(req);
  const spanMs = to.getTime() - from.getTime();
  const prevFrom = new Date(from.getTime() - spanMs);
  const prevTo = from;

  const [orders, prevOrders, orderLines, statusHistory, stockByProduct, allProducts] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: from, lt: to } },
      select: { id: true, total: true, createdAt: true, status: true, isPreorder: true, payment: true, customerId: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: prevFrom, lt: prevTo } },
      select: { total: true, status: true, customerId: true, isPreorder: true },
    }),
    prisma.orderLine.findMany({
      where: { order: { createdAt: { gte: from, lt: to }, status: { not: CANCELLED } } },
      select: { productId: true, qty: true, unitPrice: true, oldPriceAtPurchase: true },
    }),
    prisma.orderStatusHistory.findMany({
      where: { status: DELIVERED, changedAt: { gte: from, lt: to } },
      select: { changedAt: true, order: { select: { createdAt: true } } },
    }),
    prisma.stock.groupBy({ by: ["productId"], _sum: { quantity: true } }),
    // No deletedAt filter here: historical order lines can reference a
    // product that has since been soft-deleted, and we still need its name
    // to label past sales correctly (not blank it out as "unknown").
    prisma.product.findMany({ select: { id: true, name: true, deletedAt: true } }),
  ]);

  const productName = new Map(allProducts.map((p) => [p.id, p.name]));
  const productDeleted = new Map(allProducts.map((p) => [p.id, p.deletedAt !== null]));
  const activeProductIds = new Set(allProducts.filter((p) => p.deletedAt === null).map((p) => p.id));

  // ---- Sales overview (excludes cancelled orders, matching /admin/hisobotlar's convention) ----
  const validOrders = orders.filter((o) => o.status !== CANCELLED);
  const validPrevOrders = prevOrders.filter((o) => o.status !== CANCELLED);
  const revenue = validOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const revenuePrev = validPrevOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const orderCount = validOrders.length;
  const orderCountPrev = validPrevOrders.length;
  const avgOrderValue = orderCount > 0 ? revenue / orderCount : 0;
  const avgOrderValuePrev = orderCountPrev > 0 ? revenuePrev / orderCountPrev : 0;

  const buckets = bucketsFor(key, from, to);
  const chart = buckets.map((b) => {
    const inBucket = validOrders.filter((o) => o.createdAt >= b.from && o.createdAt < b.to);
    return {
      label: b.label,
      revenue: inBucket.reduce((sum, o) => sum + Number(o.total), 0),
      orderCount: inBucket.length,
    };
  });
  const maxBucketRevenue = Math.max(1, ...chart.map((b) => b.revenue));

  // ---- Orders: status breakdown (includes cancelled — the point is to see it) ----
  const statusCounts = new Map<string, number>();
  for (const o of orders) statusCounts.set(o.status, (statusCounts.get(o.status) ?? 0) + 1);

  const deliveryDurations = statusHistory
    .map((h) => (h.changedAt.getTime() - h.order.createdAt.getTime()) / 86_400_000)
    .filter((d) => d >= 0);
  const avgDeliveryDays =
    deliveryDurations.length > 0 ? deliveryDurations.reduce((a, b) => a + b, 0) / deliveryDurations.length : null;

  // ---- Products: best-sellers (from OrderLine, NOT Product.sold — that field is static seed data) ----
  const productStats = new Map<string, { qty: number; revenue: number }>();
  for (const l of orderLines) {
    const entry = productStats.get(l.productId) ?? { qty: 0, revenue: 0 };
    entry.qty += l.qty;
    entry.revenue += l.qty * Number(l.unitPrice);
    productStats.set(l.productId, entry);
  }
  const bestSellers = [...productStats.entries()]
    .map(([productId, s]) => ({
      productId,
      name: productName.get(productId) ?? "—",
      deleted: productDeleted.get(productId) ?? false,
      ...s,
    }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 8);

  // Stock alerts only make sense for products still listed in the catalog.
  const stockTotals = stockByProduct
    .map((s) => ({ productId: s.productId, quantity: s._sum.quantity ?? 0 }))
    .filter((s) => activeProductIds.has(s.productId));
  const outOfStock = stockTotals
    .filter((s) => s.quantity <= 0)
    .map((s) => ({ productId: s.productId, name: productName.get(s.productId)! }));
  const lowStock = stockTotals
    .filter((s) => s.quantity > 0 && s.quantity < LOW_STOCK_THRESHOLD)
    .map((s) => ({ productId: s.productId, name: productName.get(s.productId)!, quantity: s.quantity }))
    .sort((a, b) => a.quantity - b.quantity);

  // ---- Customers ----
  const totalCustomers = await prisma.customer.count();
  const distinctCustomerIds = [...new Set(validOrders.map((o) => o.customerId))];
  const orderingCustomers = await prisma.customer.findMany({
    where: { id: { in: distinctCustomerIds } },
    select: { id: true, ism: true, familiya: true, phone: true, createdAt: true },
  });
  const customerById = new Map(orderingCustomers.map((c) => [c.id, c]));
  const newInRange = orderingCustomers.filter((c) => c.createdAt >= from).length;
  const returningInRange = orderingCustomers.filter((c) => c.createdAt < from).length;
  const newInRangePrevIds = [...new Set(validPrevOrders.map((o) => o.customerId))];
  const newInRangePrev =
    newInRangePrevIds.length === 0
      ? 0
      : (
          await prisma.customer.findMany({
            where: { id: { in: newInRangePrevIds } },
            select: { createdAt: true },
          })
        ).filter((c) => c.createdAt >= prevFrom && c.createdAt < prevTo).length;

  const spendByCustomer = new Map<string, { total: number; orderCount: number }>();
  for (const o of validOrders) {
    const entry = spendByCustomer.get(o.customerId) ?? { total: 0, orderCount: 0 };
    entry.total += Number(o.total);
    entry.orderCount += 1;
    spendByCustomer.set(o.customerId, entry);
  }
  const topCustomers = [...spendByCustomer.entries()]
    .map(([customerId, s]) => {
      const c = customerById.get(customerId);
      return {
        customerId,
        name: c ? `${c.ism} ${c.familiya ?? ""}`.trim() : "—",
        phone: c?.phone ?? "—",
        totalSpent: s.total,
        orderCount: s.orderCount,
      };
    })
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 8);

  // ---- Payment methods (excludes cancelled) ----
  const paymentCounts = new Map<string, { count: number; revenue: number }>();
  for (const o of validOrders) {
    const key = o.payment ?? "Noma'lum";
    const entry = paymentCounts.get(key) ?? { count: 0, revenue: 0 };
    entry.count += 1;
    entry.revenue += Number(o.total);
    paymentCounts.set(key, entry);
  }
  const payments = [...paymentCounts.entries()]
    .map(([method, s]) => ({ method, ...s }))
    .sort((a, b) => b.revenue - a.revenue);

  // ---- Preorders ----
  const preorderOrders = validOrders.filter((o) => o.isPreorder);
  const preorderPrevOrders = validPrevOrders.filter((o) => o.isPreorder);
  const preorderRevenue = preorderOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const preorderRevenuePrev = preorderPrevOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const preorders = {
    count: preorderOrders.length,
    revenue: preorderRevenue,
    countPrev: preorderPrevOrders.length,
    revenueChangePct: pctChange(preorderRevenue, preorderRevenuePrev),
  };

  // ---- Discounts (historical, from oldPriceAtPurchase snapshot — null = pre-tracking) ----
  let discountedRevenue = 0;
  let fullPriceRevenue = 0;
  let untrackedRevenue = 0;
  for (const l of orderLines) {
    const lineRevenue = l.qty * Number(l.unitPrice);
    if (l.oldPriceAtPurchase === null) {
      untrackedRevenue += lineRevenue;
    } else if (Number(l.oldPriceAtPurchase) > Number(l.unitPrice)) {
      discountedRevenue += lineRevenue;
    } else {
      fullPriceRevenue += lineRevenue;
    }
  }
  const discountTotal = discountedRevenue + fullPriceRevenue + untrackedRevenue;
  const coveragePct = discountTotal > 0 ? ((discountedRevenue + fullPriceRevenue) / discountTotal) * 100 : 100;

  return NextResponse.json({
    range: { key, from: from.toISOString(), to: to.toISOString() },
    sales: {
      revenue,
      revenuePrev,
      revenueChangePct: pctChange(revenue, revenuePrev),
      orderCount,
      orderCountPrev,
      orderCountChangePct: pctChange(orderCount, orderCountPrev),
      avgOrderValue,
      avgOrderValuePrev,
      avgOrderValueChangePct: pctChange(avgOrderValue, avgOrderValuePrev),
      chart: chart.map((b) => ({ ...b, heightPct: Math.round((b.revenue / maxBucketRevenue) * 100) })),
    },
    orders: {
      statusBreakdown: [...statusCounts.entries()].map(([status, count]) => ({ status: statusDisplay(status), count })),
      avgDeliveryDays,
    },
    products: {
      bestSellers,
      lowStock: lowStock.slice(0, 15),
      outOfStock: outOfStock.slice(0, 15),
    },
    customers: {
      totalCustomers,
      newInRange,
      newInRangePrev,
      newChangePct: pctChange(newInRange, newInRangePrev),
      returningInRange,
      topCustomers,
    },
    payments,
    preorders,
    discounts: {
      discountedRevenue,
      fullPriceRevenue,
      untrackedRevenue,
      coveragePct,
    },
  });
}
