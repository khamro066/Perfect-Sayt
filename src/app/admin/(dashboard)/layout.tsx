"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Moon, Sun } from "lucide-react";
import { useAdminAuth } from "@/lib/admin-auth-context";
import { useTheme } from "@/lib/theme-context";
import { Sidebar } from "@/components/admin/Sidebar";
import { NotificationBell } from "@/components/admin/NotificationBell";

const TITLES: Record<string, string> = {
  "/admin": "Boshqaruv paneli",
  "/admin/mahsulotlar": "Mahsulotlar",
  "/admin/kategoriyalar": "Kategoriyalar",
  "/admin/ombor": "Ombor nazorati",
  "/admin/buyurtmalar": "Buyurtmalar",
  "/admin/sharhlar": "Sharhlar",
  "/admin/oldindan-buyurtmalar": "Oldindan buyurtmalar",
  "/admin/oldindan-buyurtma-mahsulotlari": "Oldindan buyurtma mahsulotlari",
  "/admin/mijozlar": "Mijozlar",
  "/admin/hisobotlar": "Hisobotlar",
};

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { authed, ready } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (ready && !authed) router.replace("/admin/login");
  }, [ready, authed, router]);

  if (!ready || !authed) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted">Yuklanmoqda…</div>;
  }

  return (
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
  );
}
