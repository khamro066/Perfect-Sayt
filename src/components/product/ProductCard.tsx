"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { Product } from "@/lib/types";
import { useProductsData } from "@/lib/products-data";
import { useFavorites } from "@/lib/favorites-context";
import { useCurrency } from "@/lib/currency-context";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

export function ProductCard({ product }: { product: Product }) {
  const t = useTranslations("productCard");
  const { isFavorite, toggleFavorite } = useFavorites();
  const { getTotalStock } = useProductsData();
  const { formatPrice } = useCurrency();

  const stock = getTotalStock(product.id);
  const soldOut = stock <= 0;
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;
  const favorited = isFavorite(product.id);

  return (
    <Link
      href={`/mahsulot/${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-card bg-surface transition-[box-shadow,transform] duration-200 hover:-translate-y-[3px] hover:shadow-[0_14px_34px_rgba(0,0,0,0.10)]"
    >
      <div className="relative aspect-square w-full bg-surface-2">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 639px) 45vw, 260px"
            className="object-cover"
          />
        ) : (
          <PlaceholderImage label={`${product.name} · 800×800px`} className="h-full w-full" />
        )}
        <div className="pointer-events-none absolute left-1.5 top-1.5 flex flex-col gap-1 sm:left-2.5 sm:top-2.5 sm:gap-1.5">
          {product.isNew && (
            <span className="rounded-pill bg-accent px-1.5 py-0.5 text-[9px] font-semibold text-accent-ink sm:px-2.5 sm:py-1 sm:text-[11px]">
              {t("newBadge")}
            </span>
          )}
          {discount > 0 && (
            <span className="rounded-pill bg-danger px-1.5 py-0.5 text-[9px] font-bold text-white sm:px-2.5 sm:py-1 sm:text-[11px]">
              -{discount}%
            </span>
          )}
          {soldOut && (
            <span className="rounded-pill bg-ink px-1.5 py-0.5 text-[9px] font-semibold text-bg sm:px-2.5 sm:py-1 sm:text-[11px]">
              {t("soldOutBadge")}
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
          className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.14)] sm:right-2.5 sm:top-2.5 sm:h-9 sm:w-9"
          aria-label={t("addToFavorites")}
        >
          <Heart
            size={16}
            className={favorited ? "fill-accent text-accent" : "fill-none text-muted"}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-2.5 sm:gap-1.5 sm:p-4">
        <span className="text-[9px] font-semibold uppercase tracking-[0.09em] text-muted sm:text-[11px]">
          {product.brand}
        </span>
        <h3 className="line-clamp-2 font-heading text-[13px] font-bold leading-tight text-ink sm:line-clamp-none sm:text-[19px]">
          {product.name}
        </h3>
        <div className="flex flex-wrap items-baseline gap-1 sm:gap-2">
          <span className="whitespace-nowrap text-[13px] font-bold text-accent sm:text-base">{formatPrice(product.price)}</span>
          {product.oldPrice && (
            <span className="whitespace-nowrap text-[10px] text-muted line-through sm:text-[12.5px]">{formatPrice(product.oldPrice)}</span>
          )}
        </div>
        <div className="flex gap-1 sm:gap-1.5">
          {product.colors.map((hex) => (
            <span
              key={hex}
              className="h-2.5 w-2.5 rounded-full border border-line sm:h-3.5 sm:w-3.5"
              style={{ background: hex }}
            />
          ))}
        </div>
      </div>
    </Link>
  );
}
