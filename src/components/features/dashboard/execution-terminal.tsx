"use client";

import { useState } from 'react';
import { ArrowDownUp, Settings, Wallet, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTradingStore } from '@/store/useTradingStore';
import { ELI5Tooltip } from '@/components/ui/ELI5Tooltip';

export function ExecutionTerminal() {
  const { mode, paperBalance, apiKey } = useTradingStore();
  const isPaperMode = mode === 'PAPER';
  const [amount, setAmount] = useState<string>('');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [quote, setQuote] = useState<any>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  
  // Constants for dev/verification (should be selectable in future)
  const INPUT_MINT = 'So11111111111111111111111111111111111111112'; // SOL
  const OUTPUT_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // USDC
  
  // Debounced Quote Fetch
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const handleAmountChange = (val: string) => {
      setAmount(val);
      if (timer) clearTimeout(timer);
      
      if (!val || parseFloat(val) <= 0) {
          setQuote(null);
          return;
      }

      setLoadingQuote(true);
      const newTimer = setTimeout(async () => {
          try {
              const headers = { 'Authorization': `Bearer ${apiKey}` };
              const res = await fetch(`http://localhost:3020/api/token/quote?inputMint=${INPUT_MINT}&outputMint=${OUTPUT_MINT}&amount=${parseFloat(val) * 1e9}`, { headers }); // SOL decimals
              if (res.ok) {
                  const data = await res.json();
                  setQuote(data);
              }
          } catch (e) {
              console.error("Quote error", e);
          } finally {
              setLoadingQuote(false);
          }
      }, 600);
      setTimer(newTimer);
  };

  return (
    <div className="flex flex-col shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-[var(--glass-border)] rounded-xl h-full overflow-hidden glass">
      {/* Terminal Header */}
      <div className="flex justify-between items-center bg-black/20 p-4 border-[var(--glass-border)] border-b">
        <h2 className="flex items-center gap-2 font-bold text-[var(--cotton-blue)]">
          <ELI5Tooltip description="Swap tokens using Jupiter Aggregator for best prices." example="Buy 0.1 SOL of PEPE">
            <div className="flex items-center gap-2">
              <ArrowDownUp className="shadow-[0_0_8px_rgba(169,222,249,0.5)] w-4 h-4" />
              TERMINAL
            </div>
          </ELI5Tooltip>
        </h2>
        <button className="group hover:bg-white/5 p-2 rounded-full transition-colors">
          <Settings className="w-4 h-4 text-gray-400 group-hover:rotate-45 transition-transform" />
        </button>
      </div>

      {/* Main Controls */}
      <div className="flex flex-col flex-1 gap-4 p-4">
        
        {/* Buy/Sell Toggle */}
        <div className="grid grid-cols-2 bg-black/40 p-1 rounded-lg">
          <button
            onClick={() => setSide('buy')}
            className={cn(
              "py-2 rounded-md font-bold text-sm transition-all",
              side === 'buy' 
                ? "bg-[var(--cotton-blue)] text-black shadow-[0_0_20px_rgba(169,222,249,0.5)] ring-1 ring-white/20" 
                : "text-gray-500 hover:text-white"
            )}
          >
            BUY
          </button>
          <button
            onClick={() => setSide('sell')}
            className={cn(
              "py-2 rounded-md font-bold text-sm transition-all",
              side === 'sell' 
                ? "bg-[var(--cotton-pink)] text-black shadow-[0_0_20px_rgba(255,153,200,0.5)] ring-1 ring-white/20" 
                : "text-gray-500 hover:text-white"
            )}
          >
            SELL
          </button>
        </div>

        {/* Amount Input */}
        <div className="space-y-1">
          <div className="flex justify-between px-1 text-gray-400 text-xs">
            <ELI5Tooltip description="Total SOL you want to spend on this trade." example="0.1 SOL (~$15)">
              <span className="cursor-help">Amount ({isPaperMode ? 'Paper SOL' : 'SOL'})</span>
            </ELI5Tooltip>
            {/* Balance check removed from here to reduce noise, kept on Wallet icon above if needed */}
             <span className="flex items-center gap-1 font-medium text-[var(--cotton-blue)]">
              <Wallet className="w-3 h-3" />
              {isPaperMode ? paperBalance.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
            </span>
          </div>
          <div className="group relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.0"
              className="bg-black/40 group-hover:bg-black/60 py-3 pr-12 pl-4 border border-[var(--glass-border)] focus:border-[var(--cotton-blue)] rounded-lg focus:outline-none focus:ring-[var(--cotton-blue)]/30 focus:ring-1 w-full font-mono text-white transition-all"
            />
            <span className="top-1/2 right-4 absolute font-bold text-gray-500 text-xs -translate-y-1/2">
              SOL
            </span>
          </div>
          {/* Quick Percentages */}
          <div className="flex gap-2 mt-2">
            {[0.1, 0.5, 1, 5].map((val) => (
              <button 
                key={val}
                onClick={() => handleAmountChange(val.toString())}
                className="flex-1 bg-black/30 hover:bg-white/10 py-1 border border-white/5 rounded text-gray-400 text-xs transition-colors"
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Quote Preview (Real) */}
        <div className="space-y-2 bg-black/30 mt-2 p-3 border border-gray-800 border-dashed rounded-lg min-h-[86px] transition-all">
          {loadingQuote ? (
               <div className="flex justify-center items-center h-full text-gray-500 text-xs animate-pulse">Fetching best price...</div>
          ) : quote ? (
              <>
                <div className="flex justify-between text-sm">
                    <ELI5Tooltip description="How much your trade will change the market price. Lower is better." example="0.05% is very safe">
                    <span className="text-gray-500 decoration-dotted decoration-gray-700 underline underline-offset-4 cursor-help">Price Impact</span>
                    </ELI5Tooltip>
                    <span className={cn("font-mono", Number(quote.priceImpactPct) > 1 ? "text-red-400" : "text-green-400")}>
                        {quote.priceImpactPct ? `~${(Number(quote.priceImpactPct) * 100).toFixed(2)}%` : '<0.01%'}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Route</span>
                    <span className="text-gray-300">Jupiter</span>
                </div>
                <div className="flex justify-between pt-2 border-gray-800 border-t text-sm">
                    <span className="text-gray-500">Est. Receive</span>
                    <span className="font-mono font-bold text-[var(--cotton-blue)]">
                        {(Number(quote.outAmount) / 1e6).toFixed(4)} USDC
                    </span>
                </div>
              </>
          ) : (
                <div className="flex justify-center items-center h-full text-gray-600 text-xs">Enter amount to see quote</div>
          )}
        </div>

        {/* Execute Button */}
        <button className={cn(
          "group relative shadow-lg mt-auto py-4 rounded-xl w-full overflow-hidden font-bold text-lg active:scale-95 transition-all",
          side === 'buy'
            ? "bg-[var(--cotton-blue)] text-black shadow-[0_0_20px_rgba(169,222,249,0.4)] hover:shadow-[0_0_35px_rgba(169,222,249,0.7)]"
            : "bg-[var(--cotton-pink)] text-black shadow-[0_0_20px_rgba(255,153,200,0.4)] hover:shadow-[0_0_35px_rgba(255,153,200,0.7)]"
        )}>
          <span className="z-10 relative">
            {side === 'buy' ? 'CONFIRM PURCHASE' : 'CONFIRM SALE'}
          </span>
          <div className="top-0 left-0 absolute bg-white/20 opacity-0 group-hover:opacity-100 w-full h-full transition-opacity pointer-events-none" />
        </button>

      </div>
    </div>
  );
}
