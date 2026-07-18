"use client";

import { useEffect, useState } from "react";
import { formatSom } from "@/lib/format";
import { Customer } from "@/lib/types";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    fetch("/api/admin/customers").then((res) => res.json()).then(setCustomers);
  }, []);

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
                <span className="font-bold">{c.ism} {c.familiya}</span>
                <span className="text-muted">{c.phone}</span>
                <span className="truncate text-muted">{c.manzil ?? "—"}</span>
                <span className="font-bold">{formatSom(c.totalSpent)}</span>
                <span className="font-bold">{c.orderCount}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
