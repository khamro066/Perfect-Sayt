"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { formatSom } from "./format";
import { setCurrency as persistCurrency } from "./currency-actions";
import {
  CURRENCY_COOKIE,
  CURRENCY_SYMBOLS,
  DEFAULT_CURRENCY,
  isCurrency,
  type Currency,
} from "./currency";

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  // Converts a UZS amount to the selected display currency and formats it,
  // prefixed with "~" for anything but UZS since this is an estimate —
  // actual charges always happen in UZS regardless of display currency.
  // `wholeNumber` forces 0 decimals — for paired min/max range labels,
  // where showing one side with cents and the other without looks broken.
  formatPrice: (amountInUzs: number, opts?: { wholeNumber?: boolean }) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function readCookie(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);
  const [rates, setRates] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    // Reading the cookie (external system) after mount, not deriving from
    // props/state — a one-time sync, not a render loop.
    const stored = readCookie(CURRENCY_COOKIE);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isCurrency(stored)) setCurrencyState(stored);

    fetch("/api/exchange-rates")
      .then((res) => res.json())
      .then((data) => setRates(data.rates ?? null))
      .catch(() => {});
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    persistCurrency(c);
  }, []);

  const formatPrice = useCallback(
    (amountInUzs: number, opts?: { wholeNumber?: boolean }) => {
      if (currency === "UZS" || !rates?.[currency]) return formatSom(amountInUzs);
      const converted = amountInUzs * rates[currency];
      const decimals = opts?.wholeNumber ? 0 : converted < 100 ? 2 : 0;
      const formatted = converted.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      return `~${formatted} ${CURRENCY_SYMBOLS[currency]}`;
    },
    [currency, rates]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
