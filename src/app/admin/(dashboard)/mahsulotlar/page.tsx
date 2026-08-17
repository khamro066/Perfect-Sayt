"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import clsx from "clsx";
import { useToast } from "@/lib/toast-context";
import { ALL_COLORS, colorName } from "@/lib/colors";
import { ALL_MATERIALS } from "@/lib/materials";
import { ACCESSORY_SIZE, SIZES } from "@/lib/constants";
import { formatSom } from "@/lib/format";
import { uploadImageDirect } from "@/lib/upload-image";
import { Product } from "@/lib/types";

interface UploadedImage {
  id: string;
  url: string;
  // Absent for images a product already has (loaded from the server as a
  // plain URL) — present only for newly picked local files awaiting upload.
  file?: File;
  primary: boolean;
}

interface AdminProduct extends Product {
  totalStock: number;
  activeOrderCount: number;
  stock: { colorHex: string; size: number; quantity: number }[];
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function stockStatus(qty: number) {
  if (qty <= 0) return { label: "Tugadi", color: "var(--danger)" };
  if (qty < 5) return { label: "Kam qoldi", color: "var(--warning)" };
  return { label: "Yetarli", color: "var(--success)" };
}

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [material, setMaterial] = useState(ALL_MATERIALS[0]);
  const [kind, setKind] = useState<"shoe" | "accessory">("shoe");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
  // Accessories have no real size dimension — internally they always use
  // the single reserved ACCESSORY_SIZE, never the shoe size picker below.
  const effectiveSizes = kind === "accessory" ? [ACCESSORY_SIZE] : selectedSizes;
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountPct, setDiscountPct] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [editTarget, setEditTarget] = useState<AdminProduct | null>(null);
  const [editName, setEditName] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editMaterial, setEditMaterial] = useState(ALL_MATERIALS[0]);
  const [editHasDiscount, setEditHasDiscount] = useState(false);
  const [editDiscountPct, setEditDiscountPct] = useState("");
  const [editImages, setEditImages] = useState<UploadedImage[]>([]);
  const [editColors, setEditColors] = useState<string[]>([]);
  const [editQuantities, setEditQuantities] = useState<Record<string, string>>({});
  const [editSubmitting, setEditSubmitting] = useState(false);

  function refetch() {
    fetch("/api/admin/products").then((res) => res.json()).then(setProducts);
  }

  useEffect(() => {
    refetch();
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((cats: { name: string }[]) => {
        setCategories(cats.map((c) => c.name));
        setCategory((prev) => prev || cats[0]?.name || "");
      });
  }, []);

  function handleFiles(files: FileList | null, setter: React.Dispatch<React.SetStateAction<UploadedImage[]>>) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        showToast(`${file.name}: faqat JPG, PNG yoki WebP`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast(`${file.name}: fayl hajmi 10MB dan katta`);
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
        setter((prev) => [...prev, { id: `${Date.now()}-${file.name}`, url, file, primary: prev.length === 0 }]);
      };
      img.src = url;
    });
  }

  // Shared by create + edit: orders images (primary first), uploads any
  // newly picked local files, and passes through URLs the product already
  // had. Returns null (after toasting) if an upload fails.
  async function resolveImageUrls(images: UploadedImage[]): Promise<string[] | null> {
    const ordered = [...images].sort((a, b) => (a.primary === b.primary ? 0 : a.primary ? -1 : 1));
    const imageUrls: string[] = [];
    for (const img of ordered) {
      if (!img.file) {
        imageUrls.push(img.url);
        continue;
      }
      try {
        imageUrls.push(await uploadImageDirect(img.file));
      } catch (e) {
        showToast(e instanceof Error ? e.message : "Rasm yuklanmadi");
        return null;
      }
    }
    return imageUrls;
  }

  async function submit() {
    if (!category) {
      showToast("Kategoriyalar hali yuklanmoqda, biroz kuting");
      return;
    }
    if (!name.trim() || !price) {
      showToast("Nom va narxni kiriting");
      return;
    }
    if (selectedColors.length === 0) {
      showToast("Kamida bitta rangni tanlang");
      return;
    }
    if (kind === "shoe" && selectedSizes.length === 0) {
      showToast("Kamida bitta o'lchamni tanlang");
      return;
    }

    setSubmitting(true);
    try {
      const imageUrls = await resolveImageUrls(images);
      if (imageUrls === null) return;

      const pct = Math.min(90, Math.max(0, Number(discountPct) || 0));
      const basePrice = Number(price);
      const finalPrice = hasDiscount && pct > 0 ? Math.round(basePrice * (1 - pct / 100)) : basePrice;

      const stockEntries = selectedColors.flatMap((hex) =>
        effectiveSizes.map((size) => ({
          colorHex: hex,
          size,
          quantity: Math.max(0, Math.floor(Number(quantities[`${hex}-${size}`]) || 0)),
        }))
      );

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          brand: brand.trim() || "Perfect",
          gender: "Erkaklar",
          kind,
          category,
          material,
          price: finalPrice,
          oldPrice: hasDiscount && pct > 0 ? basePrice : undefined,
          description: "",
          images: imageUrls,
          colors: selectedColors,
          sizes: effectiveSizes,
          stockEntries,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error ?? "Xatolik yuz berdi");
        return;
      }

      setName(""); setBrand(""); setPrice(""); setImages([]);
      setSelectedColors([]); setSelectedSizes([]); setQuantities({});
      setHasDiscount(false); setDiscountPct(""); setMaterial(ALL_MATERIALS[0]);
      // Reset like every other field above -- without this, the dropdown
      // silently kept whatever category the previous product used, which
      // is how accessory products ended up saved under a leftover shoe
      // category with no valid accessory option to switch to.
      setCategory(categories[0] ?? "");
      showToast("Mahsulot qo'shildi");
      refetch();
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/admin/products/${deleteTarget.id}`, { method: "DELETE" });
    setDeleteTarget(null);
    showToast("Mahsulot o'chirildi");
    refetch();
  }

  function openEdit(p: AdminProduct) {
    setEditTarget(p);
    setEditName(p.name);
    setEditBrand(p.brand);
    setEditCategory(p.category);
    setEditPrice(String(p.oldPrice ?? p.price));
    setEditMaterial(p.material);
    setEditHasDiscount(!!p.oldPrice);
    setEditDiscountPct(p.oldPrice ? String(Math.round((1 - p.price / p.oldPrice) * 100)) : "");
    setEditImages((p.images ?? []).map((url, i) => ({ id: `${p.id}-${i}`, url, primary: i === 0 })));
    setEditColors(p.colors);
    setEditQuantities(
      Object.fromEntries(p.stock.map((s) => [`${s.colorHex}-${s.size}`, String(s.quantity)]))
    );
  }

  async function submitEdit() {
    if (!editTarget) return;
    if (!editName.trim() || !editPrice) {
      showToast("Nom va narxni kiriting");
      return;
    }
    if (editColors.length === 0) {
      showToast("Kamida bitta rangni tanlang");
      return;
    }

    setEditSubmitting(true);
    try {
      const imageUrls = await resolveImageUrls(editImages);
      if (imageUrls === null) return;

      const pct = Math.min(90, Math.max(0, Number(editDiscountPct) || 0));
      const basePrice = Number(editPrice);
      const finalPrice = editHasDiscount && pct > 0 ? Math.round(basePrice * (1 - pct / 100)) : basePrice;

      const stockEntries = editColors.flatMap((hex) =>
        editTarget.sizes.map((size) => ({
          colorHex: hex,
          size,
          quantity: Math.max(0, Math.floor(Number(editQuantities[`${hex}-${size}`]) || 0)),
        }))
      );

      const res = await fetch(`/api/admin/products/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          brand: editBrand.trim() || "Perfect",
          category: editCategory,
          material: editMaterial,
          price: finalPrice,
          oldPrice: editHasDiscount && pct > 0 ? basePrice : null,
          images: imageUrls,
          colors: editColors,
          stockEntries,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error ?? "Xatolik yuz berdi");
        return;
      }

      setEditTarget(null);
      showToast("Mahsulot yangilandi");
      refetch();
    } finally {
      setEditSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-card border border-line bg-surface p-5.5">
        <h2 className="font-bold text-ink">Yangi mahsulot qo&apos;shish</h2>
        <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3.5">
          <LabeledInput label="Nomi" value={name} onChange={setName} placeholder="Mahsulot nomi" />
          <LabeledInput label="Brend" value={brand} onChange={setBrand} placeholder="Brend (ixtiyoriy)" />
          <LabeledSelect label="Kategoriya" value={category} onChange={setCategory} options={categories} />
          <LabeledInput label="Narx (so'm)" value={price} onChange={setPrice} placeholder="890000" type="number" />
          <LabeledSelect label="Material" value={material} onChange={setMaterial} options={ALL_MATERIALS} />
        </div>

        <div className="mt-4">
          <p className="mb-2 text-[13px] font-semibold text-ink">Mahsulot turi</p>
          <div className="flex gap-2">
            {(
              [
                { value: "shoe" as const, label: "Oyoq kiyim" },
                { value: "accessory" as const, label: "Aksessuar" },
              ]
            ).map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  setKind(o.value);
                  setSelectedSizes([]);
                  setQuantities({});
                }}
                className={clsx(
                  "rounded-pill border px-3.5 py-2 text-[13px] font-semibold",
                  kind === o.value ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface text-ink"
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-[13px] font-semibold text-ink">Rang(lar)</p>
          <div className="flex flex-wrap gap-2.5">
            {ALL_COLORS.map((hex) => (
              <button
                key={hex}
                type="button"
                title={colorName(hex)}
                onClick={() => setSelectedColors(toggle(selectedColors, hex))}
                className="h-[30px] w-[30px] rounded-full border border-line"
                style={{
                  background: hex,
                  boxShadow: selectedColors.includes(hex)
                    ? "0 0 0 2px var(--surface), 0 0 0 4px var(--accent)"
                    : undefined,
                }}
              />
            ))}
          </div>
        </div>

        {kind === "shoe" && (
          <div className="mt-4">
            <p className="mb-2 text-[13px] font-semibold text-ink">O&apos;lchamlar</p>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSizes(toggle(selectedSizes, s))}
                  className={clsx(
                    "min-w-[46px] rounded-[10px] border px-2 py-2.5 text-sm font-semibold",
                    selectedSizes.includes(s)
                      ? "border-accent bg-accent text-accent-ink"
                      : "border-line bg-surface text-ink"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedColors.length > 0 && effectiveSizes.length > 0 && (
          <div className="mt-4 rounded-[12px] bg-surface-2 p-4">
            <p className="mb-1 text-[13px] font-semibold text-ink">Boshlang&apos;ich qoldiqlar</p>
            <p className="mb-3 text-xs text-muted">
              {kind === "shoe"
                ? "Har bir rang × o'lcham birikmasi uchun aniq miqdorni kiriting."
                : "Har bir rang uchun aniq miqdorni kiriting."}
            </p>
            <div
              className={clsx(
                "grid gap-3 border-b border-line pb-2 text-xs font-bold uppercase tracking-[0.05em] text-muted",
                kind === "shoe" ? "grid-cols-[1.4fr_0.8fr_1fr_1fr]" : "grid-cols-[1.4fr_1fr_1fr]"
              )}
            >
              <span>Rang</span>
              {kind === "shoe" && <span>O&apos;lcham</span>}
              <span>Qoldiq</span><span>Holat</span>
            </div>
            {selectedColors.flatMap((hex) =>
              effectiveSizes
                .slice()
                .sort((a, b) => a - b)
                .map((size) => {
                  const key = `${hex}-${size}`;
                  const qtyValue = quantities[key] ?? "";
                  const status = stockStatus(Math.floor(Number(qtyValue) || 0));
                  return (
                    <div
                      key={key}
                      className={clsx(
                        "grid items-center gap-3 border-b border-line py-2.5 text-[13.5px] text-ink last:border-b-0",
                        kind === "shoe" ? "grid-cols-[1.4fr_0.8fr_1fr_1fr]" : "grid-cols-[1.4fr_1fr_1fr]"
                      )}
                    >
                      <span className="flex items-center gap-1.5 text-muted">
                        <span className="h-3.5 w-3.5 rounded-full border border-line" style={{ background: hex }} />
                        {colorName(hex)}
                      </span>
                      {kind === "shoe" && <span>{size}</span>}
                      <input
                        type="number"
                        min={0}
                        value={qtyValue}
                        onChange={(e) => setQuantities((prev) => ({ ...prev, [key]: e.target.value }))}
                        placeholder="0"
                        className="w-24 rounded-[8px] border border-line bg-surface px-2.5 py-1.5 text-[13px] outline-none"
                      />
                      <span className="font-bold" style={{ color: status.color }}>{status.label}</span>
                    </div>
                  );
                })
            )}
          </div>
        )}

        <ImagePicker images={images} setImages={setImages} handleFiles={handleFiles} fileInputRef={fileInputRef} />

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

        <button
          onClick={submit}
          disabled={submitting || !category}
          className="mt-4 rounded-btn bg-accent px-6 py-3 text-sm font-semibold text-accent-ink disabled:opacity-60"
        >
          {submitting ? "Yuklanmoqda…" : "+ Mahsulotni qo'shish"}
        </button>
      </div>

      <div className="rounded-card border border-line bg-surface p-5.5">
        <h2 className="font-bold text-ink">Mahsulotlar ro&apos;yxati</h2>
        <div className="mt-3 overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-[1.8fr_1fr_1.1fr_1fr_1fr_1.3fr] gap-3 border-b border-line pb-2.5 text-xs font-bold uppercase tracking-[0.05em] text-muted">
              <span>Nomi</span><span>Brend</span><span>Kategoriya</span><span>Narx</span><span>Ombor</span><span />
            </div>
            {products.map((p) => {
              const stock = p.totalStock;
              const stockLabel = stock <= 0 ? "Tugagan" : stock <= 5 ? "Kam qoldi" : "Mavjud";
              const stockColor = stock <= 0 ? "var(--danger)" : stock <= 5 ? "var(--warning)" : "var(--success)";
              return (
                <div key={p.id} className="grid grid-cols-[1.8fr_1fr_1.1fr_1fr_1fr_1.3fr] items-center gap-3 border-b border-line py-3 text-[13.5px] text-ink">
                  <span className="font-bold">{p.name}</span>
                  <span className="text-muted">{p.brand}</span>
                  <span className="text-muted">{p.category}</span>
                  <span className="font-bold">{formatSom(p.price)}</span>
                  <span className="font-bold" style={{ color: stockColor }}>{stock} · {stockLabel}</span>
                  <div className="flex justify-self-end gap-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="whitespace-nowrap rounded-[8px] border border-line px-3 py-1.5 text-[12.5px] font-semibold text-ink"
                    >
                      Tahrirlash
                    </button>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="whitespace-nowrap rounded-[8px] border border-danger px-3 py-1.5 text-[12.5px] font-semibold text-danger"
                    >
                      O&apos;chirish
                    </button>
                  </div>
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
            {deleteTarget.activeOrderCount > 0 && (
              <div className="mt-3 rounded-[10px] border border-danger p-3.5 text-[13.5px] leading-relaxed text-danger" style={{ background: "rgba(200,60,50,0.08)" }}>
                Bu mahsulot {deleteTarget.activeOrderCount} ta faol buyurtmada mavjud. Baribir o&apos;chirilsinmi?
              </div>
            )}
            <div className="mt-4 flex gap-2.5">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 rounded-[12px] border border-line bg-surface py-3.5 text-sm font-semibold text-ink">
                Bekor qilish
              </button>
              <button onClick={confirmDelete} className="flex-1 rounded-[12px] bg-danger py-3.5 text-sm font-bold text-white">
                O&apos;chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {editTarget && (
        <div className="fixed inset-0 z-[270] flex items-center justify-center bg-black/40 p-5" onClick={() => setEditTarget(null)}>
          <div
            className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-block bg-surface p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-ink">Mahsulotni tahrirlash</h3>
              <button onClick={() => setEditTarget(null)}><X size={18} className="text-muted" /></button>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3.5">
              <LabeledInput label="Nomi" value={editName} onChange={setEditName} placeholder="Mahsulot nomi" />
              <LabeledInput label="Brend" value={editBrand} onChange={setEditBrand} placeholder="Brend" />
              <LabeledSelect label="Kategoriya" value={editCategory} onChange={setEditCategory} options={categories} />
              <LabeledInput label="Narx (so'm)" value={editPrice} onChange={setEditPrice} placeholder="890000" type="number" />
              <LabeledSelect label="Material" value={editMaterial} onChange={setEditMaterial} options={ALL_MATERIALS} />
            </div>

            <div className="mt-4">
              <p className="mb-2 text-[13px] font-semibold text-ink">Rang(lar)</p>
              <div className="flex flex-wrap gap-2.5">
                {ALL_COLORS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    title={colorName(hex)}
                    onClick={() => setEditColors(toggle(editColors, hex))}
                    className="h-[30px] w-[30px] rounded-full border border-line"
                    style={{
                      background: hex,
                      boxShadow: editColors.includes(hex)
                        ? "0 0 0 2px var(--surface), 0 0 0 4px var(--accent)"
                        : undefined,
                    }}
                  />
                ))}
              </div>
            </div>

            {editTarget && editColors.length > 0 && editTarget.sizes.length > 0 && (
              <div className="mt-4 rounded-[12px] bg-surface-2 p-4">
                <p className="mb-1 text-[13px] font-semibold text-ink">Qoldiqlar</p>
                <p className="mb-3 text-xs text-muted">
                  {editTarget.kind === "shoe"
                    ? "Har bir rang × o'lcham birikmasi uchun aniq miqdorni kiriting."
                    : "Har bir rang uchun aniq miqdorni kiriting."}
                </p>
                <div
                  className={clsx(
                    "grid gap-3 border-b border-line pb-2 text-xs font-bold uppercase tracking-[0.05em] text-muted",
                    editTarget.kind === "shoe" ? "grid-cols-[1.4fr_0.8fr_1fr_1fr]" : "grid-cols-[1.4fr_1fr_1fr]"
                  )}
                >
                  <span>Rang</span>
                  {editTarget.kind === "shoe" && <span>O&apos;lcham</span>}
                  <span>Qoldiq</span><span>Holat</span>
                </div>
                {editColors.flatMap((hex) =>
                  editTarget.sizes
                    .slice()
                    .sort((a, b) => a - b)
                    .map((size) => {
                      const key = `${hex}-${size}`;
                      const qtyValue = editQuantities[key] ?? "";
                      const status = stockStatus(Math.floor(Number(qtyValue) || 0));
                      return (
                        <div
                          key={key}
                          className={clsx(
                            "grid items-center gap-3 border-b border-line py-2.5 text-[13.5px] text-ink last:border-b-0",
                            editTarget.kind === "shoe" ? "grid-cols-[1.4fr_0.8fr_1fr_1fr]" : "grid-cols-[1.4fr_1fr_1fr]"
                          )}
                        >
                          <span className="flex items-center gap-1.5 text-muted">
                            <span className="h-3.5 w-3.5 rounded-full border border-line" style={{ background: hex }} />
                            {colorName(hex)}
                          </span>
                          {editTarget.kind === "shoe" && <span>{size}</span>}
                          <input
                            type="number"
                            min={0}
                            value={qtyValue}
                            onChange={(e) => setEditQuantities((prev) => ({ ...prev, [key]: e.target.value }))}
                            placeholder="0"
                            className="w-24 rounded-[8px] border border-line bg-surface px-2.5 py-1.5 text-[13px] outline-none"
                          />
                          <span className="font-bold" style={{ color: status.color }}>{status.label}</span>
                        </div>
                      );
                    })
                )}
              </div>
            )}

            <ImagePicker images={editImages} setImages={setEditImages} handleFiles={handleFiles} />

            <div className="mt-4 flex flex-col gap-3 rounded-[12px] bg-surface-2 p-4">
              <p className="text-[13px] font-semibold text-ink">Ushbu mahsulot chegirmada sotiladimi?</p>
              <div className="flex gap-2">
                {[true, false].map((v) => (
                  <button
                    key={String(v)}
                    onClick={() => setEditHasDiscount(v)}
                    className={`rounded-pill border px-3.5 py-2 text-[13px] font-semibold ${editHasDiscount === v ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface text-ink"}`}
                  >
                    {v ? "Ha" : "Yo'q"}
                  </button>
                ))}
              </div>
              {editHasDiscount && (
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={editDiscountPct}
                    onChange={(e) => setEditDiscountPct(e.target.value)}
                    placeholder="20"
                    className="w-[220px] rounded-btn border border-line bg-surface px-3.5 py-2.5 text-sm outline-none"
                  />
                  {editPrice && editDiscountPct && (
                    <span className="text-sm text-ink">
                      Yakuniy narx:{" "}
                      <b className="text-accent">
                        {formatSom(Math.round(Number(editPrice) * (1 - Math.min(90, Number(editDiscountPct)) / 100)))}
                      </b>
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2.5">
              <button onClick={() => setEditTarget(null)} className="flex-1 rounded-[12px] border border-line bg-surface py-3.5 text-sm font-semibold text-ink">
                Bekor qilish
              </button>
              <button
                onClick={submitEdit}
                disabled={editSubmitting}
                className="flex-1 rounded-[12px] bg-accent py-3.5 text-sm font-bold text-accent-ink disabled:opacity-60"
              >
                {editSubmitting ? "Saqlanmoqda…" : "Saqlash"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ImagePicker({
  images, setImages, handleFiles, fileInputRef,
}: {
  images: UploadedImage[];
  setImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
  handleFiles: (files: FileList | null, setter: React.Dispatch<React.SetStateAction<UploadedImage[]>>) => void;
  fileInputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="mt-4 flex flex-col gap-3 rounded-[12px] bg-surface-2 p-4">
      <p className="text-[13px] font-semibold text-ink">Mahsulot rasmlari</p>
      <p className="text-xs leading-relaxed text-muted">
        Format: JPG, PNG yoki WebP · Nisbat: kvadrat (1:1) · Tavsiya etilgan o&apos;lcham: 800×800px · Minimal:
        600×600px · Maksimal fayl hajmi: 10MB. Bir nechta rasm yuklash mumkin — birini asosiy (muqova) rasm sifatida
        belgilang.
      </p>
      <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-btn border border-dashed border-line bg-surface px-4.5 py-3 text-[13px] font-semibold text-ink">
        + Rasm yuklash
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files, setImages)}
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
                {/* eslint-disable-next-line @next/next/no-img-element -- transient blob: object URL from local file input, next/image can't optimize these */}
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
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <label className="flex flex-col gap-1.5 text-[12.5px] text-muted">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-[10px] border border-line bg-bg px-3.5 py-2.5 text-sm text-ink outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
