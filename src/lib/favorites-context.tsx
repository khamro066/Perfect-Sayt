"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useCustomer } from "./customer-context";

interface FavoritesContextValue {
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);
const STORAGE_KEY = "perfect-shoes-favorites";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { customer } = useCustomer();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const syncedPhoneRef = useRef<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Hydrating from localStorage after mount — unavailable during SSR.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setFavorites(parsed);
        }
      } catch {
        // ignore corrupt favorites data
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites, hydrated]);

  // Once the customer's phone is known (first order placed, or hydrated
  // from a returning session), push local favorites up and pull down
  // anything already saved server-side under that phone — so favorites
  // follow the customer across devices without requiring a phone number
  // just to use the heart icon while anonymous.
  useEffect(() => {
    if (!hydrated || !customer?.phone) return;
    if (syncedPhoneRef.current === customer.phone) return;
    syncedPhoneRef.current = customer.phone;

    fetch("/api/favorites/merge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: customer.phone, productIds: favorites }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { productIds: string[] } | null) => {
        if (data) setFavorites(data.productIds);
      })
      .catch(() => {
        // best-effort sync — local favorites remain the source of truth
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, customer?.phone]);

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const wasFavorite = prev.includes(productId);
      const next = wasFavorite ? prev.filter((id) => id !== productId) : [...prev, productId];

      if (customer?.phone) {
        const body = JSON.stringify({ phone: customer.phone, productId });
        fetch("/api/favorites", {
          method: wasFavorite ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body,
        }).catch(() => {
          // best-effort sync — local state already updated
        });
      }

      return next;
    });
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
