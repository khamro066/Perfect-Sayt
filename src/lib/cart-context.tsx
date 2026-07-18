"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useProductsData } from "./products-data";

export interface CartLine {
  productId: string;
  colorHex: string;
  size: number;
  qty: number;
}

interface CartContextValue {
  lines: CartLine[];
  addLine: (line: CartLine) => void;
  removeLine: (productId: string, colorHex: string, size: number) => void;
  setQty: (productId: string, colorHex: string, size: number, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "perfect-shoes-cart";

function sameLine(a: CartLine, b: Pick<CartLine, "productId" | "colorHex" | "size">) {
  return a.productId === b.productId && a.colorHex === b.colorHex && a.size === b.size;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { products } = useProductsData();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Hydrating from localStorage after mount — unavailable during SSR.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setLines(parsed);
        }
      } catch {
        // ignore corrupt cart data
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const addLine: CartContextValue["addLine"] = (line) => {
    setLines((prev) => {
      const existing = prev.find((l) => sameLine(l, line));
      if (existing) {
        return prev.map((l) => (sameLine(l, line) ? { ...l, qty: l.qty + line.qty } : l));
      }
      return [...prev, line];
    });
  };

  const removeLine: CartContextValue["removeLine"] = (productId, colorHex, size) => {
    setLines((prev) => prev.filter((l) => !sameLine(l, { productId, colorHex, size })));
  };

  const setQty: CartContextValue["setQty"] = (productId, colorHex, size, qty) => {
    setLines((prev) =>
      prev.map((l) =>
        sameLine(l, { productId, colorHex, size }) ? { ...l, qty: Math.max(1, qty) } : l
      )
    );
  };

  const clear = () => setLines([]);

  const count = lines.reduce((sum, l) => sum + l.qty, 0);
  const subtotal = lines.reduce((sum, l) => {
    const product = products.find((p) => p.id === l.productId);
    return sum + (product?.price ?? 0) * l.qty;
  }, 0);

  return (
    <CartContext.Provider value={{ lines, addLine, removeLine, setQty, clear, count, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
