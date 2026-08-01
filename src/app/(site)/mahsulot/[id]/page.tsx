"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import clsx from "clsx";
import { Star, Minus, Plus } from "lucide-react";
import { useProductsData } from "@/lib/products-data";
import { colorName } from "@/lib/colors";
import { formatDateRangeUz } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { useFavorites } from "@/lib/favorites-context";
import { useCurrency } from "@/lib/currency-context";
import { useToast } from "@/lib/toast-context";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { SizeChartModal } from "@/components/product/SizeChartModal";
import { ProductCard } from "@/components/product/ProductCard";
import { Product, Review } from "@/lib/types";
import { ACCESSORY_SIZE } from "@/lib/constants";

const RECENT_KEY = "perfect-shoes-recent";
const PREORDER_MIN_QTY = 3;

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations("product");
  const { products, getStock, getTotalStock, getColorStock } = useProductsData();
  const product = products.find((p) => p.id === params.id);
  const { formatPrice } = useCurrency();

  const { addLine } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const [approvedReviews, setApprovedReviews] = useState<Review[]>([]);

  const [galleryIndex, setGalleryIndex] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);
  const [size, setSize] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    if (!product) return;
    const raw = localStorage.getItem(RECENT_KEY);
    let ids: string[] = raw ? JSON.parse(raw) : [];
    // Hydrating from localStorage after mount — unavailable during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecentIds(ids.filter((id) => id !== product.id).slice(0, 8));
    ids = [product.id, ...ids.filter((id) => id !== product.id)].slice(0, 9);
    localStorage.setItem(RECENT_KEY, JSON.stringify(ids));
    setColorIndex(0);
    // Accessories have no real size step — implicitly "select" the
    // reserved sentinel size so Add to Cart works without that UI.
    setSize(product.kind === "accessory" ? ACCESSORY_SIZE : null);
    setQty(1);
    setGalleryIndex(0);
    window.scrollTo(0, 0);
    fetch(`/api/products/${product.id}/reviews`)
      .then((res) => res.json())
      .then(setApprovedReviews);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, product?.id]);

  if (!product) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-24 text-center">
        <p className="font-semibold text-ink">{t("notFound")}</p>
        <Link href="/katalog" className="mt-3 inline-block text-sm font-semibold text-accent">
          {t("backToCatalog")}
        </Link>
      </div>
    );
  }

  const isAccessory = product.kind === "accessory";
  const selectedColor = product.colors[colorIndex];
  const totalStock = getTotalStock(product.id);
  const selectedSizeStock = size !== null ? getStock(product.id, selectedColor, size) : 0;
  const canPre = totalStock <= 0 || qty >= PREORDER_MIN_QTY;
  const cpOut = totalStock <= 0;
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;
  const favorited = isFavorite(product.id);
  const images = product.images ?? [];

  const recentProducts = recentIds.map((id) => products.find((p) => p.id === id)).filter(Boolean) as Product[];
  const recommended = products
    .filter((p) => p.id !== product.id && p.kind === product.kind && p.gender === product.gender)
    .slice(0, 4);
  const similar = products
    .filter((p) => p.id !== product.id && p.kind === product.kind && p.brand === product.brand)
    .slice(0, 4);

  function handleAddToCart(goToCheckout: boolean) {
    if (size === null) {
      showToast(t("toastSelectSize"));
      return;
    }
    addLine({ productId: product!.id, colorHex: selectedColor, size, qty });
    if (goToCheckout) {
      router.push("/checkout");
    } else {
      showToast(t("toastAddedToCart"));
    }
  }

  function handlePreorder() {
    const q = new URLSearchParams({ product: product!.id, color: selectedColor, qty: String(qty) });
    if (size !== null) q.set("size", String(size));
    router.push(`/oldindan-buyurtma?${q.toString()}`);
  }

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-5 pb-10">
      <p className="mb-4 text-[13px] text-muted">
        <Link href="/">{t("home")}</Link> / <Link href="/katalog">{t("catalog")}</Link> / <span className="text-ink">{product.name}</span>
      </p>

      <div className="flex flex-wrap gap-10">
        <div className="min-w-0 flex-[1_1_420px]">
          <div className="relative aspect-square w-full overflow-hidden rounded-[20px] border border-line">
            {images[galleryIndex] ? (
              <Image src={images[galleryIndex]} alt={product.name} fill sizes="500px" className="object-cover" />
            ) : (
              <PlaceholderImage
                label={`${product.name} · ${colorName(selectedColor)} · sichqoncha bilan kattalashtiring`}
                className="h-full w-full"
              />
            )}
          </div>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                onClick={() => setGalleryIndex(i)}
                className="relative aspect-square overflow-hidden rounded-[12px]"
                style={{ boxShadow: galleryIndex === i ? "0 0 0 2px var(--accent)" : "0 0 0 2px transparent" }}
              >
                {images[i] ? (
                  <Image src={images[i]} alt="" fill sizes="120px" className="object-cover" />
                ) : (
                  <PlaceholderImage label={`${i + 1}`} className="h-full w-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-0 flex-[1_1_380px]">
          <span className="text-xs font-semibold uppercase tracking-[0.09em] text-muted">{product.brand}</span>
          <h1 className="mt-1 font-heading text-[28px] font-medium text-ink">{product.name}</h1>
          <div className="mt-2 flex items-center gap-1.5 text-sm">
            <Star size={15} className="fill-star text-star" />
            <span className="font-bold text-ink">{product.rating.toFixed(1)}</span>
            <span className="text-muted">· {t("reviewsCount", { count: product.ratingCount })}</span>
          </div>

          <div className="mt-3 flex items-baseline gap-2.5">
            <span className="text-[30px] font-bold text-accent">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <>
                <span className="text-[17px] text-muted line-through">{formatPrice(product.oldPrice)}</span>
                <span className="rounded-pill bg-danger px-2.5 py-1 text-[11px] font-bold text-white">-{discount}%</span>
              </>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2 text-sm">
            <span
              className="h-[9px] w-[9px] rounded-full"
              style={{ background: totalStock <= 0 ? "var(--danger)" : totalStock <= 5 ? "var(--warning)" : "var(--success)" }}
            />
            <span style={{ color: totalStock <= 0 ? "var(--danger)" : totalStock <= 5 ? "var(--warning)" : "var(--success)" }}>
              {totalStock <= 0
                ? t("outOfStock")
                : totalStock <= 5
                ? t("lowStock", { count: totalStock })
                : t("inStock", { count: totalStock })}
            </span>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm text-ink">{t("colorLabel", { color: colorName(selectedColor) })}</p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((hex, i) => {
                const colorStock = getColorStock(product.id, hex);
                const colorSoldOut = colorStock <= 0;
                const active = i === colorIndex;
                return (
                  <button
                    key={hex}
                    onClick={() => {
                      setColorIndex(i);
                      setSize(isAccessory ? ACCESSORY_SIZE : null);
                    }}
                    className={clsx(
                      "flex items-center gap-2 rounded-pill border px-3 py-1.5 text-sm font-semibold transition-colors",
                      active ? "border-accent bg-accent-soft" : "border-line bg-surface",
                      colorSoldOut ? "text-muted" : "text-ink"
                    )}
                  >
                    <span
                      className="h-[18px] w-[18px] shrink-0 rounded-full border border-line"
                      style={{
                        background: hex,
                        boxShadow: active ? "0 0 0 2px var(--surface), 0 0 0 4px var(--accent)" : undefined,
                        opacity: colorSoldOut ? 0.5 : 1,
                      }}
                    />
                    {colorSoldOut
                      ? t("colorSoldOut", { color: colorName(hex) })
                      : t("colorAvailable", { color: colorName(hex), count: colorStock })}
                  </button>
                );
              })}
            </div>
          </div>

          {!isAccessory && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm text-ink">{t("chooseSize")}</p>
                <button onClick={() => setSizeChartOpen(true)} className="text-sm font-semibold text-accent">
                  {t("sizeChart")}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => {
                  const stockForSize = getStock(product.id, selectedColor, s);
                  const outOfStock = stockForSize <= 0;
                  return (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={clsx(
                        "relative min-w-[46px] overflow-hidden rounded-[10px] border px-2 py-2.5 text-sm transition-colors",
                        outOfStock
                          ? clsx(
                              "bg-surface-2 font-normal text-muted opacity-70",
                              size === s ? "border-[1.5px] border-accent" : "border-line"
                            )
                          : size === s
                          ? "border-accent bg-accent font-bold text-accent-ink"
                          : "border-line bg-surface font-bold text-ink"
                      )}
                    >
                      {s}
                      {outOfStock && (
                        <span className="pointer-events-none absolute left-[-15%] top-1/2 h-[1.5px] w-[130%] -translate-y-1/2 rotate-[-22deg] bg-muted" />
                      )}
                    </button>
                  );
                })}
              </div>
              {size !== null && selectedSizeStock > 0 && selectedSizeStock < 3 && (
                <p className="mt-2 text-sm font-semibold text-warning">{t("lowStockWarning", { count: selectedSizeStock })}</p>
              )}
            </div>
          )}

          <div className="mt-5">
            <p className="mb-2 text-sm text-ink">{t("quantity")}</p>
            <div className="inline-flex items-center gap-3 rounded-pill border border-line px-2 py-1.5">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-[42px] w-[42px] items-center justify-center rounded-full"
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-semibold">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="flex h-[42px] w-[42px] items-center justify-center rounded-full"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {!cpOut && (
            <div className="mt-5 flex flex-col gap-3">
              <div className="flex gap-3">
                <button
                  onClick={() => handleAddToCart(false)}
                  className="flex-1 rounded-btn bg-accent py-3.5 text-sm font-semibold text-accent-ink"
                >
                  {t("addToCart")}
                </button>
                <button
                  onClick={() => handleAddToCart(true)}
                  className="flex-1 rounded-btn bg-ink py-3.5 text-sm font-semibold text-bg"
                >
                  {t("buyNow")}
                </button>
              </div>
              <button
                onClick={() => toggleFavorite(product.id)}
                className="w-full rounded-btn border border-accent py-3 text-sm font-semibold text-accent"
              >
                {favorited ? t("favorited") : t("addToFavorites")}
              </button>
            </div>
          )}

          {canPre && (
            <div className="mt-5 rounded-card border-[1.5px] border-accent bg-accent-soft p-5">
              <span className="rounded-pill bg-accent px-2.5 py-1 text-[11px] font-bold text-accent-ink">
                {t("preorderBadge")}
              </span>
              <p className="mt-3 text-sm text-ink">
                {cpOut
                  ? t("preorderOutOfStockDesc")
                  : t("preorderQtyDesc", { minQty: PREORDER_MIN_QTY })}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink">
                <span>{t("productionTime")}</span>
                <span>{t("estimatedDelivery", { range: formatDateRangeUz(14, 21) })}</span>
              </div>
              <button
                onClick={handlePreorder}
                className="mt-4 w-full rounded-btn bg-accent py-3 text-sm font-semibold text-accent-ink"
              >
                {t("preorderButton")}
              </button>
            </div>
          )}

          <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4 border-t border-line pt-5 text-sm">
            <div>
              <p className="font-semibold text-ink">{t("deliveryTitle")}</p>
              <p className="text-muted">{t("deliveryDesc")}</p>
            </div>
            <div>
              <p className="font-semibold text-ink">{t("materialTitle")}</p>
              <p className="text-muted">{product.material}</p>
            </div>
          </div>

          <div className="mt-5 border-t border-line pt-5">
            <h2 className="mb-2 font-semibold text-ink">{t("descriptionTitle")}</h2>
            <p className="text-sm leading-relaxed text-muted">{product.description}</p>
          </div>
        </div>
      </div>

      <section className="mt-10 max-w-[760px]">
        <h2 className="mb-4 text-2xl font-medium text-ink">{t("reviewsTitle")}</h2>
        {approvedReviews.length === 0 ? (
          <p className="text-sm text-muted">{t("noReviews")}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {approvedReviews.map((r) => (
              <div key={r.id} className="rounded-card border border-line p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-ink">{r.customerName}</span>
                  <span className="text-muted">{r.createdAt}</span>
                </div>
                <div className="mt-1 text-star">{"★".repeat(r.rating)}</div>
                <p className="mt-1.5 text-sm text-muted">{r.text}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {recentProducts.length > 0 && (
        <ProductSection title={t("recentlyViewed")} products={recentProducts} />
      )}
      <ProductSection title={t("recommended")} products={recommended} />
      <ProductSection title={t("similar")} products={similar} />

      {sizeChartOpen && <SizeChartModal onClose={() => setSizeChartOpen(false)} />}
    </div>
  );
}

function ProductSection({ title, products }: { title: string; products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-2xl font-medium text-ink">{title}</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] sm:gap-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
