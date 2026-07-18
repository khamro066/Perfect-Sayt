"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { formatDateRangeUz } from "@/lib/format";
import { Order } from "@/lib/types";

function ConfirmContent() {
  const params = useParams<{ orderNumber: string }>();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${params.orderNumber}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setOrder);
  }, [params.orderNumber]);

  const isPreorderConfirm = searchParams.get("kind") === "preorder";
  const flaggedPreorder = !isPreorderConfirm && order?.isPreorder;

  return (
    <div className="mx-auto max-w-[640px] px-6 py-14 pb-16">
      <div className="rounded-block bg-surface p-[clamp(28px,5vw,48px)] text-center">
        <div className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-accent-soft">
          <Check size={38} className="text-accent" />
        </div>

        {isPreorderConfirm ? (
          <>
            <h1 className="text-2xl font-medium text-ink">Oldindan buyurtma qabul qilindi</h1>
            <p className="mt-2 text-sm text-muted">
              Buyurtmangiz ishlab chiqarish navbatiga qo&apos;shildi. Holat o&apos;zgarganda sizga xabar beramiz.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-medium text-ink">Buyurtma tasdiqlandi</h1>
            <p className="mt-2 text-sm text-muted">
              Xaridingiz uchun rahmat! Buyurtmangiz qabul qilindi va tayyorlanmoqda.
            </p>
            {flaggedPreorder && (
              <div className="mt-4 rounded-[12px] border p-3.5 text-sm" style={{ background: "#f5eaff", borderColor: "#c9a8f0", color: "#6b3fa0" }}>
                ⏳ Diqqat: so&apos;ralgan miqdor omborda yetarli emas — bu buyurtma OLDINDAN BUYURTMA sifatida qabul qilindi.
              </div>
            )}
          </>
        )}

        <div className="mt-6 flex flex-col gap-2 rounded-[14px] bg-bg p-5 text-left text-sm">
          <Row label="Raqam" value={params.orderNumber} />
          {isPreorderConfirm ? (
            <>
              <Row label="Ishlab chiqarish" value="14–21 kun" />
              <Row label="Taxminiy yetkazish" value={formatDateRangeUz(14, 21)} />
              <Row label="Holat" value="Kutilmoqda" color="var(--star)" />
            </>
          ) : (
            <>
              <Row label="Taxminiy yetkazish" value={formatDateRangeUz(2, 4)} />
              <Row label="Holat" value="Tayyorlanmoqda" color="var(--accent)" />
            </>
          )}
        </div>

        <p className="mx-auto mt-5 w-fit rounded-pill bg-accent-soft px-4 py-2 text-xs text-ink">
          Tasdiqnoma SMS va Email orqali yuborildi
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/profil" className="rounded-btn bg-accent px-5 py-3 text-sm font-semibold text-accent-ink">
            Buyurtmalarim
          </Link>
          <Link href="/" className="rounded-btn border border-line px-5 py-3 text-sm font-semibold text-ink">
            Bosh sahifaga
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className="font-semibold" style={{ color: color ?? "var(--ink)" }}>{value}</span>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmContent />
    </Suspense>
  );
}
