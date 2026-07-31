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
  // Only show the jump-to-end arrow when the row actually overflows — with
  // few enough items to fit the viewport there's nothing to scroll to.
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    function checkOverflow() {
      if (el) setCanScroll(el.scrollWidth > el.clientWidth + 4);
    }
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
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
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 sm:gap-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((p) => (
            <div key={p.id} className="w-[45vw] shrink-0 snap-start sm:w-[260px]">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
        {canScroll && (
          <button
            onClick={scrollToEnd}
            aria-label={viewAllLabel}
            className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-[0_4px_14px_rgba(0,0,0,0.14)] transition-opacity hover:opacity-90"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </section>
  );
}
