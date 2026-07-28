"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, Search as SearchIcon, Moon, Sun, ShoppingBag } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { useCart } from "@/lib/cart-context";
import { MiniCart } from "./MiniCart";
import { SlideMenu } from "./SlideMenu";
import { SearchPanel } from "./SearchPanel";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const router = useRouter();
  const t = useTranslations("header");
  const { theme, toggleTheme } = useTheme();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [miniCartOpen, setMiniCartOpen] = useState(false);

  function handleCartClick() {
    if (count === 0) {
      router.push("/savat");
      return;
    }
    setMiniCartOpen((v) => !v);
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-deep">
        <div className="relative mx-auto flex max-w-[1280px] items-center justify-between px-6 py-3.5">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label={t("menu")}
            className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border border-deep-line text-deep-ink transition-colors hover:bg-white/10 sm:h-[42px] sm:w-[42px]"
          >
            <Menu size={19} />
          </button>

          <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Image
              src="/brand/perfect-logo-white.png"
              alt="Perfect Shoes"
              width={140}
              height={40}
              className="h-7 w-auto brightness-0 invert sm:h-9"
              priority
            />
          </Link>

          <div className="relative flex shrink-0 items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label={t("search")}
              className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-deep-line text-deep-ink transition-colors hover:bg-white/10 sm:h-[42px] sm:w-[42px]"
            >
              <SearchIcon size={17} />
            </button>
            {searchOpen && <SearchPanel onClose={() => setSearchOpen(false)} />}
            <button
              onClick={toggleTheme}
              aria-label={t("themeToggle")}
              className="hidden h-[42px] w-[42px] items-center justify-center rounded-full border border-deep-line text-deep-ink transition-colors hover:bg-white/10 sm:flex"
            >
              {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            <LanguageSwitcher />
            <div className="relative">
              <button
                onClick={handleCartClick}
                aria-label={t("cart")}
                className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full border border-deep-line text-deep-ink transition-colors hover:bg-white/10 sm:h-[42px] sm:w-[42px]"
              >
                <ShoppingBag size={17} />
                {count > 0 && (
                  <span
                    key={count}
                    className="animate-pop-badge absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-pill bg-deep-ink px-1 text-[11px] font-bold text-deep"
                  >
                    {count}
                  </span>
                )}
              </button>
              {miniCartOpen && <MiniCart onClose={() => setMiniCartOpen(false)} />}
            </div>
          </div>
        </div>
      </header>
      <SlideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
