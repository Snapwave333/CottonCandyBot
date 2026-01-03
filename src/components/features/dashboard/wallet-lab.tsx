"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Wallet, 
  Plus, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff, 
  ArrowRightLeft,
  Layers,
  Download,
  Upload,
  Bot
} from "lucide-react";
import { useTradingStore } from "@/store/useTradingStore";
import { useCombinedWallets } from "@/context/WalletContext";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export function WalletLab() {
  const { botWallets, createSwarm, mode } = useTradingStore();
  const { transferToBot, transferToMain } = useCombinedWallets();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [swarmCount, setSwarmCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleKeyVisibility = (publicKey: string) => {
    setShowKeys((prev: Record<string, boolean>) => ({ ...prev, [publicKey]: !prev[publicKey] }));
  };

  const handleCreateSwarm = async () => {
    const password = window.prompt("Enter session password to encrypt new wallets:");
    if (!password) return; // Cancelled
    
    setIsGenerating(true);
    await createSwarm(swarmCount, password);
    setIsGenerating(false);
  };

  const handleDisperse = async () => {
    // Basic logic: send 0.1 SOL to each wallet for now if LIVE
    if (mode === 'PAPER') return alert("Already funded with paper balance!");
    
    for (const wallet of botWallets) {
      try {
        await transferToBot(0.1, wallet.publicKey);
      } catch (e) {
        console.error(`Failed to fund ${wallet.publicKey}:`, e);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Controls: Master Actions */}
      <section className="gap-4 grid grid-cols-1 md:grid-cols-3">
         <button 
           onClick={handleCreateSwarm}
           disabled={isGenerating}
           className="group flex flex-col justify-center items-center gap-2 hover:bg-[rgba(169,222,249,0.1)] disabled:opacity-50 p-6 border-[var(--cotton-blue)] border-2 border-dashed rounded-xl text-[var(--cotton-blue)] transition-colors glass"
         >
            <Bot size={32} className={cn("group-hover:scale-110 transition-transform", isGenerating && "animate-pulse")} />
            <span className="font-bold">{isGenerating ? 'Generating...' : `Generate Swarm (${swarmCount})`}</span>
         </button>
         
         <div className="flex flex-col gap-3 p-6 rounded-xl glass">
            <h4 className="flex items-center gap-2 font-bold text-gray-400 text-sm">
               <Upload size={16} /> Disperse Sol
            </h4>
            <div className="flex gap-2">
               <input 
                 type="number" 
                 value={0.1} 
                 readOnly
                 className="bg-[var(--input)] p-2 rounded w-20 text-white text-sm" 
               />
               <button 
                 onClick={handleDisperse}
                 className="flex-1 bg-[var(--deep-void)] border border-[var(--glass-border)] hover:border-[var(--cotton-blue)] rounded text-xs transition-colors"
                >
                  Main -&gt; Swarm
               </button>
            </div>
         </div>

         <div className="flex flex-col gap-3 p-6 rounded-xl glass">
            <h4 className="flex items-center gap-2 font-bold text-gray-400 text-sm">
               <Download size={16} /> Consolidate
            </h4>
            <button className="flex justify-center items-center gap-2 bg-[var(--deep-void)] border border-[var(--glass-border)] hover:border-[var(--cotton-pink)] rounded w-full h-full hover:text-[var(--cotton-pink)] text-xs transition-colors">
               <Trash2 size={14} /> Drain All to Main
            </button>
         </div>
      </section>

      {/* Clusters & Wallets */}
      <div className="space-y-8">
         <section className="relative">
            {/* Cluster Header */}
            <div className="flex items-center gap-3 mb-4 pl-2">
               <Layers size={20} className="text-[var(--cotton-blue)]" />
               <h3 className="font-bold text-white text-lg">Active Swarm</h3>
               <span className="bg-[var(--card)] px-2 py-1 border border-[var(--glass-border)] rounded-full text-gray-500 text-xs">
                  {botWallets.length} Wallets
               </span>
               <div className="flex-1 bg-[var(--glass-border)] ml-4 h-px"></div>
            </div>

            {/* Wallets Grid */}
            <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
               {botWallets.map(wallet => (
                  <div key={wallet.publicKey} className="p-4 border-l-[var(--cotton-blue)] border-l-4 rounded-xl transition-transform hover:translate-x-1 glass">
                     <div className="flex justify-between items-start mb-3">
                        <div>
                           <h5 className="font-bold text-gray-200">{wallet.label}</h5>
                           <div className="flex items-center gap-2 mt-1">
                              <span className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded font-mono text-[10px] text-gray-500 cursor-pointer" onClick={() => navigator.clipboard.writeText(wallet.publicKey)}>
                                 {wallet.publicKey.slice(0, 4)}...{wallet.publicKey.slice(-4)}
                                 <Copy size={10} className="hover:text-white" />
                              </span>
                           </div>
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="font-bold text-[var(--cotton-blue)] text-sm">
                             {wallet.isPaper ? `$${(wallet.balance).toLocaleString()}` : `${(wallet.balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`}
                           </span>
                           {wallet.isPaper && <span className="text-[10px] text-gray-500 uppercase">Simulated</span>}
                        </div>
                     </div>
                     
                     <div className="flex justify-between items-center mt-4 pt-3 border-[var(--glass-border)] border-t">
                        <button 
                          className="flex items-center gap-1 text-gray-500 hover:text-white text-xs"
                          onClick={() => toggleKeyVisibility(wallet.publicKey)}
                        >
                           {showKeys[wallet.publicKey] ? <EyeOff size={12} /> : <Eye size={12} />}
                           Private Key
                        </button>
                        
                        <div className="flex gap-2">
                           <button className="hover:bg-[var(--glass-border)] p-1.5 rounded text-[var(--cotton-pink)]" title="Delete Wallet">
                              <Trash2 size={14} />
                           </button>
                           <button 
                             onClick={() => transferToMain(wallet.balance / (wallet.isPaper ? 1 : LAMPORTS_PER_SOL), wallet.publicKey)}
                             className="hover:bg-[var(--glass-border)] p-1.5 rounded text-gray-400" 
                             title="Withdraw to Main"
                           >
                              <ArrowRightLeft size={14} />
                           </button>
                        </div>
                     </div>
                     
                     {showKeys[wallet.publicKey] && (
                        <div className="bg-red-900/10 mt-2 p-2 border border-red-900/30 rounded font-mono text-[10px] text-red-400 break-all">
                           {wallet.encryptedKey}
                        </div>
                     )}
                  </div>
               ))}
               
               {/* Add to Cluster Button */}
               <button 
                 onClick={handleCreateSwarm}
                 className="flex justify-center items-center border-[var(--glass-border)] border-2 hover:border-gray-400 border-dashed rounded-xl min-h-[120px] text-gray-500 hover:text-white transition-colors glass"
               >
                  <Plus size={24} />
                  <span className="ml-2 text-sm">Add Swarm Node</span>
               </button>
            </div>
         </section>
      </div>
    </div>
  );
}
