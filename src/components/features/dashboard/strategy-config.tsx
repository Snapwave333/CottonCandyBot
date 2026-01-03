"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Zap, 
  TrendingUp, 
  ArrowDownUp, 
  Activity, 
  Users, 
  Settings, 
  Play,
  Pause,
  StopCircle
} from "lucide-react";
import { useTradingStore } from "@/store/useTradingStore";
import { StrategyType } from "@/types";

interface StrategyTemplate {
  type: StrategyType;
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string; // Tailwind class equivalent or hex
}

const TEMPLATES: StrategyTemplate[] = [
  {
    type: 'SNIPER',
    title: "The Sniper",
    description: "Instant entry on liquidity add. High risk, high speed.",
    icon: <Zap size={24} />,
    accentColor: "text-purple-400 border-purple-400 shadow-purple-500/20",
  },
  {
    type: 'DCA',
    title: "The Accumulator",
    description: "Dollar Cost Average over time to smooth entry.",
    icon: <Activity size={24} />,
    accentColor: "text-blue-400 border-blue-400 shadow-blue-500/20",
  },
  {
    type: 'DIP_CATCHER',
    title: "Dip Catcher",
    description: "Buy the red candles. Enter on % drop support.",
    icon: <ArrowDownUp size={24} />, // Approximation
    accentColor: "text-green-400 border-green-400 shadow-green-500/20",
  },
  {
    type: 'MOMENTUM',
    title: "Momentum Surfer",
    description: "Trend following. Buy volume spikes & breakouts.",
    icon: <TrendingUp size={24} />,
    accentColor: "text-cyan-400 border-cyan-400 shadow-cyan-500/20",
  },
  {
    type: 'COPYCAT',
    title: "The Copycat",
    description: "Mirror the trades of a profitable wallet.",
    icon: <Users size={24} />,
    accentColor: "text-amber-400 border-amber-400 shadow-amber-500/20",
  },
];

export function StrategyConfig() {
  const [selectedType, setSelectedType] = useState<StrategyType | null>(null);
  const { strategies, addStrategy } = useTradingStore();

  const handleCreate = (type: StrategyType) => {
    // Mock creation logic - normally opens a modal configuration
    addStrategy({
      id: crypto.randomUUID(),
      type,
      status: 'IDLE',
      config: {
        targetToken: '',
        amountInSol: 0.1
      },
      logs: [],
      createdAt: Date.now()
    });
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Templates Carousel */}
      <section>
        <h3 className="flex items-center gap-2 mb-4 font-bold text-white text-xl">
           <Zap className="text-[var(--cotton-pink)]" /> 
           Strategy Templates
        </h3>
        <div className="gap-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5">
          {TEMPLATES.map((t) => (
            <button
              key={t.type}
              onClick={() => handleCreate(t.type)}
              className={cn(
                "group flex flex-col items-center gap-3 hover:bg-[rgba(255,255,255,0.08)] p-4 rounded-xl text-center transition-all hover:-translate-y-1 glass",
                `hover:shadow-lg ${t.accentColor.replace('text-', 'shadow-')}` // Hacky dynamic shadow
              )}
            >
              <div className={cn("bg-[rgba(0,0,0,0.3)] p-3 rounded-full group-hover:scale-110 transition-transform", t.accentColor)}>
                {t.icon}
              </div>
              <div>
                <h4 className={cn("font-bold text-sm", t.accentColor.split(' ')[0])}>{t.title}</h4>
                <p className="mt-1 text-gray-400 text-xs leading-tight">{t.description}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Active Strategies Grid */}
      <section className="p-6 rounded-xl min-h-[300px] glass">
        <h3 className="flex items-center gap-2 mb-4 font-bold text-white text-xl">
           <Activity className="text-[var(--cotton-blue)]" /> 
           Active Engines
        </h3>
        
        {strategies.length === 0 ? (
           <div className="flex flex-col justify-center items-center border-[var(--glass-border)] border-2 border-dashed rounded-lg h-48 text-gray-500 italic">
             <p>No active strategies. Select a template above to start.</p>
           </div>
        ) : (
           <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
             {strategies.map(strat => (
               <div key={strat.id} className="flex justify-between items-center bg-[var(--deep-void)] p-4 border border-[var(--glass-border)] rounded-lg">
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "px-2 py-0.5 rounded font-bold text-xs",
                        strat.type === 'SNIPER' ? "bg-purple-900 text-purple-200" :
                        strat.type === 'DCA' ? "bg-blue-900 text-blue-200" :
                        "bg-gray-800 text-gray-200"
                      )}>
                        {strat.type}
                      </span>
                      <span className="font-mono text-gray-500 text-xs">ID: {strat.id.slice(0, 8)}</span>
                    </div>
                    <div className="text-gray-300 text-sm">
                      Target: <span className="font-mono text-white">{strat.config.targetToken || "Not Set"}</span>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-2">
                   {strat.status === 'RUNNING' ? (
                     <button className="bg-yellow-500/20 hover:bg-yellow-500/30 p-2 rounded text-yellow-400">
                       <Pause size={18} />
                     </button>
                   ) : (
                     <button className="bg-green-500/20 hover:bg-green-500/30 p-2 rounded text-green-400">
                       <Play size={18} />
                     </button>
                   )}
                   <button className="bg-red-500/20 hover:bg-red-500/30 p-2 rounded text-red-400">
                     <StopCircle size={18} />
                   </button>
                 </div>
               </div>
             ))}
           </div>
        )}
      </section>
      
      {/* Custom Builder Teaser */}
      <section className="opacity-50 hover:opacity-100 transition-opacity">
        <h3 className="flex items-center gap-2 mb-2 font-bold text-gray-400 text-lg">
           <Settings size={18} /> 
           Custom Logic Builder (Advanced)
        </h3>
        <div className="flex justify-center items-center p-8 border border-gray-700 border-dashed rounded-xl cursor-not-allowed">
           <span className="text-gray-500">Coming Soon: Visual Node Editor</span>
        </div>
      </section>
    </div>
  );
}
