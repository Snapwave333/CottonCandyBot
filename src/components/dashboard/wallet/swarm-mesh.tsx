import { BotWallet } from "./types";
import { Hexagon, Zap, Copy } from "lucide-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { cn } from "@/lib/utils";

interface SwarmMeshProps {
  wallets: BotWallet[];
  onCopy: (text: string) => void;
}

export function SwarmMesh({ wallets, onCopy }: SwarmMeshProps) {
  if (wallets.length === 0) return <div className="opacity-30 p-8 text-gray-400 text-xs text-center">No Switch Dormant.</div>;

  // Adapt grid size based on count
  const isLargeSwarm = wallets.length > 50;

  return (
    <div className="relative bg-black/20 p-6 rounded-2xl min-h-[300px] overflow-hidden">
        {/* Helper Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,153,200,0.05),transparent)] pointer-events-none" />

        <div className="z-10 relative flex justify-between items-center mb-4">
            <h4 className="flex items-center gap-2 font-bold text-[var(--cotton-pink)] text-sm">
                <Zap size={16} /> Swarm Mesh (Idle)
            </h4>
            <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] text-gray-500">{wallets.length} Drones</span>
        </div>

        <div className={cn(
            "z-10 relative gap-2 grid",
            isLargeSwarm 
             ? "grid-cols-[repeat(auto-fill,minmax(30px,1fr))]" 
             : "grid-cols-[repeat(auto-fill,minmax(120px,1fr))]"
        )}>
            {wallets.map((wallet) => {
                const bal = wallet.isPaper ? wallet.balance : wallet.balance / LAMPORTS_PER_SOL;
                if (isLargeSwarm) {
                    // Dense Mode (Minimal)
                    return (
                        <div 
                          key={wallet.publicKey} 
                          title={`${wallet.label}: ${bal.toFixed(3)} SOL`}
                          className="flex justify-center items-center bg-[var(--cotton-pink)]/10 hover:bg-[var(--cotton-pink)]/40 border border-[var(--cotton-pink)]/20 rounded-md aspect-square hover:scale-110 transition-all cursor-pointer"
                          onClick={() => onCopy(wallet.publicKey)}
                        >
                            <Hexagon size={16} className="opacity-50 text-[var(--cotton-pink)]" />
                        </div>
                    )
                }
                
                // Detailed Mode (Card-like but hexagonal vibe)
                return (
                    <div 
                        key={wallet.publicKey}
                        className="group relative bg-black/40 hover:bg-[var(--cotton-pink)]/10 backdrop-blur-sm p-2 border border-white/5 hover:border-[var(--cotton-pink)]/50 rounded-lg overflow-hidden transition-all hover:-translate-y-1 cursor-pointer"
                        onClick={() => onCopy(wallet.publicKey)}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <Hexagon size={14} className="text-gray-600 group-hover:text-[var(--cotton-pink)] transition-colors" />
                            <span className="font-mono text-[10px] text-gray-500 group-hover:text-white truncate">{wallet.label}</span>
                        </div>
                        <div className="text-right">
                            <span className="font-bold text-[var(--cotton-pink)] text-xs">{bal.toFixed(4)}</span>
                            <span className="ml-1 text-[8px] text-gray-600">SOL</span>
                        </div>
                        <div className="absolute inset-0 flex justify-center items-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Copy size={16} className="text-white" />
                        </div>
                    </div>
                )
            })}
        </div>
    </div>
  );
}
