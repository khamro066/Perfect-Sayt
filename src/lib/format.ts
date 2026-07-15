export function formatSom(amount: number): string {
  return `${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so'm`;
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
