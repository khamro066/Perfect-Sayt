import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const WEEKDAY_LABELS = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"]; // Date#getDay(): 0=Sunday
const MONTH_LABELS = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];

const PERIOD_LABELS: Record<string, string> = {
  daily: "Kunlik",
  weekly: "Haftalik",
  monthly: "Oylik",
  yearly: "Yillik",
};

function bucketsFor(period: string): { label: string; from: Date; to: Date }[] {
  const now = new Date();
  const buckets: { label: string; from: Date; to: Date }[] = [];

  if (period === "daily") {
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    for (let h = 0; h < 24; h += 3) {
      const from = new Date(startOfDay.getTime() + h * 3600_000);
      const to = new Date(startOfDay.getTime() + (h + 3) * 3600_000);
      buckets.push({ label: String(h).padStart(2, "0"), from, to });
    }
  } else if (period === "monthly") {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    for (let w = 0; w < 4; w++) {
      const from = new Date(startOfMonth.getTime() + w * 7 * 86_400_000);
      const to = new Date(startOfMonth.getTime() + (w + 1) * 7 * 86_400_000);
      buckets.push({ label: `${w + 1}-h`, from, to });
    }
  } else if (period === "yearly") {
    for (let m = 11; m >= 0; m--) {
      const from = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const to = new Date(now.getFullYear(), now.getMonth() - m + 1, 1);
      buckets.push({ label: MONTH_LABELS[from.getMonth()], from, to });
    }
  } else {
    // weekly (default)
    for (let d = 6; d >= 0; d--) {
      const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d);
      const to = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d + 1);
      buckets.push({ label: WEEKDAY_LABELS[from.getDay()], from, to });
    }
  }
  return buckets;
}

export async function GET(req: NextRequest) {
  const period = req.nextUrl.searchParams.get("period") ?? "weekly";
  const buckets = bucketsFor(period);
  const rangeStart = buckets[0].from;
  const rangeEnd = buckets[buckets.length - 1].to;

  const [orders, activePreorders] = await Promise.all([
    prisma.order.findMany({
      where: { status: { not: "BekorQilindi" }, createdAt: { gte: rangeStart, lt: rangeEnd } },
      select: { total: true, createdAt: true },
    }),
    prisma.order.count({ where: { isPreorder: true, status: { notIn: ["Yetkazildi", "BekorQilindi"] } } }),
  ]);

  const bucketTotals = buckets.map((b) => {
    const inBucket = orders.filter((o) => o.createdAt >= b.from && o.createdAt < b.to);
    return { label: b.label, revenue: inBucket.reduce((sum, o) => sum + Number(o.total), 0), count: inBucket.length };
  });

  const revenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const orderCount = orders.length;
  const maxRevenue = Math.max(1, ...bucketTotals.map((b) => b.revenue));

  return NextResponse.json({
    period,
    periodLabel: PERIOD_LABELS[period] ?? "Haftalik",
    revenue,
    orderCount,
    averageReceipt: orderCount > 0 ? Math.round(revenue / orderCount) : 0,
    activePreorders,
    bars: bucketTotals.map((b) => ({ label: b.label, heightPct: Math.round((b.revenue / maxRevenue) * 100) })),
  });
}
