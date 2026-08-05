"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { formatSom } from "@/lib/format";
import { StatCard } from "@/components/admin/StatCard";

const RANGES = [
  { key: "today", label: "Bugun" },
  { key: "7d", label: "7 kun" },
  { key: "30d", label: "30 kun" },
  { key: "custom", label: "Boshqa" },
] as const;

type RangeKey = (typeof RANGES)[number]["key"];

const STATUS_COLOR: Record<string, string> = {
  "Yangi": "var(--star)",
  "To'lov tekshirilmoqda": "var(--star)",
  "Tasdiqlandi": "#2c6fb0",
  "Tayyorlanmoqda": "#2c6fb0",
  "Yo'lda": "#2c6fb0",
  "Yetkazildi": "var(--accent)",
  "Bekor qilindi": "var(--danger)",
};

interface AnalyticsData {
  sales: {
    revenue: number;
    revenueChangePct: number | null;
    orderCount: number;
    orderCountChangePct: number | null;
    avgOrderValue: number;
    avgOrderValueChangePct: number | null;
    chart: { label: string; revenue: number; orderCount: number; heightPct: number }[];
  };
  orders: {
    statusBreakdown: { status: string; count: number }[];
    avgDeliveryDays: number | null;
  };
  products: {
    bestSellers: { productId: string; name: string; deleted: boolean; qty: number; revenue: number }[];
    lowStock: { productId: string; name: string; quantity: number }[];
    outOfStock: { productId: string; name: string }[];
  };
  customers: {
    totalCustomers: number;
    newInRange: number;
    newChangePct: number | null;
    returningInRange: number;
    topCustomers: { customerId: string; name: string; phone: string; totalSpent: number; orderCount: number }[];
  };
  payments: { method: string; count: number; revenue: number }[];
  preorders: { count: number; revenue: number; revenueChangePct: number | null };
  discounts: { discountedRevenue: number; fullPriceRevenue: number; untrackedRevenue: number; coveragePct: number };
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-line bg-surface p-5.5">
      <h2 className="font-bold text-ink">{title}</h2>
      {subtitle && <p className="mt-1 text-[12.5px] text-muted">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function paramsKeyFor(range: RangeKey, customFrom: string, customTo: string): string | null {
  if (range === "custom" && (!customFrom || !customTo)) return null;
  const params = new URLSearchParams({ range });
  if (range === "custom") {
    params.set("from", customFrom);
    params.set("to", customTo);
  }
  return params.toString();
}

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<RangeKey>("7d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  // Keyed by the query params it was fetched with, so "loading" can be
  // derived (current key vs. result.key) instead of resetting data to null
  // synchronously in the effect body (which React flags as cascading-render
  // prone) -- this also means the previous range's numbers don't flash
  // away instantly, only once the new ones are ready.
  const [result, setResult] = useState<{ key: string; data: AnalyticsData } | null>(null);

  const currentKey = paramsKeyFor(range, customFrom, customTo);

  useEffect(() => {
    if (currentKey === null) return;
    fetch(`/api/admin/analytics?${currentKey}`)
      .then((res) => res.json())
      .then((data) => setResult({ key: currentKey, data }));
  }, [currentKey]);

  const data = result?.data ?? null;
  const loading = currentKey !== null && result?.key !== currentKey;

  const chartLabelStep = data ? Math.max(1, Math.ceil(data.sales.chart.length / 10)) : 1;
  const maxStatusCount = data ? Math.max(1, ...data.orders.statusBreakdown.map((s) => s.count)) : 1;
  const discountTotal = data
    ? data.discounts.discountedRevenue + data.discounts.fullPriceRevenue + data.discounts.untrackedRevenue
    : 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-[13.5px] font-semibold text-ink">Davr:</span>
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={clsx(
              "rounded-pill border px-3.5 py-2 text-[13px] font-semibold",
              range === r.key ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface text-ink"
            )}
          >
            {r.label}
          </button>
        ))}
        {range === "custom" && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="rounded-[9px] border border-line bg-bg px-3 py-2 text-[13px] outline-none"
            />
            <span className="text-muted">–</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="rounded-[9px] border border-line bg-bg px-3 py-2 text-[13px] outline-none"
            />
          </div>
        )}
      </div>

      {!data ? (
        <p className="text-sm text-muted">
          {range === "custom" && (!customFrom || !customTo) ? "Sana oralig'ini tanlang." : "Yuklanmoqda…"}
        </p>
      ) : (
        <div className={clsx("flex flex-col gap-5 transition-opacity", loading && "opacity-50")}>
          {/* Sales overview */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
            <StatCard label="Daromad" value={formatSom(data.sales.revenue)} changePct={data.sales.revenueChangePct} />
            <StatCard label="Buyurtmalar" value={String(data.sales.orderCount)} changePct={data.sales.orderCountChangePct} />
            <StatCard
              label="O'rtacha chek"
              value={formatSom(data.sales.avgOrderValue)}
              changePct={data.sales.avgOrderValueChangePct}
            />
            <StatCard label="Jami mijozlar" value={String(data.customers.totalCustomers)} />
          </div>

          <Section title="Sotuv dinamikasi">
            <div className="flex h-[180px] items-end gap-1.5 sm:gap-3">
              {data.sales.chart.map((b, i) => (
                <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <div className="w-full rounded-t-[6px] bg-accent" style={{ height: `${Math.max(b.heightPct, b.revenue > 0 ? 2 : 0)}%` }} />
                  <span className="text-[10.5px] text-muted">{i % chartLabelStep === 0 ? b.label : ""}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Orders */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Section title="Buyurtmalar holati bo'yicha">
              <div className="flex flex-col gap-2.5">
                {data.orders.statusBreakdown.length === 0 && <p className="text-sm text-muted">Bu davrda buyurtma yo&apos;q.</p>}
                {data.orders.statusBreakdown.map((s) => (
                  <div key={s.status} className="flex items-center gap-3">
                    <span className="w-[150px] shrink-0 truncate text-[13px] font-semibold text-ink">{s.status}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-pill bg-surface-2">
                      <div
                        className="h-full rounded-pill"
                        style={{ width: `${(s.count / maxStatusCount) * 100}%`, background: STATUS_COLOR[s.status] ?? "var(--accent)" }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right text-[13px] font-bold text-ink">{s.count}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="O'rtacha yetkazib berish muddati">
              <span className="text-2xl font-bold text-ink">
                {data.orders.avgDeliveryDays !== null ? `${data.orders.avgDeliveryDays.toFixed(1)} kun` : "—"}
              </span>
              <p className="mt-1.5 text-[12.5px] text-muted">
                Buyurtma qilingandan &quot;Yetkazildi&quot; holatiga o&apos;tgunicha o&apos;rtacha vaqt (shu davrda yetkazilgan buyurtmalar bo&apos;yicha).
              </p>
            </Section>
          </div>

          {/* Products */}
          <Section title="Eng ko'p sotilgan mahsulotlar" subtitle="Buyurtma qatorlari asosida (soni va summasi)">
            {data.products.bestSellers.length === 0 ? (
              <p className="text-sm text-muted">Bu davrda sotuv yo&apos;q.</p>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[420px]">
                  <div className="grid grid-cols-[2fr_0.8fr_1fr] gap-3 border-b border-line pb-2.5 text-xs font-bold uppercase tracking-[0.05em] text-muted">
                    <span>Mahsulot</span>
                    <span>Soni</span>
                    <span>Summasi</span>
                  </div>
                  {data.products.bestSellers.map((p) => (
                    <div key={p.productId} className="grid grid-cols-[2fr_0.8fr_1fr] items-center gap-3 border-b border-line py-2.5 text-[13.5px] text-ink">
                      <span className="flex items-center gap-1.5 font-bold">
                        {p.name}
                        {p.deleted && (
                          <span className="rounded-pill bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-muted">o&apos;chirilgan</span>
                        )}
                      </span>
                      <span>{p.qty}</span>
                      <span className="font-bold">{formatSom(p.revenue)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Section title="Tugagan mahsulotlar" subtitle="Hozirgi ombor holati (davrga bog'liq emas)">
              {data.products.outOfStock.length === 0 ? (
                <p className="text-sm text-muted">Tugagan mahsulot yo&apos;q.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {data.products.outOfStock.map((p) => (
                    <li key={p.productId} className="flex items-center justify-between text-[13.5px] text-ink">
                      <span>{p.name}</span>
                      <span className="font-bold text-danger">Tugadi</span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section title="Kam qolgan mahsulotlar" subtitle="Hozirgi ombor holati (davrga bog'liq emas)">
              {data.products.lowStock.length === 0 ? (
                <p className="text-sm text-muted">Kam qolgan mahsulot yo&apos;q.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {data.products.lowStock.map((p) => (
                    <li key={p.productId} className="flex items-center justify-between text-[13.5px] text-ink">
                      <span>{p.name}</span>
                      <span className="font-bold text-warning">{p.quantity} dona qoldi</span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>

          {/* Customers */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Section title="Mijozlar">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[13px] font-medium text-muted">Yangi mijozlar</p>
                  <p className="mt-1 text-xl font-bold text-ink">{data.customers.newInRange}</p>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-muted">Qaytgan mijozlar</p>
                  <p className="mt-1 text-xl font-bold text-ink">{data.customers.returningInRange}</p>
                </div>
              </div>
            </Section>

            <Section title="To'lov usullari">
              {data.payments.length === 0 ? (
                <p className="text-sm text-muted">Bu davrda buyurtma yo&apos;q.</p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {data.payments.map((p) => (
                    <div key={p.method} className="flex items-center justify-between text-[13.5px] text-ink">
                      <span className="font-semibold">{p.method}</span>
                      <span className="text-muted">
                        {p.count} ta · <span className="font-bold text-ink">{formatSom(p.revenue)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>

          <Section title="Eng ko'p xarid qilgan mijozlar">
            {data.customers.topCustomers.length === 0 ? (
              <p className="text-sm text-muted">Bu davrda buyurtma yo&apos;q.</p>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[420px]">
                  <div className="grid grid-cols-[1.5fr_1fr_0.8fr_1fr] gap-3 border-b border-line pb-2.5 text-xs font-bold uppercase tracking-[0.05em] text-muted">
                    <span>Mijoz</span>
                    <span>Telefon</span>
                    <span>Buyurtma</span>
                    <span>Summasi</span>
                  </div>
                  {data.customers.topCustomers.map((c) => (
                    <div key={c.customerId} className="grid grid-cols-[1.5fr_1fr_0.8fr_1fr] items-center gap-3 border-b border-line py-2.5 text-[13.5px] text-ink">
                      <span className="font-bold">{c.name}</span>
                      <span className="text-muted">{c.phone}</span>
                      <span>{c.orderCount}</span>
                      <span className="font-bold">{formatSom(c.totalSpent)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {/* Preorders */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
            <StatCard label="Oldindan buyurtmalar soni" value={String(data.preorders.count)} />
            <StatCard
              label="Oldindan buyurtmalar summasi"
              value={formatSom(data.preorders.revenue)}
              changePct={data.preorders.revenueChangePct}
            />
          </div>

          {/* Discounts */}
          <Section
            title="Chegirma bo'yicha sotuvlar"
            subtitle={
              data.discounts.coveragePct < 100
                ? `Bu davr daromadining ${Math.round(data.discounts.coveragePct)}% kuzatilgan — qolgani kuzatuv boshlanishidan oldingi buyurtmalar bo'lib, chegirma ma'lumoti mavjud emas.`
                : "Bu davr uchun to'liq ma'lumot mavjud."
            }
          >
            {discountTotal === 0 ? (
              <p className="text-sm text-muted">Bu davrda sotuv yo&apos;q.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-[13.5px] text-ink">
                  <span className="font-semibold">Chegirmali sotuvlar</span>
                  <span className="font-bold">{formatSom(data.discounts.discountedRevenue)}</span>
                </div>
                <div className="flex items-center justify-between text-[13.5px] text-ink">
                  <span className="font-semibold">To&apos;liq narxdagi sotuvlar</span>
                  <span className="font-bold">{formatSom(data.discounts.fullPriceRevenue)}</span>
                </div>
                {data.discounts.untrackedRevenue > 0 && (
                  <div className="flex items-center justify-between text-[13.5px] text-muted">
                    <span>Kuzatuvdan oldingi (noma&apos;lum)</span>
                    <span>{formatSom(data.discounts.untrackedRevenue)}</span>
                  </div>
                )}
              </div>
            )}
          </Section>
        </div>
      )}
    </div>
  );
}
