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
  "#b6b8ba": "Kumush",
  "#bd9a3f": "Oltin",
  "#16233f": "Siyohrang",
  "#6b1f2e": "Bordo",
  "#d9a0ab": "Pushti",
  "#e0b429": "Sariq",
  "#c2701c": "To'q sariq",
  "#c9c7c2": "Och kulrang",
  "#4a4a48": "To'q kulrang",
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
  "Kumush": { ru: "Серебристый", en: "Silver" },
  "Oltin": { ru: "Золотой", en: "Gold" },
  "Siyohrang": { ru: "Тёмно-синий", en: "Navy" },
  "Bordo": { ru: "Бордовый", en: "Burgundy" },
  "Pushti": { ru: "Розовый", en: "Pink" },
  "Sariq": { ru: "Жёлтый", en: "Yellow" },
  "To'q sariq": { ru: "Тёмно-оранжевый", en: "Dark orange" },
  "Och kulrang": { ru: "Светло-серый", en: "Light gray" },
  "To'q kulrang": { ru: "Тёмно-серый", en: "Dark gray" },
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
