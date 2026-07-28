"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

export function SlideMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("menu");

  const PRIMARY_LINKS = [
    { label: t("home"), href: "/" },
    { label: t("newArrivals"), href: "/katalog?sort=new" },
    { label: t("sale"), href: "/katalog?sale=1" },
    { label: t("catalog"), href: "/katalog" },
    { label: t("categories"), href: "/kategoriyalar" },
  ];

  const SECONDARY_LINKS = [
    { label: t("adminLogin"), href: "/admin/login" },
    { label: t("preorder"), href: "/oldindan-buyurtma" },
    { label: t("trackOrder"), href: "/profil" },
    { label: t("favorites"), href: "/profil?tab=favs" },
  ];

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex">
      <div className="animate-overlay-fade-in absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="animate-slide-in-left relative flex h-full w-full max-w-[420px] flex-col overflow-y-auto bg-surface lg:w-[420px]">
        <div className="flex items-center justify-between border-b border-line p-5">
          <span className="font-heading text-lg font-medium text-ink">{t("title")}</span>
          <button
            onClick={onClose}
            aria-label={t("close")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-5">
          {PRIMARY_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="rounded-[10px] px-3.5 py-3 text-[17px] font-semibold text-ink transition-colors hover:bg-accent-soft/40"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-line p-5">
          <nav className="flex flex-col gap-1">
            {SECONDARY_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="rounded-[8px] px-3.5 py-2.5 text-sm font-medium text-muted transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/aloqa"
              onClick={onClose}
              className="rounded-[8px] px-3.5 py-2.5 text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              {t("contactHelp")}
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
