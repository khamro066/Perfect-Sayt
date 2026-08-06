"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Send, Phone } from "lucide-react";
import clsx from "clsx";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { useCustomer } from "@/lib/customer-context";
import { useProductsData } from "@/lib/products-data";
import { SELLER_CONTACT, PROVINCES } from "@/lib/constants";
import { DELIVERY_METHODS, deliveryFeeFor } from "@/lib/delivery";
import { formatSom } from "@/lib/format";
import { useCurrency } from "@/lib/currency-context";
import { useProvinceName } from "@/lib/provinces";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { CurrencySwitcher } from "@/components/layout/CurrencySwitcher";

export default function CheckoutPage() {
  const router = useRouter();
  const t = useTranslations("checkout");
  const { lines, subtotal, clear } = useCart();
  const { products } = useProductsData();
  const { currency, formatPrice } = useCurrency();
  const { showToast } = useToast();
  const { customer, setCustomer } = useCustomer();
  const [submitting, setSubmitting] = useState(false);
  const provinceName = useProvinceName();

  const DELIVERY_METHODS_UI: Record<string, { label: string; eta: string }> = {
    kuryer: { label: t("deliveryKuryerLabel"), eta: t("deliveryKuryerEta") },
    express: { label: t("deliveryExpressLabel"), eta: t("deliveryExpressEta") },
    pickup: { label: t("deliveryPickupLabel"), eta: t("deliveryPickupEta") },
  };

  const [ism, setIsm] = useState(customer?.ism ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [viloyat, setViloyat] = useState(customer?.viloyat ?? "Toshkent shahri");
  const [tuman, setTuman] = useState("");
  const [manzil, setManzil] = useState(customer?.manzil ?? "");
  const [delivery, setDelivery] = useState("kuryer");
  const [payment, setPayment] = useState<"cash" | "card">("cash");

  // CustomerProvider hydrates from localStorage asynchronously after mount,
  // so on a fresh/hard navigation straight to /checkout (bookmark, refresh,
  // shared link) `customer` is still null during the useState initializers
  // above and the fields end up permanently empty even for a returning
  // customer. Sync once, the first time a saved profile becomes available --
  // done during render (not an effect) per React's own guidance for
  // "adjusting state when a prop changes", so it applies before paint
  // instead of causing a visible empty-then-filled flash.
  const [hydratedCustomer, setHydratedCustomer] = useState(customer);
  if (customer && customer !== hydratedCustomer) {
    setHydratedCustomer(customer);
    setIsm(customer.ism);
    setPhone(customer.phone);
    if (customer.viloyat) setViloyat(customer.viloyat);
    if (customer.manzil) setManzil(customer.manzil);
  }

  const deliveryFee = deliveryFeeFor(delivery);
  const total = subtotal + deliveryFee;

  async function placeOrder() {
    if (!ism.trim()) return showToast(t("toastEnterName"));
    if (!phone.trim()) return showToast(t("toastEnterPhone"));
    if (!manzil.trim()) return showToast(t("toastEnterAddress"));
    if (!payment) return showToast(t("toastSelectPayment"));

    setSubmitting(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ism, phone, viloyat, tuman, manzil,
        deliveryMethod: delivery, payment,
        lines: lines.map((l) => ({ productId: l.productId, colorHex: l.colorHex, size: l.size, qty: l.qty })),
      }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      showToast(data.error ?? t("toastError"));
      return;
    }

    const { orderNumber, isPreorder } = await res.json();
    // Spread the previous profile first so an existing familiya (set via
    // the preorder flow or profile edit) isn't dropped from local state —
    // checkout itself no longer collects or overwrites it.
    setCustomer({ ...customer, ism, phone, viloyat, manzil });
    if (isPreorder) {
      showToast(t("toastBecamePreorder"));
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
        <p className="text-lg text-ink">{t("emptyCartTitle")}</p>
        <p className="mt-1 text-sm text-muted">{t("emptyCartDesc")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-9 pb-12">
      <h1 className="mb-6 text-2xl font-medium text-ink">{t("title")}</h1>
      <div className="flex flex-wrap gap-7">
        <div className="flex min-w-0 flex-[2_1_440px] flex-col gap-4">
          <Card title={t("contactInfoTitle")}>
            <Field label={t("firstName")} required value={ism} onChange={setIsm} placeholder={t("firstNamePlaceholder")} />
            <Field label={t("phone")} required value={phone} onChange={setPhone} placeholder={t("phonePlaceholder")} className="mt-3.5" />
            <div className="mt-4 rounded-[12px] bg-accent-soft p-4 text-sm text-ink">
              <p className="font-semibold">{t("questionTitle")}</p>
              <p className="mt-0.5">{t("questionDesc")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={SELLER_CONTACT.telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-pill bg-surface px-3.5 py-2 text-sm font-semibold text-ink"
                >
                  <Send size={14} /> {t("telegramContact")}
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

          <Card title={t("deliveryAddressTitle")}>
            <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
              <label className="flex flex-col gap-1.5 text-sm text-ink">
                {t("province")}
                <select
                  value={viloyat}
                  onChange={(e) => setViloyat(e.target.value)}
                  className="rounded-btn border border-line bg-bg px-3.5 py-2.5 outline-none"
                >
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>{provinceName(p)}</option>
                  ))}
                </select>
              </label>
              <Field label={t("district")} value={tuman} onChange={setTuman} placeholder={t("districtPlaceholder")} />
            </div>
            <Field label={t("address")} value={manzil} onChange={setManzil} placeholder={t("addressPlaceholder")} className="mt-3.5" />
          </Card>

          <Card title={t("deliveryMethodTitle")}>
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
                    <p className="text-sm font-semibold text-ink">{DELIVERY_METHODS_UI[d.id].label}</p>
                    <p className="text-xs text-muted">{DELIVERY_METHODS_UI[d.id].eta}</p>
                  </div>
                  <span className="text-sm font-bold text-ink">{d.fee === 0 ? t("free") : formatPrice(d.fee)}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card title={t("paymentMethodTitle")}>
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
                  {p === "cash" ? t("paymentCash") : t("paymentCard")}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">{t("paymentSecureNote")}</p>
          </Card>
        </div>

        <aside className="sticky top-[150px] h-fit flex-[1_1_300px] rounded-block border border-line bg-surface p-6">
          <h2 className="mb-4 font-bold text-ink">{t("orderTitle")}</h2>
          <div className="flex max-h-[230px] flex-col gap-3 overflow-y-auto">
            {lines.map((line) => {
              const product = products.find((p) => p.id === line.productId);
              if (!product) return null;
              return (
                <div key={`${line.productId}-${line.colorHex}-${line.size}`} className="flex items-center gap-3">
                  <PlaceholderImage label={product.name} className="h-[52px] w-[52px] shrink-0 rounded-card" />
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="truncate font-semibold text-ink">{product.name}</p>
                    <p className="text-xs text-muted">
                      {product.kind === "accessory"
                        ? t("qtyOnly", { qty: line.qty })
                        : t("lineQty", { size: line.size, qty: line.qty })}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-ink">{formatPrice(product.price * line.qty)}</span>
                </div>
              );
            })}
          </div>
          <div className="my-4 border-t border-line" />
          <div className="flex justify-between text-sm text-ink">
            <span>{t("products")}</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-ink">
            <span>{t("delivery")}</span>
            <span>{deliveryFee === 0 ? t("free") : formatPrice(deliveryFee)}</span>
          </div>
          <div className="my-4 border-t border-line" />
          <div className="flex items-center justify-between text-[21px] font-bold text-ink">
            <div className="flex items-center gap-2">
              <span>{t("total")}</span>
              <CurrencySwitcher variant="inline" />
            </div>
            <span>{formatPrice(total)}</span>
          </div>
          <p className="mb-4 mt-1 text-xs text-muted">
            {currency !== "UZS" ? t("uzsChargeNote", { amount: formatSom(total) }) : " "}
          </p>
          <button
            onClick={placeOrder}
            disabled={submitting}
            className="w-full rounded-btn bg-accent py-3.5 text-sm font-semibold text-accent-ink disabled:opacity-60"
          >
            {submitting ? t("submitting") : t("confirmButton")}
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
