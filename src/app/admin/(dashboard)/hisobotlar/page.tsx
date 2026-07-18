"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { formatSom } from "@/lib/format";

const PERIODS = [
  { key: "daily", label: "Kunlik" },
  { key: "weekly", label: "Haftalik" },
  { key: "monthly", label: "Oylik" },
  { key: "yearly", label: "Yillik" },
] as const;

type PeriodKey = (typeof PERIODS)[number]["key"];

interface ReportData {
  periodLabel: string;
  revenue: number;
  orderCount: number;
  averageReceipt: number;
  activePreorders: number;
  bars: { label: string; heightPct: number }[];
}

export default function AdminReportsPage() {
  const [period, setPeriod] = useState<PeriodKey>("weekly");
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => {
    fetch(`/api/admin/reports?period=${period}`)
      .then((res) => res.json())
      .then(setData);
  }, [period]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-[13.5px] font-semibold text-ink">Davr:</span>
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={clsx(
              "rounded-pill border px-3.5 py-2 text-[13px] font-semibold",
              period === p.key ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface text-ink"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {!data ? (
        <p className="text-sm text-muted">Yuklanmoqda…</p>
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
            <StatCard label={`${data.periodLabel} daromad`} value={formatSom(data.revenue)} />
            <StatCard label={`${data.periodLabel} buyurtmalar`} value={String(data.orderCount)} />
            <StatCard label="O'rtacha chek" value={formatSom(data.averageReceipt)} />
            <StatCard label="Faol oldindan buyurtmalar" value={String(data.activePreorders)} />
          </div>

          <div className="rounded-card border border-line bg-surface p-6">
            <h2 className="font-bold text-ink">Sotuv statistikasi · {data.periodLabel}</h2>
            <div className="mt-5.5 flex h-[180px] items-end gap-3.5">
              {data.bars.map((b) => (
                <div key={b.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <div className="w-full rounded-t-[8px] bg-accent" style={{ height: `${b.heightPct}%` }} />
                  <span className="text-[11.5px] text-muted">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
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
