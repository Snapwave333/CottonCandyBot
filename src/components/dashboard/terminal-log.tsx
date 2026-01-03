import { useEffect, useRef } from "react";
import { useTradingStore } from "@/store/useTradingStore";
import { cn } from "@/lib/utils";

export function TerminalLog() {
  const { globalLogs, initSocket } = useTradingStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initSocket();
  }, [initSocket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [globalLogs]);

  return (
    <div className="flex flex-col bg-black/40 border border-white/5 rounded-lg h-full overflow-hidden font-mono text-[10px]">
      {/* Terminal Output */}
      <div 
        ref={scrollRef}
        className="flex-1 space-y-1 p-3 overflow-y-auto scrollbar-hide"
      >
        {globalLogs.length === 0 ? (
          <div className="flex justify-center items-center opacity-30 h-full italic">
            INITIALIZING SECURE LINK...
          </div>
        ) : (
          globalLogs.map((log, i) => (
            <div key={`${log.timestamp}-${i}`} className="flex gap-2 leading-tight">
              <span className="opacity-40 whitespace-nowrap">
                [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
              </span>
              <span className={cn(
                "break-all",
                log.type === 'ERROR' ? "text-red-400" : 
                log.type === 'SUCCESS' ? "text-green-400" : 
                log.type === 'WARNING' ? "text-yellow-400" : "text-blue-300"
              )}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Terminal Footer */}
      <div className="flex justify-between items-center bg-white/5 px-3 py-1.5 border-white/5 border-t text-[9px]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="bg-green-500 rounded-full w-1.5 h-1.5 animate-pulse" />
            <span className="font-bold text-green-500 uppercase tracking-tighter">Live Feed</span>
          </div>
          <span className="opacity-40 uppercase tracking-tighter">Connection: {process.env.NEXT_PUBLIC_API_URL || 'Localhost:3021'}</span>
        </div>
        <div className="opacity-40 font-bold uppercase tracking-widest">
          {/* Version Removed */}
        </div>
      </div>
    </div>
  );
}
