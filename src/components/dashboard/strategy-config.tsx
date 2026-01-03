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
  StopCircle,
  Trash2,
  Clock,
  Terminal
} from "lucide-react";
import { useTradingStore } from "@/store/useTradingStore";
import { StrategyType } from "@/types";
import { StrategyCard } from "./strategy-card";
import { StrategyWizardModal } from "../strategy-wizard";

interface StrategyTemplate {
  type: StrategyType;
  title: string;
  description: string;
  icon: React.ReactNode;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';
  tags: string[];
  accentColor: string;
}

const TEMPLATES: StrategyTemplate[] = [
  {
    type: 'SNIPER',
    title: "The Sniper",
    description: "Instant entry on liquidity adds. Detects new pools within miliseconds.",
    icon: <Zap size={24} className="text-purple-400" />,
    riskLevel: 'HIGH',
    tags: ["Meme Coins", "Liquidity Sniping"],
    accentColor: "purple",
  },
  {
    type: 'DCA',
    title: "The Accumulator",
    description: "Slowly enters positions over time to smooth out volatility.",
    icon: <Activity size={24} className="text-blue-400" />,
    riskLevel: 'SAFE',
    tags: ["Long Term", "Risk Mgmt"],
    accentColor: "blue",
  },
  {
    type: 'DIP_CATCHER',
    title: "Dip Catcher",
    description: "Buys aggressive pullbacks. Enters when RSI is oversold.",
    icon: <ArrowDownUp size={24} className="text-green-400" />,
    riskLevel: 'MEDIUM',
    tags: ["Reversals", "Scalping"],
    accentColor: "green",
  },
  {
    type: 'MOMENTUM',
    title: "Momentum Surfer",
    description: "Chases volume spikes and breakouts. Trend following.",
    icon: <TrendingUp size={24} className="text-cyan-400" />,
    riskLevel: 'MEDIUM',
    tags: ["Volume", "Breakouts"],
    accentColor: "cyan",
  },
  {
    type: 'COPYCAT',
    title: "The Copycat",
    description: "Mirrors successful wallets. Automated social trading.",
    icon: <Users size={24} className="text-amber-400" />,
    riskLevel: 'HIGH',
    tags: ["Social", "Mirroring"],
    accentColor: "amber",
  },
  {
    type: 'TOP_200',
    title: "Top 200 Hunter",
    description: "Auto-scans and trades top ranked Solana tokens.",
    icon: <TrendingUp size={24} className="text-emerald-400" />,
    riskLevel: 'MEDIUM',
    tags: ["Momentum", "Auto-Pilot"],
    accentColor: "emerald",
  },
];

