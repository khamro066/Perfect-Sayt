"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface AdminNotification {
  id: string;
  time: string;
  read: boolean;
  customerName: string;
  productSummary: string;
  amount: number;
  kind: "order" | "preorder";
}

interface NotificationsContextValue {
  notifications: AdminNotification[];
  unreadCount: number;
  push: (n: Omit<AdminNotification, "id" | "time" | "read">) => void;
  markRead: (id: string) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);
const STORAGE_KEY = "perfect-shoes-notifications";

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setNotifications(JSON.parse(raw));
      } catch {
        // ignore corrupt notifications data
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications, hydrated]);

  const push: NotificationsContextValue["push"] = (n) => {
    const time = new Date().toTimeString().slice(0, 5);
    setNotifications((prev) => [{ ...n, id: `n-${Date.now()}`, time, read: false }, ...prev].slice(0, 30));
  };

  const markRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, push, markRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
