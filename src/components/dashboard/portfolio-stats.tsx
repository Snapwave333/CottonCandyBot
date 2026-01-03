import { Target } from "lucide-react";
import { useTradingStore } from "@/store/useTradingStore";

export function PortfolioStats() {
  const { realizedPnL, unrealizedPnL } = useTradingStore();
  const isPositiveRealized = realizedPnL >= 0;
  const isPositiveUnrealized = unrealizedPnL >= 0;

  return (
    <div className="gap-2 grid grid-cols-1 bg-black/20 mt-2 p-2 border border-white/5 rounded-lg">
        <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-[9px] text-gray-500 uppercase tracking-wider">Realized PnL</span>
            <span className={`font-mono font-bold ${isPositiveRealized ? 'text-green-400' : 'text-red-400'}`}>
                {isPositiveRealized ? '+' : ''}${realizedPnL.toFixed(2)}
            </span>
        </div>
        <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-[9px] text-gray-500 uppercase tracking-wider">Unrealized PnL</span>
            <span className={`font-mono font-bold ${isPositiveUnrealized ? 'text-green-400' : 'text-red-400'}`}>
                {isPositiveUnrealized ? '+' : ''}${unrealizedPnL.toFixed(2)}
            </span>
        </div>
         <div className="bg-white/5 my-0.5 w-full h-px" />
        <div className="flex justify-between items-center text-xs">
            <span className="flex items-center gap-1 font-bold text-[9px] text-white uppercase tracking-wider">
                <Target size={10} className="text-[var(--cotton-blue)]" /> Win Rate
            </span>
            <span className="font-mono font-bold text-white">
                {useTradingStore.getState().winRate.toFixed(1)}% <span className="opacity-50 text-[8px] text-gray-400">({useTradingStore.getState().totalTrades} trades)</span>
            </span>
        </div>
    </div>
  );
}
