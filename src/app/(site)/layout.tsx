import { NextIntlClientProvider } from "next-intl";
import { CurrencyProvider } from "@/lib/currency-context";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider>
      {/* Needs locale (for the currency word/number formatting), so it must
          nest inside NextIntlClientProvider rather than sit in the root
          layout — the root layout has no intl context of its own. */}
      <CurrencyProvider>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </CurrencyProvider>
    </NextIntlClientProvider>
  );
}
