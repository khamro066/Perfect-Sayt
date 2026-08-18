// somLabel is the translated currency word (from the "currency.som" message
// key) -- kept as a plain parameter here rather than importing next-intl
// directly, since this file has no component/hook context of its own and
// is also called from admin pages that are intentionally Uzbek-only.
export function formatSom(amount: number, locale: string = "uz", somLabel: string = "so'm"): string {
  const separator = locale === "en" ? "," : " ";
  const numberFormatted = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return `${numberFormatted} ${somLabel}`;
}

export function formatDateUz(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

export function formatDateRangeUz(daysFrom: number, daysTo: number): string {
  const from = new Date();
  from.setDate(from.getDate() + daysFrom);
  const to = new Date();
  to.setDate(to.getDate() + daysTo);
  return `${formatDateUz(from)} – ${formatDateUz(to)}`;
}
