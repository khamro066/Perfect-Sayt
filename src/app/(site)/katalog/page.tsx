"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Grid2x2, Rows2, SlidersHorizontal, X } from "lucide-react";
import clsx from "clsx";
import { ProductCard } from "@/components/product/ProductCard";
import { useProductsData } from "@/lib/products-data";
import { useCurrency } from "@/lib/currency-context";
import { ALL_COLORS, useColorName } from "@/lib/colors";
import { ALL_MATERIALS, useMaterialName } from "@/lib/materials";
import { Product } from "@/lib/types";

const SIZES = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
const RATINGS = [4.5, 4.0, 3.5];

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

interface FilterValues {
  sizes: number[];
  categories: string[];
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
  sizes: [], categories: [], colors: [], materials: [],
  priceMin: 0, priceMax: 2000000, minRating: 0,
  onSale: false, inStock: false, onlyNew: false, popular: false,
};

function filtersFromParams(searchParams: ReturnType<typeof useSearchParams>): FilterValues {
  const category = searchParams.get("category");
  return {
    ...EMPTY_FILTERS,
    categories: category ? [category] : [],
    onSale: searchParams.get("sale") === "1",
  };
}

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

  const initialFilters: FilterValues = filtersFromParams(searchParams);

  const [sizes, setSizes] = useState<number[]>(initialFilters.sizes);
  const [categories, setCategories] = useState<string[]>(initialFilters.categories);
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
  const [filterPageOpen, setFilterPageOpen] = useState(false);
  const [sortPageOpen, setSortPageOpen] = useState(false);
  const activeSortOption = SORT_OPTIONS.find((o) => o.value === sort) ?? SORT_OPTIONS[0];

  // Persisted per browser tab (not indefinitely) — matches "for the session".
  // Starts at the "compact" default on every render (server included) and
  // only switches after mount, to avoid a hydration mismatch against
  // sessionStorage (which the server can't see).
  const [gridDensity, setGridDensity] = useState<"compact" | "large">("compact");

  useEffect(() => {
    // Reading sessionStorage (an external system) after mount, not deriving
    // from props/state — this is the one-time sync, not a render loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (sessionStorage.getItem("katalog-grid-density") === "large") setGridDensity("large");
  }, []);

  useEffect(() => {
    sessionStorage.setItem("katalog-grid-density", gridDensity);
  }, [gridDensity]);

  // Filters only take effect once "Qidirish" is pressed — this snapshot,
  // not the live draft state above, drives the product grid.
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>(initialFilters);

  // Re-sync every filter to the URL whenever it changes via client-side
  // navigation within /katalog (e.g. picking a different category from the
  // hamburger menu). The useState initializers above only run once at
  // mount, and Next.js reuses this same component instance across
  // same-route navigations, so without this the grid keeps showing
  // whichever category/sale/sort was active the first time this page
  // mounted. Adjusting state during render (React's documented pattern for
  // this) instead of in a useEffect avoids both an extra visible frame and
  // this repo's react-hooks/set-state-in-effect rule.
  const paramsKey = searchParams.toString();
  const [syncedParamsKey, setSyncedParamsKey] = useState(paramsKey);
  if (paramsKey !== syncedParamsKey) {
    setSyncedParamsKey(paramsKey);
    const fresh = filtersFromParams(searchParams);
    setSizes(fresh.sizes);
    setCategories(fresh.categories);
    setColors(fresh.colors);
    setMaterials(fresh.materials);
    setPriceMin(fresh.priceMin);
    setPriceMax(fresh.priceMax);
    setMinRating(fresh.minRating);
    setOnSale(fresh.onSale);
    setInStock(fresh.inStock);
    setOnlyNew(fresh.onlyNew);
    setPopular(fresh.popular);
    setSort(searchParams.get("sort") ?? "new");
    setAppliedFilters(fresh);
  }

  const draftFilters: FilterValues = {
    sizes, categories, colors, materials,
    priceMin, priceMax, minRating, onSale, inStock, onlyNew, popular,
  };

  // Live count for the sticky apply button — the full draft combination,
  // not scoped to any single facet (unlike FilterSidebar's own countFor).
  const matchingCount = products.filter((p) => matchesFilters(p, draftFilters, getTotalStock)).length;

  function applyFilters() {
    setAppliedFilters(draftFilters);
    setFilterPageOpen(false);
  }

  function clearFilters() {
    setSizes(EMPTY_FILTERS.sizes);
    setCategories(EMPTY_FILTERS.categories);
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
    <div className="mx-auto max-w-[1280px] px-2 py-7 pb-10 sm:px-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl font-medium text-ink">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted">{t("resultsCount", { count: results.length })}</p>
      </div>

      {/* Sticky on mobile only (top offset matches the site header's real
          height) so filter/sort/grid controls stay reachable while
          scrolling the grid, without needing to scroll back up. Desktop
          keeps its original static, non-sticky placement. */}
      <div className="sticky top-[67px] z-30 -mx-2 mb-6 flex items-center gap-2 bg-surface/90 px-2 py-2.5 backdrop-blur-sm sm:static sm:z-auto sm:mx-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
        <button
          onClick={() => setFilterPageOpen(true)}
          className="flex flex-1 items-center justify-center gap-2 rounded-btn border border-line bg-surface px-3.5 py-2 text-sm font-semibold text-ink sm:flex-none"
        >
          <SlidersHorizontal size={15} /> {t("filtersButton")}
        </button>
        <button
          onClick={() => setSortPageOpen(true)}
          className="flex flex-1 items-center justify-center rounded-btn border border-line bg-surface px-3.5 py-2 text-sm font-semibold text-ink sm:flex-none"
        >
          {activeSortOption.label}
        </button>
        <button
          onClick={() => setGridDensity(gridDensity === "compact" ? "large" : "compact")}
          aria-label={gridDensity === "compact" ? t("gridLarge") : t("gridCompact")}
          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-btn border border-line bg-surface text-ink transition-colors hover:bg-accent-soft/40"
        >
          {gridDensity === "compact" ? <Rows2 size={16} /> : <Grid2x2 size={16} />}
        </button>
      </div>

      {filterPageOpen && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-surface">
          <div className="sticky top-0 flex items-center justify-between border-b border-line bg-surface px-5 py-4">
            <span className="font-bold text-ink">{t("filtersTitle")}</span>
            <button
              onClick={() => setFilterPageOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line"
              aria-label={t("close")}
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[640px] p-5.5">
              <FilterSidebar
                {...{
                  sizes, setSizes, categories, setCategories,
                  colors, setColors, materials, setMaterials,
                  priceMin, setPriceMin, priceMax, setPriceMax, minRating, setMinRating,
                  onSale, setOnSale, inStock, setInStock, onlyNew, setOnlyNew, popular, setPopular,
                  clearFilters, allCategories,
                  products, getTotalStock, draftFilters,
                }}
              />
            </div>
          </div>
          <div className="border-t border-line bg-surface p-4">
            <div className="mx-auto w-full max-w-[640px]">
              <button
                onClick={applyFilters}
                className="w-full rounded-btn bg-accent py-3.5 text-sm font-semibold text-accent-ink transition-colors hover:opacity-90"
              >
                {t("applyButton", { count: matchingCount })}
              </button>
            </div>
          </div>
        </div>
      )}

      {sortPageOpen && (
        <div className="fixed inset-0 z-[200] flex flex-col overflow-y-auto bg-surface">
          <div className="sticky top-0 flex items-center justify-between border-b border-line bg-surface px-5 py-4">
            <span className="font-bold text-ink">{t("sortTitle")}</span>
            <button
              onClick={() => setSortPageOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line"
              aria-label={t("close")}
            >
              <X size={16} />
            </button>
          </div>
          <div className="mx-auto w-full max-w-[480px] flex-1 p-5.5">
            <div className="flex flex-col gap-1">
              {SORT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => {
                    setSort(o.value);
                    setSortPageOpen(false);
                  }}
                  className={clsx(
                    "rounded-[10px] px-4 py-3.5 text-left text-[15px] font-medium transition-colors",
                    o.value === sort ? "bg-accent text-accent-ink" : "text-ink hover:bg-accent-soft/40"
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {results.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-semibold text-ink">{t("noResultsTitle")}</p>
          <p className="mt-1 text-sm text-muted">{t("noResultsDesc")}</p>
        </div>
      ) : (
        <div className="-mx-2 sm:mx-0">
          <div
            className={clsx(
              "grid gap-1 sm:gap-2",
              gridDensity === "large"
                ? "mx-auto max-w-[560px] grid-cols-1 px-2 sm:px-0"
                : "grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]"
            )}
          >
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface FilterProps {
  sizes: number[]; setSizes: (v: number[]) => void;
  categories: string[]; setCategories: (v: string[]) => void;
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
  const { formatPrice } = useCurrency();
  const colorName = useColorName();
  const materialName = useMaterialName();

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

      <FilterSection label={t("colorLabel")}>
        <div className="flex flex-wrap gap-1.5">
          {ALL_COLORS.map((hex) => (
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
          {ALL_MATERIALS.map((m) => (
            <Pill key={m} active={p.materials.includes(m)} onClick={() => p.setMaterials(toggle(p.materials, m))}>
              {materialName(m)} ({countFor("materials", (product) => product.material === m)})
            </Pill>
          ))}
        </div>
      </FilterSection>

      <FilterSection label={t("priceRangeLabel")}>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-muted">
            <span>{formatPrice(p.priceMin, { wholeNumber: true })}</span>
            <span>{formatPrice(p.priceMax, { wholeNumber: true })}</span>
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
