import { Activity, Power, RefreshCw, Crosshair, TerminalSquare, Wallet } from "lucide-react";
import { useTradingStore } from "@/store/useTradingStore";

export function HeadsUpDisplay({ 
    stats, 
    onAutoSort, 
    actions 
}: { 
    stats: { totalSol: number, activeNodes: number },
    onAutoSort: () => void,
    actions: { onDeploy: () => void, onPanic: () => void }
}) {
    const { globalLogs } = useTradingStore();
    const displayLogs = globalLogs.slice(-3).reverse();

    return (
        <div className="right-0 bottom-0 left-0 z-50 absolute flex items-end p-6 h-24 pointer-events-none">
            {/* Left: Health Monitor */}
            <div className="flex items-center gap-6 bg-black/60 shadow-lg backdrop-blur-xl p-4 border border-white/10 border-l-[var(--cotton-blue)] border-l-4 rounded-tr-2xl rounded-bl-sm h-16 skew-x-6 hover:skew-x-0 origin-bottom-left transition-transform pointer-events-auto">
                <div className="flex gap-6 -skew-x-6">
                    <div className="flex flex-col">
                        <span className="flex items-center gap-1 font-bold text-[10px] text-gray-500 uppercase"><Wallet size={10} /> Net Worth</span>
                        <span className="shadow-blue-500/50 drop-shadow-sm font-mono font-bold text-white text-lg">{stats.totalSol.toFixed(2)} SOL</span>
                    </div>
                    <div className="self-center bg-white/10 w-px h-8" />
                    <div className="flex flex-col">
                        <span className="flex items-center gap-1 font-bold text-[10px] text-gray-500 uppercase"><Activity size={10} /> Active Nodes</span>
                        <span className="font-mono font-bold text-[var(--cotton-green)] text-lg">{stats.activeNodes}</span>
                    </div>
                </div>
            </div>

            {/* Center: Command Deck */}
            <div className="flex flex-1 justify-center items-end gap-4 pb-2">
                 <button 
                    onClick={onAutoSort}
                    className="group relative flex justify-center items-center bg-black/50 hover:bg-[var(--cotton-blue)]/20 shadow-[0_0_20px_rgba(59,130,246,0.1)] border border-[var(--cotton-blue)]/30 hover:border-[var(--cotton-blue)] rounded-full w-14 h-14 text-[var(--cotton-blue)] active:scale-95 transition-all pointer-events-auto"
                    title="Auto-Sort Network"
                 >
                    <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-700" />
                 </button>

                 <button 
                    onClick={actions.onDeploy}
                    className="group relative flex justify-center items-center bg-gradient-to-t from-[var(--cotton-pink)]/20 to-black/60 hover:shadow-[0_0_30px_rgba(236,72,153,0.4)] -mb-4 border border-[var(--cotton-pink)] rounded-full w-20 h-20 text-[var(--cotton-pink)] hover:scale-110 active:scale-95 transition-all pointer-events-auto"
                    title="Deploy New Node"
                 >
                     <Crosshair size={32} className="animate-spin-slow" />
                     <div className="absolute inset-2 border border-[var(--cotton-pink)]/50 border-dashed rounded-full animate-reverse-spin" />
                 </button>

                 <button 
                    onClick={actions.onPanic}
                    className="group relative flex justify-center items-center bg-black/50 hover:bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)] border border-red-500/30 hover:border-red-500 rounded-full w-14 h-14 text-red-500 active:scale-95 transition-all pointer-events-auto"
                    title="EMERGENCY HALT"
                 >
                    <Power size={24} className="group-hover:scale-110 transition-transform" />
                 </button>
            </div>

            {/* Right: Live Feed */}
            <div className="hidden md:block bg-black/60 backdrop-blur-xl p-4 border border-white/10 border-r-[var(--cotton-pink)] border-r-4 rounded-tl-2xl rounded-br-sm w-64 h-24 -skew-x-6 hover:skew-x-0 origin-bottom-right transition-transform pointer-events-auto">
                 <div className="flex flex-col h-full -skew-x-6">
                    <div className="flex items-center gap-2 mb-2 pb-1 border-white/5 border-b">
                        <TerminalSquare size={12} className="text-gray-400" />
                        <span className="font-bold text-[10px] text-gray-400 uppercase tracking-widest">Live Uplink</span>
                        <div className="bg-green-500 ml-auto rounded-full w-2 h-2 animate-pulse" />
                    </div>
                    <div className="flex flex-col flex-1 justify-end overflow-hidden">
                        {displayLogs.map((log: any, i: number) => (
                            <div key={i} className="opacity-80 font-mono text-[9px] text-gray-300 truncate">
                                <span className="mr-1 text-[var(--cotton-blue)]">&gt;</span> {log.message}
                            </div>
                        ))}
                    </div>
                 </div>
            </div>
        </div>
    )
}
