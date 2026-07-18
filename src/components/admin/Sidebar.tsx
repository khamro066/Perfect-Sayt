"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import clsx from "clsx";
import { X } from "lucide-react";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/admin", label: "Boshqaruv paneli" },
  { href: "/admin/mahsulotlar", label: "Mahsulotlar" },
  { href: "/admin/kategoriyalar", label: "Kategoriyalar" },
  { href: "/admin/ombor", label: "Ombor nazorati" },
  { href: "/admin/buyurtmalar", label: "Buyurtmalar" },
  { href: "/admin/sharhlar", label: "Sharhlar" },
  { href: "/admin/oldindan-buyurtmalar", label: "Oldindan buyurtmalar" },
  { href: "/admin/oldindan-buyurtma-mahsulotlari", label: "Oldindan buyurtma mahsulotlari" },
  { href: "/admin/mijozlar", label: "Mijozlar" },
  { href: "/admin/hisobotlar", label: "Hisobotlar" },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  const content = (
    <>
      <div className="flex items-center justify-between px-2 pb-4.5 pt-1.5">
        <Image src="/brand/perfect-logo-blue.jpg" alt="Perfect Shoes" width={120} height={36} className="h-9 w-auto" />
        <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full border border-line lg:hidden" aria-label="Yopish">
          <X size={15} />
        </button>
      </div>
      <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-muted">Admin panel</p>
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={clsx(
              "rounded-[10px] px-3.5 py-2.5 text-sm font-semibold transition-colors",
              active ? "bg-accent text-accent-ink" : "text-ink hover:bg-accent-soft/40"
            )}
          >
            {item.label}
          </Link>
        );
      })}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="mt-auto rounded-[10px] border border-line px-3.5 py-2.5 text-left text-sm font-semibold text-ink"
      >
        ← Do&apos;konga qaytish
      </button>
    </>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[250px] shrink-0 flex-col gap-1.5 overflow-y-auto border-r border-line bg-surface p-4 lg:flex">
        {content}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <aside className="relative flex h-full w-[250px] max-w-[80vw] flex-col gap-1.5 overflow-y-auto bg-surface p-4">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
