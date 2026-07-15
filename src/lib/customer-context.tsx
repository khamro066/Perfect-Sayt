"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface CustomerProfile {
  ism: string;
  familiya?: string;
  phone: string;
  viloyat?: string;
  manzil?: string;
}

interface CustomerContextValue {
  customer: CustomerProfile | null;
  setCustomer: (c: CustomerProfile) => void;
}

const CustomerContext = createContext<CustomerContextValue | null>(null);
const STORAGE_KEY = "perfect-shoes-customer";

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomerState] = useState<CustomerProfile | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setCustomerState(JSON.parse(raw));
      } catch {
        // ignore corrupt customer data
      }
    }
  }, []);

  const setCustomer = (c: CustomerProfile) => {
    setCustomerState(c);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  };

  return (
    <CustomerContext.Provider value={{ customer, setCustomer }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error("useCustomer must be used within CustomerProvider");
  return ctx;
}
