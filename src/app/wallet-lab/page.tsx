"use client";

import { Header } from "@/components/dashboard/header";
import { WalletLab } from "@/components/dashboard/wallet-lab";

export default function WalletLabPage() {
  return (
    <div className="px-4 md:px-6 pt-20 pb-10 min-h-screen">
      <Header />
      
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
            <h1 className="mb-2 font-bold text-white text-3xl">Wallet Lab</h1>
            <p className="text-gray-400">Manage your cluster of burner wallets and orchestrate mass actions.</p>
        </div>
        
        <WalletLab />
      </div>
    </div>
  );
}
