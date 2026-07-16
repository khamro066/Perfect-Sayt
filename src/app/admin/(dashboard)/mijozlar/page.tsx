"use client";

import { useMemo } from "react";
import { useOrders } from "@/lib/orders-context";
import { formatSom } from "@/lib/format";

export default function AdminCustomersPage() {
  const { orders } = useOrders();

  const customers = useMemo(() => {
    const byPhone = new Map<string, { name: string; phone: string; address?: string; total: number; count: number }>();
    for (const o of orders) {
      const existing = byPhone.get(o.phone);
      if (existing) {
        existing.total += o.total;
        existing.count += 1;
        existing.name = o.customerName;
        existing.address = o.address;
      } else {
        byPhone.set(o.phone, { name: o.customerName, phone: o.phone, address: o.address, total: o.total, count: 1 });
      }
    }
    return Array.from(byPhone.values());
  }, [orders]);

  return (
    <div className="rounded-card border border-line bg-surface p-5.5">
      <h2 className="font-bold text-ink">Mijozlar</h2>
      <p className="mt-1.5 mb-4 text-[13px] text-muted">
        Telefon raqami bo&apos;yicha dublikatsiz ro&apos;yxat — buyurtma berilganda avtomatik yig&apos;iladi.
      </p>
      <div className="overflow-x-auto">
        <div className="min-w-[560px]">
          <div className="grid grid-cols-[1.2fr_1.2fr_1.6fr_0.9fr_0.9fr] gap-3 border-b border-line pb-2.5 text-xs font-bold uppercase tracking-[0.05em] text-muted">
            <span>Ism</span><span>Telefon</span><span>Manzil</span><span>Summa</span><span>Buyurtmalar</span>
          </div>
          {customers.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-muted">Hozircha mijozlar yo&apos;q</p>
          ) : (
            customers.map((c) => (
              <div key={c.phone} className="grid grid-cols-[1.2fr_1.2fr_1.6fr_0.9fr_0.9fr] items-center gap-3 border-b border-line py-3 text-[13px] text-ink">
                <span className="font-bold">{c.name}</span>
                <span className="text-muted">{c.phone}</span>
                <span className="truncate text-muted">{c.address ?? "—"}</span>
                <span className="font-bold">{formatSom(c.total)}</span>
                <span className="font-bold">{c.count}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
