"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { Minus, Plus } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { useProductsData } from "@/lib/products-data";
import { formatSom, formatDateRangeUz } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { useCustomer } from "@/lib/customer-context";

function StepStrip() {
  const steps = [
    { title: "Model, o'lcham va miqdorni tanlang", desc: "Kerakli mahsulot xususiyatlarini belgilang." },
    { title: "Ma'lumot va to'lov turini kiriting", desc: "To'liq, oldindan (30%) yoki yetkazishda to'lash." },
    { title: "Ishlab chiqarilgach yetkazamiz", desc: "Holat SMS va Telegram orqali kuzatiladi." },
  ];
  return (
    <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
      {steps.map((s, i) => (
        <div key={s.title} className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-ink">
            {i + 1}
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">{s.title}</p>
            <p className="text-sm text-muted">{s.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PreorderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { products, getTotalStock } = useProductsData();
  const { customer, setCustomer } = useCustomer();
  const [submitting, setSubmitting] = useState(false);

  const productId = searchParams.get("product");
  const product = productId ? products.find((p) => p.id === productId) : undefined;

  const [colorHex, setColorHex] = useState(searchParams.get("color") ?? product?.colors[0] ?? "");
  const [size, setSize] = useState<number | null>(
    searchParams.get("size") ? Number(searchParams.get("size")) : null
  );
  const [qty, setQty] = useState(Number(searchParams.get("qty") ?? 3));
  const [ism, setIsm] = useState(customer?.ism ?? "");
  const [familiya, setFamiliya] = useState(customer?.familiya ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [manzil, setManzil] = useState("");
  const [payType, setPayType] = useState<"full" | "deposit">("deposit");

  const preorderCandidates = products.filter((p) => getTotalStock(p.id) <= 0);

  async function submit() {
    if (!product) return;
    if (!ism.trim() || !phone.trim() || size === null) {
      showToast("Ism, telefon va o'lchamni to'ldiring");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/preorders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, colorHex, size, qty, ism, familiya, phone, manzil, payType }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      showToast(data.error ?? "Xatolik yuz berdi, qayta urinib ko'ring");
      return;
    }

    const { orderNumber } = await res.json();
    setCustomer({ ism, familiya, phone, manzil });
    router.push(`/tasdiqlash/${orderNumber}?kind=preorder`);
  }

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-9 pb-12">
      <div className="rounded-block bg-accent-soft p-[clamp(28px,4vw,44px)]">
        <span className="text-xs font-semibold uppercase tracking-[0.09em] text-muted">Oldindan buyurtma tizimi</span>
        <h1 className="mt-2 font-heading text-[clamp(28px,3.5vw,38px)] font-medium text-ink">
          Kutayotgan modelingizni oldindan buyurtma qiling
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] text-muted">
          Omborda mavjud bo&apos;lmagan, hali ishlab chiqarilmagan yoki katta miqdordagi (3+ juft) buyurtmalar uchun.
          Oldindan buyurtma bering — biz ishlab chiqarib, sizga yetkazamiz.
        </p>
        <StepStrip />
      </div>

      {!product ? (
        <div className="mt-8">
          <h2 className="text-2xl font-medium text-ink">Oldindan buyurtmaga tayyor modellar</h2>
          <p className="mt-1 text-sm text-muted">Hozircha omborda yo&apos;q — bosing va oldindan buyurtma bering.</p>
          <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
            {preorderCandidates.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/katalog" className="inline-block rounded-btn bg-ink px-5 py-3 text-sm font-semibold text-bg">
              Butun katalogni ko&apos;rish
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 flex flex-wrap gap-7">
          <div className="flex min-w-0 flex-[2_1_440px] flex-col gap-4">
            <div className="flex items-center gap-4 rounded-block border border-line bg-surface p-5">
              <PlaceholderImage label={product.name} className="h-[100px] w-[100px] shrink-0 rounded-[14px]" />
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.09em] text-muted">{product.brand}</span>
                <p className="font-heading text-xl text-ink">{product.name}</p>
                <p className="text-sm text-muted">{formatSom(product.price)} / juft</p>
                {getTotalStock(product.id) <= 0 && (
                  <p className="mt-1 text-sm font-semibold text-danger">Hozircha omborda yo&apos;q</p>
                )}
              </div>
            </div>

            <Card title="Mahsulot tafsilotlari">
              <p className="mb-2 text-sm text-ink">O&apos;lcham</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={clsx(
                      "min-w-[46px] rounded-[10px] border px-2 py-2.5 text-sm font-semibold",
                      size === s ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface text-ink"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="mb-2 mt-4 text-sm text-ink">Rang</p>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((hex) => (
                  <button
                    key={hex}
                    onClick={() => setColorHex(hex)}
                    className="h-[30px] w-[30px] rounded-full border border-line"
                    style={{ background: hex, boxShadow: hex === colorHex ? "0 0 0 2px var(--surface), 0 0 0 4px var(--accent)" : undefined }}
                  />
                ))}
              </div>
              <p className="mb-2 mt-4 text-sm text-ink">Miqdor</p>
              <div className="inline-flex items-center gap-3 rounded-pill border border-line px-2 py-1.5">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-10 w-10 items-center justify-center rounded-full">
                  <Minus size={15} />
                </button>
                <span className="w-11 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="flex h-10 w-10 items-center justify-center rounded-full">
                  <Plus size={15} />
                </button>
              </div>
            </Card>

            <Card title="Buyurtmachi ma'lumotlari">
              <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
                <Field label="Ism" value={ism} onChange={setIsm} placeholder="Ismingiz" />
                <Field label="Familiya" value={familiya} onChange={setFamiliya} placeholder="Familiyangiz" />
              </div>
              <Field label="Telefon raqami" value={phone} onChange={setPhone} placeholder="+998 90 123 45 67" className="mt-3.5" />
              <Field label="Yetkazib berish manzili" value={manzil} onChange={setManzil} placeholder="Viloyat, tuman, ko'cha, uy" className="mt-3.5" />
            </Card>

            <Card title="To'lov turi">
              <div className="grid grid-cols-2 gap-2.5 max-sm:grid-cols-1">
                {(
                  [
                    { id: "full", label: "To'liq to'lov" },
                    { id: "deposit", label: "Oldindan to'lov (30%)" },
                  ] as const
                ).map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setPayType(o.id)}
                    className={clsx(
                      "rounded-card border p-3.5 text-left text-sm font-semibold",
                      payType === o.id ? "border-[1.5px] border-accent bg-accent-soft text-ink" : "border-line bg-surface text-ink"
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          <aside className="sticky top-[150px] h-fit flex-[1_1_300px] rounded-block border border-line bg-surface p-6">
            <h2 className="mb-4 font-bold text-ink">Oldindan buyurtma xulosasi</h2>
            <div className="flex flex-col gap-2 text-sm text-ink">
              <Row label="Ishlab chiqarish" value="14–21 kun" />
              <Row label="Taxminiy yetkazish" value={formatDateRangeUz(18, 25)} />
              <Row label="Navbatdagi o'rin" value="#14" />
              <Row label="Boshlang'ich holat" value="Kutilmoqda" color="var(--star)" />
            </div>
            <div className="my-4 border-t border-line" />
            <Row label="Umumiy summa" value={formatSom(product.price * qty)} bold />
            <div className="mt-3 rounded-card bg-accent-soft p-3.5">
              <Row
                label={payType === "full" ? "Hozir to'lanadi" : "Oldindan to'lov (30%)"}
                value={formatSom(payType === "full" ? product.price * qty : Math.round(product.price * qty * 0.3))}
                bold
              />
            </div>
            <button
              onClick={submit}
              disabled={submitting}
              className="mt-4 w-full rounded-btn bg-accent py-3.5 text-sm font-semibold text-accent-ink disabled:opacity-60"
            >
              {submitting ? "Yuborilmoqda…" : "Oldindan buyurtmani tasdiqlash"}
            </button>
            <p className="mt-3 text-xs text-muted">Tasdiqlangach SMS va Telegram orqali xabar yuboriladi.</p>
          </aside>
        </div>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-block border border-line bg-surface p-6">
      <h2 className="mb-4 font-bold text-ink">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, className,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <label className={clsx("flex flex-col gap-1.5 text-sm text-ink", className)}>
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-btn border border-line bg-bg px-3.5 py-2.5 outline-none"
      />
    </label>
  );
}

function Row({ label, value, color, bold }: { label: string; value: string; color?: string; bold?: boolean }) {
  return (
    <div className={clsx("flex justify-between", bold && "text-lg font-bold")}>
      <span className={bold ? "text-ink" : "text-muted"}>{label}</span>
      <span className="font-semibold" style={{ color: color ?? "var(--ink)" }}>{value}</span>
    </div>
  );
}

export default function PreorderPage() {
  return (
    <Suspense>
      <PreorderContent />
    </Suspense>
  );
}
