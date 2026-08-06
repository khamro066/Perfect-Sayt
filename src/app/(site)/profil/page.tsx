"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import clsx from "clsx";
import { useCustomer } from "@/lib/customer-context";
import { useFavorites } from "@/lib/favorites-context";
import { useProductsData } from "@/lib/products-data";
import { useToast } from "@/lib/toast-context";
import { formatSom } from "@/lib/format";
import { ProductCard } from "@/components/product/ProductCard";
import { ReviewModal } from "@/components/product/ReviewModal";
import { Order, OrderStatus } from "@/lib/types";

const STATUS_COLOR: Record<OrderStatus, string> = {
  "Yangi": "var(--star)",
  "To'lov tekshirilmoqda": "var(--star)",
  "Tasdiqlandi": "#2c6fb0",
  "Tayyorlanmoqda": "#2c6fb0",
  "Yo'lda": "#2c6fb0",
  "Yetkazildi": "var(--accent)",
  "Bekor qilindi": "var(--danger)",
};

function GuestNotice() {
  const t = useTranslations("profile");
  return (
    <div className="rounded-block border border-line py-16 text-center">
      <p className="text-ink">{t("guestTitle")}</p>
      <p className="mt-1 text-sm text-muted">{t("guestDesc")}</p>
      <Link href="/katalog" className="mt-4 inline-block rounded-btn bg-accent px-5 py-3 text-sm font-semibold text-accent-ink">
        {t("startShopping")}
      </Link>
    </div>
  );
}

function ProfileContent() {
  const searchParams = useSearchParams();
  const t = useTranslations("profile");
  const tReview = useTranslations("reviewModal");
  const { customer, setCustomer } = useCustomer();
  const { favorites } = useFavorites();
  const { products } = useProductsData();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);

  const TABS = [
    { id: "orders", label: t("tabOrders") },
    { id: "preorders", label: t("tabPreorders") },
    { id: "favs", label: t("tabFavorites") },
    { id: "info", label: t("tabInfo") },
  ] as const;

  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>(
    searchParams.get("tab") === "favs" ? "favs" : "orders"
  );
  const [reviewTarget, setReviewTarget] = useState<{ orderNumber: string; productId: string; productName: string } | null>(null);

  const [ism, setIsm] = useState(customer?.ism ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");

  // CustomerProvider hydrates from localStorage asynchronously after mount,
  // so a fresh/hard navigation straight to /profil (bookmark, refresh)
  // leaves these fields empty even for a returning customer. Sync once,
  // during render (not an effect) per React's guidance for "adjusting
  // state when a prop changes" -- see the identical fix in checkout/page.tsx.
  const [hydratedCustomer, setHydratedCustomer] = useState(customer);
  if (customer && customer !== hydratedCustomer) {
    setHydratedCustomer(customer);
    setIsm(customer.ism);
    setPhone(customer.phone);
  }

  useEffect(() => {
    if (!customer) return;
    fetch(`/api/orders?phone=${encodeURIComponent(customer.phone)}`)
      .then((res) => res.json())
      .then(setOrders);
  }, [customer]);

  const myOrders = orders.filter((o) => !o.isPreorder);
  const myPreorders = orders.filter((o) => o.isPreorder);
  const favProducts = products.filter((p) => favorites.includes(p.id));

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-9 pb-12">
      <h1 className="mb-6 text-2xl font-medium text-ink">{t("title")}</h1>
      <div className="flex flex-col gap-7 sm:flex-row sm:flex-wrap">
        <aside className="h-fit w-full shrink-0 rounded-block border border-line bg-surface p-4 sm:max-w-[280px]">
          {customer && (
            <div className="mb-3 flex items-center gap-3 px-2 py-2">
              <span className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-accent-soft font-semibold text-accent">
                {customer.ism[0]}
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{customer.ism}{customer.familiya ? ` ${customer.familiya}` : ""}</p>
                <p className="text-xs text-muted">{customer.phone}</p>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-1">
            {TABS.map((tabItem) => (
              <button
                key={tabItem.id}
                onClick={() => setTab(tabItem.id)}
                className={clsx(
                  "rounded-[10px] px-3.5 py-2.5 text-left text-sm font-semibold",
                  tab === tabItem.id ? "bg-accent text-accent-ink" : "text-ink hover:bg-accent-soft/40"
                )}
              >
                {tabItem.label}
              </button>
            ))}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {tab === "orders" && (
            !customer ? <GuestNotice /> : (
              <div className="flex flex-col gap-3">
                {myOrders.length === 0 && <p className="text-sm text-muted">{t("noOrders")}</p>}
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
                          <p className="mt-3 text-sm text-muted">{t("reviewed")}</p>
                        ) : (
                          <button
                            onClick={() => setReviewTarget({ orderNumber: o.orderNumber, productId: product.id, productName: product.name })}
                            className="mt-3 rounded-btn border border-accent px-3.5 py-2 text-sm font-semibold text-accent"
                          >
                            {t("leaveReview")}
                          </button>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            )
          )}

          {tab === "preorders" && (
            !customer ? <GuestNotice /> : (
              <div className="flex flex-col gap-3">
                {myPreorders.length === 0 && <p className="text-sm text-muted">{t("noPreorders")}</p>}
                {myPreorders.map((o) => (
                  <div key={o.orderNumber} className="rounded-card border border-line p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-ink">{o.orderNumber}</p>
                        <p className="text-sm text-muted">
                          {o.lines.map((l) => `${l.productName} · ${l.qty} ${t("pairsSuffix")}`).join(", ")} · {o.createdAt}
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
                      <span>{t("preorderEta")}</span>
                      <span>{t("preorderQueue")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === "favs" && (
            favProducts.length === 0 ? (
              <div className="rounded-block border border-line py-16 text-center">
                <p className="text-ink">{t("noFavorites")}</p>
                <p className="mt-1 text-sm text-muted">{t("noFavoritesDesc")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1 sm:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] sm:gap-2">
                {favProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )
          )}

          {tab === "info" && (
            !customer ? <GuestNotice /> : (
              <div className="max-w-[520px] rounded-block border border-line bg-surface p-6">
                <label className="flex flex-col gap-1.5 text-sm text-ink">
                  {t("infoFirstName")}
                  <input value={ism} onChange={(e) => setIsm(e.target.value)} className="rounded-btn border border-line bg-bg px-3.5 py-2.5 outline-none" />
                </label>
                <label className="mt-3.5 flex flex-col gap-1.5 text-sm text-ink">
                  {t("infoPhone")}
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-btn border border-line bg-bg px-3.5 py-2.5 outline-none" />
                </label>
                <button
                  onClick={() => setCustomer({ ...customer, ism, phone })}
                  className="mt-4 rounded-btn bg-accent px-5 py-3 text-sm font-semibold text-accent-ink"
                >
                  {t("save")}
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {customer && reviewTarget && (
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
              showToast(data.error ?? tReview("toastError"));
            }
          }}
        />
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfileContent />
    </Suspense>
  );
}
