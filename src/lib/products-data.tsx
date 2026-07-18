"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Product, StockEntry } from "./types";

interface ProductsDataValue {
  products: Product[];
  stock: StockEntry[];
  loading: boolean;
  getStock: (productId: string, colorHex: string, size: number) => number;
  getTotalStock: (productId: string) => number;
  refetch: () => Promise<void>;
}

const ProductsDataContext = createContext<ProductsDataValue | null>(null);

export function ProductsDataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [stock, setStock] = useState<StockEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data.products);
    setStock(data.stock);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Fetching from the API after mount — setState happens after the
    // await, not synchronously within this effect body.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch]);

  const getStock = (productId: string, colorHex: string, size: number) =>
    stock.find((s) => s.productId === productId && s.colorHex === colorHex && s.size === size)?.quantity ?? 0;

  const getTotalStock = (productId: string) =>
    stock.filter((s) => s.productId === productId).reduce((sum, s) => sum + s.quantity, 0);

  return (
    <ProductsDataContext.Provider value={{ products, stock, loading, getStock, getTotalStock, refetch }}>
      {children}
    </ProductsDataContext.Provider>
  );
}

export function useProductsData() {
  const ctx = useContext(ProductsDataContext);
  if (!ctx) throw new Error("useProductsData must be used within ProductsDataProvider");
  return ctx;
}
