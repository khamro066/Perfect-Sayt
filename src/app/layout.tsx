import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import { ToastProvider } from "@/lib/toast-context";
import { CartProvider } from "@/lib/cart-context";
import { FavoritesProvider } from "@/lib/favorites-context";
import { CustomerProvider } from "@/lib/customer-context";
import { ProductsDataProvider } from "@/lib/products-data";

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
            <CustomerProvider>
              <ProductsDataProvider>
                <FavoritesProvider>
                  <CartProvider>{children}</CartProvider>
                </FavoritesProvider>
              </ProductsDataProvider>
            </CustomerProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
