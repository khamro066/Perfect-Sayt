"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Phone } from "lucide-react";
import clsx from "clsx";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { useCustomer } from "@/lib/customer-context";
import { useProductsData } from "@/lib/products-data";
import { SELLER_CONTACT, PROVINCES } from "@/lib/constants";
import { DELIVERY_METHODS, deliveryFeeFor } from "@/lib/delivery";
import { formatSom } from "@/lib/format";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotal, clear } = useCart();
  const { products } = useProductsData();
  const { showToast } = useToast();
  const { customer, setCustomer } = useCustomer();
  const [submitting, setSubmitting] = useState(false);

  const [ism, setIsm] = useState(customer?.ism ?? "");
  const [familiya, setFamiliya] = useState(customer?.familiya ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [viloyat, setViloyat] = useState(customer?.viloyat ?? "Toshkent shahri");
  const [tuman, setTuman] = useState("");
  const [manzil, setManzil] = useState(customer?.manzil ?? "");
  const [delivery, setDelivery] = useState("kuryer");
  const [payment, setPayment] = useState<"cash" | "card">("cash");

  const deliveryFee = deliveryFeeFor(delivery);
  const total = subtotal + deliveryFee;

  async function placeOrder() {
    if (!ism.trim()) return showToast("Ismingizni kiriting");
    if (!phone.trim()) return showToast("Telefon raqamini kiriting");
    if (!manzil.trim()) return showToast("Yetkazib berish manzilini kiriting");
    if (!payment) return showToast("To'lov usulini tanlang");

    setSubmitting(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ism, familiya, phone, viloyat, tuman, manzil,
        deliveryMethod: delivery, payment,
        lines: lines.map((l) => ({ productId: l.productId, colorHex: l.colorHex, size: l.size, qty: l.qty })),
      }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      showToast(data.error ?? "Xatolik yuz berdi, qayta urinib ko'ring");
      return;
    }

    const { orderNumber, isPreorder } = await res.json();
    setCustomer({ ism, familiya, phone, viloyat, manzil });
    if (isPreorder) {
      showToast("Omborda yetarli emas — bu buyurtma OLDINDAN BUYURTMA sifatida qabul qilindi");
    }
    clear();
    if (payment === "card") {
      router.push(`/tolov/${orderNumber}`);
    } else {
      router.push(`/tasdiqlash/${orderNumber}?kind=order`);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-[1100px] px-6 py-16 text-center">
        <p className="text-lg text-ink">Savatchangiz bo&apos;sh</p>
        <p className="mt-1 text-sm text-muted">Buyurtma berish uchun avval mahsulot tanlang.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-9 pb-12">
      <h1 className="mb-6 text-2xl font-medium text-ink">Buyurtmani rasmiylashtirish</h1>
      <div className="flex flex-wrap gap-7">
        <div className="flex min-w-0 flex-[2_1_440px] flex-col gap-4">
          <Card title="Aloqa ma'lumotlari">
            <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
              <Field label="Ism" required value={ism} onChange={setIsm} placeholder="Ismingiz" />
              <Field label="Familiya (ixtiyoriy)" value={familiya} onChange={setFamiliya} placeholder="Familiyangiz" />
            </div>
            <Field label="Telefon raqami" required value={phone} onChange={setPhone} placeholder="+998 90 123 45 67" className="mt-3.5" />
            <div className="mt-4 rounded-[12px] bg-accent-soft p-4 text-sm text-ink">
              <p className="font-semibold">Savolingiz bormi?</p>
              <p className="mt-0.5">Buyurtmadan oldin sotuvchi bilan bog&apos;laning.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={SELLER_CONTACT.telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-pill bg-surface px-3.5 py-2 text-sm font-semibold text-ink"
                >
                  <Send size={14} /> Telegram orqali yozish
                </a>
                <a
                  href={SELLER_CONTACT.phoneHref}
                  className="flex items-center gap-2 rounded-pill bg-surface px-3.5 py-2 text-sm font-semibold text-ink"
                >
                  <Phone size={14} /> {SELLER_CONTACT.phoneDisplay}
                </a>
              </div>
            </div>
          </Card>

          <Card title="Yetkazib berish manzili">
            <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
              <label className="flex flex-col gap-1.5 text-sm text-ink">
                Viloyat
                <select
                  value={viloyat}
                  onChange={(e) => setViloyat(e.target.value)}
                  className="rounded-btn border border-line bg-bg px-3.5 py-2.5 outline-none"
                >
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </label>
              <Field label="Tuman" value={tuman} onChange={setTuman} placeholder="Tuman" />
            </div>
            <Field label="Manzil" value={manzil} onChange={setManzil} placeholder="Ko'cha, uy, kvartira" className="mt-3.5" />
          </Card>

          <Card title="Yetkazib berish usuli">
            <div className="flex flex-col gap-2.5">
              {DELIVERY_METHODS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDelivery(d.id)}
                  className={clsx(
                    "flex items-center justify-between rounded-card border p-3.5 text-left",
                    delivery === d.id ? "border-[1.5px] border-accent bg-accent-soft" : "border-line bg-surface"
                  )}
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">{d.label}</p>
                    <p className="text-xs text-muted">{d.eta}</p>
                  </div>
                  <span className="text-sm font-bold text-ink">{d.fee === 0 ? "Bepul" : formatSom(d.fee)}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card title="To'lov usuli">
            <div className="flex gap-2">
              {(["cash", "card"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPayment(p)}
                  className={clsx(
                    "rounded-pill border px-4 py-2 text-sm font-semibold",
                    payment === p ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface text-ink"
                  )}
                >
                  {p === "cash" ? "Naqd pul" : "Karta orqali"}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">To&apos;lov xavfsiz shifrlangan ulanish orqali amalga oshiriladi.</p>
          </Card>
        </div>

        <aside className="sticky top-[150px] h-fit flex-[1_1_300px] rounded-block border border-line bg-surface p-6">
          <h2 className="mb-4 font-bold text-ink">Buyurtma</h2>
          <div className="flex max-h-[230px] flex-col gap-3 overflow-y-auto">
            {lines.map((line) => {
              const product = products.find((p) => p.id === line.productId);
              if (!product) return null;
              return (
                <div key={`${line.productId}-${line.colorHex}-${line.size}`} className="flex items-center gap-3">
                  <PlaceholderImage label={product.name} className="h-[52px] w-[52px] shrink-0 rounded-card" />
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="truncate font-semibold text-ink">{product.name}</p>
                    <p className="text-xs text-muted">{line.size} · {line.qty} dona</p>
                  </div>
                  <span className="text-sm font-bold text-ink">{formatSom(product.price * line.qty)}</span>
                </div>
              );
            })}
          </div>
          <div className="my-4 border-t border-line" />
          <div className="flex justify-between text-sm text-ink">
            <span>Mahsulotlar</span>
            <span>{formatSom(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-ink">
            <span>Yetkazib berish</span>
            <span>{deliveryFee === 0 ? "Bepul" : formatSom(deliveryFee)}</span>
          </div>
          <div className="my-4 border-t border-line" />
          <div className="mb-4 flex justify-between text-[21px] font-bold text-ink">
            <span>Jami</span>
            <span>{formatSom(total)}</span>
          </div>
          <button
            onClick={placeOrder}
            disabled={submitting}
            className="w-full rounded-btn bg-accent py-3.5 text-sm font-semibold text-accent-ink disabled:opacity-60"
          >
            {submitting ? "Yuborilmoqda…" : "Buyurtmani tasdiqlash"}
          </button>
        </aside>
      </div>
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
  label, value, onChange, placeholder, required, className,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; className?: string;
}) {
  return (
    <label className={clsx("flex flex-col gap-1.5 text-sm text-ink", className)}>
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="rounded-btn border border-line bg-bg px-3.5 py-2.5 outline-none"
      />
    </label>
  );
}
