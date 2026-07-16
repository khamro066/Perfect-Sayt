import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import { ToastProvider } from "@/lib/toast-context";
import { CartProvider } from "@/lib/cart-context";
import { FavoritesProvider } from "@/lib/favorites-context";
import { OrdersProvider } from "@/lib/orders-context";
import { CustomerProvider } from "@/lib/customer-context";
import { ReviewsProvider } from "@/lib/reviews-context";
import { AdminAuthProvider } from "@/lib/admin-auth-context";
import { NotificationsProvider } from "@/lib/notifications-context";
import { AdminDataProvider } from "@/lib/admin-data-context";

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const sourceSans3 = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Perfect Shoes — Oyoq kiyim onlayn do'koni",
  description: "Sifatli oyoq kiyimlar onlayn do'koni",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uz"
      className={`${cormorantGaramond.variable} ${sourceSans3.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink font-body">
        <ThemeProvider>
          <ToastProvider>
            <AdminAuthProvider>
              <NotificationsProvider>
                <AdminDataProvider>
                  <CustomerProvider>
                    <OrdersProvider>
                      <ReviewsProvider>
                        <FavoritesProvider>
                          <CartProvider>{children}</CartProvider>
                        </FavoritesProvider>
                      </ReviewsProvider>
                    </OrdersProvider>
                  </CustomerProvider>
                </AdminDataProvider>
              </NotificationsProvider>
            </AdminAuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
