import Link from "next/link";
import { Send } from "lucide-react";
import { SELLER_CONTACT } from "@/lib/constants";

const SHOP_LINKS = [
  { label: "Erkaklar", href: "/katalog?gender=Erkaklar" },
  { label: "Ayollar", href: "/katalog?gender=Ayollar" },
  { label: "Bolalar", href: "/katalog?gender=Bolalar" },
  { label: "Yangi mahsulotlar", href: "/katalog?sort=new" },
  { label: "Chegirmalar", href: "/katalog?sale=1" },
];

const HELP_LINKS = [
  { label: "Oldindan buyurtma", href: "/oldindan-buyurtma" },
  { label: "Qaytarish siyosati", href: "/katalog" },
  { label: "Buyurtmani kuzatish", href: "/profil" },
  { label: "Bog'lanish", href: "/aloqa" },
];

const PAYMENT_METHODS = ["Payme", "Click", "Uzum Bank", "Humo", "UzCard", "Visa", "Mastercard", "Naqd pul"];

export function Footer() {
  return (
    <footer className="mt-6 bg-deep">
      <div className="mx-auto grid max-w-[1280px] grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-9 px-6 py-13">
        <div className="max-w-[280px]">
          <p className="font-heading text-[22px] font-semibold tracking-[0.04em] text-deep-ink">PERFECT</p>
          <p className="mt-3 text-[13.5px] text-deep-muted">
            O&apos;zbekistondagi premium oyoq kiyim do&apos;koni. Original mahsulotlar, ishonchli xizmat.
          </p>
          <p className="mt-3 text-[13.5px] text-deep-muted">{SELLER_CONTACT.phoneDisplay}</p>
          <div className="mt-3 flex gap-2">
            <a
              href={SELLER_CONTACT.telegramChannelUrl}
              target="_blank"
              rel="noreferrer"
              title="Telegram kanal"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-deep-line text-deep-ink transition-colors hover:border-accent hover:text-accent"
            >
              <Send size={15} />
            </a>
            <a
              href={SELLER_CONTACT.telegramUrl}
              target="_blank"
              rel="noreferrer"
              title="Sotuvchi bilan bog'lanish"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-deep-line text-deep-ink transition-colors hover:border-accent hover:text-accent"
            >
              <Send size={15} />
            </a>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-deep-highlight">Do&apos;kon</p>
          <ul className="mt-3 flex flex-col gap-2.5">
            {SHOP_LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="text-[13.5px] text-deep-muted hover:text-deep-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-deep-highlight">Yordam</p>
          <ul className="mt-3 flex flex-col gap-2.5">
            {HELP_LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="text-[13.5px] text-deep-muted hover:text-deep-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-deep-highlight">To&apos;lov usullari</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {PAYMENT_METHODS.map((m) => (
              <span
                key={m}
                className="rounded-[8px] border border-deep-line px-2.5 py-1 text-[11.5px] font-semibold text-deep-muted"
              >
                {m}
              </span>
            ))}
          </div>
          <Link
            href="/admin/login"
            className="mt-3 inline-block text-[13px] font-semibold text-deep-highlight"
          >
            Admin kirish →
          </Link>
        </div>
      </div>
      <div className="border-t border-deep-line px-6 py-4.5">
        <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-2 text-[12.5px] text-deep-muted">
          <span>© 2026 Perfect Shoes. Barcha huquqlar himoyalangan.</span>
          <span>Toshkent, O&apos;zbekiston</span>
        </div>
      </div>
    </footer>
  );
}
