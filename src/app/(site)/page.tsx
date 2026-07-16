import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, PackageCheck, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { PRODUCTS, CATEGORIES } from "@/lib/mock-data";
import { NewsletterForm } from "@/components/home/NewsletterForm";

const HOME_CATEGORIES = CATEGORIES.filter((c) => c !== "Krossovka");

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: "Sifat kafolati", desc: "Barcha mahsulotlar yuqori sifatli materiallardan" },
  { icon: PackageCheck, title: "Tez yetkazib berish", desc: "O'zbekiston bo'ylab 1-2 kun ichida" },
  { icon: Sparkles, title: "Xavfsiz to'lov", desc: "Online to'lov tizimi 100% himoyalangan" },
];

const REVIEWS = [
  { name: "Dilnoza Karimova", city: "Toshkent", rating: 5, text: "Krossovka juda sifatli chiqdi, o'lchami aniq keldi. Yetkazib berish ertasiga bo'ldi — juda mamnunman!" },
  { name: "Sardor Aliyev", city: "Samarqand", rating: 5, text: "Original mahsulot, charm etiklar zo'r. Viloyatga ham tez yetib keldi. Yana buyurtma beraman." },
  { name: "Malika Yusupova", city: "Farg'ona", rating: 4, text: "Sayt qulay, qidiruv tez ishlaydi. Chegirmalar ajoyib. Faqat rangi rasmga nisbatan biroz och." },
];

function ProductRow({ title, href, products }: { title: string; href: string; products: typeof PRODUCTS }) {
  if (products.length === 0) return null;
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-8">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-medium text-ink">{title}</h2>
        <Link href={href} className="text-sm font-semibold text-accent hover:text-ink">
          Barchasini ko&apos;rish →
        </Link>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,260px))] gap-5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const newArrivals = PRODUCTS.filter((p) => p.isNew).slice(0, 4);
  const bestSellers = [...PRODUCTS].sort((a, b) => b.sold - a.sold).slice(0, 4);
  const discounted = PRODUCTS.filter((p) => p.oldPrice).slice(0, 4);

  return (
    <>
      <div className="mx-auto max-w-[1280px] px-6 pb-3 pt-9">
        <div
          className="relative min-h-[420px] overflow-hidden rounded-block border border-line p-[clamp(30px,5vw,68px)]"
          style={{
            background:
              "radial-gradient(130% 130% at 100% 0%, var(--accent-soft) 0%, #cfdbee 32%, var(--surface) 58%, var(--bg) 100%)",
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden pl-[44%]"
          >
            <Image
              src="/brand/perfect-logo-white.png"
              alt=""
              width={340}
              height={162}
              className="h-auto w-[340px] max-w-full opacity-[0.12]"
            />
          </div>
          <div className="relative max-w-[640px]">
            <span className="inline-block rounded-pill border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink">
              Perfect Shoes
            </span>
            <h1 className="mt-4 font-heading text-[clamp(34px,5vw,58px)] font-medium leading-[1.07] text-ink">
              Har qadamingiz uchun mukammal tanlov
            </h1>
            <p className="mt-4 max-w-[460px] text-[17px] text-muted">
              O&apos;zbekistondagi eng qulay oyoq kiyimlar kolleksiyasi. Sifatli mahsulotlar, tez yetkazib berish va qulay to&apos;lov.
            </p>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1280px] px-6 py-8">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] divide-x divide-line rounded-card border border-line bg-surface">
          {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col gap-2 p-6">
              <Icon size={28} className="text-accent" />
              <p className="font-semibold text-ink">{title}</p>
              <p className="text-sm text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-medium text-ink">Kategoriyalar</h2>
          <Link href="/katalog" className="text-sm font-semibold text-accent hover:text-ink">
            Katalog →
          </Link>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
          {HOME_CATEGORIES.map((cat) => (
            <Link key={cat} href={`/katalog?category=${cat}`} className="flex flex-col items-center gap-2.5">
              <PlaceholderImage label={cat} className="aspect-square w-full rounded-card" />
              <span className="text-sm font-semibold text-ink">{cat}</span>
            </Link>
          ))}
        </div>
      </section>

      <ProductRow title="Yangi mahsulotlar" href="/katalog?sort=new" products={newArrivals} />
      <ProductRow title="Eng ko'p sotilganlar" href="/katalog?sort=popular" products={bestSellers} />

      <section className="mx-auto max-w-[1280px] px-6 py-8">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-0 overflow-hidden rounded-block border border-line">
          <div className="flex flex-col justify-center gap-4 bg-surface p-9">
            <span className="text-xs font-semibold uppercase tracking-[0.09em] text-muted">Tanlangan kolleksiya</span>
            <h2 className="font-heading text-[clamp(26px,3.5vw,38px)] font-medium text-ink">Klassika, qayta kashf etilgan</h2>
            <p className="text-[15px] text-muted">
              Har mavsumda tanlab olingan eng sifatli modellar — charm, zamsh va zamonaviy dizayn uyg&apos;unligi.
            </p>
            <Link
              href="/katalog"
              className="w-fit rounded-btn bg-ink px-5 py-3 text-sm font-semibold text-bg"
            >
              Kolleksiyani ko&apos;rish
            </Link>
          </div>
          <PlaceholderImage label="Tanlangan kolleksiya" className="min-h-[320px] w-full" />
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-8">
        <div className="mb-5 flex items-center gap-3">
          <h2 className="text-2xl font-medium text-ink">Chegirmadagi mahsulotlar</h2>
          <span className="rounded-pill bg-danger px-2.5 py-1 text-[11px] font-bold text-white">SALE</span>
          <Link href="/katalog?sale=1" className="ml-auto text-sm font-semibold text-accent hover:text-ink">
            Barchasini ko&apos;rish →
          </Link>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,260px))] gap-5">
          {discounted.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-8">
        <h2 className="mb-5 text-2xl font-medium text-ink">Mijozlar fikri</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
          {REVIEWS.map((r) => (
            <div key={r.name} className="flex flex-col gap-3 rounded-card border border-line bg-surface p-6">
              <div className="text-star tracking-[2px]">{"★".repeat(r.rating)}</div>
              <p className="text-[15px] text-ink">{r.text}</p>
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent">
                  {r.name[0]}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{r.name}</p>
                  <p className="text-xs text-muted">{r.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-8">
        <div className="rounded-block bg-accent-soft p-[clamp(28px,5vw,44px)] text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.09em] text-muted">Yangiliklar</span>
          <h2 className="mt-2 font-heading text-2xl font-medium text-ink">Yangiliklardan xabardor bo&apos;ling</h2>
          <p className="mx-auto mt-2 max-w-md text-[15px] text-muted">
            Yangi kolleksiyalar va maxsus chegirmalar haqida birinchilardan bo&apos;lib bilib oling.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
