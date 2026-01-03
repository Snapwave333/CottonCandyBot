import { useEffect, useState } from "react";
import { useTradingStore } from "@/store/useTradingStore";
import { Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function SystemLogs() {
  const { globalLogs, initSocket } = useTradingStore();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    initSocket();
  }, [initSocket]);

  return (
    <div 
      className={cn(
        "z-40 relative flex flex-col p-4 border border-[var(--glass-border)] rounded-xl overflow-hidden font-mono text-xs transition-all duration-300 ease-in-out glass",
        isExpanded ? "absolute inset-2 z-50 h-[calc(100%-1rem)]" : "flex-1 min-h-0"
      )}
    >
      <div className="top-0 left-0 z-10 absolute flex justify-between items-start bg-gradient-to-b from-[var(--deep-void)] via-[var(--deep-void)]/80 to-transparent p-4 w-full h-12">
        <span className="font-bold text-[10px] text-white/50 uppercase tracking-widest">System Logs</span>
         <button 
           onClick={() => setIsExpanded(!isExpanded)}
           className="hover:bg-white/10 opacity-50 hover:opacity-100 p-1 rounded-md text-white transition-all"
           title={isExpanded ? "Minimize" : "Maximize"}
         >
           {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
         </button>
      </div>

      <div className="pt-8 h-full overflow-y-auto scrollbar-hide">
        {globalLogs.length === 0 ? (
          <div className="flex justify-center items-center opacity-50 h-full text-gray-500 italic">
             Waiting for system logs...
          </div>
        ) : (
          globalLogs.map((log, index) => (
            <p key={`${log.timestamp}-${index}`} className={cn(
              "py-0.5 border-white/5 last:border-0 border-b leading-relaxed",
              log.type === 'ERROR' ? 'text-red-400' : log.type === 'SUCCESS' ? 'text-green-400' : 'text-green-400/80'
            )}>
              <span className="opacity-50 mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              {log.message}
            </p>
          ))
        )}
      </div>
    </div>
  );
}
