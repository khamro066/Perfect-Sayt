import { useLocale } from "next-intl";

// Fixed, enumerable set of Product.material values (verified against the
// live DB) — not free text, so a static dictionary is safe here.
const MATERIAL_TRANSLATIONS: Record<string, { ru: string; en: string }> = {
  "Charm": { ru: "Кожа", en: "Leather" },
  "Zamsh": { ru: "Замша", en: "Suede" },
  "Mesh": { ru: "Сетка", en: "Mesh" },
  "Tekstil": { ru: "Текстиль", en: "Textile" },
  "Rezina": { ru: "Резина", en: "Rubber" },
};

// Falls back to the raw Uzbek value whenever a material has no translation
// entry yet (e.g. one the admin just added) — never crashes or shows
// "undefined".
export function localizedMaterialName(material: string, locale: string): string {
  if (locale === "uz") return material;
  return MATERIAL_TRANSLATIONS[material]?.[locale as "ru" | "en"] ?? material;
}

export function useMaterialName() {
  const locale = useLocale();
  return (material: string) => localizedMaterialName(material, locale);
}
