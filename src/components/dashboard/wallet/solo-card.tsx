import { BotWallet } from "./types"; // Adjust import path
import { ShieldCheck, ArrowUpRight, Copy, ExternalLink, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

interface SoloCardProps {
  wallet: BotWallet;
  onCopy: (text: string) => void;
  onAction: (action: string, wallet: BotWallet) => void;
}

export function SoloCard({ wallet, onCopy, onAction }: SoloCardProps) {
  const balanceSol = wallet.isPaper ? wallet.balance : wallet.balance / LAMPORTS_PER_SOL;

  return (
    <div className="group relative flex flex-col justify-between bg-gradient-to-br from-yellow-500/10 to-transparent backdrop-blur-xl p-6 border border-yellow-500/30 hover:border-yellow-400/50 rounded-2xl w-full h-48 transition-all hover:translate-y-[-2px] glass">
      <div className="top-0 left-0 absolute bg-yellow-400/20 blur-xl rounded-full w-full h-1" />
      
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="flex justify-center items-center bg-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.2)] rounded-xl w-12 h-12 text-yellow-500">
             <Crown size={24} />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg tracking-wide">{wallet.label || 'Commander Node'}</h3>
            <div className="flex items-center gap-2 opacity-70 hover:opacity-100 mt-1 transition-opacity cursor-pointer" onClick={() => onCopy(wallet.publicKey)}>
               <span className="font-mono text-[10px] text-yellow-200/80">{wallet.publicKey}</span>
               <Copy size={10} className="text-yellow-500" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 bg-green-500/10 px-2 py-1 border border-green-500/20 rounded-full">
           <ShieldCheck size={12} className="text-green-400" />
           <span className="font-bold text-[10px] text-green-400 uppercase">Secure</span>
        </div>
      </div>

      <div className="mt-4">
         <p className="text-[10px] text-yellow-500/60 uppercase tracking-widest">Available Capital</p>
         <h2 className="font-bold text-white text-4xl tracking-tighter">
            {balanceSol.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} 
            <span className="bg-clip-text bg-gradient-to-b from-white to-white/40 ml-2 text-transparent text-2xl">SOL</span>
         </h2>
      </div>

      <div className="flex gap-2 mt-4">
        <button 
          onClick={() => onAction('withdraw', wallet)}
          className="flex-1 bg-yellow-500/10 hover:bg-yellow-500/20 py-2 border border-yellow-500/30 rounded-lg font-bold text-yellow-200 text-xs uppercase transition-colors"
        >
           Withdraw
        </button>
        <button 
           onClick={() => onAction('view', wallet)}
           className="bg-black/40 hover:bg-black/60 p-2 border border-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
        >
           <ExternalLink size={16} />
        </button>
      </div>
    </div>
  );
}
