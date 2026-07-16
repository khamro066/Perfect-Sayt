"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { unlockNotificationAudio, playNotificationDing } from "./notification-sound";

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
  soundOn: boolean;
  toggleSound: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);
const STORAGE_KEY = "perfect-shoes-notifications";
const SOUND_KEY = "perfect-shoes-notif-sound";

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [soundOn, setSoundOn] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Hydrating from localStorage after mount — unavailable during SSR.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setNotifications(parsed);
        }
      } catch {
        // ignore corrupt notifications data
      }
    }
    const storedSound = localStorage.getItem(SOUND_KEY);
    if (storedSound !== null) {
      setSoundOn(storedSound === "1");
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications, hydrated]);

  useEffect(() => {
    // AudioContext starts "suspended" until a real user gesture — unlock it
    // on the first interaction anywhere in the app, well before any
    // notification is likely to arrive, rather than relying on the
    // notification event itself (which isn't a user gesture).
    const unlock = () => {
      unlockNotificationAudio();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const push: NotificationsContextValue["push"] = (n) => {
    const time = new Date().toTimeString().slice(0, 5);
    setNotifications((prev) => [{ ...n, id: `n-${Date.now()}`, time, read: false }, ...prev].slice(0, 30));
    if (soundOn) playNotificationDing();
  };

  const markRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const toggleSound = () => {
    setSoundOn((prev) => {
      const next = !prev;
      localStorage.setItem(SOUND_KEY, next ? "1" : "0");
      return next;
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, push, markRead, soundOn, toggleSound }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
