"use client";

import { NetworkMap } from "@/components/network-map/network-map";
import { Network } from "lucide-react";

export function WalletLab() {
  return (
    <div className="flex flex-col gap-4 w-full h-[calc(100vh-140px)]" data-testid="wallet-lab">
      
      {/* Header - Tactical Map Title */}
      <div className="flex justify-between items-center mb-2">
         <h3 className="flex items-center gap-2 font-bold text-white text-xl tracking-tight">
             <Network size={20} className="text-[var(--cotton-blue)] animate-pulse" />
             Tactical Network Map
         </h3>
         <div className="flex items-center gap-2 bg-black/40 px-3 py-1 border border-white/5 rounded-full text-[10px] text-gray-500 uppercase tracking-widest">
            <span className="bg-green-500 rounded-full w-1.5 h-1.5 animate-pulse" />
            Live Topology
         </div>
      </div>

      {/* The Map */}
      <div className="relative flex-1">
         <NetworkMap />
      </div>

    </div>
  );
}
