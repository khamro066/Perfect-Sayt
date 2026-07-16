"use client";

import { useMemo, useState } from "react";
import { useAdminData } from "@/lib/admin-data-context";
import { colorName } from "@/lib/colors";

export default function AdminStockPage() {
  const { products, stock, setStockQty } = useAdminData();
  const [modelFilter, setModelFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const allColors = useMemo(() => Array.from(new Set(stock.map((s) => s.colorHex))), [stock]);
  const allSizes = useMemo(() => Array.from(new Set(stock.map((s) => s.size))).sort((a, b) => a - b), [stock]);

  function statusFor(qty: number) {
    if (qty <= 0) return { label: "Tugadi", color: "var(--danger)" };
    if (qty < 5) return { label: "Kam qoldi", color: "var(--warning)" };
    return { label: "Yetarli", color: "var(--success)" };
  }

  const rows = stock.filter((s) => {
    const product = products.find((p) => p.id === s.productId);
    if (!product) return false;
    if (modelFilter && product.name !== modelFilter) return false;
    if (colorFilter && s.colorHex !== colorFilter) return false;
    if (sizeFilter && s.size !== Number(sizeFilter)) return false;
    if (statusFilter && statusFor(s.quantity).label !== statusFilter) return false;
    return true;
  });

  return (
    <div className="rounded-card border border-line bg-surface p-5.5">
      <h2 className="font-bold text-ink">Ombor nazorati</h2>
      <p className="mt-1.5 mb-4 text-[13px] text-muted">
        Model → rang → o&apos;lcham bo&apos;yicha qoldiqlar. Kam qolgan (sariq) va tugagan (qizil) qatorlarga
        e&apos;tibor bering.
      </p>

      <div className="mb-4 flex flex-wrap gap-2.5">
        <select value={modelFilter} onChange={(e) => setModelFilter(e.target.value)} className="rounded-[9px] border border-line bg-bg px-3 py-2 text-[13px] outline-none">
          <option value="">Barchasi (model)</option>
          {products.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
        </select>
        <select value={colorFilter} onChange={(e) => setColorFilter(e.target.value)} className="rounded-[9px] border border-line bg-bg px-3 py-2 text-[13px] outline-none">
          <option value="">Barchasi (rang)</option>
          {allColors.map((hex) => <option key={hex} value={hex}>{colorName(hex)}</option>)}
        </select>
        <select value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)} className="rounded-[9px] border border-line bg-bg px-3 py-2 text-[13px] outline-none">
          <option value="">Barchasi (o&apos;lcham)</option>
          {allSizes.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-[9px] border border-line bg-bg px-3 py-2 text-[13px] outline-none">
          <option value="">Barchasi (holat)</option>
          <option value="Yetarli">Yetarli</option>
          <option value="Kam qoldi">Kam qoldi</option>
          <option value="Tugadi">Tugadi</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[560px]">
          <div className="grid grid-cols-[2fr_1fr_0.8fr_1fr_1.2fr] gap-3 border-b border-line pb-2.5 text-xs font-bold uppercase tracking-[0.05em] text-muted">
            <span>Model</span><span>Rang</span><span>O&apos;lcham</span><span>Qoldiq</span><span>Holat</span>
          </div>
          {rows.map((s) => {
            const product = products.find((p) => p.id === s.productId)!;
            const st = statusFor(s.quantity);
            return (
              <div key={`${s.productId}-${s.colorHex}-${s.size}`} className="grid grid-cols-[2fr_1fr_0.8fr_1fr_1.2fr] items-center gap-3 border-b border-line py-2.5 text-[13.5px] text-ink">
                <span className="font-bold">{product.name}</span>
                <span className="flex items-center gap-1.5 text-muted">
                  <span className="h-3.5 w-3.5 rounded-full border border-line" style={{ background: s.colorHex }} />
                  {colorName(s.colorHex)}
                </span>
                <span>{s.size}</span>
                <input
                  type="number"
                  value={s.quantity}
                  onChange={(e) => setStockQty(s.productId, s.colorHex, s.size, Number(e.target.value))}
                  className="w-[76px] rounded-[8px] border border-line bg-bg px-2.5 py-1.5 text-[13px] outline-none"
                />
                <span className="font-bold" style={{ color: st.color }}>{st.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
