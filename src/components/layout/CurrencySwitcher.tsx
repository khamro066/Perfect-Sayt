"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Coins } from "lucide-react";
import { useCurrency } from "@/lib/currency-context";
import { CURRENCIES, type Currency } from "@/lib/currency";

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();
  const t = useTranslations("header");
  const [open, setOpen] = useState(false);

  function handleSelect(next: Currency) {
    setOpen(false);
    setCurrency(next);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("currency")}
        className="flex h-[38px] w-[38px] items-center justify-center gap-1.5 rounded-full border border-line text-ink transition-colors hover:bg-accent-soft/40 sm:h-[42px] sm:w-auto sm:px-3"
      >
        <Coins size={16} />
        <span className="hidden text-xs font-semibold uppercase sm:inline">{currency}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[140px] overflow-hidden rounded-[14px] border border-line bg-surface py-1.5 shadow-xl">
            {CURRENCIES.map((code) => (
              <button
                key={code}
                onClick={() => handleSelect(code)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-accent-soft/40 ${
                  code === currency ? "font-semibold text-ink" : "text-muted"
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
