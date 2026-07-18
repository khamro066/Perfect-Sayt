"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import clsx from "clsx";
import { ProductCard } from "@/components/product/ProductCard";
import { useProductsData } from "@/lib/products-data";
import { formatSom } from "@/lib/format";

const GENDERS = ["Erkaklar", "Ayollar", "Bolalar", "Uniseks"];
const SIZES = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
const COLORS = ["#1b1a16", "#f4f1ea", "#8a8880", "#6b4a2f", "#2c4a7a", "#0a5c3a", "#a83232", "#d8c7a8"];
const RATINGS = [4.5, 4.0, 3.5];
const BRANDS = ["Qadam", "Zamin", "Uzstep", "Terra", "Volna", "Silk Road", "Atlas"];
const MATERIALS = ["Charm", "Zamsh", "Mesh", "Tekstil", "Rezina"];

const SORT_OPTIONS = [
  { value: "new", label: "Eng yangi" },
  { value: "popular", label: "Eng mashhur" },
  { value: "rating", label: "Eng yuqori baholangan" },
  { value: "priceAsc", label: "Narxi: arzon" },
  { value: "priceDesc", label: "Narxi: qimmat" },
  { value: "discount", label: "Eng katta chegirma" },
];

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function CatalogContent() {
  const searchParams = useSearchParams();
  const { products, getTotalStock } = useProductsData();
  const [allCategories, setAllCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setAllCategories);
  }, []);

  const [sizes, setSizes] = useState<number[]>([]);
  const [genders, setGenders] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>(
    searchParams.get("category") ? [searchParams.get("category")!] : []
  );
  const [brands, setBrands] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(2000000);
  const [minRating, setMinRating] = useState(0);
  const [onSale, setOnSale] = useState(searchParams.get("sale") === "1");
  const [inStock, setInStock] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);
  const [popular, setPopular] = useState(false);
  const [sort, setSort] = useState(searchParams.get("sort") ?? "new");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  function clearFilters() {
    setSizes([]);
    setGenders([]);
    setCategories([]);
    setBrands([]);
    setColors([]);
    setMaterials([]);
    setPriceMin(0);
    setPriceMax(2000000);
    setMinRating(0);
    setOnSale(false);
    setInStock(false);
    setOnlyNew(false);
    setPopular(false);
  }

  const results = useMemo(() => {
    let list = products.filter((p) => {
      if (sizes.length && !sizes.some((s) => p.sizes.includes(s))) return false;
      if (genders.length && !genders.includes(p.gender)) return false;
      if (categories.length && !categories.includes(p.category)) return false;
      if (brands.length && !brands.includes(p.brand)) return false;
      if (colors.length && !colors.some((c) => p.colors.includes(c))) return false;
      if (materials.length && !materials.includes(p.material)) return false;
      if (p.price < priceMin || p.price > priceMax) return false;
      if (minRating && p.rating < minRating) return false;
      if (onSale && !p.oldPrice) return false;
      if (inStock && getTotalStock(p.id) <= 0) return false;
      if (onlyNew && !p.isNew) return false;
      if (popular && p.sold < 50) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "popular":
          return b.sold - a.sold;
        case "rating":
          return b.rating - a.rating;
        case "priceAsc":
          return a.price - b.price;
        case "priceDesc":
          return b.price - a.price;
        case "discount": {
          const da = a.oldPrice ? (a.oldPrice - a.price) / a.oldPrice : 0;
          const db = b.oldPrice ? (b.oldPrice - b.price) / b.oldPrice : 0;
          return db - da;
        }
        default:
          return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.id.localeCompare(a.id);
      }
    });

    return list;
  }, [products, sizes, genders, categories, brands, colors, materials, priceMin, priceMax, minRating, onSale, inStock, onlyNew, popular, sort, getTotalStock]);

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-7 pb-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium text-ink">Katalog</h1>
          <p className="mt-1 text-sm text-muted">{results.length} ta mahsulot topildi</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 rounded-btn border border-line bg-surface px-3.5 py-2 text-sm font-semibold text-ink lg:hidden"
          >
            <SlidersHorizontal size={15} /> Filtrlar
          </button>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-ink">Saralash:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-btn border border-line bg-surface px-3 py-2 text-sm outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="relative ml-auto flex h-full w-[86vw] max-w-[340px] flex-col overflow-y-auto bg-surface p-5.5">
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="mb-3 flex h-9 w-9 items-center justify-center self-end rounded-full border border-line"
              aria-label="Yopish"
            >
              <X size={16} />
            </button>
            <FilterSidebar
              {...{
                sizes, setSizes, genders, setGenders, categories, setCategories,
                brands, setBrands, colors, setColors, materials, setMaterials,
                priceMin, setPriceMin, priceMax, setPriceMax, minRating, setMinRating,
                onSale, setOnSale, inStock, setInStock, onlyNew, setOnlyNew, popular, setPopular,
                clearFilters, allCategories,
              }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-7">
        <aside className="sticky top-[150px] hidden h-fit w-[270px] shrink-0 rounded-block border border-line bg-surface p-5.5 lg:block">
          <FilterSidebar
            {...{
              sizes, setSizes, genders, setGenders, categories, setCategories,
              brands, setBrands, colors, setColors, materials, setMaterials,
              priceMin, setPriceMin, priceMax, setPriceMax, minRating, setMinRating,
              onSale, setOnSale, inStock, setInStock, onlyNew, setOnlyNew, popular, setPopular,
              clearFilters, allCategories,
            }}
          />
        </aside>

        <div className="min-w-0 flex-[3_1_520px]">
          {results.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-semibold text-ink">Hech narsa topilmadi</p>
              <p className="mt-1 text-sm text-muted">Filtrlarni o&apos;zgartirib ko&apos;ring yoki tozalang.</p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface FilterProps {
  sizes: number[]; setSizes: (v: number[]) => void;
  genders: string[]; setGenders: (v: string[]) => void;
  categories: string[]; setCategories: (v: string[]) => void;
  brands: string[]; setBrands: (v: string[]) => void;
  colors: string[]; setColors: (v: string[]) => void;
  materials: string[]; setMaterials: (v: string[]) => void;
  priceMin: number; setPriceMin: (v: number) => void;
  priceMax: number; setPriceMax: (v: number) => void;
  minRating: number; setMinRating: (v: number) => void;
  onSale: boolean; setOnSale: (v: boolean) => void;
  inStock: boolean; setInStock: (v: boolean) => void;
  onlyNew: boolean; setOnlyNew: (v: boolean) => void;
  popular: boolean; setPopular: (v: boolean) => void;
  clearFilters: () => void;
  allCategories: string[];
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "whitespace-nowrap rounded-pill border px-3.5 py-2 text-[13px] font-semibold transition-colors",
        active ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface text-ink"
      )}
    >
      {children}
    </button>
  );
}

