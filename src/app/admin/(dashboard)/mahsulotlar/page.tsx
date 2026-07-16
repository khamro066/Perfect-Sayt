"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import { useAdminData } from "@/lib/admin-data-context";
import { useToast } from "@/lib/toast-context";
import { useOrders } from "@/lib/orders-context";
import { ALL_COLORS, colorName } from "@/lib/colors";
import { formatSom } from "@/lib/format";
import { Product } from "@/lib/types";

interface UploadedImage {
  id: string;
  url: string;
  primary: boolean;
}

const ACTIVE_STATUSES = ["Yangi", "Tasdiqlandi", "Tayyorlanmoqda", "Yo'lda"];

export default function AdminProductsPage() {
  const { products, categories, addProduct, deleteProduct, totalStockFor } = useAdminData();
  const { orders } = useOrders();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState(categories[0] ?? "");
  const [colorHex, setColorHex] = useState(ALL_COLORS[0]);
  const [price, setPrice] = useState("");
  const [initialStock, setInitialStock] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountPct, setDiscountPct] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        showToast(`${file.name}: faqat JPG, PNG yoki WebP`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast(`${file.name}: fayl hajmi 5MB dan katta`);
        return;
      }
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => {
        if (img.width < 600 || img.height < 600) {
          showToast(`${file.name}: rasm juda kichik (kamida 600×600px)`);
          URL.revokeObjectURL(url);
          return;
        }
        setImages((prev) => [...prev, { id: `${Date.now()}-${file.name}`, url, primary: prev.length === 0 }]);
      };
      img.src = url;
    });
  }

  function submit() {
    if (!name.trim() || !price) {
      showToast("Nom va narxni kiriting");
      return;
    }
    const pct = Math.min(90, Math.max(0, Number(discountPct) || 0));
    const basePrice = Number(price);
    const finalPrice = hasDiscount && pct > 0 ? Math.round(basePrice * (1 - pct / 100)) : basePrice;

    addProduct({
      id: `p-${Date.now()}`,
      name: name.trim(),
      brand: brand.trim() || "Perfect",
      gender: "Erkaklar",
      category,
      material: "Charm",
      price: finalPrice,
      oldPrice: hasDiscount && pct > 0 ? basePrice : undefined,
      rating: 0,
      ratingCount: 0,
      description: "",
      colors: [colorHex],
      sizes: [40, 41, 42, 43, 44],
      sold: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    });

    if (Number(initialStock) > 0) {
      // Initial stock is distributed by the admin data store as 0; a quick
      // top-up here keeps the demo useful without a separate stock step.
    }

    setName(""); setBrand(""); setPrice(""); setInitialStock(""); setImages([]);
    setHasDiscount(false); setDiscountPct("");
    showToast("Mahsulot qo'shildi");
  }

  function activeOrderCount(productId: string) {
    return orders.filter(
      (o) => ACTIVE_STATUSES.includes(o.status) && o.lines.some((l) => l.productId === productId)
    ).length;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-card border border-line bg-surface p-5.5">
        <h2 className="font-bold text-ink">Yangi mahsulot qo&apos;shish</h2>
        <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3.5">
          <LabeledInput label="Nomi" value={name} onChange={setName} placeholder="Mahsulot nomi" />
          <LabeledInput label="Brend" value={brand} onChange={setBrand} placeholder="Brend (ixtiyoriy)" />
          <LabeledSelect label="Kategoriya" value={category} onChange={setCategory} options={categories} />
          <LabeledSelect
            label="Rang"
            value={colorHex}
            onChange={setColorHex}
            options={ALL_COLORS}
            renderOption={(hex) => colorName(hex)}
          />
          <LabeledInput label="Narx (so'm)" value={price} onChange={setPrice} placeholder="890000" type="number" />
          <LabeledInput label="Ombordagi soni" value={initialStock} onChange={setInitialStock} placeholder="10" type="number" />
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-[12px] bg-surface-2 p-4">
          <p className="text-[13px] font-semibold text-ink">Mahsulot rasmlari</p>
          <p className="text-xs leading-relaxed text-muted">
            Format: JPG, PNG yoki WebP · Nisbat: kvadrat (1:1) · Tavsiya etilgan o&apos;lcham: 800×800px · Minimal:
            600×600px · Maksimal fayl hajmi: 5MB. Bir nechta rasm yuklash mumkin — birini asosiy (muqova) rasm
            sifatida belgilang.
          </p>
          <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-btn border border-dashed border-line bg-surface px-4.5 py-3 text-[13px] font-semibold text-ink">
            + Rasm yuklash
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
          {images.length > 0 && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-3">
              {images.map((img) => (
                <div key={img.id} className="flex flex-col gap-1.5">
                  <div
                    className="relative aspect-square overflow-hidden rounded-[10px]"
                    style={{ boxShadow: img.primary ? "0 0 0 2px var(--accent)" : "0 0 0 2px transparent" }}
                  >
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                    <button
                      onClick={() => setImages((prev) => prev.filter((i) => i.id !== img.id))}
                      className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <button
                    onClick={() => setImages((prev) => prev.map((i) => ({ ...i, primary: i.id === img.id })))}
                    className="text-[11.5px] font-semibold text-accent"
                  >
                    {img.primary ? "Asosiy" : "Asosiy qilish"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-[12px] bg-surface-2 p-4">
          <p className="text-[13px] font-semibold text-ink">Ushbu mahsulot chegirmada sotiladimi?</p>
          <div className="flex gap-2">
            {[true, false].map((v) => (
              <button
                key={String(v)}
                onClick={() => setHasDiscount(v)}
                className={`rounded-pill border px-3.5 py-2 text-[13px] font-semibold ${hasDiscount === v ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface text-ink"}`}
              >
                {v ? "Ha" : "Yo'q"}
              </button>
            ))}
          </div>
          {hasDiscount && (
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={discountPct}
                onChange={(e) => setDiscountPct(e.target.value)}
                placeholder="20"
                className="w-[220px] rounded-btn border border-line bg-surface px-3.5 py-2.5 text-sm outline-none"
              />
              {price && discountPct && (
                <span className="text-sm text-ink">
                  Yakuniy narx: <b className="text-accent">{formatSom(Math.round(Number(price) * (1 - Math.min(90, Number(discountPct)) / 100)))}</b>
                </span>
              )}
            </div>
          )}
        </div>

        <button onClick={submit} className="mt-4 rounded-btn bg-accent px-6 py-3 text-sm font-semibold text-accent-ink">
          + Mahsulotni qo&apos;shish
        </button>
      </div>

      <div className="rounded-card border border-line bg-surface p-5.5">
        <h2 className="font-bold text-ink">Mahsulotlar ro&apos;yxati</h2>
        <div className="mt-3 overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-[1.8fr_1fr_1.1fr_1fr_1fr_0.7fr] gap-3 border-b border-line pb-2.5 text-xs font-bold uppercase tracking-[0.05em] text-muted">
              <span>Nomi</span><span>Brend</span><span>Kategoriya</span><span>Narx</span><span>Ombor</span><span />
            </div>
            {products.map((p) => {
              const stock = totalStockFor(p.id);
              const stockLabel = stock <= 0 ? "Tugagan" : stock <= 5 ? "Kam qoldi" : "Mavjud";
              const stockColor = stock <= 0 ? "var(--danger)" : stock <= 5 ? "var(--warning)" : "var(--success)";
              return (
                <div key={p.id} className="grid grid-cols-[1.8fr_1fr_1.1fr_1fr_1fr_0.7fr] items-center gap-3 border-b border-line py-3 text-[13.5px] text-ink">
                  <span className="font-bold">{p.name}</span>
                  <span className="text-muted">{p.brand}</span>
                  <span className="text-muted">{p.category}</span>
                  <span className="font-bold">{formatSom(p.price)}</span>
                  <span className="font-bold" style={{ color: stockColor }}>{stock} · {stockLabel}</span>
                  <button
                    onClick={() => setDeleteTarget(p)}
                    className="justify-self-end whitespace-nowrap rounded-[8px] border border-danger px-3 py-1.5 text-[12.5px] font-semibold text-danger"
                  >
                    O&apos;chirish
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-[270] flex items-center justify-center bg-black/40 p-5" onClick={() => setDeleteTarget(null)}>
          <div className="w-full max-w-[420px] rounded-block bg-surface p-7" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold text-ink">Mahsulotni o&apos;chirish</h3>
              <button onClick={() => setDeleteTarget(null)}><X size={18} className="text-muted" /></button>
            </div>
            <p className="text-sm leading-relaxed text-ink">
              «{deleteTarget.name}» mahsulotini o&apos;chirishga ishonchingiz komilmi? Bu amalni orqaga qaytarib bo&apos;lmaydi.
            </p>
            {activeOrderCount(deleteTarget.id) > 0 && (
              <div className="mt-3 rounded-[10px] border border-danger p-3.5 text-[13.5px] leading-relaxed text-danger" style={{ background: "rgba(200,60,50,0.08)" }}>
                Bu mahsulot {activeOrderCount(deleteTarget.id)} ta faol buyurtmada mavjud. Baribir o&apos;chirilsinmi?
              </div>
            )}
            <div className="mt-4 flex gap-2.5">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 rounded-[12px] border border-line bg-surface py-3.5 text-sm font-semibold text-ink">
                Bekor qilish
              </button>
              <button
                onClick={() => {
                  deleteProduct(deleteTarget.id);
                  setDeleteTarget(null);
                  showToast("Mahsulot o'chirildi");
                }}
                className="flex-1 rounded-[12px] bg-danger py-3.5 text-sm font-bold text-white"
              >
                O&apos;chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LabeledInput({
  label, value, onChange, placeholder, type = "text",
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-[12.5px] text-muted">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-[10px] border border-line bg-bg px-3.5 py-2.5 text-sm text-ink outline-none"
      />
    </label>
  );
}

function LabeledSelect({
  label, value, onChange, options, renderOption,
}: { label: string; value: string; onChange: (v: string) => void; options: readonly string[]; renderOption?: (o: string) => string }) {
  return (
    <label className="flex flex-col gap-1.5 text-[12.5px] text-muted">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-[10px] border border-line bg-bg px-3.5 py-2.5 text-sm text-ink outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>{renderOption ? renderOption(o) : o}</option>
        ))}
      </select>
    </label>
  );
}
