"use client";

import { useState } from "react";
import { Search, ShieldAlert, ShieldCheck, AlertTriangle, Copy, ExternalLink, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { ELI5Tooltip } from "@/components/ui/ELI5Tooltip";
import { TokenImage } from "@/components/ui/token-image";

interface TokenData {
  address: string;
  name: string;
  symbol: string;
  image: string;
  price: number;
  liquidity: number;
  riskScore: 'SAFE' | 'WARN' | 'DANGER' | 'UNKNOWN';
  riskDetails?: string;
  source: 'DEXSCREENER' | 'UNKNOWN';
}

export function TokenSniffer() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<TokenData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!input) return;
    setLoading(true);
    setError(null);
    setToken(null);
    
    try {
      // 1. Fetch Basic Token Data from DexScreener
      const dexRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${input}`);
      const dexData = await dexRes.json();

      if (!dexData.pairs || dexData.pairs.length === 0) {
        throw new Error("Token not found or no liquidity pools detected.");
      }

      const pair = dexData.pairs[0];
      const address = pair.baseToken.address;

      // 2. Fetch Risk Data from RugCheck
      let riskScore: TokenData['riskScore'] = 'UNKNOWN';
      let riskDetails = "Risk check unavailable";
      
      try {
        const rugRes = await fetch(`https://api.rugcheck.xyz/v1/tokens/${address}/report/summary`);
        if (rugRes.ok) {
            const rugData = await rugRes.json();
            // Map RugCheck score to our simplified types
            // RugCheck score is usually 0-10000 or similar, but summary might differ.
            // Using logic: < 1000 good, > 5000 danger
            const score = rugData.score || 0;
            if (score < 500) {
                riskScore = 'SAFE';
            } else if (score < 2500) {
                riskScore = 'WARN';
            } else {
                riskScore = 'DANGER';
            }
            
            riskDetails = `Score: ${score}. ${rugData.risks?.length || 0} risks detected.`;
        }
      } catch (e) {
        console.warn("RugCheck failed:", e);
      }

      setToken({
        address: pair.baseToken.address,
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol,
        image: pair.info?.imageUrl || "https://api.dicebear.com/7.x/shapes/svg?seed=" + pair.baseToken.address, 
        price: Number.parseFloat(pair.priceUsd),
        liquidity: pair.liquidity?.usd || 0,
        riskScore: riskScore,
        riskDetails: riskDetails,
        source: 'DEXSCREENER',
      });

    } catch (err: any) {
      setError(err.message || "Failed to fetch token data");
    } finally {
      setLoading(false);
    }
  };
  
  const getRiskColor = (score: string) => {
    if (score === 'SAFE') return "bg-green-900/10 border-green-500/30 text-green-400";
    if (score === 'WARN') return "bg-yellow-900/10 border-yellow-500/30 text-yellow-400";
    if (score === 'DANGER') return "bg-red-900/10 border-red-500/30 text-red-400";
    return "bg-gray-900/10 border-white/10 text-gray-400";
  };

  const getRiskIcon = (score: string) => {
     if (score === 'SAFE') return <ShieldCheck size={24} />;
     if (score === 'DANGER') return <ShieldAlert size={24} />;
     return <AlertTriangle size={24} />;
  };

  return (
    <div className="relative flex flex-col gap-4 h-full">
       {/* Input Area */}
       <div className="group relative">
         <Search className="top-1/2 left-3 absolute text-gray-500 group-focus-within:text-[var(--cotton-blue)] transition-colors -translate-y-1/2" size={18} />
         <input 
            type="text" 
            placeholder="Paste Contract Address (CA)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="bg-[var(--deep-void)] py-3 pr-4 pl-10 border border-[var(--glass-border)] focus:border-[var(--cotton-blue)] rounded-xl focus:outline-none focus:ring-[var(--cotton-blue)]/30 focus:ring-1 w-full font-mono text-gray-200 text-sm transition-all"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
         />
       </div>

       {/* Loading State */}
       {loading && (
         <div className="flex flex-col flex-1 justify-center items-center text-[var(--cotton-blue)]">
            <RefreshCw className="opacity-80 mb-4 w-8 h-8 animate-spin" />
            <span className="font-bold text-xs tracking-[0.2em] animate-pulse">SNIFFING BLOCKCHAIN...</span>
         </div>
       )}

       {/* Error State */}
       {error && (
         <div className="flex flex-col flex-1 justify-center items-center text-red-400">
           <AlertTriangle className="mb-2 w-8 h-8" />
           <p className="text-xs text-center">{error}</p>
         </div>
       )}

       {/* Result Display */}
       {!loading && token && (
          <div className="slide-in-from-bottom-4 flex flex-col flex-1 gap-4 animate-in duration-500 fade-in">
             
             {/* Header Card */}
             <div className="flex items-start gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_25px_rgba(0,0,0,0.4)] p-4 border-l-[var(--cotton-blue)] border-l-4 rounded-xl transition-all glass">
                <TokenImage 
                  src={token.image} 
                  alt={token.symbol} 
                  className="bg-black/40 shadow-[0_0_15px_rgba(169,222,249,0.2)] rounded-lg ring-1 ring-white/10 w-16 h-16" 
                  size={64}
                />
                <div className="flex-1 min-w-0">
                   <h2 className="bg-clip-text bg-gradient-to-r from-white to-gray-400 font-bold text-transparent text-xl truncate">
                      {token.name}
                   </h2>
                   <div className="flex items-center gap-2 mb-1 text-gray-400">
                      <span className="shadow-[0_0_8px_rgba(255,153,200,0.3)] font-mono font-bold text-[var(--cotton-pink)] text-sm">${token.symbol}</span>
                      <span className="bg-black/40 px-1.5 py-0.5 border border-[var(--glass-border)] rounded font-mono text-[10px]">{token.address.slice(0,4)}...{token.address.slice(-4)}</span>
                      <Copy size={12} className="hover:text-white transition-colors cursor-pointer" onClick={() => navigator.clipboard.writeText(token.address)} />
                   </div>
                   <div className="flex gap-3">
                       <a href={`https://solscan.io/token/${token.address}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-[var(--cotton-blue)] transition-colors">
                          Solscan <ExternalLink size={10} />
                       </a>
                       <a href={`https://rugcheck.xyz/tokens/${token.address}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-[var(--cotton-pink)] transition-colors">
                          RugCheck <ExternalLink size={10} />
                       </a>
                   </div>
                </div>
             </div>

             {/* Risk Badge */}
             <ELI5Tooltip 
               description="Real-time risk assessment powered by RugCheck."
               example="Green is SAFE, Red is DANGER."
             >
               <div className={cn(
                  "flex items-center gap-3 p-3 border rounded-xl hover:scale-[1.02] transition-all cursor-help",
                  getRiskColor(token.riskScore)
               )}>
                  {getRiskIcon(token.riskScore)}
                  
                  <div>
                     <h4 className="font-bold text-xs uppercase tracking-wider">SAFETY: {token.riskScore}</h4>
                     <p className="opacity-70 mt-0.5 text-[10px] leading-tight">
                        {token.riskDetails || "Verified by RugCheck."}
                     </p>
                  </div>
               </div>
             </ELI5Tooltip>

             {/* Stats Grid */}
             <div className="gap-3 grid grid-cols-2">
                <div className="group flex flex-col p-3 border border-white/5 hover:border-[var(--cotton-blue)]/30 rounded-lg transition-colors glass">
                   <span className="text-[10px] text-gray-500 uppercase tracking-tighter">Current Price</span>
                   <span className="shadow-[0_0_10px_rgba(169,222,249,0.2)] font-mono font-bold text-[var(--cotton-blue)] text-base">${token.price.toFixed(6)}</span>
                </div>
                <ELI5Tooltip description="Total value locked in this token. Higher means easier to buy/sell without price jumps." example="$100K+ is usually safe for $100 trades.">
                  <div className="group flex flex-col p-3 border border-white/5 hover:border-[var(--cotton-pink)]/30 rounded-lg h-full transition-colors cursor-help glass">
                    <span className="text-[10px] text-gray-500 uppercase tracking-tighter">Liquidity</span>
                    <span className="font-mono font-bold text-white text-base">${(token.liquidity / 1000).toFixed(1)}K</span>
                  </div>
                </ELI5Tooltip>
             </div>

             {/* Source Indicator */}
             <div className="mt-auto pb-2 text-center">
                <span className="bg-black/20 px-2 py-0.5 border border-white/5 rounded-full text-[9px] text-gray-600 uppercase tracking-widest">
                   Data: DexScreener + RugCheck
                </span>
             </div>

          </div>
       )}

       {/* Initial Empty State */}
       {!loading && !token && !error && (
          <div className="flex flex-col flex-1 justify-center items-center opacity-50 text-gray-600">
             <Search size={48} className="mb-4" />
             <p className="text-sm text-center">Paste a Contract Address<br />to start sniffing.</p>
          </div>
       )}
    </div>
  );
}
