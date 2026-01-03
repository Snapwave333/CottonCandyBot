import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import "@/styles/wallet-adapter.css";
import { SolanaProvider } from "@/components/solana-provider";
import { WalletProvider } from "@/context/WalletContext";
import { ShaderBackground } from "@/components/ui/shader-background";
import { ThemeHydrator } from "@/components/theme-hydrator";
import { NewsTicker } from "@/components/dashboard/news-ticker";
import { SecurityProvider } from "@/context/SecurityContext";
import { QuickTradeDialog } from "@/components/dashboard/quick-trade-dialog";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Cotton Candy Bot",
  description: "Solana DEX Trading Bot",
};

import { cn } from "@/lib/utils";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          inter.variable,
          dmSans.variable,
          "font-sans antialiased"
        )}
      >
        <SolanaProvider>
          <SecurityProvider>
            <WalletProvider>
              <ThemeHydrator />
              {children}
              <ShaderBackground />
              <NewsTicker />
            </WalletProvider>
          </SecurityProvider>
        </SolanaProvider>
      </body>
    </html>
  );
}
