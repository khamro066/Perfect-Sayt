"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { formatDateRangeUz } from "@/lib/format";
import { Order } from "@/lib/types";

function ConfirmContent() {
  const params = useParams<{ orderNumber: string }>();
  const searchParams = useSearchParams();
  const t = useTranslations("confirm");
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${params.orderNumber}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setOrder);
  }, [params.orderNumber]);

  const isPreorderConfirm = searchParams.get("kind") === "preorder";
  const flaggedPreorder = !isPreorderConfirm && order?.isPreorder;
  const pendingPayment = !isPreorderConfirm && order?.status === "To'lov tekshirilmoqda";

  return (
    <div className="mx-auto max-w-[640px] px-6 py-14 pb-16">
      <div className="rounded-block bg-surface p-[clamp(28px,5vw,48px)] text-center">
        <div className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-accent-soft">
          <Check size={38} className="text-accent" />
        </div>

        {isPreorderConfirm ? (
          <>
            <h1 className="text-2xl font-medium text-ink">{t("preorderTitle")}</h1>
            <p className="mt-2 text-sm text-muted">
              {t("preorderDesc")}
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-medium text-ink">
              {pendingPayment ? t("pendingPaymentTitle") : t("confirmedTitle")}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {pendingPayment ? t("pendingPaymentDesc") : t("confirmedDesc")}
            </p>
            {pendingPayment && (
              <div className="mt-4 rounded-[12px] border p-3.5 text-sm" style={{ background: "var(--accent-soft)", borderColor: "var(--accent)", color: "var(--ink)" }}>
                {t("pendingPaymentBanner")}
              </div>
            )}
            {flaggedPreorder && (
              <div className="mt-4 rounded-[12px] border p-3.5 text-sm" style={{ background: "#f5eaff", borderColor: "#c9a8f0", color: "#6b3fa0" }}>
                {t("preorderFlagBanner")}
              </div>
            )}
          </>
        )}

        <div className="mt-6 flex flex-col gap-2 rounded-[14px] bg-bg p-5 text-left text-sm">
          <Row label={t("orderNumber")} value={params.orderNumber} />
          {isPreorderConfirm ? (
            <>
              <Row label={t("production")} value={t("productionRange")} />
              <Row label={t("estimatedDelivery")} value={formatDateRangeUz(14, 21)} />
              <Row label={t("status")} value={t("statusPending")} color="var(--star)" />
            </>
          ) : pendingPayment ? (
            <Row label={t("status")} value={t("statusPaymentPending")} color="var(--star)" />
          ) : (
            <>
              <Row label={t("estimatedDelivery")} value={formatDateRangeUz(2, 4)} />
              <Row label={t("status")} value={t("statusPreparing")} color="var(--accent)" />
            </>
          )}
        </div>

        <p className="mx-auto mt-5 w-fit rounded-pill bg-accent-soft px-4 py-2 text-xs text-ink">
          {t("smsNotice")}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/profil" className="rounded-btn bg-accent px-5 py-3 text-sm font-semibold text-accent-ink">
            {t("myOrders")}
          </Link>
          <Link href="/" className="rounded-btn border border-line px-5 py-3 text-sm font-semibold text-ink">
            {t("backHome")}
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
