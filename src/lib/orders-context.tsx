"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Order, OrderStatus } from "./types";
import { ORDERS as SEED_ORDERS } from "./mock-data";

interface OrdersContextValue {
  orders: Order[];
  addOrder: (order: Order) => void;
  setStatus: (orderNumber: string, status: OrderStatus) => void;
  getByNumber: (orderNumber: string) => Order | undefined;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);
const STORAGE_KEY = "perfect-shoes-orders";

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Hydrating from localStorage after mount — unavailable during SSR.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setOrders(parsed);
        }
      } catch {
        // ignore corrupt orders data
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders, hydrated]);

  const addOrder = (order: Order) => setOrders((prev) => [order, ...prev]);

  const setStatus = (orderNumber: string, status: OrderStatus) =>
    setOrders((prev) => prev.map((o) => (o.orderNumber === orderNumber ? { ...o, status } : o)));

  const getByNumber = (orderNumber: string) => orders.find((o) => o.orderNumber === orderNumber);

  return (
    <OrdersContext.Provider value={{ orders, addOrder, setStatus, getByNumber }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}
