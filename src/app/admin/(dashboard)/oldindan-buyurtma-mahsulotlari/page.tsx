"use client";

import { useState } from "react";
import { useAdminData } from "@/lib/admin-data-context";
import { useToast } from "@/lib/toast-context";
import { ALL_COLORS, colorName } from "@/lib/colors";
import { formatSom } from "@/lib/format";

export default function AdminPreorderProductsPage() {
  const { products, categories, addProduct, totalStockFor } = useAdminData();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0] ?? "");
  const [colorHex, setColorHex] = useState(ALL_COLORS[0]);
  const [price, setPrice] = useState("");
  const [days, setDays] = useState("");

  const outOfStock = products.filter((p) => totalStockFor(p.id) <= 0);

  function submit() {
    if (!name.trim() || !price) {
      showToast("Nom va narxni kiriting");
      return;
    }
    addProduct({
      id: `pre-${Date.now()}`,
      name: name.trim(),
      brand: "Perfect",
      gender: "Erkaklar",
      category,
      material: "Charm",
      price: Number(price),
      rating: 0,
      ratingCount: 0,
      description: "",
      colors: [colorHex],
      sizes: [40, 41, 42, 43, 44],
      productionDays: Number(days) > 0 ? Number(days) : 21,
      sold: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    });
    setName(""); setPrice(""); setDays("");
    showToast("Oldindan buyurtma mahsuloti qo'shildi");
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-card border border-line bg-surface p-5.5">
        <h2 className="font-bold text-ink">Oldindan buyurtma mahsuloti qo&apos;shish</h2>
        <p className="mt-1.5 mb-4 text-[13px] text-muted">
          Hali omborda yo&apos;q yoki ishlab chiqarilmagan mahsulotlarni shu yerdan qo&apos;shing — ular mijozlar
          uchun &quot;Oldindan buyurtma&quot; bo&apos;limida ko&apos;rinadi.
        </p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3.5">
          <label className="flex flex-col gap-1.5 text-[12.5px] text-muted">
            Nomi
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mahsulot nomi" className="rounded-[10px] border border-line bg-bg px-3.5 py-2.5 text-sm text-ink outline-none" />
          </label>
          <label className="flex flex-col gap-1.5 text-[12.5px] text-muted">
            Kategoriya
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-[10px] border border-line bg-bg px-3.5 py-2.5 text-sm text-ink outline-none">
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-[12.5px] text-muted">
            Rang
            <select value={colorHex} onChange={(e) => setColorHex(e.target.value)} className="rounded-[10px] border border-line bg-bg px-3.5 py-2.5 text-sm text-ink outline-none">
              {ALL_COLORS.map((hex) => <option key={hex} value={hex}>{colorName(hex)}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-[12.5px] text-muted">
            Narx (so&apos;m)
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="1290000" className="rounded-[10px] border border-line bg-bg px-3.5 py-2.5 text-sm text-ink outline-none" />
          </label>
          <label className="flex flex-col gap-1.5 text-[12.5px] text-muted">
            Ishlab chiqarish (kun)
            <input type="number" value={days} onChange={(e) => setDays(e.target.value)} placeholder="21" className="rounded-[10px] border border-line bg-bg px-3.5 py-2.5 text-sm text-ink outline-none" />
          </label>
        </div>
        <button onClick={submit} className="mt-4 rounded-btn bg-accent px-6 py-3 text-sm font-semibold text-accent-ink">
          + Oldindan buyurtma mahsulotini qo&apos;shish
        </button>
      </div>

      <div className="rounded-card border border-line bg-surface p-5.5">
        <h2 className="font-bold text-ink">Oldindan buyurtma mahsulotlari ro&apos;yxati</h2>
        <div className="mt-3 overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr] gap-3 border-b border-line pb-2.5 text-xs font-bold uppercase tracking-[0.05em] text-muted">
              <span>Nomi</span><span>Kategoriya</span><span>Narx</span><span>Ishlab chiqarish</span>
            </div>
            {outOfStock.map((p) => (
              <div key={p.id} className="grid grid-cols-[2fr_1.2fr_1fr_1fr] items-center gap-3 border-b border-line py-3 text-[13.5px] text-ink">
                <span className="font-bold">{p.name}</span>
                <span className="text-muted">{p.category}</span>
                <span className="font-bold">{formatSom(p.price)}</span>
                <span className="text-muted">{p.productionDays ?? 14}–{(p.productionDays ?? 14) + 7} kun</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
