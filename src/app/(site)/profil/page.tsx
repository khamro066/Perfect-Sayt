"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { useCustomer } from "@/lib/customer-context";
import { useFavorites } from "@/lib/favorites-context";
import { useProductsData } from "@/lib/products-data";
import { useToast } from "@/lib/toast-context";
import { formatSom } from "@/lib/format";
import { ProductCard } from "@/components/product/ProductCard";
import { ReviewModal } from "@/components/product/ReviewModal";
import { Order, OrderStatus } from "@/lib/types";

const TABS = [
  { id: "orders", label: "Buyurtmalarim" },
  { id: "preorders", label: "Oldindan buyurtmalar" },
  { id: "favs", label: "Sevimli mahsulotlar" },
  { id: "info", label: "Profil" },
] as const;

const STATUS_COLOR: Record<OrderStatus, string> = {
  "Yangi": "var(--star)",
  "To'lov tekshirilmoqda": "var(--star)",
  "Tasdiqlandi": "#2c6fb0",
  "Tayyorlanmoqda": "#2c6fb0",
  "Yo'lda": "#2c6fb0",
  "Yetkazildi": "var(--accent)",
  "Bekor qilindi": "var(--danger)",
};

export default function ProfilePage() {
  const { customer, setCustomer } = useCustomer();
  const { favorites } = useFavorites();
  const { products } = useProductsData();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("orders");
  const [reviewTarget, setReviewTarget] = useState<{ orderNumber: string; productId: string; productName: string } | null>(null);

  const [ism, setIsm] = useState(customer?.ism ?? "");
  const [familiya, setFamiliya] = useState(customer?.familiya ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");

  useEffect(() => {
    if (!customer) return;
    fetch(`/api/orders?phone=${encodeURIComponent(customer.phone)}`)
      .then((res) => res.json())
      .then(setOrders);
  }, [customer]);

  const myOrders = orders.filter((o) => !o.isPreorder);
  const myPreorders = orders.filter((o) => o.isPreorder);
  const favProducts = products.filter((p) => favorites.includes(p.id));

  if (!customer) {
    return (
      <div className="mx-auto max-w-[640px] px-6 py-16 text-center">
        <h1 className="text-2xl font-medium text-ink">Shaxsiy kabinet</h1>
        <p className="mt-2 text-sm text-muted">
          Profilingizni ko&apos;rish uchun avval buyurtma bering — biz sizni telefon raqamingiz orqali eslab qolamiz.
        </p>
        <Link href="/katalog" className="mt-5 inline-block rounded-btn bg-accent px-5 py-3 text-sm font-semibold text-accent-ink">
          Xaridni boshlash
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-9 pb-12">
      <h1 className="mb-6 text-2xl font-medium text-ink">Shaxsiy kabinet</h1>
      <div className="flex flex-wrap gap-7">
        <aside className="h-fit w-full max-w-[280px] shrink-0 rounded-block border border-line bg-surface p-4">
          <div className="mb-3 flex items-center gap-3 px-2 py-2">
            <span className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-accent-soft font-semibold text-accent">
              {customer.ism[0]}
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{customer.ism} {customer.familiya}</p>
              <p className="text-xs text-muted">{customer.phone}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={clsx(
                  "rounded-[10px] px-3.5 py-2.5 text-left text-sm font-semibold",
                  tab === t.id ? "bg-accent text-accent-ink" : "text-ink hover:bg-accent-soft/40"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {tab === "orders" && (
            <div className="flex flex-col gap-3">
              {myOrders.length === 0 && <p className="text-sm text-muted">Hali buyurtmalar yo&apos;q.</p>}
              {myOrders.map((o) => {
                const line = o.lines[0];
                const product = products.find((p) => p.id === line?.productId);
                const reviewed = product ? (o.reviewedProductIds ?? []).includes(product.id) : false;
                return (
                  <div key={o.orderNumber} className="rounded-card border border-line p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-ink">{o.orderNumber}</p>
                        <p className="text-sm text-muted">
                          {o.lines.map((l) => l.productName).join(", ")} · {o.createdAt}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-ink">{formatSom(o.total)}</p>
                        <span
                          className="mt-1 inline-block rounded-pill bg-surface-2 px-2.5 py-1 text-xs font-semibold"
                          style={{ color: STATUS_COLOR[o.status] }}
                        >
                          {o.status}
                        </span>
                      </div>
                    </div>
                    {o.status === "Yetkazildi" && product && (
                      reviewed ? (
                        <p className="mt-3 text-sm text-muted">✓ Siz sharh qoldirdingiz</p>
                      ) : (
                        <button
                          onClick={() => setReviewTarget({ orderNumber: o.orderNumber, productId: product.id, productName: product.name })}
                          className="mt-3 rounded-btn border border-accent px-3.5 py-2 text-sm font-semibold text-accent"
                        >
                          ★ Fikr bildirish
                        </button>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {tab === "preorders" && (
            <div className="flex flex-col gap-3">
              {myPreorders.length === 0 && <p className="text-sm text-muted">Hali oldindan buyurtmalar yo&apos;q.</p>}
              {myPreorders.map((o) => (
                <div key={o.orderNumber} className="rounded-card border border-line p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-ink">{o.orderNumber}</p>
                      <p className="text-sm text-muted">
                        {o.lines.map((l) => `${l.productName} · ${l.qty} juft`).join(", ")} · {o.createdAt}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-ink">{formatSom(o.total)}</p>
                      <span className="mt-1 inline-block rounded-pill bg-surface-2 px-2.5 py-1 text-xs font-semibold" style={{ color: STATUS_COLOR[o.status] }}>
                        {o.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-5 border-t border-line pt-3 text-sm text-muted">
                    <span>Taxminiy yetkazish: 18–25 kun</span>
                    <span>Navbatdagi o&apos;rin: #14</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "favs" && (
            favProducts.length === 0 ? (
              <div className="rounded-block border border-line py-16 text-center">
                <p className="text-ink">Sevimlilar bo&apos;sh</p>
                <p className="mt-1 text-sm text-muted">Yoqtirgan mahsulotlarni ♡ tugmasi orqali qo&apos;shing.</p>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4.5">
                {favProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )
          )}

          {tab === "info" && (
            <div className="max-w-[520px] rounded-block border border-line bg-surface p-6">
              <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
                <label className="flex flex-col gap-1.5 text-sm text-ink">
                  Ism
                  <input value={ism} onChange={(e) => setIsm(e.target.value)} className="rounded-btn border border-line bg-bg px-3.5 py-2.5 outline-none" />
                </label>
                <label className="flex flex-col gap-1.5 text-sm text-ink">
                  Familiya
                  <input value={familiya} onChange={(e) => setFamiliya(e.target.value)} className="rounded-btn border border-line bg-bg px-3.5 py-2.5 outline-none" />
                </label>
              </div>
              <label className="mt-3.5 flex flex-col gap-1.5 text-sm text-ink">
                Telefon
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-btn border border-line bg-bg px-3.5 py-2.5 outline-none" />
              </label>
              <button
                onClick={() => setCustomer({ ...customer, ism, familiya, phone })}
                className="mt-4 rounded-btn bg-accent px-5 py-3 text-sm font-semibold text-accent-ink"
              >
                Saqlash
              </button>
            </div>
          )}
        </div>
      </div>

      {reviewTarget && (
        <ReviewModal
          productName={reviewTarget.productName}
          onClose={() => setReviewTarget(null)}
          onSubmit={async (rating, text) => {
            const res = await fetch("/api/reviews", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                productId: reviewTarget.productId,
                orderNumber: reviewTarget.orderNumber,
                phone: customer.phone,
                rating,
                text,
              }),
            });
            if (res.ok) {
              setOrders((prev) =>
                prev.map((o) =>
                  o.orderNumber === reviewTarget.orderNumber
                    ? { ...o, reviewedProductIds: [...(o.reviewedProductIds ?? []), reviewTarget.productId] }
                    : o
                )
              );
            } else {
              const data = await res.json().catch(() => ({}));
              showToast(data.error ?? "Sharhni yuborib bo'lmadi");
            }
          }}
        />
      )}
    </div>
  );
}
