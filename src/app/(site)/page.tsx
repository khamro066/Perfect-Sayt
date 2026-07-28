import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, PackageCheck, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ProductCard } from "@/components/product/ProductCard";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serializers";
import { Product } from "@/lib/types";

// Product/category data changes constantly (admin adds products, stock
// changes) — render this per-request rather than freezing it at build time.
export const dynamic = "force-dynamic";

const REVIEWERS = [
  { name: "Dilnoza Karimova", city: "Toshkent", rating: 5 },
  { name: "Sardor Aliyev", city: "Samarqand", rating: 5 },
  { name: "Malika Yusupova", city: "Farg'ona", rating: 4 },
];

function ProductRow({ title, href, viewAllLabel, products }: { title: string; href: string; viewAllLabel: string; products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-8">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-medium text-ink">{title}</h2>
        <Link href={href} className="text-sm font-semibold text-accent hover:text-ink">
          {viewAllLabel}
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(230px,260px))] sm:gap-5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

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
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const products = dbProducts.map(serializeProduct);
  const homeCategories = dbCategories
    .filter((c) => c.name !== "Krossovka")
    .map((c) => ({ name: c.name, image: c.image }));
  const newArrivals = products.filter((p) => p.isNew).slice(0, 4);
  const bestSellers = [...products].sort((a, b) => b.sold - a.sold).slice(0, 4);
  const discounted = products.filter((p) => p.oldPrice).slice(0, 4);

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
            className="pointer-events-none absolute inset-0 flex items-end justify-end overflow-hidden p-5 sm:items-center sm:justify-center sm:p-0 sm:pl-[44%]"
          >
            <Image
              src="/brand/perfect-logo-white.png"
              alt=""
              width={340}
              height={162}
              className="h-auto w-[140px] max-w-[45%] opacity-[0.12] sm:w-[340px] sm:max-w-full"
            />
          </div>
          <div className="relative max-w-[640px]">
            <span className="inline-block rounded-pill border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink">
              {t("badge")}
            </span>
            <h1 className="mt-4 font-heading text-[clamp(34px,5vw,58px)] font-medium leading-[1.07] text-ink">
              {t("heroTitle")}
            </h1>
            <p className="mt-4 max-w-[460px] text-[17px] text-muted">
              {t("heroSubtitle")}
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
          <h2 className="text-2xl font-medium text-ink">{t("categoriesTitle")}</h2>
          <Link href="/katalog" className="text-sm font-semibold text-accent hover:text-ink">
            {t("catalogLink")}
          </Link>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
          {homeCategories.map((cat) => (
            <Link key={cat.name} href={`/katalog?category=${cat.name}`} className="flex flex-col items-center gap-2.5">
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

      <ProductRow title={t("newArrivalsTitle")} href="/katalog?sort=new" viewAllLabel={t("viewAll")} products={newArrivals} />
      <ProductRow title={t("bestSellersTitle")} href="/katalog?sort=popular" viewAllLabel={t("viewAll")} products={bestSellers} />

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

      <section className="mx-auto max-w-[1280px] px-6 py-8">
        <div className="mb-5 flex items-center gap-3">
          <h2 className="text-2xl font-medium text-ink">{t("discountedTitle")}</h2>
          <span className="rounded-pill bg-danger px-2.5 py-1 text-[11px] font-bold text-white">SALE</span>
          <Link href="/katalog?sale=1" className="ml-auto text-sm font-semibold text-accent hover:text-ink">
            {t("viewAll")}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(230px,260px))] sm:gap-5">
          {discounted.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

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