export function StrategyConfig() {
  const { strategies, addStrategy, updateStrategyStatus, removeStrategy } = useTradingStore();
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const handleCreate = (type: StrategyType) => {
    addStrategy({
      id: crypto.randomUUID(),
      type,
      status: 'STOPPED',
      config: {
        targetToken: '',
        amountInSol: 0.1
      },
      logs: [],
      createdAt: Date.now()
    });
  };

  return (
    <div className="flex flex-col gap-10 pb-20 w-full" data-testid="strategy-config">
      
      {/* Templates Row */}
      <section>
        <h3 className="flex items-center gap-2 mb-6 font-bold text-white text-xl tracking-tight">
           <Zap className="text-[var(--cotton-pink)]" /> 
           Tactical Command Center
        </h3>
        <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {TEMPLATES.map((t) => (
            <div key={t.type} className="h-full">
              <StrategyCard
                title={t.title}
                description={t.description}
                icon={t.icon}
                riskLevel={t.riskLevel}
                tags={t.tags}
                accentColor={t.accentColor}
                onClick={() => handleCreate(t.type)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Active Engines - Live Monitor */}
      <section className="relative overflow-hidden">
        <h3 className="flex items-center gap-2 mb-4 font-bold text-white text-xl tracking-tight">
           <Activity className="text-[var(--cotton-blue)]" /> 
           Active Engines
        </h3>
        
        {strategies.length === 0 ? (
           <div className="flex flex-col justify-center items-center bg-black/20 backdrop-blur-md border border-white/5 border-dashed rounded-xl h-32 text-gray-500">
             <Terminal size={32} className="opacity-50 mb-2" />
             <p className="font-mono text-xs">No active engines deployed</p>
           </div>
        ) : (
           <div className="flex flex-col gap-3">
             {strategies.map(strat => (
               <div key={strat.id} className={cn(
                 "group relative flex justify-between items-center p-4 border rounded-xl transition-all duration-300",
                 "bg-black/40 backdrop-blur-xl", // Sleek dark glass
                 strat.type === 'SNIPER' ? "border-purple-500/30 hover:border-purple-500" :
                 strat.type === 'DCA' ? "border-blue-500/30 hover:border-blue-500" :
                 "border-white/10 hover:border-white/30"
               )}>
                 <div className="flex items-center gap-4">
                    {/* Status Dot */}
                    <div className="relative">
                      <div className={cn("rounded-full w-3 h-3", strat.status === 'RUNNING' ? "bg-green-500 animate-pulse" : "bg-gray-500")} />
                      {strat.status === 'RUNNING' && <div className="absolute inset-0 bg-green-500 opacity-50 rounded-full animate-ping" />}
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm uppercase tracking-wider">{strat.type}</span>
                        <span className="font-mono text-[10px] text-gray-500">#{strat.id.slice(0, 8)}</span>
                      </div>
                      <div className="flex gap-4 mt-1 font-mono text-[10px] text-gray-400">
                        <span className="flex items-center gap-1"><Clock size={10} /> 4h 20m</span>
                        <span className="flex items-center gap-1"><TrendingUp size={10} /> 12 Trades</span>
                        <span className="text-green-400">+$4.50 P/L</span>
                      </div>
                    </div>
                 </div>
                 
                  <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    {strat.status === 'RUNNING' ? (
                      <button 
                        onClick={() => updateStrategyStatus(strat.id, 'PAUSED')}
                        className="bg-yellow-500/10 hover:bg-yellow-500/20 p-2 border border-yellow-500/20 rounded-lg text-yellow-400 transition-colors"
                        title="Pause"
                      >
                        <Pause size={16} />
                      </button>
                    ) : (
                      <button 
                        onClick={() => updateStrategyStatus(strat.id, 'RUNNING')}
                        className="bg-green-500/10 hover:bg-green-500/20 p-2 border border-green-500/20 rounded-lg text-green-400 transition-colors"
                        title="Start"
                      >
                        <Play size={16} />
                      </button>
                    )}
                      <button 
                        onClick={() => updateStrategyStatus(strat.id, 'STOPPED')}
                        className="bg-white/5 hover:bg-white/10 p-2 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                        title="Stop"
                      >
                      <StopCircle size={16} />
                    </button>
                    <button 
                      onClick={() => removeStrategy(strat.id)}
                      className="bg-red-500/10 hover:bg-red-500/20 ml-2 p-2 border border-red-500/20 rounded-lg text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
               </div>
             ))}
           </div>
        )}
      </section>
      
      {/* Custom Builder - Tactical Wizard Entry */}
      <section className="group relative mt-8">
        <h3 className="flex items-center gap-2 mb-4 font-bold text-white text-lg tracking-tight">
           <Zap className="shadow-[0_0_10px_var(--cotton-pink)] text-[var(--cotton-pink)]" size={18} /> 
           Advanced Strategy Designer
        </h3>
        
        <div className="group relative border border-[var(--cotton-pink)]/30 hover:border-[var(--cotton-pink)] rounded-2xl h-64 overflow-hidden transition-all duration-300">
           {/* Dynamic Background */}
           <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
           <div className="absolute inset-0 bg-[length:250%_250%] bg-[linear-gradient(45deg,transparent_25%,rgba(236,72,153,0.05)_50%,transparent_75%)] opacity-0 group-hover:opacity-100 transition-opacity animate-shine duration-1000" />
           
           {/* Grid Effect */}
           <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

           <div className="z-20 relative flex flex-col justify-center items-center p-8 h-full text-center">
             <div className="bg-[var(--cotton-pink)]/10 shadow-[0_0_30px_rgba(236,72,153,0.2)] mb-6 p-4 border border-[var(--cotton-pink)]/30 rounded-full group-hover:scale-110 transition-transform duration-500">
               <Zap className="text-[var(--cotton-pink)]" size={40} />
             </div>
             
             <h4 className="mb-2 font-bold text-white text-2xl tracking-wide">
               Initialize Tactical Wizard
             </h4>
             <p className="mx-auto mb-8 max-w-md text-gray-400 text-sm">
               Configure high-precision strategies with slippage protection, MEV shielding, and multi-tier exit protocols.
             </p>

             <button 
                onClick={() => setIsWizardOpen(true)}
                className="group/btn relative bg-[var(--cotton-pink)] hover:shadow-[0_0_20px_var(--cotton-pink)] px-8 py-3 rounded-full overflow-hidden font-bold text-black text-sm uppercase tracking-widest transition-all"
             >
               <span className="z-10 relative flex items-center gap-2">
                 Launch Configuration <Settings size={14} className="animate-spin-slow" />
               </span>
               <div className="absolute inset-0 bg-white/50 transition-transform translate-y-full group-hover/btn:translate-y-0 duration-300" />
             </button>
           </div>
        </div>
      </section>

      <StrategyWizardModal isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
    </div>
  );
}
