"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Star, Minus, Plus } from "lucide-react";
import { PRODUCTS, getStock, getTotalStock } from "@/lib/mock-data";
import { colorName } from "@/lib/colors";
import { formatSom, formatDateRangeUz } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { useFavorites } from "@/lib/favorites-context";
import { useToast } from "@/lib/toast-context";
import { useReviews } from "@/lib/reviews-context";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { SizeChartModal } from "@/components/product/SizeChartModal";
import { ProductCard } from "@/components/product/ProductCard";

const RECENT_KEY = "perfect-shoes-recent";
const PREORDER_MIN_QTY = 3;

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const product = PRODUCTS.find((p) => p.id === params.id);

  const { addLine } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const { reviews } = useReviews();

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
    setRecentIds(ids.filter((id) => id !== product.id).slice(0, 8));
    ids = [product.id, ...ids.filter((id) => id !== product.id)].slice(0, 9);
    localStorage.setItem(RECENT_KEY, JSON.stringify(ids));
    setColorIndex(0);
    setSize(null);
    setQty(1);
    setGalleryIndex(0);
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (!product) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-24 text-center">
        <p className="font-semibold text-ink">Mahsulot topilmadi</p>
        <Link href="/katalog" className="mt-3 inline-block text-sm font-semibold text-accent">
          Katalogga qaytish →
        </Link>
      </div>
    );
  }

  const selectedColor = product.colors[colorIndex];
  const totalStock = getTotalStock(product.id);
  const selectedSizeStock = size !== null ? getStock(product.id, selectedColor, size) : 0;
  const canPre = totalStock <= 0 || qty >= PREORDER_MIN_QTY;
  const cpOut = totalStock <= 0;
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;
  const favorited = isFavorite(product.id);

  const approvedReviews = reviews.filter((r) => r.productId === product.id && r.status === "approved");
  const recentProducts = recentIds.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean) as typeof PRODUCTS;
  const recommended = PRODUCTS.filter((p) => p.id !== product.id && p.gender === product.gender).slice(0, 4);
  const similar = PRODUCTS.filter((p) => p.id !== product.id && p.brand === product.brand).slice(0, 4);

  function handleAddToCart(goToCheckout: boolean) {
    if (size === null) {
      showToast("Avval o'lchamni tanlang");
      return;
    }
    addLine({ productId: product!.id, colorHex: selectedColor, size, qty });
    if (goToCheckout) {
      router.push("/checkout");
    } else {
      showToast("Savatga qo'shildi");
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
        <Link href="/">Bosh sahifa</Link> / <Link href="/katalog">Katalog</Link> / <span className="text-ink">{product.name}</span>
      </p>

      <div className="flex flex-wrap gap-10">
        <div className="min-w-0 flex-[1_1_420px]">
          <PlaceholderImage
            label={`${product.name} · ${colorName(selectedColor)} · sichqoncha bilan kattalashtiring`}
            className="aspect-square w-full rounded-[20px] border border-line"
          />
          <div className="mt-3 grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                onClick={() => setGalleryIndex(i)}
                className="aspect-square overflow-hidden rounded-[12px]"
                style={{ boxShadow: galleryIndex === i ? "0 0 0 2px var(--accent)" : "0 0 0 2px transparent" }}
              >
                <PlaceholderImage label={`${i + 1}`} className="h-full w-full" />
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
            <span className="text-muted">· {product.ratingCount} ta sharh</span>
          </div>

          <div className="mt-3 flex items-baseline gap-2.5">
            <span className="text-[30px] font-bold text-accent">{formatSom(product.price)}</span>
            {product.oldPrice && (
              <>
                <span className="text-[17px] text-muted line-through">{formatSom(product.oldPrice)}</span>
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
                ? "Omborda yo'q"
                : totalStock <= 5
                ? `Kam qoldi — ${totalStock} juft`
                : `Omborda mavjud — ${totalStock} juft`}
            </span>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm text-ink">Rang: {colorName(selectedColor)}</p>
            <div className="flex flex-wrap gap-2.5">
              {product.colors.map((hex, i) => (
                <button
                  key={hex}
                  onClick={() => {
                    setColorIndex(i);
                    setSize(null);
                  }}
                  className="h-[30px] w-[30px] rounded-full border border-line"
                  style={{
                    background: hex,
                    boxShadow: i === colorIndex ? "0 0 0 2px var(--surface), 0 0 0 4px var(--accent)" : undefined,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-ink">O&apos;lchamni tanlang</p>
              <button onClick={() => setSizeChartOpen(true)} className="text-sm font-semibold text-accent">
                O&apos;lcham jadvali
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const stockForSize = getStock(product.id, selectedColor, s);
                const disabled = stockForSize <= 0;
                return (
                  <button
                    key={s}
                    disabled={disabled}
                    onClick={() => setSize(s)}
                    className="min-w-[46px] rounded-[10px] border px-2 py-2.5 text-sm font-semibold transition-colors"
                    style={
                      disabled
                        ? { background: "var(--surface-2)", color: "var(--muted)", textDecoration: "line-through", opacity: 0.6, cursor: "not-allowed", borderColor: "var(--line)" }
                        : size === s
                        ? { background: "var(--accent)", color: "var(--accent-ink)", borderColor: "var(--accent)" }
                        : { background: "var(--surface)", color: "var(--ink)", borderColor: "var(--line)" }
                    }
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {size !== null && selectedSizeStock > 0 && selectedSizeStock < 3 && (
              <p className="mt-2 text-sm font-semibold text-warning">⚠ Faqat {selectedSizeStock} dona qoldi!</p>
            )}
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm text-ink">Miqdor</p>
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
                  Savatchaga qo&apos;shish
                </button>
                <button
                  onClick={() => handleAddToCart(true)}
                  className="flex-1 rounded-btn bg-ink py-3.5 text-sm font-semibold text-bg"
                >
                  Hozir sotib olish
                </button>
              </div>
              <button
                onClick={() => toggleFavorite(product.id)}
                className="w-full rounded-btn border border-accent py-3 text-sm font-semibold text-accent"
              >
                {favorited ? "♥ Sevimlilarda" : "♡ Sevimlilarga"}
              </button>
            </div>
          )}

          {canPre && (
            <div className="mt-5 rounded-card border-[1.5px] border-accent bg-accent-soft p-5">
              <span className="rounded-pill bg-accent px-2.5 py-1 text-[11px] font-bold text-accent-ink">
                OLDINDAN BUYURTMA
              </span>
              <p className="mt-3 text-sm text-ink">
                {cpOut
                  ? "Bu mahsulot hozircha omborda yo'q. Oldindan buyurtma bering — ishlab chiqarilgach, sizga birinchi bo'lib yetkaziladi."
                  : `${PREORDER_MIN_QTY} juft va undan ko'p buyurtma uchun oldindan buyurtma tavsiya etiladi — yetkazish muddati kafolatlanadi.`}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink">
                <span>Ishlab chiqarish: 14–21 kun</span>
                <span>Taxminiy yetkazish: {formatDateRangeUz(14, 21)}</span>
              </div>
              <button
                onClick={handlePreorder}
                className="mt-4 w-full rounded-btn bg-accent py-3 text-sm font-semibold text-accent-ink"
              >
                Oldindan buyurtma berish
              </button>
            </div>
          )}

          <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4 border-t border-line pt-5 text-sm">
            <div>
              <p className="font-semibold text-ink">Yetkazib berish</p>
              <p className="text-muted">1–4 ish kuni · butun O&apos;zbekiston</p>
            </div>
            <div>
              <p className="font-semibold text-ink">Qaytarish</p>
              <p className="text-muted">14 kun ichida bepul qaytarish</p>
            </div>
            <div>
              <p className="font-semibold text-ink">Material</p>
              <p className="text-muted">{product.material}</p>
            </div>
          </div>

          <div className="mt-5 border-t border-line pt-5">
            <h2 className="mb-2 font-semibold text-ink">Tavsif</h2>
            <p className="text-sm leading-relaxed text-muted">{product.description}</p>
          </div>
        </div>
      </div>

      <section className="mt-10 max-w-[760px]">
        <h2 className="mb-4 text-2xl font-medium text-ink">Mijoz sharhlari</h2>
        {approvedReviews.length === 0 ? (
          <p className="text-sm text-muted">Hozircha tasdiqlangan sharh yo&apos;q — birinchi bo&apos;lib fikr bildiring.</p>
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
        <ProductSection title="Yaqinda ko'rilgan" products={recentProducts} />
      )}
      <ProductSection title="Tavsiya etamiz" products={recommended} />
      <ProductSection title="O'xshash mahsulotlar" products={similar} />

      {sizeChartOpen && <SizeChartModal onClose={() => setSizeChartOpen(false)} />}
    </div>
  );
}

function ProductSection({ title, products }: { title: string; products: typeof PRODUCTS }) {
  if (products.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-2xl font-medium text-ink">{title}</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4.5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
