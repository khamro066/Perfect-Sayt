import Link from "next/link";
import { Send } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SELLER_CONTACT } from "@/lib/constants";

const PAYMENT_METHODS = ["Payme", "Click", "Uzum Bank", "Humo", "UzCard", "Visa", "Mastercard"];

export async function Footer() {
  const t = await getTranslations("footer");

  const SHOP_LINKS = [
    { label: t("newArrivals"), href: "/katalog?sort=new" },
    { label: t("sale"), href: "/katalog?sale=1" },
  ];

  const HELP_LINKS = [
    { label: t("preorder"), href: "/oldindan-buyurtma" },
    { label: t("trackOrder"), href: "/profil" },
    { label: t("contact"), href: "/aloqa" },
  ];

  return (
    <footer className="mt-6 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-[1280px] grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-9 px-6 py-13">
        <div className="max-w-[280px]">
          <p className="font-heading text-[22px] font-semibold tracking-[0.04em] text-ink">PERFECT</p>
          <p className="mt-3 text-[13.5px] text-muted">{t("tagline")}</p>
          <p className="mt-3 text-[13.5px] text-muted">{SELLER_CONTACT.phoneDisplay}</p>
          <div className="mt-3 flex gap-2">
            <a
              href={SELLER_CONTACT.telegramChannelUrl}
              target="_blank"
              rel="noreferrer"
              title={t("telegramChannelTitle")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-accent hover:text-accent"
            >
              <Send size={15} />
            </a>
            <a
              href={SELLER_CONTACT.telegramUrl}
              target="_blank"
              rel="noreferrer"
              title={t("telegramContactTitle")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-accent hover:text-accent"
            >
              <Send size={15} />
            </a>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-accent">{t("shop")}</p>
          <ul className="mt-3 flex flex-col gap-2.5">
            {SHOP_LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="text-[13.5px] text-muted hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-accent">{t("help")}</p>
          <ul className="mt-3 flex flex-col gap-2.5">
            {HELP_LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="text-[13.5px] text-muted hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-accent">{t("paymentMethods")}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {[...PAYMENT_METHODS, t("cash")].map((m) => (
              <span
                key={m}
                className="rounded-[8px] border border-line px-2.5 py-1 text-[11.5px] font-semibold text-muted"
              >
                {m}
              </span>
            ))}
          </div>
          <Link
            href="/admin/login"
            className="mt-3 inline-block text-[13px] font-semibold text-accent"
          >
            {t("adminLogin")}
          </Link>
        </div>
      </div>
      <div className="border-t border-line px-6 py-4.5">
        <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-2 text-[12.5px] text-muted">
          <span>{t("copyright")}</span>
          <span>{t("location")}</span>
        </div>
      </div>
    </footer>
  );
}
