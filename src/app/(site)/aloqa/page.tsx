import { Phone, MapPin, Send } from "lucide-react";
import { SELLER_CONTACT } from "@/lib/constants";

export default function ContactPage() {
  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-10 px-6 py-10 pb-14">
      <div className="max-w-[660px]">
        <span className="text-xs font-semibold uppercase tracking-[0.09em] text-muted">Biz haqimizda</span>
        <h1 className="mt-2 font-heading text-[clamp(30px,4.5vw,46px)] font-medium leading-[1.1] text-ink">
          Perfect Shoes — ishonchli oyoq kiyim do&apos;koni
        </h1>
        <p className="mt-3 text-[15px] text-muted">
          Biz O&apos;zbekiston bo&apos;ylab erkaklar, ayollar va bolalar uchun sifatli, qulay va zamonaviy oyoq
          kiyimlarni yetkazib beramiz. Har bir juft — original mahsulot, rasmiy kafolat bilan. Tez yetkazib berish
          va qulay to&apos;lov.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4">
        <div className="rounded-card border border-line bg-surface p-6">
          <Phone size={20} className="text-accent" />
          <p className="mt-3 text-sm font-semibold text-muted">Telefon</p>
          <p className="mt-1 text-[19px] font-bold text-ink">{SELLER_CONTACT.phoneDisplay}</p>
          <p className="mt-1 text-sm text-muted">Har kuni 09:00 – 22:00</p>
        </div>

        <a
          href="https://maps.app.goo.gl/APaX4HPUtGLA454b6"
          target="_blank"
          rel="noreferrer"
          className="rounded-card border border-line bg-surface p-6 transition-colors hover:border-accent"
        >
          <MapPin size={20} className="text-accent" />
          <p className="mt-3 text-sm font-semibold text-muted">Manzil</p>
          <p className="mt-1 text-[15px] font-semibold text-ink">Toshkent shahri, Olmazor tumani, Allon 25A</p>
          <p className="mt-2 text-sm font-semibold text-accent">Xaritada ko&apos;rish →</p>
        </a>

        <div className="rounded-card border border-line bg-surface p-6">
          <p className="text-sm font-semibold text-muted">Yetkazib berish</p>
          <p className="mt-3 text-[15px] text-ink">Toshkent — 1 kun</p>
          <p className="text-[15px] text-ink">Viloyatlar — 3-5 kun</p>
        </div>

        <div className="rounded-card border border-line bg-surface p-6">
          <Send size={20} className="text-accent" />
          <p className="mt-3 text-sm font-semibold text-muted">Telegram</p>
          <a href={SELLER_CONTACT.telegramChannelUrl} target="_blank" rel="noreferrer" className="mt-1 block text-[15px] font-semibold text-ink">
            Rasmiy kanal
          </a>
          <a href={SELLER_CONTACT.telegramUrl} target="_blank" rel="noreferrer" className="mt-1 block text-sm text-muted">
            Sotuvchi bilan bog&apos;lanish
          </a>
        </div>
      </div>

      <div className="rounded-block bg-accent-soft p-[clamp(28px,4vw,44px)]">
        <h2 className="font-heading text-2xl font-medium text-ink">Savolingiz bormi?</h2>
        <p className="mt-2 max-w-lg text-[15px] text-muted">
          Buyurtma, o&apos;lcham yoki yetkazib berish bo&apos;yicha bizga qo&apos;ng&apos;iroq qiling — yordam beramiz.
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
