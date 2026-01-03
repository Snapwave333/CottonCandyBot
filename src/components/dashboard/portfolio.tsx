"use client";

import { ELI5Tooltip } from "@/components/ui/ELI5Tooltip";
import { PortfolioStats } from "./portfolio-stats";
import { useTradingStore } from "@/store/useTradingStore";
import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export function Portfolio() {
  const { paperBalance, mode } = useTradingStore();

  return (
    <div className="flex flex-col gap-4 h-full" data-testid="portfolio-table">
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
            <span className="mb-1 text-[10px] text-gray-400 uppercase tracking-tighter">Available Balance</span>
            <span className="shadow-[0_0_15px_rgba(189,228,249,0.2)] font-mono font-bold text-[var(--cotton-blue)] text-xl">
              ${(paperBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
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
            <span className="mb-1 text-[10px] text-gray-400 uppercase tracking-tighter">Total Value</span>
            <span className="shadow-[0_0_15px_rgba(255,153,200,0.2)] font-mono font-bold text-white text-xl">
              ${(paperBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </span>
          </div>
        </ELI5Tooltip>
      </div>

      <div className="flex-1 mt-2">
         <div className="flex justify-between items-center mb-1 px-1">
            <span className="text-[10px] text-gray-400 uppercase">24h Performance</span>
            <div className={cn(
               "flex items-center gap-1 font-mono text-xs",
                (paperBalance || 0) >= 100 ? "text-green-400" : "text-red-400"
            )}>
               {(paperBalance || 0) >= 100 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
               {/* Simplified calculation: ((Current - Start) / Start) * 100. Assuming start is 100 for paper mode */}
               {(() => {
                   const start = 100; // Hardcoded start for paper mode visual cleanliness
                   const current = paperBalance || 0;
                   const pct = ((current - start) / start) * 100;
                   return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
               })()}
            </div>
         </div>
         {/* Main Progress Bar - Visualizing PnL range logic could be complex, for now let's just make it represent win rate or pure decor based on positive/negative */}
         <div className="bg-white/5 mb-2 rounded-lg h-2 overflow-hidden">
             {/* Dynamic width based on something real, or just a indeterminate loader if active? 
                 Let's stick to a full width bar that changes color based on daily PnL 
             */}
            <div className={cn(
                "h-full transition-all duration-500",
                (paperBalance || 0) >= 100 
                  ? "bg-gradient-to-r from-[var(--cotton-blue)] to-green-500 w-full" 
                  : "bg-gradient-to-r from-red-500 to-orange-500 w-full"
            )}></div>
         </div>

         {/* Detailed Stats */}
         <PortfolioStats />
      </div>
    </div>
  );
}
