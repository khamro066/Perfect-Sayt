export const DELIVERY_METHODS = [
  { id: "kuryer", label: "Kuryer orqali (Toshkent bo'ylab)", eta: "1-2 kun", fee: 25000 },
  { id: "express", label: "BTS Express (viloyatlarga)", eta: "2-4 kun", fee: 40000 },
  { id: "pickup", label: "Do'kondan olib ketish", eta: "Bugun tayyor", fee: 0 },
] as const;

export function deliveryFeeFor(methodId: string): number {
  return DELIVERY_METHODS.find((m) => m.id === methodId)?.fee ?? 0;
}

export const PAYMENT_LABELS: Record<string, string> = {
  cash: "Naqd pul",
  card: "Karta orqali",
};
