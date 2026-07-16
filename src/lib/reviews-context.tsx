"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Review } from "./types";
import { REVIEWS as SEED_REVIEWS } from "./mock-data";

interface PendingReviewInput {
  productId: string;
  orderNumber: string;
  customerName: string;
  rating: number;
  text: string;
}

interface ReviewsContextValue {
  reviews: (Review & { orderNumber?: string })[];
  addReview: (input: PendingReviewInput) => void;
  setStatus: (id: string, status: Review["status"]) => void;
  deleteReview: (id: string) => void;
  isReviewed: (orderNumber: string, productId: string) => boolean;
}

const ReviewsContext = createContext<ReviewsContextValue | null>(null);
const STORAGE_KEY = "perfect-shoes-reviews";

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<(Review & { orderNumber?: string })[]>(SEED_REVIEWS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Hydrating from localStorage after mount — unavailable during SSR.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setReviews(parsed);
        }
      } catch {
        // ignore corrupt reviews data
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  }, [reviews, hydrated]);

  const addReview = (input: PendingReviewInput) => {
    setReviews((prev) => [
      {
        id: `rev-${Date.now()}`,
        productId: input.productId,
        orderNumber: input.orderNumber,
        customerName: input.customerName,
        rating: input.rating,
        text: input.text,
        status: "pending",
        createdAt: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
  };

  const setStatus = (id: string, status: Review["status"]) =>
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

  const deleteReview = (id: string) => setReviews((prev) => prev.filter((r) => r.id !== id));

  const isReviewed = (orderNumber: string, productId: string) =>
    reviews.some((r) => r.orderNumber === orderNumber && r.productId === productId);

  return (
    <ReviewsContext.Provider value={{ reviews, addReview, setStatus, deleteReview, isReviewed }}>
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error("useReviews must be used within ReviewsProvider");
  return ctx;
}
