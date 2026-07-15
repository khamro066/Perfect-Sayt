"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { PRODUCTS } from "@/lib/mock-data";
import { colorName } from "@/lib/colors";
import { formatSom } from "@/lib/format";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

const COUPONS: Record<string, number> = { SALOM10: 0.1, PERFECT15: 0.15 };

export default function CartPage() {
  const { lines, removeLine, setQty, subtotal } = useCart();
  const { showToast } = useToast();
  const [couponInput, setCouponInput] = useState("");
  const [couponRate, setCouponRate] = useState(0);

  function applyCoupon() {
    const rate = COUPONS[couponInput.trim().toUpperCase()];
    if (rate) {
      setCouponRate(rate);
      showToast(`${rate * 100}% chegirma qo'llandi`);
    } else {
      setCouponRate(0);
      showToast("Kupon kodi noto'g'ri");
    }
  }

  const discount = subtotal * couponRate;
  const delivery = subtotal - discount >= 500000 ? 0 : subtotal > 0 ? 25000 : 0;
  const total = subtotal - discount + delivery;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-[1180px] px-6 py-12">
        <h1 className="mb-6 text-2xl font-medium text-ink">Savatcha</h1>
        <div className="rounded-block border border-line py-[70px] text-center">
          <p className="text-lg text-ink">Savatchangiz bo&apos;sh</p>
          <p className="mt-1 text-sm text-muted">Yoqtirgan mahsulotlaringizni savatchaga qo&apos;shing.</p>
          <Link href="/katalog" className="mt-5 inline-block rounded-btn bg-accent px-5 py-3 text-sm font-semibold text-accent-ink">
            Xaridni boshlash
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-9 pb-12">
      <h1 className="mb-6 text-2xl font-medium text-ink">Savatcha</h1>
      <div className="flex flex-wrap gap-7">
        <div className="min-w-0 flex-[2_1_460px] flex flex-col gap-3">
          {lines.map((line) => {
            const product = PRODUCTS.find((p) => p.id === line.productId);
            if (!product) return null;
            return (
              <div key={`${line.productId}-${line.colorHex}-${line.size}`} className="flex flex-wrap items-center gap-4 rounded-card border border-line p-4">
                <PlaceholderImage label={product.name} className="h-24 w-24 shrink-0 rounded-card" />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.09em] text-muted">{product.brand}</span>
                  <p className="font-heading text-lg text-ink">{product.name}</p>
                  <p className="text-sm text-muted">
                    O&apos;lcham: {line.size} · Rang: {colorName(line.colorHex)}
                  </p>
                  <button
                    onClick={() => removeLine(line.productId, line.colorHex, line.size)}
                    className="mt-1 text-sm font-semibold text-danger"
                  >
                    O&apos;chirish
                  </button>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-base font-bold text-ink">{formatSom(product.price * line.qty)}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQty(line.productId, line.colorHex, line.size, line.qty - 1)}
                      className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-line"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-9 text-center text-sm font-semibold">{line.qty}</span>
                    <button
                      onClick={() => setQty(line.productId, line.colorHex, line.size, line.qty + 1)}
                      className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-line"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="sticky top-[150px] h-fit flex-[1_1_300px] rounded-block border border-line bg-surface p-6">
          <h2 className="mb-4 font-bold text-ink">Buyurtma xulosasi</h2>
          <div className="mb-3 flex gap-2">
            <input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Kupon kodi"
              className="min-w-0 flex-1 rounded-btn border border-line bg-bg px-3 py-2.5 text-sm outline-none"
            />
            <button onClick={applyCoupon} className="rounded-btn border border-line px-3.5 text-sm font-semibold text-ink">
              Qo&apos;llash
            </button>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-ink">
              <span>Mahsulotlar</span>
              <span>{formatSom(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-accent">
                <span>Chegirma</span>
                <span>−{formatSom(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-ink">
              <span>Yetkazib berish</span>
              <span>{delivery === 0 ? "Bepul" : formatSom(delivery)}</span>
            </div>
          </div>
          <div className="my-4 border-t border-line" />
          <div className="mb-4 flex justify-between text-[22px] font-bold text-ink">
            <span>Jami</span>
            <span>{formatSom(total)}</span>
          </div>
          <Link
            href="/checkout"
            className="block w-full rounded-btn bg-accent py-3.5 text-center text-sm font-semibold text-accent-ink"
          >
            Rasmiylashtirishga o&apos;tish
          </Link>
        </aside>
      </div>
    </div>
  );
}