function FilterSidebar(p: FilterProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="font-bold text-ink">Filtrlar</span>
        <button onClick={p.clearFilters} className="text-sm font-semibold text-accent">
          Tozalash
        </button>
      </div>

      <FilterSection label="Oyoq o'lchami">
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => p.setSizes(toggle(p.sizes, s))}
              className={clsx(
                "min-w-[46px] rounded-[10px] border px-2 py-2.5 text-sm font-semibold transition-colors",
                p.sizes.includes(s) ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface text-ink"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection label="Jinsi">
        <div className="flex flex-wrap gap-1.5">
          {GENDERS.map((g) => (
            <Pill key={g} active={p.genders.includes(g)} onClick={() => p.setGenders(toggle(p.genders, g))}>
              {g}
            </Pill>
          ))}
        </div>
      </FilterSection>

      <FilterSection label="Kategoriya">
        <div className="flex flex-wrap gap-1.5">
          {p.allCategories.map((c) => (
            <Pill key={c} active={p.categories.includes(c)} onClick={() => p.setCategories(toggle(p.categories, c))}>
              {c}
            </Pill>
          ))}
        </div>
      </FilterSection>

      <FilterSection label="Brend">
        <div className="flex flex-wrap gap-1.5">
          {BRANDS.map((b) => (
            <Pill key={b} active={p.brands.includes(b)} onClick={() => p.setBrands(toggle(p.brands, b))}>
              {b}
            </Pill>
          ))}
        </div>
      </FilterSection>

      <FilterSection label="Rang">
        <div className="flex flex-wrap gap-2">
          {COLORS.map((hex) => (
            <button
              key={hex}
              onClick={() => p.setColors(toggle(p.colors, hex))}
              className="h-[30px] w-[30px] rounded-full border border-line"
              style={{
                background: hex,
                boxShadow: p.colors.includes(hex) ? `0 0 0 2px var(--surface), 0 0 0 4px var(--accent)` : undefined,
              }}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection label="Material">
        <div className="flex flex-wrap gap-1.5">
          {MATERIALS.map((m) => (
            <Pill key={m} active={p.materials.includes(m)} onClick={() => p.setMaterials(toggle(p.materials, m))}>
              {m}
            </Pill>
          ))}
        </div>
      </FilterSection>

      <FilterSection label="Narx oralig'i">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-muted">
            <span>{formatSom(p.priceMin)}</span>
            <span>{formatSom(p.priceMax)}</span>
          </div>
          <input
            type="range" min={0} max={2000000} step={50000}
            value={p.priceMin}
            onChange={(e) => p.setPriceMin(Math.min(Number(e.target.value), p.priceMax))}
            className="w-full accent-accent"
          />
          <input
            type="range" min={0} max={2000000} step={50000}
            value={p.priceMax}
            onChange={(e) => p.setPriceMax(Math.max(Number(e.target.value), p.priceMin))}
            className="w-full accent-accent"
          />
        </div>
      </FilterSection>

      <FilterSection label="Reyting">
        <div className="flex flex-wrap gap-1.5">
          {RATINGS.map((r) => (
            <Pill
              key={r}
              active={p.minRating === r}
              onClick={() => p.setMinRating(p.minRating === r ? 0 : r)}
            >
              ★ {r}+
            </Pill>
          ))}
        </div>
      </FilterSection>

      <div className="flex flex-col gap-2.5 border-t border-line pt-4">
        {[
          { label: "Chegirmadagi mahsulotlar", value: p.onSale, set: p.setOnSale },
          { label: "Omborda mavjud", value: p.inStock, set: p.setInStock },
          { label: "Yangi mahsulotlar", value: p.onlyNew, set: p.setOnlyNew },
          { label: "Mashhur mahsulotlar", value: p.popular, set: p.setPopular },
        ].map((c) => (
          <label key={c.label} className="flex items-center gap-2.5 text-sm text-ink">
            <input
              type="checkbox"
              checked={c.value}
              onChange={(e) => c.set(e.target.checked)}
              className="h-[17px] w-[17px] accent-accent"
            />
            {c.label}
          </label>
        ))}
      </div>
    </div>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-[13.5px] font-semibold text-ink">{label}</span>
      {children}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense>
      <CatalogContent />
    </Suspense>
  );
}
