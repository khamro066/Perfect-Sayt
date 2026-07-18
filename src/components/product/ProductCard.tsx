"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, Star } from "lucide-react";
import { Product } from "@/lib/types";
import { formatSom } from "@/lib/format";
import { useProductsData } from "@/lib/products-data";
import { useFavorites } from "@/lib/favorites-context";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addLine } = useCart();
  const { showToast } = useToast();
  const { getTotalStock } = useProductsData();

  const stock = getTotalStock(product.id);
  const soldOut = stock <= 0;
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;
  const favorited = isFavorite(product.id);

  function handleFooterClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (soldOut) {
      router.push(`/mahsulot/${product.id}`);
      return;
    }
    addLine({ productId: product.id, colorHex: product.colors[0], size: product.sizes[0], qty: 1 });
    showToast("Savatga qo'shildi");
  }

  return (
    <Link
      href={`/mahsulot/${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface transition-[box-shadow,transform] duration-200 hover:-translate-y-[3px] hover:shadow-[0_14px_34px_rgba(0,0,0,0.10)]"
    >
      <div className="relative aspect-square w-full bg-surface-2">
        {product.images?.[0] ? (
          <Image src={product.images[0]} alt={product.name} fill sizes="260px" className="object-cover" />
        ) : (
          <PlaceholderImage label={`${product.name} · 800×800px`} className="h-full w-full" />
        )}
        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="rounded-pill bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-ink">
              Yangi
            </span>
          )}
          {discount > 0 && (
            <span className="rounded-pill bg-danger px-2.5 py-1 text-[11px] font-bold text-white">
              -{discount}%
            </span>
          )}
          {soldOut && (
            <span className="rounded-pill bg-ink px-2.5 py-1 text-[11px] font-semibold text-bg">
              Tugagan
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
          className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.14)]"
          aria-label="Sevimlilarga qo'shish"
        >
          <Heart
            size={16}
            className={favorited ? "fill-accent text-accent" : "fill-none text-muted"}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted">
          {product.brand}
        </span>
        <h3 className="font-heading text-[19px] font-bold leading-tight text-ink">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 text-[12.5px] text-muted">
          <Star size={13} className="fill-star text-star" />
          <span>{product.rating.toFixed(1)}</span>
          <span>({product.ratingCount})</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-accent">{formatSom(product.price)}</span>
          {product.oldPrice && (
            <span className="text-[12.5px] text-muted line-through">{formatSom(product.oldPrice)}</span>
          )}
        </div>
        <div className="flex gap-1.5">
          {product.colors.map((hex) => (
            <span
              key={hex}
              className="h-3.5 w-3.5 rounded-full border border-line"
              style={{ background: hex }}
            />
          ))}
        </div>
        <button
          onClick={handleFooterClick}
          className="mt-auto rounded-btn border border-accent px-2.5 py-2.5 text-[13px] font-semibold text-accent transition-colors hover:bg-accent hover:text-accent-ink"
        >
          {soldOut ? "Oldindan buyurtma" : "Savatga qo'shish"}
        </button>
      </div>
    </Link>
  );
}
