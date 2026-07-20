"use client";

import { useEffect, useState } from "react";
import { formatSom } from "@/lib/format";
import { Order, OrderStatus } from "@/lib/types";

const STATUS_COLOR: Record<OrderStatus, string> = {
  "Yangi": "var(--star)",
  "To'lov tekshirilmoqda": "var(--star)",
  "Tasdiqlandi": "#2c6fb0",
  "Tayyorlanmoqda": "#2c6fb0",
  "Yo'lda": "#2c6fb0",
  "Yetkazildi": "var(--accent)",
  "Bekor qilindi": "var(--danger)",
};

interface DashboardData {
  totalProducts: number;
  totalStock: number;
  activePreorders: number;
  monthlyRevenue: number;
  recentOrders: Order[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <p className="text-sm text-muted">Yuklanmoqda…</p>;

  const cards = [
    { label: "Jami mahsulotlar", value: String(data.totalProducts) },
    { label: "Ombordagi juftlar", value: String(data.totalStock) },
    { label: "Faol oldindan buyurtmalar", value: String(data.activePreorders) },
    { label: "Oylik daromad", value: formatSom(data.monthlyRevenue) },
  ];

  return (
    <div className="flex flex-col gap-6.5">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {cards.map((c) => (
          <div key={c.label} className="flex flex-col gap-2 rounded-card border border-line bg-surface p-5.5">
            <span className="text-[13px] font-medium text-muted">{c.label}</span>
            <span className="text-2xl font-bold text-ink">{c.value}</span>
          </div>
        ))}
      </div>

      <div className="rounded-card border border-line bg-surface p-5.5">
        <h2 className="font-bold text-ink">So&apos;nggi buyurtmalar</h2>
        <div className="mt-3 overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-[1.2fr_1.5fr_1fr_1fr_1fr] gap-3 border-b border-line pb-2.5 text-xs font-bold uppercase tracking-[0.05em] text-muted">
              <span>Raqam</span>
              <span>Mijoz</span>
              <span>Sana</span>
              <span>Summa</span>
              <span>Holat</span>
            </div>
            {data.recentOrders.map((o) => (
              <div key={o.orderNumber} className="grid grid-cols-[1.2fr_1.5fr_1fr_1fr_1fr] items-center gap-3 border-b border-line py-3 text-[13.5px] text-ink">
                <span className="flex items-center gap-1.5 font-bold">
                  {o.orderNumber}
                  {o.isPreorder && (
                    <span className="rounded-pill bg-preorder-bg px-1.5 py-0.5 text-[10px] font-bold tracking-[0.03em] text-preorder-ink">
                      PRE-ORDER
                    </span>
                  )}
                </span>
                <span>{o.customerName}</span>
                <span className="text-muted">{o.createdAt}</span>
                <span className="font-bold">{formatSom(o.total)}</span>
                <span className="font-bold" style={{ color: STATUS_COLOR[o.status] }}>{o.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
