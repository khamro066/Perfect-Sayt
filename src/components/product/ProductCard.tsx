"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { Product } from "@/lib/types";
import { useProductsData } from "@/lib/products-data";
import { useFavorites } from "@/lib/favorites-context";
import { useCurrency } from "@/lib/currency-context";
import { useColorName } from "@/lib/colors";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

export function ProductCard({ product }: { product: Product }) {
  const t = useTranslations("productCard");
  const { isFavorite, toggleFavorite } = useFavorites();
  const { getTotalStock } = useProductsData();
  const { formatPrice } = useCurrency();
  const colorName = useColorName();

  const stock = getTotalStock(product.id);
  const soldOut = stock <= 0;
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;
  const favorited = isFavorite(product.id);

  const images = product.images ?? [];
  const hasGallery = images.length > 1;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeImage, setActiveImage] = useState(0);

  // Tracks which slide is centered as the user swipes/scrolls, so the dot
  // indicator and arrow visibility (hide "prev" at the start, "next" at
  // the end) stay in sync regardless of whether the change came from a
  // touch swipe or an arrow click.
  useEffect(() => {
    if (!hasGallery) return;
    const el = scrollerRef.current;
    if (!el) return;
    function onScroll() {
      if (!el) return;
      setActiveImage(Math.round(el.scrollLeft / el.clientWidth));
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [hasGallery]);

  function goToImage(e: React.MouseEvent, index: number) {
    e.preventDefault();
    e.stopPropagation();
    scrollerRef.current?.scrollTo({ left: index * scrollerRef.current.clientWidth, behavior: "smooth" });
  }

  return (
    <Link
      href={`/mahsulot/${product.id}`}
      className="group flex h-full flex-col bg-surface transition-shadow duration-200 hover:shadow-[0_14px_34px_rgba(0,0,0,0.10)]"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-surface-2">
        {images.length === 0 ? (
          <PlaceholderImage label={`${product.name} · 800×800px`} className="h-full w-full" />
        ) : hasGallery ? (
          <div
            ref={scrollerRef}
            className="flex h-full w-full snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {images.map((src, i) => (
              <div key={i} className="relative h-full w-full shrink-0 snap-center">
                <Image
                  src={src}
                  alt={product.name}
                  fill
                  sizes="(max-width: 639px) 45vw, 260px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <Image
            src={images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 639px) 45vw, 260px"
            className="object-cover"
          />
        )}

        {hasGallery && (
          <>
            {activeImage > 0 && (
              <button
                onClick={(e) => goToImage(e, activeImage - 1)}
                aria-label={t("prevImage")}
                className="absolute left-1.5 top-1/2 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-ink opacity-0 shadow-[0_2px_8px_rgba(0,0,0,0.14)] backdrop-blur-sm transition-opacity group-hover:opacity-100 sm:flex"
              >
                <ChevronLeft size={15} />
              </button>
            )}
            {activeImage < images.length - 1 && (
              <button
                onClick={(e) => goToImage(e, activeImage + 1)}
                aria-label={t("nextImage")}
                className="absolute right-1.5 top-1/2 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-ink opacity-0 shadow-[0_2px_8px_rgba(0,0,0,0.14)] backdrop-blur-sm transition-opacity group-hover:opacity-100 sm:flex"
              >
                <ChevronRight size={15} />
              </button>
            )}
            <div className="pointer-events-none absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-1">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={clsx(
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    i === activeImage ? "bg-white" : "bg-white/50"
                  )}
                />
              ))}
            </div>
          </>
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
              title={colorName(hex)}
              className="h-2.5 w-2.5 rounded-full border border-line sm:h-3.5 sm:w-3.5"
              style={{ background: hex }}
            />
          ))}
        </div>
      </div>
    </Link>
  );
}
