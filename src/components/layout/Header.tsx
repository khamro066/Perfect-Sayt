"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import clsx from "clsx";
import { useTheme } from "@/lib/theme-context";
import { useCart } from "@/lib/cart-context";
import { MiniCart } from "./MiniCart";

const NAV_ITEMS = [
  { label: "Bosh sahifa", href: "/", trackActive: true },
  { label: "Katalog", href: "/katalog", trackActive: true },
  { label: "Yangi mahsulotlar", href: "/katalog?sort=new", trackActive: false },
  { label: "Chegirmalar", href: "/katalog?sale=1", trackActive: false },
  { label: "Biz haqimizda", href: "/aloqa", trackActive: true },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { count } = useCart();
  const [miniCartOpen, setMiniCartOpen] = useState(false);

  function handleCartClick() {
    if (count === 0) {
      router.push("/savat");
      return;
    }
    setMiniCartOpen((v) => !v);
  }

  return (
    <header className="sticky top-0 z-40 bg-deep">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-5 px-6 py-3.5">
        <Link href="/">
          <Image
            src="/brand/perfect-logo-white.png"
            alt="Perfect Shoes"
            width={140}
            height={40}
            className="h-10 w-auto brightness-0 invert"
            priority
          />
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            aria-label="Mavzuni almashtirish"
            className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-deep-line text-deep-ink transition-colors hover:bg-white/10"
          >
            {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          <div className="relative">
            <button
              onClick={handleCartClick}
              className="flex h-[42px] items-center gap-2 rounded-btn border border-deep-line px-4 text-sm font-medium text-deep-ink transition-colors hover:bg-white/10"
            >
              Savatcha
              {count > 0 && (
                <span
                  key={count}
                  className="animate-pop-badge flex min-w-5 h-5 items-center justify-center rounded-pill bg-deep-ink px-1 text-[11px] font-bold text-deep"
                >
                  {count}
                </span>
              )}
            </button>
            {miniCartOpen && <MiniCart onClose={() => setMiniCartOpen(false)} />}
          </div>
        </div>
      </div>
      <nav className="border-t border-deep-line bg-deep">
        <div className="mx-auto flex max-w-[1280px] gap-0.5 overflow-x-auto px-4.5">
          {NAV_ITEMS.map((item) => {
            const active = item.trackActive && (pathname === item.href.split("?")[0]);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={clsx(
                  "whitespace-nowrap border-b-2 px-4 py-3.5 text-[13px] uppercase tracking-[0.04em] transition-colors hover:text-deep-ink",
                  active
                    ? "border-deep-ink font-bold text-deep-ink"
                    : "border-transparent font-medium text-deep-muted"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
