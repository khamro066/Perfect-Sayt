"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { setLocale } from "@/i18n/actions";
import { LOCALES, type Locale } from "@/i18n/locales";

const LOCALE_LABELS: Record<Locale, string> = {
  uz: "O'zbekcha",
  ru: "Русский",
  en: "English",
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const t = useTranslations("languageSwitcher");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSelect(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("label")}
        disabled={isPending}
        className="flex h-[38px] w-[38px] items-center justify-center gap-1.5 rounded-full border border-deep-line text-deep-ink transition-colors hover:bg-white/10 disabled:opacity-60 sm:h-[42px] sm:w-auto sm:px-3"
      >
        <Globe size={16} />
        <span className="hidden text-xs font-semibold uppercase sm:inline">{locale}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[160px] overflow-hidden rounded-[14px] border border-line bg-surface py-1.5 shadow-xl">
            {LOCALES.map((code) => (
              <button
                key={code}
                onClick={() => handleSelect(code)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-accent-soft/40 ${
                  code === locale ? "font-semibold text-ink" : "text-muted"
                }`}
              >
                {LOCALE_LABELS[code]}
                <span className="text-xs uppercase text-muted">{code}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
