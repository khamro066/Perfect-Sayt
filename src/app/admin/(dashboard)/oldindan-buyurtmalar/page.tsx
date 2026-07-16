"use client";

import { useOrders } from "@/lib/orders-context";
import { OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = ["Yangi", "Tasdiqlandi", "Tayyorlanmoqda", "Yo'lda", "Yetkazildi", "Bekor qilindi"];

export default function AdminPreordersPage() {
  const { orders, setStatus } = useOrders();
  const preorders = orders.filter((o) => o.isPreorder);

  return (
    <div className="rounded-card border border-line bg-surface p-5.5">
      <h2 className="font-bold text-ink">Oldindan buyurtmalar</h2>
      <p className="mt-1.5 mb-4 text-[13px] text-muted">
        Bu ro&apos;yxat &quot;Buyurtmalar&quot; bo&apos;limi bilan bir xil ma&apos;lumotdan olinadi
        (is_preorder=true) — ikkisi doim sinxron.
      </p>

      {preorders.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-muted">Hozircha oldindan buyurtmalar yo&apos;q</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-[1fr_1.3fr_1.5fr_0.6fr_1fr_1.4fr] gap-3 border-b border-line pb-2.5 text-xs font-bold uppercase tracking-[0.05em] text-muted">
              <span>Raqam</span><span>Mijoz</span><span>Mahsulot</span><span>Soni</span><span>Yetkazish</span><span>Holat</span>
            </div>
            {preorders.map((o) => {
              const line = o.lines[0];
              const totalQty = o.lines.reduce((s, l) => s + l.qty, 0);
              return (
                <div key={o.orderNumber} className="grid grid-cols-[1fr_1.3fr_1.5fr_0.6fr_1fr_1.4fr] items-center gap-3 border-b border-line py-3 text-[13px] text-ink">
                  <span className="font-bold">{o.orderNumber}</span>
                  <span>{o.customerName}</span>
                  <span className="text-muted">{line?.productName}</span>
                  <span>{totalQty}</span>
                  <span className="text-muted">14–21 kun</span>
                  <select
                    value={o.status}
                    onChange={(e) => setStatus(o.orderNumber, e.target.value as OrderStatus)}
                    className="rounded-[9px] border border-line bg-bg px-2.5 py-2 text-[12.5px] font-semibold outline-none"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
