"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search as SearchIcon } from "lucide-react";
import { useProductsData } from "@/lib/products-data";
import { formatSom } from "@/lib/format";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

export function SearchPanel({ onClose }: { onClose: () => void }) {
  const { products } = useProductsData();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 6);
  }, [query, products]);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-[52px] z-50 flex max-h-[420px] w-[360px] max-w-[90vw] flex-col rounded-block border border-line bg-surface shadow-[0_20px_48px_rgba(10,20,40,0.22),0_2px_8px_rgba(10,20,40,0.1)]">
        <div className="border-b border-line p-3.5">
          <div className="flex items-center gap-2 rounded-btn border border-line bg-bg px-3.5 py-2.5">
            <SearchIcon size={16} className="shrink-0 text-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Mahsulot qidirish..."
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {query.trim() === "" ? (
            <p className="p-4 text-center text-sm text-muted">Mahsulot nomini yozing</p>
          ) : results.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted">Hech narsa topilmadi</p>
          ) : (
            results.map((p) => (
              <Link
                key={p.id}
                href={`/mahsulot/${p.id}`}
                onClick={onClose}
                className="flex items-center gap-3 rounded-[10px] p-2.5 transition-colors hover:bg-accent-soft/40"
              >
                {p.images?.[0] ? (
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[8px]">
                    <Image src={p.images[0]} alt={p.name} fill sizes="44px" className="object-cover" />
                  </div>
                ) : (
                  <PlaceholderImage label={p.name} className="h-11 w-11 shrink-0 rounded-[8px]" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
                  <p className="text-xs text-muted">{formatSom(p.price)}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </>
  );
}
