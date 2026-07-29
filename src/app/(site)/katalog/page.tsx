"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { SlidersHorizontal, X } from "lucide-react";
import clsx from "clsx";
import { ProductCard } from "@/components/product/ProductCard";
import { useProductsData } from "@/lib/products-data";
import { formatSom } from "@/lib/format";
import { colorName } from "@/lib/colors";
import { Product } from "@/lib/types";

const SIZES = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
const COLORS = ["#1b1a16", "#f4f1ea", "#8a8880", "#6b4a2f", "#2c4a7a", "#0a5c3a", "#a83232", "#d8c7a8"];
const RATINGS = [4.5, 4.0, 3.5];
const BRANDS = ["Qadam", "Zamin", "Uzstep", "Terra", "Volna", "Silk Road", "Atlas"];
const MATERIALS = ["Charm", "Zamsh", "Mesh", "Tekstil", "Rezina"];

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

interface FilterValues {
  sizes: number[];
  categories: string[];
  brands: string[];
  colors: string[];
  materials: string[];
  priceMin: number;
  priceMax: number;
  minRating: number;
  onSale: boolean;
  inStock: boolean;
  onlyNew: boolean;
  popular: boolean;
}

type FacetKey = keyof Omit<FilterValues, "priceMin" | "priceMax">;

function matchesFilters(
  p: Product,
  f: FilterValues,
  getTotalStock: (id: string) => number,
  except?: FacetKey
): boolean {
  if (except !== "sizes" && f.sizes.length && !f.sizes.some((s) => p.sizes.includes(s))) return false;
  if (except !== "categories" && f.categories.length && !f.categories.includes(p.category)) return false;
  if (except !== "brands" && f.brands.length && !f.brands.includes(p.brand)) return false;
  if (except !== "colors" && f.colors.length && !f.colors.some((c) => p.colors.includes(c))) return false;
  if (except !== "materials" && f.materials.length && !f.materials.includes(p.material)) return false;
  if (p.price < f.priceMin || p.price > f.priceMax) return false;
  if (except !== "minRating" && f.minRating && p.rating < f.minRating) return false;
  if (except !== "onSale" && f.onSale && !p.oldPrice) return false;
  if (except !== "inStock" && f.inStock && getTotalStock(p.id) <= 0) return false;
  if (except !== "onlyNew" && f.onlyNew && !p.isNew) return false;
  if (except !== "popular" && f.popular && p.sold < 50) return false;
  return true;
}

const EMPTY_FILTERS: FilterValues = {
  sizes: [], categories: [], brands: [], colors: [], materials: [],
  priceMin: 0, priceMax: 2000000, minRating: 0,
  onSale: false, inStock: false, onlyNew: false, popular: false,
};

