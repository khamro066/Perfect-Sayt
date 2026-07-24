import { Phone, MapPin, Send } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SELLER_CONTACT } from "@/lib/constants";

export default async function ContactPage() {
  const t = await getTranslations("contact");
  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-10 px-6 py-10 pb-14">
      <div className="max-w-[660px]">
        <span className="text-xs font-semibold uppercase tracking-[0.09em] text-muted">{t("kicker")}</span>
        <h1 className="mt-2 font-heading text-[clamp(30px,4.5vw,46px)] font-medium leading-[1.1] text-ink">
          {t("title")}
        </h1>
        <p className="mt-3 text-[15px] text-muted">
          {t("description")}
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4">
        <div className="rounded-card border border-line bg-surface p-6">
          <Phone size={20} className="text-accent" />
          <p className="mt-3 text-sm font-semibold text-muted">{t("phoneLabel")}</p>
          <p className="mt-1 text-[19px] font-bold text-ink">{SELLER_CONTACT.phoneDisplay}</p>
          <p className="mt-1 text-sm text-muted">{t("workingHours")}</p>
        </div>

        <a
          href="https://maps.app.goo.gl/APaX4HPUtGLA454b6"
          target="_blank"
          rel="noreferrer"
          className="rounded-card border border-line bg-surface p-6 transition-colors hover:border-accent"
        >
          <MapPin size={20} className="text-accent" />
          <p className="mt-3 text-sm font-semibold text-muted">{t("addressLabel")}</p>
          <p className="mt-1 text-[15px] font-semibold text-ink">Toshkent shahri, Olmazor tumani, Allon 25A</p>
          <p className="mt-2 text-sm font-semibold text-accent">{t("viewOnMap")}</p>
        </a>

        <div className="rounded-card border border-line bg-surface p-6">
          <p className="text-sm font-semibold text-muted">{t("deliveryLabel")}</p>
          <p className="mt-3 text-[15px] text-ink">{t("deliveryTashkent")}</p>
          <p className="text-[15px] text-ink">{t("deliveryRegions")}</p>
        </div>

        <div className="rounded-card border border-line bg-surface p-6">
          <Send size={20} className="text-accent" />
          <p className="mt-3 text-sm font-semibold text-muted">{t("telegramLabel")}</p>
          <a href={SELLER_CONTACT.telegramChannelUrl} target="_blank" rel="noreferrer" className="mt-1 block text-[15px] font-semibold text-ink">
            {t("officialChannel")}
          </a>
          <a href={SELLER_CONTACT.telegramUrl} target="_blank" rel="noreferrer" className="mt-1 block text-sm text-muted">
            {t("contactSeller")}
          </a>
        </div>
      </div>

      <div className="rounded-block bg-accent-soft p-[clamp(28px,4vw,44px)]">
        <h2 className="font-heading text-2xl font-medium text-ink">{t("questionTitle")}</h2>
        <p className="mt-2 max-w-lg text-[15px] text-muted">
          {t("questionDesc")}
        </p>
        <a
          href={SELLER_CONTACT.phoneHref}
          className="mt-4 inline-block rounded-pill bg-accent px-5 py-3 text-sm font-semibold text-accent-ink"
        >
          {SELLER_CONTACT.phoneDisplay}
        </a>
      </div>
    </div>
  );
}
