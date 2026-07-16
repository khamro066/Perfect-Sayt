"use client";

import { useState } from "react";
import clsx from "clsx";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useOrders } from "@/lib/orders-context";
import { colorName } from "@/lib/colors";
import { formatSom } from "@/lib/format";
import { OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = ["Yangi", "Tasdiqlandi", "Tayyorlanmoqda", "Yo'lda", "Yetkazildi", "Bekor qilindi"];

const STATUS_COLOR: Record<OrderStatus, string> = {
  "Yangi": "var(--star)",
  "Tasdiqlandi": "#2c6fb0",
  "Tayyorlanmoqda": "#2c6fb0",
  "Yo'lda": "#2c6fb0",
  "Yetkazildi": "var(--accent)",
  "Bekor qilindi": "var(--danger)",
};

export default function AdminOrdersPage() {
  const { orders, setStatus } = useOrders();
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = orders.filter((o) => (filter === "all" ? true : o.status === filter));

  return (
    <div className="rounded-card border border-line bg-surface p-5.5">
      <h2 className="font-bold text-ink">Barcha buyurtmalar</h2>

      <div className="mt-3.5 flex flex-wrap gap-2">
        {(["all", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={clsx(
              "rounded-pill border px-3.5 py-2 text-[13px] font-semibold",
              filter === s ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface text-ink"
            )}
          >
            {s === "all" ? "Barchasi" : s}
          </button>
        ))}
      </div>

      <div className="mt-3 overflow-x-auto">
      <div className="min-w-[640px]">
      <div className="grid grid-cols-[0.3fr_1.1fr_1.4fr_0.9fr_1fr_1.4fr] gap-3 border-b border-line pb-2.5 text-xs font-bold uppercase tracking-[0.05em] text-muted">
        <span /><span>Raqam</span><span>Mijoz</span><span>Sana</span><span>Summa</span><span>Holat</span>
      </div>

      {filtered.map((o) => {
        const isOpen = expanded === o.orderNumber;
        return (
          <div key={o.orderNumber} className="border-b border-line">
            <button
              onClick={() => setExpanded(isOpen ? null : o.orderNumber)}
              className="grid w-full grid-cols-[0.3fr_1.1fr_1.4fr_0.9fr_1fr_1.4fr] items-center gap-3 py-3 text-left text-[13.5px] text-ink"
            >
              <span className="text-muted">{isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
              <span className="flex items-center gap-1.5 font-bold">
                {o.orderNumber}
                {o.isPreorder && (
                  <span className="rounded-pill bg-preorder-bg px-1.5 py-0.5 text-[10px] font-bold text-preorder-ink">PRE-ORDER</span>
                )}
              </span>
              <span>{o.customerName}</span>
              <span className="text-muted">{o.createdAt}</span>
              <span className="font-bold">{formatSom(o.total)}</span>
              <select
                value={o.status}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setStatus(o.orderNumber, e.target.value as OrderStatus)}
                className="rounded-[9px] border border-line bg-bg px-2.5 py-2 text-[12.5px] font-semibold outline-none"
                style={{ color: STATUS_COLOR[o.status] }}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </button>
            {isOpen && (
              <div className="bg-surface-2 py-4 pl-8.5 pr-2">
                <div className="flex flex-wrap gap-5 pb-2.5 text-[13px] text-ink">
                  <span>Mijoz: <b>{o.customerName}</b></span>
                  <span>Manzil: <b>{o.address ?? "—"}</b></span>
                  <span>To&apos;lov: <b>{o.payment ?? "—"}</b></span>
                </div>
                <div className="flex flex-col gap-2 pt-2.5">
                  {o.lines.map((l, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-3.5 rounded-[10px] border border-line bg-surface px-3.5 py-2.5 text-[13px] text-ink">
                      <span className="flex-[1.4] font-bold">{l.productName}</span>
                      <span className="text-muted">{formatSom(l.unitPrice)} / dona</span>
                      <span className="font-bold">{formatSom(l.unitPrice * l.qty)}</span>
                      <span className="flex items-center gap-1.5 text-muted">
                        <span className="h-3 w-3 rounded-full border border-line" style={{ background: l.colorHex }} />
                        {colorName(l.colorHex)}
                      </span>
                      <span className="text-muted">O&apos;lcham {l.size}</span>
                      <span className="text-muted">{l.qty} juft</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
      </div>
      </div>
    </div>
  );
}
