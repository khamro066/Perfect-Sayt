import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

// Category list/images change via admin — render per-request, not frozen at build time.
export const dynamic = "force-dynamic";

export default async function KategoriyalarPage() {
  const t = await getTranslations("menu");
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-9 pb-14">
      <h1 className="mb-6 text-2xl font-medium text-ink">{t("categories")}</h1>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-5">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/katalog?category=${cat.name}`} className="flex flex-col items-center gap-2.5">
            {cat.image ? (
              <div className="relative aspect-square w-full overflow-hidden rounded-card">
                <Image src={cat.image} alt={cat.name} fill sizes="200px" className="object-cover" />
              </div>
            ) : (
              <PlaceholderImage label={cat.name} className="aspect-square w-full rounded-card" />
            )}
            <span className="text-sm font-semibold text-ink">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
