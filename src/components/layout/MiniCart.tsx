"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { X, Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { PRODUCTS } from "@/lib/mock-data";
import { colorName } from "@/lib/colors";
import { formatSom } from "@/lib/format";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

export function MiniCart({ onClose }: { onClose: () => void }) {
  const { lines, removeLine, setQty, subtotal } = useCart();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function startTimer() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(onClose, 4000);
  }

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        onMouseEnter={() => timerRef.current && clearTimeout(timerRef.current)}
        onMouseLeave={startTimer}
        className="animate-mini-cart-pop absolute right-0 top-[52px] z-50 flex max-h-[520px] w-[340px] max-w-[88vw] flex-col rounded-block border border-line bg-surface shadow-[0_20px_48px_rgba(10,20,40,0.22),0_2px_8px_rgba(10,20,40,0.1)]">
        <div className="flex items-center justify-between border-b border-line p-4">
          <span className="text-sm font-bold text-ink">Savatcha · {lines.reduce((s, l) => s + l.qty, 0)} ta</span>
          <button onClick={onClose} aria-label="Yopish">
            <X size={18} className="text-muted" />
          </button>
        </div>
        {lines.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted">Savatchangiz bo'sh</p>
        ) : (
          <>
            <div className="flex max-h-[340px] flex-col gap-3 overflow-y-auto p-4">
              {lines.map((line) => {
                const product = PRODUCTS.find((p) => p.id === line.productId);
                if (!product) return null;
                return (
                  <div key={`${line.productId}-${line.colorHex}-${line.size}`} className="flex items-center gap-3">
                    <PlaceholderImage label={product.name} className="h-[50px] w-[50px] shrink-0 rounded-[10px]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-heading text-sm font-semibold text-ink">{product.name}</p>
                      <p className="text-xs text-muted">
                        O'lcham {line.size} · {colorName(line.colorHex)}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <button
                          onClick={() => setQty(line.productId, line.colorHex, line.size, line.qty - 1)}
                          className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-line"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-4 text-center text-xs">{line.qty}</span>
                        <button
                          onClick={() => setQty(line.productId, line.colorHex, line.size, line.qty + 1)}
                          className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-line"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-sm font-bold text-ink">{formatSom(product.price * line.qty)}</span>
                      <button
                        onClick={() => removeLine(line.productId, line.colorHex, line.size)}
                        className="text-muted hover:text-danger"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-line p-4">
              <div className="mb-3 flex items-center justify-between text-sm font-bold text-ink">
                <span>Jami</span>
                <span>{formatSom(subtotal)}</span>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/savat"
                  onClick={onClose}
                  className="flex-1 rounded-btn border border-line py-2.5 text-center text-sm font-semibold text-ink"
                >
                  Savatchani ko'rish
                </Link>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="flex-1 rounded-btn bg-accent py-2.5 text-center text-sm font-semibold text-accent-ink"
                >
                  Rasmiylashtirish
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
