import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, PackageCheck, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serializers";

// Product/category data changes constantly (admin adds products, stock
// changes) — render this per-request rather than freezing it at build time.
export const dynamic = "force-dynamic";

const REVIEWERS = [
  { name: "Dilnoza Karimova", city: "Toshkent", rating: 5 },
  { name: "Sardor Aliyev", city: "Samarqand", rating: 5 },
  { name: "Malika Yusupova", city: "Farg'ona", rating: 4 },
];


export default async function HomePage() {
  const t = await getTranslations("home");

  const TRUST_ITEMS = [
    { icon: ShieldCheck, title: t("trust1Title"), desc: t("trust1Desc") },
    { icon: PackageCheck, title: t("trust2Title"), desc: t("trust2Desc") },
    { icon: Sparkles, title: t("trust3Title"), desc: t("trust3Desc") },
  ];

  const REVIEWS = REVIEWERS.map((r, i) => ({
    ...r,
    text: t(`review${i + 1}Text` as "review1Text" | "review2Text" | "review3Text"),
  }));

  const [dbProducts, dbCategories] = await Promise.all([
    prisma.product.findMany({
      where: { deletedAt: null },
      include: { category: true, colors: true, sizes: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { products: { where: { deletedAt: null }, select: { kind: true } } },
    }),
  ]);

  const products = dbProducts.map(serializeProduct);
  const homeCategories = dbCategories
    .filter((c) => !c.products.some((p) => p.kind === "accessory"))
    .map((c) => ({ name: c.name, image: c.image }));
  // Capped higher than the old static grid's 4 — these are now horizontally
  // scrollable carousels, so there's room to actually scroll through.
  const newArrivals = products.filter((p) => p.isNew).slice(0, 8);
  const bestSellers = [...products].sort((a, b) => b.sold - a.sold).slice(0, 8);
  const discounted = products.filter((p) => p.oldPrice).slice(0, 8);

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
          {/* Mobile: full-bleed photo behind the text, with a top-heavy dark
              scrim (matching the header's navy) so light text stays legible
              regardless of what's behind it — sky, water, or shoe detail. */}
          <div aria-hidden="true" className="absolute inset-0 sm:hidden">
            <Image
              src="/images/hero-loafers-coastal.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: "62% 38%" }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(11,37,69,0.90) 0%, rgba(11,37,69,0.68) 40%, rgba(11,37,69,0.30) 68%, rgba(11,37,69,0.08) 100%)",
              }}
            />
          </div>
          {/* Photo only on sm+ — at mobile width the card is too narrow for a
              busy photo to sit behind stacked text without looking like a
              cluttered blur, so mobile gets the full-bleed + scrim treatment
              above instead. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] overflow-hidden sm:block"
            style={{
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 38%)",
              maskImage: "linear-gradient(to right, transparent 0%, black 38%)",
            }}
          >
            <Image
              src="/images/hero-loafers-coastal.jpg"
              alt=""
              fill
              priority
              sizes="(min-width: 1280px) 742px, 58vw"
              className="object-cover"
              style={{ objectPosition: "70% 45%" }}
            />
          </div>
          <div className="relative max-w-[640px]">
            <span className="inline-block rounded-pill border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm sm:border-line sm:bg-surface sm:text-ink sm:backdrop-blur-none">
              {t("badge")}
            </span>
            <h1 className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-heading text-[clamp(28px,5vw,58px)] font-medium leading-[1.15] text-white sm:gap-x-5 sm:text-ink">
              <span>{t("heroTitle1")}</span>
              <span>{t("heroTitle2")}</span>
              <span>{t("heroTitle3")}</span>
            </h1>
            <p className="mt-4 max-w-[460px] text-[17px] text-white/85 sm:text-muted">
              {t("heroSubtitle")}
            </p>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1280px] px-6 py-8">
        <div className="grid grid-cols-3 divide-x divide-line rounded-card border border-line bg-surface sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
          {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center gap-1 p-2.5 text-center sm:items-start sm:gap-2 sm:p-6 sm:text-left">
              <Icon size={18} className="text-accent sm:hidden" />
              <Icon size={28} className="hidden text-accent sm:block" />
              <p className="text-[10.5px] font-semibold leading-tight text-ink sm:text-base">{title}</p>
              <p className="hidden text-sm text-muted sm:block">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-medium text-ink">{t("categoriesTitle")}</h2>
          <Link href="/katalog" className="text-sm font-semibold text-accent hover:text-ink">
            {t("catalogLink")}
          </Link>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
          {homeCategories.map((cat) => (
            <Link key={cat.name} href={`/katalog?category=${encodeURIComponent(cat.name)}`} className="flex flex-col items-center gap-2.5">
              {cat.image ? (
                <div className="relative aspect-square w-full overflow-hidden rounded-card">
                  <Image src={cat.image} alt={cat.name} fill sizes="150px" className="object-cover" />
                </div>
              ) : (
                <PlaceholderImage label={cat.name} className="aspect-square w-full rounded-card" />
              )}
              <span className="text-sm font-semibold text-ink">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <ProductCarousel title={t("newArrivalsTitle")} href="/katalog?sort=new" viewAllLabel={t("viewAll")} products={newArrivals} />
      <ProductCarousel title={t("bestSellersTitle")} href="/katalog?sort=popular" viewAllLabel={t("viewAll")} products={bestSellers} />

      <section className="mx-auto max-w-[1280px] px-6 py-5">
        <div className="relative grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] overflow-hidden rounded-[22px] border border-line bg-accent-soft">
          <div className="flex flex-col justify-center gap-3.5 p-[clamp(28px,4vw,52px)]">
            <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-accent">{t("collectionKicker")}</span>
            <h2 className="font-heading text-[clamp(28px,3.5vw,40px)] font-medium text-ink">{t("collectionTitle")}</h2>
            <p className="max-w-[340px] text-[15px] leading-[1.6] text-muted">
              {t("collectionDesc")}
            </p>
            <Link
              href="/katalog"
              className="mt-1.5 w-fit rounded-btn bg-ink px-6.5 py-3.5 text-sm font-semibold text-bg"
            >
              {t("collectionCta")}
            </Link>
          </div>
          <div className="relative min-h-[320px] w-full bg-surface-2">
            <Image
              src="/images/hero-banner-navy-loafer.jpg"
              alt="Klassik charm loafer"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <ProductCarousel
        title={t("discountedTitle")}
        href="/katalog?sale=1"
        viewAllLabel={t("viewAll")}
        products={discounted}
        badge={<span className="rounded-pill bg-danger px-2.5 py-1 text-[11px] font-bold text-white">SALE</span>}
      />

      <section className="mx-auto max-w-[1280px] px-6 py-8">
        <h2 className="mb-5 text-2xl font-medium text-ink">{t("reviewsTitle")}</h2>
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
          <span className="text-xs font-semibold uppercase tracking-[0.09em] text-muted">{t("newsletterKicker")}</span>
          <h2 className="mt-2 font-heading text-2xl font-medium text-ink">{t("newsletterTitle")}</h2>
          <p className="mx-auto mt-2 max-w-md text-[15px] text-muted">
            {t("newsletterDesc")}
          </p>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
