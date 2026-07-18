"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
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
  markRead: (id: string) => void;
  soundOn: boolean;
  toggleSound: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);
const SOUND_KEY = "perfect-shoes-notif-sound";
const POLL_INTERVAL_MS = 7000;

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [soundOn, setSoundOn] = useState(true);
  const knownIds = useRef<Set<string> | null>(null);
  const soundOnRef = useRef(soundOn);

  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);

  useEffect(() => {
    // Hydrating from localStorage after mount — unavailable during SSR.
    const stored = localStorage.getItem(SOUND_KEY);
    if (stored !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSoundOn(stored === "1");
    }
  }, []);

  useEffect(() => {
    // AudioContext starts "suspended" until a real user gesture — unlock it
    // on the first interaction anywhere in the admin panel.
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

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/admin/notifications");
        if (!res.ok) return;
        const data: AdminNotification[] = await res.json();
        if (cancelled) return;

        if (knownIds.current) {
          const newOnes = data.filter((n) => !knownIds.current!.has(n.id) && !n.read);
          if (newOnes.length > 0 && soundOnRef.current) playNotificationDing();
        }
        knownIds.current = new Set(data.map((n) => n.id));
        setNotifications(data);
      } catch {
        // network hiccup — next poll will retry
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const markRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await fetch(`/api/admin/notifications/${id}/read`, { method: "PATCH" });
  };

  const toggleSound = () => {
    setSoundOn((prev) => {
      const next = !prev;
      localStorage.setItem(SOUND_KEY, next ? "1" : "0");
      return next;
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markRead, soundOn, toggleSound }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
