export const CURRENCIES = ["UZS", "USD", "RUB", "KGS", "TJS", "KZT"] as const;
export type Currency = (typeof CURRENCIES)[number];
export const DEFAULT_CURRENCY: Currency = "UZS";
export const CURRENCY_COOKIE = "PS_CURRENCY";

export function isCurrency(value: string | undefined): value is Currency {
  return !!value && (CURRENCIES as readonly string[]).includes(value);
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  UZS: "so'm",
  USD: "$",
  RUB: "₽",
  KGS: "с",
  TJS: "SM",
  KZT: "₸",
};