function CatalogContent() {
  const searchParams = useSearchParams();
  const t = useTranslations("catalog");
  const { products, getTotalStock } = useProductsData();
  const [allCategories, setAllCategories] = useState<string[]>([]);

  const SORT_OPTIONS = [
    { value: "new", label: t("sortNewest") },
    { value: "popular", label: t("sortPopular") },
    { value: "rating", label: t("sortRating") },
    { value: "priceAsc", label: t("sortPriceAsc") },
    { value: "priceDesc", label: t("sortPriceDesc") },
    { value: "discount", label: t("sortDiscount") },
  ];

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setAllCategories);
  }, []);

  const initialFilters: FilterValues = {
    ...EMPTY_FILTERS,
    categories: searchParams.get("category") ? [searchParams.get("category")!] : [],
    onSale: searchParams.get("sale") === "1",
  };

  const [sizes, setSizes] = useState<number[]>(initialFilters.sizes);
  const [categories, setCategories] = useState<string[]>(initialFilters.categories);
  const [brands, setBrands] = useState<string[]>(initialFilters.brands);
  const [colors, setColors] = useState<string[]>(initialFilters.colors);
  const [materials, setMaterials] = useState<string[]>(initialFilters.materials);
  const [priceMin, setPriceMin] = useState(initialFilters.priceMin);
  const [priceMax, setPriceMax] = useState(initialFilters.priceMax);
  const [minRating, setMinRating] = useState(initialFilters.minRating);
  const [onSale, setOnSale] = useState(initialFilters.onSale);
  const [inStock, setInStock] = useState(initialFilters.inStock);
  const [onlyNew, setOnlyNew] = useState(initialFilters.onlyNew);
  const [popular, setPopular] = useState(initialFilters.popular);
  const [sort, setSort] = useState(searchParams.get("sort") ?? "new");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filters only take effect once "Qidirish" is pressed — this snapshot,
  // not the live draft state above, drives the product grid.
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>(initialFilters);

  const draftFilters: FilterValues = {
    sizes, categories, brands, colors, materials,
    priceMin, priceMax, minRating, onSale, inStock, onlyNew, popular,
  };

  function applyFilters() {
    setAppliedFilters(draftFilters);
    setMobileFiltersOpen(false);
  }

  function clearFilters() {
    setSizes(EMPTY_FILTERS.sizes);
    setCategories(EMPTY_FILTERS.categories);
    setBrands(EMPTY_FILTERS.brands);
    setColors(EMPTY_FILTERS.colors);
    setMaterials(EMPTY_FILTERS.materials);
    setPriceMin(EMPTY_FILTERS.priceMin);
    setPriceMax(EMPTY_FILTERS.priceMax);
    setMinRating(EMPTY_FILTERS.minRating);
    setOnSale(EMPTY_FILTERS.onSale);
    setInStock(EMPTY_FILTERS.inStock);
    setOnlyNew(EMPTY_FILTERS.onlyNew);
    setPopular(EMPTY_FILTERS.popular);
    setAppliedFilters(EMPTY_FILTERS);
  }

  const results = useMemo(() => {
    let list = products.filter((p) => matchesFilters(p, appliedFilters, getTotalStock));

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
  }, [products, appliedFilters, sort, getTotalStock]);

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-7 pb-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium text-ink">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted">{t("resultsCount", { count: results.length })}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 rounded-btn border border-line bg-surface px-3.5 py-2 text-sm font-semibold text-ink lg:hidden"
          >
            <SlidersHorizontal size={15} /> {t("filtersButton")}
          </button>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-ink">{t("sortLabel")}</span>
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
              aria-label={t("close")}
            >
              <X size={16} />
            </button>
            <FilterSidebar
              {...{
                sizes, setSizes, categories, setCategories,
                brands, setBrands, colors, setColors, materials, setMaterials,
                priceMin, setPriceMin, priceMax, setPriceMax, minRating, setMinRating,
                onSale, setOnSale, inStock, setInStock, onlyNew, setOnlyNew, popular, setPopular,
                clearFilters, allCategories, applyFilters,
                products, getTotalStock, draftFilters,
              }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-7">
        <aside className="sticky top-[150px] hidden h-fit w-[270px] shrink-0 rounded-block border border-line bg-surface p-5.5 lg:block">
          <FilterSidebar
            {...{
              sizes, setSizes, categories, setCategories,
              brands, setBrands, colors, setColors, materials, setMaterials,
              priceMin, setPriceMin, priceMax, setPriceMax, minRating, setMinRating,
              onSale, setOnSale, inStock, setInStock, onlyNew, setOnlyNew, popular, setPopular,
              clearFilters, allCategories, applyFilters,
              products, getTotalStock, draftFilters,
            }}
          />
        </aside>

        <div className="min-w-0 flex-[3_1_520px]">
          {results.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-semibold text-ink">{t("noResultsTitle")}</p>
              <p className="mt-1 text-sm text-muted">{t("noResultsDesc")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] sm:gap-5">
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
  applyFilters: () => void;
  products: Product[];
  getTotalStock: (id: string) => number;
  draftFilters: FilterValues;
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
  const t = useTranslations("catalog");

  function countFor(except: FacetKey, predicate: (product: Product) => boolean) {
    return p.products.filter(
      (product) => matchesFilters(product, p.draftFilters, p.getTotalStock, except) && predicate(product)
    ).length;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="font-bold text-ink">{t("filtersTitle")}</span>
        <button onClick={p.clearFilters} className="text-sm font-semibold text-accent">
          {t("clearFilters")}
        </button>
      </div>

      <FilterSection label={t("sizeLabel")}>
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
              {s} ({countFor("sizes", (product) => product.sizes.includes(s))})
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection label={t("categoryLabel")}>
        <div className="flex flex-wrap gap-1.5">
          {p.allCategories.map((c) => (
            <Pill key={c} active={p.categories.includes(c)} onClick={() => p.setCategories(toggle(p.categories, c))}>
              {c} ({countFor("categories", (product) => product.category === c)})
            </Pill>
          ))}
        </div>
      </FilterSection>

      <FilterSection label={t("brandLabel")}>
        <div className="flex flex-wrap gap-1.5">
          {BRANDS.map((b) => (
            <Pill key={b} active={p.brands.includes(b)} onClick={() => p.setBrands(toggle(p.brands, b))}>
              {b} ({countFor("brands", (product) => product.brand === b)})
            </Pill>
          ))}
        </div>
      </FilterSection>

      <FilterSection label={t("colorLabel")}>
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map((hex) => (
            <Pill key={hex} active={p.colors.includes(hex)} onClick={() => p.setColors(toggle(p.colors, hex))}>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-3 w-3 shrink-0 rounded-full border border-line"
                  style={{ background: hex }}
                />
                {colorName(hex)} ({countFor("colors", (product) => product.colors.includes(hex))})
              </span>
            </Pill>
          ))}
        </div>
      </FilterSection>

      <FilterSection label={t("materialLabel")}>
        <div className="flex flex-wrap gap-1.5">
          {MATERIALS.map((m) => (
            <Pill key={m} active={p.materials.includes(m)} onClick={() => p.setMaterials(toggle(p.materials, m))}>
              {m} ({countFor("materials", (product) => product.material === m)})
            </Pill>
          ))}
        </div>
      </FilterSection>

      <FilterSection label={t("priceRangeLabel")}>
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

      <FilterSection label={t("ratingLabel")}>
        <div className="flex flex-wrap gap-1.5">
          {RATINGS.map((r) => (
            <Pill
              key={r}
              active={p.minRating === r}
              onClick={() => p.setMinRating(p.minRating === r ? 0 : r)}
            >
              ★ {r}+ ({countFor("minRating", (product) => product.rating >= r)})
            </Pill>
          ))}
        </div>
      </FilterSection>

      <div className="flex flex-col gap-2.5 border-t border-line pt-4">
        {(
          [
            { key: "onSale" as const, label: t("onSaleCheckbox"), value: p.onSale, set: p.setOnSale, predicate: (product: Product) => !!product.oldPrice },
            { key: "inStock" as const, label: t("inStockCheckbox"), value: p.inStock, set: p.setInStock, predicate: (product: Product) => p.getTotalStock(product.id) > 0 },
            { key: "onlyNew" as const, label: t("onlyNewCheckbox"), value: p.onlyNew, set: p.setOnlyNew, predicate: (product: Product) => !!product.isNew },
            { key: "popular" as const, label: t("popularCheckbox"), value: p.popular, set: p.setPopular, predicate: (product: Product) => product.sold >= 50 },
          ]
        ).map((c) => (
          <label key={c.key} className="flex items-center gap-2.5 text-sm text-ink">
            <input
              type="checkbox"
              checked={c.value}
              onChange={(e) => c.set(e.target.checked)}
              className="h-[17px] w-[17px] accent-accent"
            />
            {c.label} ({countFor(c.key, c.predicate)})
          </label>
        ))}
      </div>

      <button
        onClick={p.applyFilters}
        className="mt-1 w-full rounded-btn bg-accent py-3 text-sm font-semibold text-accent-ink transition-colors hover:opacity-90"
      >
        {t("applyButton")}
      </button>
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
