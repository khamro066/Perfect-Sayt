"use server";

import { cookies } from "next/headers";
import { CURRENCIES, CURRENCY_COOKIE, type Currency } from "./currency";

export async function setCurrency(currency: Currency) {
  if (!CURRENCIES.includes(currency)) return;
  const cookieStore = await cookies();
  cookieStore.set(CURRENCY_COOKIE, currency, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
