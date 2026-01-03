import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Activity, Terminal } from "lucide-react";

export function LiveTerminal({ config }: { config: any }) {
  const [lines, setLines] = useState<string[]>([]);

  // Simulation of a boot sequence / update log
  useEffect(() => {
    const sequence = [
      "Connecting to Neural Net...",
      "Syncing with Solana Mainnet...",
      "Analyzing Liquidity Pools..."
    ];
    setLines(sequence);
  }, []);

  // Update lines based on config changes (Mock logic for now)
  useEffect(() => {
    if (config.trigger) {
        setLines(p => [...p.slice(-4), `> TARGET_LOCK: [${config.trigger.toUpperCase()}] Protocol engaged.`]);
    }
  }, [config.trigger]);

  useEffect(() => {
     if (config.slippage) {
         setLines(p => [...p.slice(-4), `> CALIBRATING SLIPPAGE: ${config.slippage}% allowed deviation.`]);
     }
  }, [config.slippage]);

  return (
    <div className="relative flex flex-col bg-black/80 p-6 border-white/10 border-l h-full overflow-hidden font-mono">
      {/* Scanline Effect */}
      <div className="z-10 absolute inset-0 bg-[length:100%_4px,3px_100%] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-10 h-32 animate-scan pointer-events-none" />

      <div className="z-20 flex items-center gap-2 opacity-80 mb-6 text-[var(--cotton-blue)]">
        <Terminal size={16} />
        <h3 className="font-bold text-xs uppercase tracking-widest">Tactical Readout</h3>
      </div>

      {/* Dynamic Summary */}
      <div className="z-20 flex-1 space-y-4 text-gray-400 text-xs leading-relaxed">
        <p>
          Bot will <span className={cn("shadow-[0_0_10px_rgba(74,222,128,0.3)] px-1 rounded font-bold text-[var(--cotton-green)]", !config.trigger && "opacity-30")}>
            {config.trigger || "WAIT"}
          </span> new pools with 
          <span className="mx-1 text-white">[&gt;5 SOL LIQ]</span>.
        </p>
        <p>
          Entry with <span className="font-bold text-[var(--cotton-blue)]">0.5 SOL</span> using 
          <span className={cn("mx-1 font-bold", config.priority === 'turbo' ? "text-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]" : "text-gray-500")}>
            [{config.priority?.toUpperCase() || "STANDARD"} FEES]
          </span>.
        </p>
        <p>
           Exec Mode: 
           <span className={cn("ml-2 font-bold", config.useJito ? "text-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.4)]" : "text-gray-500")}>
             {config.useJito ? "JITO BUNDLE (SECURE)" : "PUBLIC MEMPOOL (RISK)"}
           </span>
        </p>
      </div>

      {/* Log Feed */}
      <div className="z-20 mt-auto pt-6 border-white/10 border-t">
         <div className="flex items-center gap-2 mb-2 text-[10px] text-gray-500 uppercase tracking-widest">
            <Activity size={10} className="text-green-500 animate-pulse" />
            System Log
         </div>
         <div className="space-y-1">
            {lines.map((line, i) => (
                <div key={i} className="font-mono text-[10px] text-[var(--cotton-blue)]/70 truncate">
                    <span className="opacity-30 mr-2">{new Date().toLocaleTimeString()}</span>
                    {line}
                </div>
            ))}
         </div>
      </div>
    </div>
  );
}
