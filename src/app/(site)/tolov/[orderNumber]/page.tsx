"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { SELLER_CONTACT } from "@/lib/constants";
import { useToast } from "@/lib/toast-context";

export default function PaymentPage() {
  const params = useParams<{ orderNumber: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const [step, setStep] = useState<"qr" | "telegram">("qr");
  const [submitting, setSubmitting] = useState(false);

  async function markPaid() {
    setSubmitting(true);
    const res = await fetch(`/api/orders/${params.orderNumber}`, { method: "PATCH" });
    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      showToast(data.error ?? "Xatolik yuz berdi, qayta urinib ko'ring");
      return;
    }
    setStep("telegram");
  }

  return (
    <div className="mx-auto max-w-[560px] px-6 py-14 pb-16">
      <div className="rounded-block bg-surface p-[clamp(28px,5vw,48px)] text-center">
        {step === "qr" ? (
          <>
            <h1 className="text-2xl font-medium text-ink">Karta orqali to&apos;lov</h1>
            <p className="mt-2 text-sm text-muted">
              Buyurtma raqami: <b className="text-ink">{params.orderNumber}</b>
            </p>

            {/*
              PLACEHOLDER — real QR code image goes here. Once provided,
              replace this block with:
                <Image src="/images/payment-qr.png" alt="To'lov QR kodi" width={300} height={300} className="mx-auto mt-6 rounded-card" />
            */}
            <div className="mx-auto mt-6 flex h-[300px] w-[300px] items-center justify-center rounded-card border border-line bg-surface-2 p-4 text-center text-xs text-muted">
              <span>QR kod (haqiqiy rasm keyinroq qo&apos;shiladi)</span>
            </div>

            <p className="mx-auto mt-5 max-w-[380px] text-sm text-muted">
              To&apos;lovni amalga oshirish uchun yuqoridagi QR kodni skanerlang.
            </p>

            <button
              onClick={markPaid}
              disabled={submitting}
              className="mt-6 w-full rounded-btn bg-accent py-3.5 text-sm font-semibold text-accent-ink disabled:opacity-60"
            >
              {submitting ? "Tekshirilmoqda…" : "To'ladim"}
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-medium text-ink">Chekingizni yuboring</h1>
            <p className="mx-auto mt-2 max-w-[380px] text-sm text-muted">
              Chekingizni shu Telegram orqali yuboring — sotuvchi tekshirgach, buyurtmangiz tasdiqlanadi.
            </p>

            <a
              href={SELLER_CONTACT.telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-pill bg-accent px-5 py-3 text-sm font-semibold text-accent-ink"
            >
              <Send size={16} /> Sotuvchi bilan bog&apos;lanish
            </a>

            <button
              onClick={() => router.push(`/tasdiqlash/${params.orderNumber}?kind=order`)}
              className="mt-4 w-full rounded-btn border border-line py-3.5 text-sm font-semibold text-ink"
            >
              Davom etish
            </button>
          </>
        )}
      </div>
    </div>
  );
}
