"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { NotificationsProvider } from "@/lib/notifications-context";
import { Sidebar } from "@/components/admin/Sidebar";
import { NotificationBell } from "@/components/admin/NotificationBell";

const TITLES: Record<string, string> = {
  "/admin": "Boshqaruv paneli",
  "/admin/mahsulotlar": "Mahsulotlar",
  "/admin/kategoriyalar": "Kategoriyalar",
  "/admin/ombor": "Ombor nazorati",
  "/admin/buyurtmalar": "Buyurtmalar",
  "/admin/tolov-tekshirish": "To'lov tekshirish",
  "/admin/sharhlar": "Sharhlar",
  "/admin/oldindan-buyurtmalar": "Oldindan buyurtmalar",
  "/admin/oldindan-buyurtma-mahsulotlari": "Oldindan buyurtma mahsulotlari",
  "/admin/mijozlar": "Mijozlar",
  "/admin/hisobotlar": "Hisobotlar",
};

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Authentication itself is enforced server-side by middleware.ts before
  // this layout ever renders — no client-side redirect check needed here.
  return (
    <SessionProvider>
      <NotificationsProvider>
        <div className="flex min-h-screen items-stretch">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="min-w-0 flex-1 bg-bg p-4.5 pb-12 sm:p-6.5">
            <div className="mb-6.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-line bg-surface text-ink lg:hidden"
                  aria-label="Menyu"
                >
                  <Menu size={17} />
                </button>
                <h1 className="font-heading text-[24px] font-medium text-ink sm:text-[28px]">
                  {TITLES[pathname] ?? "Boshqaruv paneli"}
                </h1>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={toggleTheme}
                  className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-line bg-surface text-ink"
                  aria-label="Mavzuni almashtirish"
                >
                  {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
                </button>
                <NotificationBell />
              </div>
            </div>
            {children}
          </main>
        </div>
      </NotificationsProvider>
    </SessionProvider>
  );
}
