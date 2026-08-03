"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck, PackageCheck, Sparkles, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import clsx from "clsx";

const ICONS = [ShieldCheck, PackageCheck, Sparkles];
const POPOVER_MAX_WIDTH = 280;
const GAP = 10;
const VIEWPORT_MARGIN = 12;

type PopoverPosition = {
  left: number;
  width: number;
  arrowLeft: number;
  placement: "top" | "bottom";
  top?: number;
  bottom?: number;
};

export function TrustBadges() {
  const t = useTranslations("home");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [position, setPosition] = useState<PopoverPosition | null>(null);
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  function close() {
    setOpenIndex(null);
    setPosition(null);
  }

  function toggle(i: number) {
    if (openIndex === i) {
      close();
      return;
    }
    const trigger = triggerRefs.current[i];
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const width = Math.min(POPOVER_MAX_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2);
    const rawLeft = rect.left + rect.width / 2 - width / 2;
    const left = Math.min(Math.max(rawLeft, VIEWPORT_MARGIN), window.innerWidth - width - VIEWPORT_MARGIN);
    const arrowLeft = Math.min(Math.max(rect.left + rect.width / 2 - left, 16), width - 16);
    const spaceBelow = window.innerHeight - rect.bottom;
    const placement: "top" | "bottom" = spaceBelow > 170 ? "bottom" : "top";

    setPosition({
      left,
      width,
      arrowLeft,
      placement,
      top: placement === "bottom" ? rect.bottom + GAP : undefined,
      bottom: placement === "top" ? window.innerHeight - rect.top + GAP : undefined,
    });
    setOpenIndex(i);
  }

  useEffect(() => {
    if (openIndex === null) return;

    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (popoverRef.current?.contains(target)) return;
      if (triggerRefs.current.some((el) => el?.contains(target))) return;
      close();
    }

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [openIndex]);

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
          const isOpen = openIndex === i;
          return (
            <button
              key={item.title}
              ref={(el) => {
                triggerRefs.current[i] = el;
              }}
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
            </button>
          );
        })}
      </div>

      {openIndex !== null && position && (
        <div
          ref={popoverRef}
          className="fixed z-50 rounded-card border border-line bg-surface p-3.5 text-left shadow-xl"
          style={{ left: position.left, width: position.width, top: position.top, bottom: position.bottom }}
        >
          <div
            className={clsx(
              "absolute h-3 w-3 rotate-45 bg-surface",
              position.placement === "bottom"
                ? "-top-[6px] border-l border-t border-line"
                : "-bottom-[6px] border-b border-r border-line"
            )}
            style={{ left: position.arrowLeft - 6 }}
          />
          <p className="text-[12.5px] leading-relaxed text-muted sm:text-[13.5px]">{items[openIndex].detail}</p>
        </div>
      )}
    </section>
  );
}
