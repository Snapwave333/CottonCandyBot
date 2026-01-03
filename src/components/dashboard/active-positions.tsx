"use client";

import { useTradingStore } from "@/store/useTradingStore";
import { ELI5Tooltip } from "@/components/ui/ELI5Tooltip";
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

export function ActivePositions() {
  const { paperPositions, mode } = useTradingStore();

  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden">
      <div className="flex justify-between items-center px-1">
        <h3 className="font-bold text-white text-xs uppercase tracking-widest">Active Positions</h3>
        <span className="font-mono text-[10px] text-gray-400">{paperPositions.length} TOKENS</span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
        {paperPositions.length === 0 ? (
          <EmptyState 
            title="Market Scanning Active" 
            description="AI Agent watching for entry signals..." 
            className="bg-transparent shadow-none border-none"
          />
        ) : (
          paperPositions.map((pos) => (
            <div 
              key={pos.mint} 
              className="group relative flex items-center gap-3 p-3 border border-white/5 hover:border-[var(--cotton-blue)]/30 rounded-lg transition-all glass"
            >
              <div className="relative bg-black/40 rounded-md ring-1 ring-white/5 w-10 h-10 overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-[var(--cotton-blue)]/20 to-transparent"></div>
                 <div className="flex justify-center items-center w-full h-full font-bold text-[10px] text-white">
                    {pos.symbol.slice(0, 2)}
                 </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                   <h4 className="font-bold text-white text-xs truncate uppercase tracking-tight">{pos.symbol}</h4>
                   <span className={cn(
                     "font-mono font-bold text-[10px]",
                     pos.pnlPercent >= 0 ? "text-green-400" : "text-red-400"
                   )}>
                     {pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
                   </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                   <span className="font-mono text-[10px] text-gray-400">
                      {pos.amount.toLocaleString()} tokens
                   </span>
                   <span className="font-mono text-[10px] text-white">
                      ${pos.valueUsdc.toFixed(2)}
                   </span>
                </div>
              </div>

              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <ELI5Tooltip description="Average price you paid for these tokens." example="If you bought 100 for $1 and 100 for $2, your entry is $1.50.">
                    <div className="hover:bg-white/5 p-1 border border-white/5 rounded transition-colors cursor-help">
                       <TrendingUp size={10} className="text-gray-400" />
                    </div>
                 </ELI5Tooltip>
                 <a href={`https://solscan.io/token/${pos.mint}`} target="_blank" rel="noreferrer" className="hover:bg-white/5 p-1 border border-white/5 rounded transition-colors">
                    <ExternalLink size={10} className="text-gray-400" />
                 </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
