"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface AdminAuthContextValue {
  authed: boolean;
  ready: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);
const STORAGE_KEY = "perfect-shoes-admin-authed";
// Temporary demo password matching the design prototype. Replaced with real
// NextAuth credential auth in Step 4 — see .env.example ADMIN_PASSWORD.
const DEMO_PASSWORD = "admin2026";

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Hydrating from sessionStorage after mount — unavailable during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthed(sessionStorage.getItem(STORAGE_KEY) === "1");
    setReady(true);
  }, []);

  const login = (password: string) => {
    if (password === DEMO_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setAuthed(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setAuthed(false);
  };

  return (
    <AdminAuthContext.Provider value={{ authed, ready, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
