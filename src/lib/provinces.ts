import { useLocale } from "next-intl";

// Fixed, enumerable set of PROVINCES (src/lib/constants.ts) -- not free
// text, so a static dictionary is safe here. Same pattern as colors.ts/
// materials.ts: the stored value (address field, admin data) always stays
// the Uzbek name; only the displayed label changes with locale.
const PROVINCE_TRANSLATIONS: Record<string, { ru: string; en: string }> = {
  "Toshkent shahri": { ru: "г. Ташкент", en: "Tashkent City" },
  "Toshkent viloyati": { ru: "Ташкентская область", en: "Tashkent Region" },
  "Samarqand": { ru: "Самарканд", en: "Samarkand" },
  "Buxoro": { ru: "Бухара", en: "Bukhara" },
  "Andijon": { ru: "Андижан", en: "Andijan" },
  "Farg'ona": { ru: "Фергана", en: "Fergana" },
  "Namangan": { ru: "Наманган", en: "Namangan" },
  "Qashqadaryo": { ru: "Кашкадарья", en: "Kashkadarya" },
  "Surxondaryo": { ru: "Сурхандарья", en: "Surkhandarya" },
  "Xorazm": { ru: "Хорезм", en: "Khorezm" },
  "Navoiy": { ru: "Навои", en: "Navoiy" },
  "Jizzax": { ru: "Джизак", en: "Jizzakh" },
  "Sirdaryo": { ru: "Сырдарья", en: "Sirdaryo" },
  "Qoraqalpog'iston": { ru: "Каракалпакстан", en: "Karakalpakstan" },
};

// Falls back to the raw Uzbek value whenever a province has no translation
// entry yet -- never crashes or shows "undefined".
export function localizedProvinceName(province: string, locale: string): string {
  if (locale === "uz") return province;
  return PROVINCE_TRANSLATIONS[province]?.[locale as "ru" | "en"] ?? province;
}

export function useProvinceName() {
  const locale = useLocale();
  return (province: string) => localizedProvinceName(province, locale);
}
