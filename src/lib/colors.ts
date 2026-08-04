import { useLocale } from "next-intl";

export const COLOR_NAMES: Record<string, string> = {
  "#1b1a16": "Qora",
  "#f4f1ea": "Oq",
  "#8a8880": "Kulrang",
  "#6b4a2f": "Jigarrang",
  "#2c4a7a": "Ko'k",
  "#0a5c3a": "Yashil",
  "#a83232": "Qizil",
  "#d8c7a8": "Bej",
};

export function colorName(hex: string): string {
  return COLOR_NAMES[hex] ?? hex;
}

export const ALL_COLORS = Object.keys(COLOR_NAMES);

// Keyed by the Uzbek name (the value actually stored/derived from the DB),
// not the hex, so any future admin-added hex without a COLOR_NAMES entry
// still falls back gracefully instead of needing a second lookup.
const COLOR_TRANSLATIONS: Record<string, { ru: string; en: string }> = {
  "Qora": { ru: "Черный", en: "Black" },
  "Oq": { ru: "Белый", en: "White" },
  "Kulrang": { ru: "Серый", en: "Gray" },
  "Jigarrang": { ru: "Коричневый", en: "Brown" },
  "Ko'k": { ru: "Синий", en: "Blue" },
  "Yashil": { ru: "Зелёный", en: "Green" },
  "Qizil": { ru: "Красный", en: "Red" },
  "Bej": { ru: "Бежевый", en: "Beige" },
};

// Falls back to the raw Uzbek name whenever a hex or its name has no
// translation entry yet (e.g. a color the admin just added) — never
// crashes or shows "undefined".
export function localizedColorName(hex: string, locale: string): string {
  const uzName = colorName(hex);
  if (locale === "uz") return uzName;
  return COLOR_TRANSLATIONS[uzName]?.[locale as "ru" | "en"] ?? uzName;
}

export function useColorName() {
  const locale = useLocale();
  return (hex: string) => localizedColorName(hex, locale);
}
