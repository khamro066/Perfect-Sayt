"use client";

import { useEffect, useState } from "react";
import { Review } from "@/lib/types";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending: { label: "Kutilmoqda", color: "var(--star)" },
  approved: { label: "Tasdiqlangan", color: "var(--accent)" },
  rejected: { label: "Rad etilgan", color: "var(--danger)" },
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [productNames, setProductNames] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/reviews").then((res) => res.json()).then(setReviews);
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((products: { id: string; name: string }[]) => {
        setProductNames(Object.fromEntries(products.map((p) => [p.id, p.name])));
      });
  }, []);

  async function setStatus(id: string, status: "approved" | "rejected") {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async function deleteReview(id: string) {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
  }

  return (
    <div className="rounded-card border border-line bg-surface p-5.5">
      <h2 className="font-bold text-ink">Mijoz sharhlari</h2>
      <p className="mt-1.5 mb-4 text-[13px] text-muted">
        Yangi sharhlar avval shu yerda tasdiqlanadi, keyin mahsulot sahifasida ko&apos;rinadi.
      </p>

      {reviews.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-muted">Hozircha sharhlar yo&apos;q</p>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((r) => {
            const st = STATUS_LABEL[r.status];
            return (
              <div key={r.id} className="flex flex-col gap-2 rounded-[14px] border border-line p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-ink">{productNames[r.productId] ?? r.productId}</p>
                    <p className="text-[12.5px] text-muted">{r.customerName} · {r.createdAt}</p>
                  </div>
                  <span className="rounded-pill bg-surface-2 px-2.5 py-1 text-xs font-bold" style={{ color: st.color }}>
                    {st.label}
                  </span>
                </div>
                <div className="text-star">{"★".repeat(r.rating)}</div>
                <p className="text-[13.5px] leading-relaxed text-muted">{r.text}</p>
                <div className="mt-1 flex gap-2">
                  <button
                    onClick={() => setStatus(r.id, "approved")}
                    className="rounded-[8px] bg-accent px-3.5 py-2 text-[12.5px] font-semibold text-accent-ink"
                  >
                    Tasdiqlash
                  </button>
                  <button
                    onClick={() => setStatus(r.id, "rejected")}
                    className="rounded-[8px] border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink"
                  >
                    Rad etish
                  </button>
                  <button
                    onClick={() => deleteReview(r.id)}
                    className="rounded-[8px] border border-danger bg-transparent px-3.5 py-2 text-[12.5px] font-semibold text-danger"
                  >
                    O&apos;chirish
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
