"use client";

import { useState } from "react";
import { X, Star } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import { Button } from "@/components/ui/Button";

export function ReviewModal({
  productName,
  onClose,
  onSubmit,
}: {
  productName: string;
  onClose: () => void;
  onSubmit: (rating: number, text: string) => void;
}) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const { showToast } = useToast();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-5" onClick={onClose}>
      <div className="w-full max-w-[420px] rounded-block bg-surface p-7" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-ink">{productName} haqida fikr</h3>
          <button onClick={onClose} aria-label="Yopish">
            <X size={18} className="text-muted" />
          </button>
        </div>
        <div className="mb-4 flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)} aria-label={`${n} yulduz`}>
              <Star size={26} className={n <= rating ? "fill-star text-star" : "fill-star/30 text-star/30"} />
            </button>
          ))}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Mahsulot haqida fikringiz (ixtiyoriy)"
          className="min-h-[100px] w-full resize-none rounded-btn border border-line bg-bg p-3.5 text-sm outline-none"
        />
        <Button
          className="mt-4 w-full"
          onClick={() => {
            onSubmit(rating, text);
            showToast("Sharh yuborildi — moderatsiyadan so'ng ko'rinadi");
            onClose();
          }}
        >
          Sharhni yuborish
        </Button>
      </div>
    </div>
  );
}
