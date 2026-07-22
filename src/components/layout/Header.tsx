"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, Search as SearchIcon, Moon, Sun, ShoppingBag } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { useCart } from "@/lib/cart-context";
import { MiniCart } from "./MiniCart";
import { SlideMenu } from "./SlideMenu";
import { SearchPanel } from "./SearchPanel";

export function Header() {
  const router = useRouter();
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
            aria-label="Menyu"
            className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border border-deep-line text-deep-ink transition-colors hover:bg-white/10"
          >
            <Menu size={19} />
          </button>

          <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Image
              src="/brand/perfect-logo-white.png"
              alt="Perfect Shoes"
              width={140}
              height={40}
              className="h-8 w-auto brightness-0 invert sm:h-9"
              priority
            />
          </Link>

          <div className="relative flex shrink-0 items-center gap-1.5">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Qidiruv"
              className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-deep-line text-deep-ink transition-colors hover:bg-white/10"
            >
              <SearchIcon size={17} />
            </button>
            {searchOpen && <SearchPanel onClose={() => setSearchOpen(false)} />}
            <button
              onClick={toggleTheme}
              aria-label="Mavzuni almashtirish"
              className="hidden h-[42px] w-[42px] items-center justify-center rounded-full border border-deep-line text-deep-ink transition-colors hover:bg-white/10 sm:flex"
            >
              {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            <div className="relative">
              <button
                onClick={handleCartClick}
                aria-label="Savatcha"
                className="flex h-[42px] items-center gap-2 rounded-btn border border-deep-line px-3 text-sm font-medium text-deep-ink transition-colors hover:bg-white/10 sm:px-4"
              >
                <span className="hidden sm:inline">Savatcha</span>
                <ShoppingBag size={18} className="sm:hidden" />
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
      </header>
      <SlideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
