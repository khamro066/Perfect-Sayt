"use client";

import { useEffect, useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { colorName } from "@/lib/colors";
import { formatSom } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { Order } from "@/lib/types";

export default function AdminPaymentVerificationPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  function refetch() {
    fetch("/api/admin/orders").then((res) => res.json()).then(setOrders);
  }

  useEffect(refetch, []);

  async function setStatus(order: Order, status: "Tasdiqlandi" | "Bekor qilindi") {
    setOrders((prev) => prev.filter((o) => o.id !== order.id));
    await fetch(`/api/admin/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    showToast(status === "Tasdiqlandi" ? "Buyurtma tasdiqlandi" : "Buyurtma bekor qilindi");
  }

  const pending = orders.filter((o) => o.status === "To'lov tekshirilmoqda");

  return (
    <div className="rounded-card border border-line bg-surface p-5.5">
      <h2 className="font-bold text-ink">To&apos;lov tekshirish</h2>
      <p className="mt-1.5 mb-4 text-[13px] text-muted">
        Karta orqali to&apos;lagan mijozlar — chekni Telegram&apos;da tekshirib, buyurtmani tasdiqlang yoki bekor
        qiling.
      </p>

      {pending.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-muted">Hozircha tekshiriladigan to&apos;lov yo&apos;q</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-[0.3fr_1.1fr_1.4fr_0.9fr_1fr_1.6fr] gap-3 border-b border-line pb-2.5 text-xs font-bold uppercase tracking-[0.05em] text-muted">
              <span /><span>Raqam</span><span>Mijoz</span><span>Sana</span><span>Summa</span><span>Amallar</span>
            </div>

            {pending.map((o) => {
              const isOpen = expanded === o.orderNumber;
              return (
                <div key={o.orderNumber} className="border-b border-line">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setExpanded(isOpen ? null : o.orderNumber)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setExpanded(isOpen ? null : o.orderNumber);
                      }
                    }}
                    className="grid w-full cursor-pointer grid-cols-[0.3fr_1.1fr_1.4fr_0.9fr_1fr_1.6fr] items-center gap-3 py-3 text-left text-[13.5px] text-ink"
                  >
                    <span className="text-muted">{isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
                    <span className="font-bold">{o.orderNumber}</span>
                    <span>{o.customerName}</span>
                    <span className="text-muted">{o.createdAt}</span>
                    <span className="font-bold">{formatSom(o.total)}</span>
                    <span className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setStatus(o, "Tasdiqlandi")}
                        className="rounded-[8px] bg-accent px-3 py-1.5 text-[12.5px] font-semibold text-accent-ink"
                      >
                        Tasdiqlash
                      </button>
                      <button
                        onClick={() => setStatus(o, "Bekor qilindi")}
                        className="rounded-[8px] border border-danger px-3 py-1.5 text-[12.5px] font-semibold text-danger"
                      >
                        Bekor qilish
                      </button>
                    </span>
                  </div>
                  {isOpen && (
                    <div className="bg-surface-2 py-4 pl-8.5 pr-2">
                      <div className="flex flex-wrap gap-5 pb-2.5 text-[13px] text-ink">
                        <span>Mijoz: <b>{o.customerName}</b></span>
                        <span>Telefon: <b>{o.phone}</b></span>
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
      )}
    </div>
  );
}
