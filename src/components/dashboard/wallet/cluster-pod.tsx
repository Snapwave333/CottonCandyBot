import { useState } from "react";
import { BotWallet, ClusterGroup } from "./types";
import { ChevronDown, ChevronRight, Hash, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

interface ClusterPodProps {
  cluster: ClusterGroup;
  onCopy: (text: string) => void;
}

export function ClusterPod({ cluster, onCopy }: ClusterPodProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const totalBalance = cluster.wallets.reduce((acc, w) => acc + (w.isPaper ? w.balance : w.balance / LAMPORTS_PER_SOL), 0);
  
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden transition-all">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex justify-between items-center bg-white/5 hover:bg-white/10 px-4 py-3 cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className={cn("bg-[var(--cotton-blue)]/20 p-1.5 rounded-lg text-[var(--cotton-blue)] transition-transform duration-300", isExpanded && "rotate-90")}>
             {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
          <div className="flex flex-col">
             <span className="flex items-center gap-2 font-bold text-gray-200 text-sm">
                <Layers size={14} className="text-[var(--cotton-blue)]" />
                {cluster.name}
             </span>
             <span className="text-[10px] text-gray-500">{cluster.wallets.length} Active Nodes</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="text-right">
              <span className="block font-bold text-white text-xs">{totalBalance.toFixed(2)} SOL</span>
              <span className="text-[9px] text-green-500 uppercase">Pooled</span>
           </div>
        </div>
      </div>
      
      {/* Expanded Content */}
      <div className={cn("overflow-hidden transition-[max-height] duration-300 ease-in-out", isExpanded ? "max-h-[500px] border-t border-white/5" : "max-h-0")}>
         <div className="gap-2 grid grid-cols-1 p-3">
            {cluster.wallets.map((wallet) => (
               <div key={wallet.publicKey} className="group flex justify-between items-center bg-black/20 hover:bg-black/30 px-3 py-2 border border-white/5 hover:border-[var(--cotton-blue)]/30 rounded transition-colors">
                  <div className="flex items-center gap-2">
                     <Hash size={12} className="text-gray-600" />
                     <span className="font-mono text-[10px] text-gray-400 group-hover:text-white transition-colors">{wallet.label}</span>
                     <span 
                        className="opacity-30 hover:opacity-100 cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); onCopy(wallet.publicKey); }}
                     >
                        <span className="font-mono text-[10px] text-gray-600 truncate">{wallet.publicKey.slice(0,4)}...{wallet.publicKey.slice(-4)}</span>
                     </span>
                  </div>
                  <span className="font-mono text-[10px] text-[var(--cotton-blue)]">
                    {(wallet.isPaper ? wallet.balance : wallet.balance / LAMPORTS_PER_SOL).toFixed(4)} SOL
                  </span>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
