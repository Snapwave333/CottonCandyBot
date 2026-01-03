"use client";

import { Header } from "@/components/dashboard/header";
import { StrategyConfig } from "@/components/dashboard/strategy-config";

export default function StrategiesPage() {
  return (
    <div className="px-4 md:px-6 pt-20 pb-10 min-h-screen">
      <Header />
      
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
            <h1 className="mb-2 font-bold text-white text-3xl">Strategy Engine</h1>
            <p className="text-gray-400">Configure automated trading bots and monitor their performance.</p>
        </div>
        
        <StrategyConfig />
      </div>
    </div>
  );
}
