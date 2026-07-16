"use client";

import { useState } from "react";
import clsx from "clsx";
import { useOrders } from "@/lib/orders-context";
import { formatSom } from "@/lib/format";

const PERIODS = {
  daily: {
    label: "Kunlik",
    bars: [["07", 40], ["08", 55], ["09", 35], ["10", 70], ["11", 90], ["12", 60], ["13", 100]] as const,
    revenue: 2380000, orders: 4,
  },
  weekly: {
    label: "Haftalik",
    bars: [["Du", 55], ["Se", 72], ["Ch", 48], ["Pa", 90], ["Ju", 100], ["Sh", 84], ["Ya", 66]] as const,
    revenue: 14650000, orders: 23,
  },
  monthly: {
    label: "Oylik",
    bars: [["1-h", 62], ["2-h", 78], ["3-h", 54], ["4-h", 100]] as const,
    revenue: 48200000, orders: 96,
  },
  yearly: {
    label: "Yillik",
    bars: [["Yan", 40], ["Fev", 55], ["Mar", 62], ["Apr", 70], ["May", 85], ["Iyun", 100]] as const,
    revenue: 412000000, orders: 780,
  },
} as const;

type PeriodKey = keyof typeof PERIODS;

export default function AdminReportsPage() {
  const { orders } = useOrders();
  const [period, setPeriod] = useState<PeriodKey>("weekly");
  const data = PERIODS[period];
  const activePreorders = orders.filter(
    (o) => o.isPreorder && o.status !== "Yetkazildi" && o.status !== "Bekor qilindi"
  ).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-[13.5px] font-semibold text-ink">Davr:</span>
        {(Object.keys(PERIODS) as PeriodKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setPeriod(k)}
            className={clsx(
              "rounded-pill border px-3.5 py-2 text-[13px] font-semibold",
              period === k ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface text-ink"
            )}
          >
            {PERIODS[k].label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <StatCard label={`${data.label} daromad`} value={formatSom(data.revenue)} />
        <StatCard label={`${data.label} buyurtmalar`} value={String(data.orders)} />
        <StatCard label="O'rtacha chek" value={formatSom(Math.round(data.revenue / data.orders))} />
        <StatCard label="Faol oldindan buyurtmalar" value={String(activePreorders)} />
      </div>

      <div className="rounded-card border border-line bg-surface p-6">
        <h2 className="font-bold text-ink">Sotuv statistikasi · {data.label}</h2>
        <div className="mt-5.5 flex h-[180px] items-end gap-3.5">
          {data.bars.map(([label, value]) => (
            <div key={label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <div className="w-full rounded-t-[8px] bg-accent" style={{ height: `${value}%` }} />
              <span className="text-[11.5px] text-muted">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-card border border-line bg-surface p-5.5">
      <span className="text-[13px] font-medium text-muted">{label}</span>
      <span className="text-2xl font-bold text-ink">{value}</span>
    </div>
  );
}
