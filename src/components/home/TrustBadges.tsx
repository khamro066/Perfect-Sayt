"use client";

import { useState } from "react";
import { ShieldCheck, PackageCheck, Sparkles, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import clsx from "clsx";

const ICONS = [ShieldCheck, PackageCheck, Sparkles];

export function TrustBadges() {
  const t = useTranslations("home");
  const [open, setOpen] = useState([false, false, false]);

  function toggle(i: number) {
    setOpen((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  const items = [1, 2, 3].map((n) => ({
    title: t(`trust${n}Title` as "trust1Title" | "trust2Title" | "trust3Title"),
    desc: t(`trust${n}Desc` as "trust1Desc" | "trust2Desc" | "trust3Desc"),
    detail: t(`trust${n}Detail` as "trust1Detail" | "trust2Detail" | "trust3Detail"),
  }));

  return (
    <section className="mx-auto max-w-[1280px] px-6 py-8">
      <div className="grid grid-cols-3 divide-x divide-line rounded-card border border-line bg-surface sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
        {items.map((item, i) => {
          const Icon = ICONS[i];
          const isOpen = open[i];
          return (
            <button
              key={item.title}
              onClick={() => toggle(i)}
              aria-expanded={isOpen}
              className="flex flex-col items-center gap-1 p-2.5 text-center transition-colors hover:bg-accent-soft/30 sm:items-start sm:gap-2 sm:p-6 sm:text-left"
            >
              <div className="flex w-full items-center gap-1.5 sm:gap-2">
                <Icon size={18} className="text-accent sm:hidden" />
                <Icon size={28} className="hidden text-accent sm:block" />
                <ChevronDown
                  size={14}
                  className={clsx("ml-auto text-muted transition-transform sm:ml-auto", isOpen && "rotate-180")}
                />
              </div>
              <p className="text-[10.5px] font-semibold leading-tight text-ink sm:text-base">{item.title}</p>
              <p className="hidden text-sm text-muted sm:block">{item.desc}</p>
              {isOpen && (
                <p className="mt-1 text-left text-[11.5px] leading-relaxed text-muted sm:text-[13.5px]">
                  {item.detail}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
