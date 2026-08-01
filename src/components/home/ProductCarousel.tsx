"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { Product } from "@/lib/types";

export function ProductCarousel({
  title, href, viewAllLabel, products, badge,
}: { title: string; href: string; viewAllLabel: string; products: Product[]; badge?: React.ReactNode }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  // Tracks live scroll position, not just whether the row overflows at all —
  // hides once scrolled to the end, reappears if the user scrolls back.
  const [canScrollForward, setCanScrollForward] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    function checkScroll() {
      if (!el) return;
      const hasOverflow = el.scrollWidth > el.clientWidth + 4;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      setCanScrollForward(hasOverflow && !atEnd);
    }
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [products]);

  if (products.length === 0) return null;

  function scrollToEnd() {
    scrollerRef.current?.scrollTo({ left: scrollerRef.current.scrollWidth, behavior: "smooth" });
  }

  return (
    <section className="mx-auto max-w-[1280px] px-6 py-8">
      <div className="mb-5 flex items-center gap-3">
        <h2 className="text-2xl font-medium text-ink">{title}</h2>
        {badge}
        <Link href={href} className="ml-auto text-sm font-semibold text-accent hover:text-ink">
          {viewAllLabel}
        </Link>
      </div>
      <div className="relative">
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth pb-1 sm:gap-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((p) => (
            <div key={p.id} className="w-[45vw] shrink-0 snap-start sm:w-[260px]">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
        {canScrollForward && (
          // Button itself keeps a 40x40 touch target; the visible circle
          // inside it is smaller so it covers less of the product image.
          <button
            onClick={scrollToEnd}
            aria-label={viewAllLabel}
            className="absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface/65 text-ink shadow-[0_4px_14px_rgba(0,0,0,0.14)] backdrop-blur-sm transition-colors hover:bg-surface/90">
              <ChevronRight size={16} />
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
