"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Product, StockEntry } from "./types";
import { PRODUCTS as SEED_PRODUCTS, STOCK as SEED_STOCK, CATEGORIES as SEED_CATEGORIES } from "./mock-data";

interface AdminDataContextValue {
  products: Product[];
  addProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;

  stock: StockEntry[];
  setStockQty: (productId: string, colorHex: string, size: number, quantity: number) => void;
  totalStockFor: (productId: string) => number;
  stockFor: (productId: string, colorHex: string, size: number) => number;

  categories: string[];
  addCategory: (name: string) => "ok" | "empty" | "duplicate";
  renameCategory: (oldName: string, newName: string) => "ok" | "empty" | "duplicate";
  deleteCategory: (name: string) => "ok" | "in-use";
}

const AdminDataContext = createContext<AdminDataContextValue | null>(null);
const PRODUCTS_KEY = "perfect-shoes-admin-products";
const STOCK_KEY = "perfect-shoes-admin-stock";
const CATEGORIES_KEY = "perfect-shoes-admin-categories";

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [stock, setStock] = useState<StockEntry[]>(SEED_STOCK);
  const [categories, setCategories] = useState<string[]>([...SEED_CATEGORIES]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hydrating from localStorage after mount — unavailable during SSR.
    try {
      const p = localStorage.getItem(PRODUCTS_KEY);
      const parsedProducts = p ? JSON.parse(p) : null;
      const s = localStorage.getItem(STOCK_KEY);
      const parsedStock = s ? JSON.parse(s) : null;
      const c = localStorage.getItem(CATEGORIES_KEY);
      const parsedCategories = c ? JSON.parse(c) : null;
      /* eslint-disable react-hooks/set-state-in-effect */
      if (Array.isArray(parsedProducts)) setProducts(parsedProducts);
      if (Array.isArray(parsedStock)) setStock(parsedStock);
      if (Array.isArray(parsedCategories)) setCategories(parsedCategories);
      /* eslint-enable react-hooks/set-state-in-effect */
    } catch {
      // ignore corrupt admin data
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    localStorage.setItem(STOCK_KEY, JSON.stringify(stock));
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }, [products, stock, categories, hydrated]);

  const addProduct = (p: Product) => {
    setProducts((prev) => [p, ...prev]);
    setStock((prev) => [
      ...prev,
      ...p.colors.flatMap((colorHex) =>
        p.sizes.map((size) => ({ productId: p.id, colorHex, size, quantity: 0 }))
      ),
    ]);
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setStock((prev) => prev.filter((s) => s.productId !== id));
  };

  const setStockQty = (productId: string, colorHex: string, size: number, quantity: number) => {
    setStock((prev) =>
      prev.map((s) =>
        s.productId === productId && s.colorHex === colorHex && s.size === size
          ? { ...s, quantity: Math.max(0, quantity) }
          : s
      )
    );
  };

  const totalStockFor = (productId: string) =>
    stock.filter((s) => s.productId === productId).reduce((sum, s) => sum + s.quantity, 0);

  const stockFor = (productId: string, colorHex: string, size: number) =>
    stock.find((s) => s.productId === productId && s.colorHex === colorHex && s.size === size)?.quantity ?? 0;

  const addCategory: AdminDataContextValue["addCategory"] = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return "empty";
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) return "duplicate";
    setCategories((prev) => [...prev, trimmed]);
    return "ok";
  };

  const renameCategory: AdminDataContextValue["renameCategory"] = (oldName, newName) => {
    const trimmed = newName.trim();
    if (!trimmed) return "empty";
    if (categories.some((c) => c !== oldName && c.toLowerCase() === trimmed.toLowerCase())) return "duplicate";
    setCategories((prev) => prev.map((c) => (c === oldName ? trimmed : c)));
    setProducts((prev) => prev.map((p) => (p.category === oldName ? { ...p, category: trimmed } : p)));
    return "ok";
  };

  const deleteCategory: AdminDataContextValue["deleteCategory"] = (name) => {
    if (products.some((p) => p.category === name)) return "in-use";
    setCategories((prev) => prev.filter((c) => c !== name));
    return "ok";
  };

  return (
    <AdminDataContext.Provider
      value={{
        products, addProduct, deleteProduct,
        stock, setStockQty, totalStockFor, stockFor,
        categories, addCategory, renameCategory, deleteCategory,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData must be used within AdminDataProvider");
  return ctx;
}
