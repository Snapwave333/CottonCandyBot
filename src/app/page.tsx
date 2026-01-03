"use client";

import { Header } from "@/components/dashboard/header";

import { TVChart } from "@/components/dashboard/tv-chart";
import { ExecutionTerminal } from "@/components/dashboard/execution-terminal";
import { Portfolio } from "@/components/dashboard/portfolio";
import { ActivePositions } from "@/components/dashboard/active-positions";
import { SystemLogs } from "@/components/dashboard/system-logs";
import { useTradingEngine } from "@/hooks/useTradingEngine";
import { useTradingStore } from "@/store/useTradingStore";

export default function Home() {
  useTradingEngine();
  // const { mode } = useTradingStore(); // Mode no longer used for watermark
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      
      <div className="flex-1 gap-4 grid grid-cols-1 lg:grid-cols-12 px-4 pt-20 pb-4 h-full overflow-hidden">
        
        {/* Mobile Mode Switcher (Visible only on mobile) */}
        <div className="lg:hidden col-span-1 min-h-[50px]">
        </div>

        {/* Left Panel: Portfolio (Expanded) */}
        <div className="flex flex-col gap-4 lg:col-span-3 h-full">
           <div className="flex-1 min-h-[180px]">
              <div className="z-20 relative p-4 border border-[var(--glass-border)] rounded-xl h-full glass">
                 <Portfolio />
              </div>
           </div>
        </div>

        {/* Center Panel: Active Positions & Chart */}
        <div className="flex flex-col gap-4 lg:col-span-6 h-full overflow-hidden">
           <div className="h-[35%] min-h-[200px]">
             <div className="p-4 border border-[var(--glass-border)] rounded-xl h-full overflow-hidden glass">
               <ActivePositions />
             </div>
           </div>
           <div className="flex-1 min-h-0">
             <div className="flex justify-center items-center p-2 border border-[var(--glass-border)] rounded-xl h-full overflow-hidden text-gray-500 glass">
               <TVChart />
             </div>
           </div>
        </div>

        {/* Right Panel: Execution & Logs */}
        <div className="flex flex-col gap-4 lg:col-span-3 h-full overflow-hidden">
           <div className="h-[65%] min-h-[350px]">
              <ExecutionTerminal />
           </div>
           
           <SystemLogs />
        </div>
      </div>

      {/* PAPER MODE WATERMARK */}
      {/* Background Watermark Removed */}
    </div>
  );
}
