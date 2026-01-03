"use client";

import { ELI5Tooltip } from "@/components/ui/ELI5Tooltip";
import { useTradingStore } from "@/store/useTradingStore";
import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export function Portfolio() {
  const { paperBalance, mode } = useTradingStore();

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-white text-sm uppercase tracking-widest">Portfolio</h3>
        <span className={cn(
          "px-2 py-0.5 border rounded-full font-bold text-[10px]",
          mode === 'PAPER' ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500" : "bg-green-500/10 border-green-500/30 text-green-500"
        )}>
          {mode} MODE
        </span>
      </div>

      <div className="gap-3 grid grid-cols-2">
        <ELI5Tooltip 
          description="Total cash you have available to trade. In Paper mode, this is simulated money."
          example="If you have $1000, you can buy $1000 worth of tokens."
        >
          <div className="group relative flex flex-col p-4 border border-white/5 hover:border-[var(--cotton-blue)]/40 rounded-xl transition-all cursor-help glass">
            <div className="top-2 right-2 absolute opacity-20 group-hover:opacity-40 transition-opacity">
              <DollarSign size={16} className="text-[var(--cotton-blue)]" />
            </div>
            <span className="mb-1 text-[10px] text-gray-500 uppercase tracking-tighter">Available Balance</span>
            <span className="shadow-[0_0_15px_rgba(169,222,249,0.2)] font-mono font-bold text-[var(--cotton-blue)] text-xl">
              ${paperBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </ELI5Tooltip>

        <ELI5Tooltip 
          description="The total value of all your tokens if you sold them right now."
          example="Portfolio Value = Cash + Value of all tokens owned."
        >
          <div className="group relative flex flex-col p-4 border border-white/5 hover:border-[var(--cotton-pink)]/40 rounded-xl transition-all cursor-help glass">
             <div className="top-2 right-2 absolute opacity-20 group-hover:opacity-40 transition-opacity">
              <Wallet size={16} className="text-[var(--cotton-pink)]" />
            </div>
            <span className="mb-1 text-[10px] text-gray-500 uppercase tracking-tighter">Total Value</span>
            <span className="shadow-[0_0_15px_rgba(255,153,200,0.2)] font-mono font-bold text-white text-xl">
              ${paperBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </ELI5Tooltip>
      </div>

      <div className="flex-1 mt-2">
         <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-[10px] text-gray-500 uppercase">24h Performance</span>
            <div className="flex items-center gap-1 font-mono text-green-400 text-xs">
               <TrendingUp size={12} />
               +0.00%
            </div>
         </div>
         <div className="bg-white/5 rounded-lg h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-[var(--cotton-blue)] to-[var(--cotton-pink)] shadow-[0_0_10px_rgba(169,222,249,0.5)] w-[60%] h-full"></div>
         </div>
      </div>
    </div>
  );
}
