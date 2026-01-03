import { cn } from "@/lib/utils";
import { Rocket, User, TrendingUp, ShieldCheck, ShieldAlert, X, Plus, Zap, Diamond } from "lucide-react";

// --- STEP 1: TRIGGER SELECTION ---
export function StepTrigger({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  const options = [
    { id: 'new_liquidity', label: 'New Liquidity', icon: Rocket, desc: 'Snipe fresh pairs immediately.' },
    { id: 'copy_trade', label: 'Copy Trade', icon: User, desc: 'Mirror a target wallet.' },
    { id: 'volume_spike', label: 'Volume Spike', icon: TrendingUp, desc: 'Detect momentum surges.' },
  ];

  return (
    <div className="flex flex-col justify-center h-full">
        <h3 className="flex items-center gap-2 mb-6 font-bold text-white text-xl">
            <span className="text-[var(--cotton-pink)]">01.</span> Select Trigger Event
        </h3>
        <div className="gap-4 grid grid-cols-3">
            {options.map((opt) => {
                const isSelected = value === opt.id;
                return (
                    <div 
                        key={opt.id}
                        onClick={() => onChange(opt.id)}
                        className={cn(
                            "group relative flex flex-col items-center gap-4 bg-white/5 p-6 border rounded-2xl text-center transition-all duration-300 cursor-pointer",
                            "hover:-translate-y-1 hover:bg-white/10",
                            isSelected 
                                ? "border-[var(--cotton-pink)] shadow-[0_0_20px_rgba(236,72,153,0.2)] bg-[var(--cotton-pink)]/5" 
                                : "border-white/10 hover:border-white/30"
                        )}
                    >
                        <div className={cn(
                            "p-4 rounded-full transition-all duration-300",
                            isSelected ? "bg-[var(--cotton-pink)] text-black shadow-[0_0_15px_var(--cotton-pink)]" : "bg-white/5 text-gray-500 group-hover:text-white"
                        )}>
                            <opt.icon size={32} />
                        </div>
                        <div>
                            <h4 className={cn("mb-1 font-bold text-sm uppercase tracking-wider", isSelected ? "text-white" : "text-gray-400 group-hover:text-gray-200")}>
                                {opt.label}
                            </h4>
                            <p className="text-[10px] text-gray-600 group-hover:text-gray-500">{opt.desc}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    </div>
  );
}

// --- STEP 2: SAFETY FILTERS ---
export function StepSafety({ config, onChange }: { config: any, onChange: (k: string, v: any) => void }) {
    // Reusing the "Cyber Switch" logic but inline for simplicity in this specific wizard context
    const Toggle = ({ label, checked, onToggle }: any) => (
        <div className="flex justify-between items-center bg-white/5 hover:bg-white/10 p-4 border border-white/5 rounded-xl transition-colors">
            <span className="font-bold text-gray-300 text-sm">{label}</span>
            <button 
                onClick={onToggle}
                className={cn(
                    "relative flex items-center bg-black/50 border rounded w-12 h-6 transition-colors",
                    checked ? "border-green-500/50 bg-green-500/10" : "border-white/10"
                )}
            >
                <div className={cn(
                    "absolute flex justify-center items-center shadow-sm rounded w-4 h-4 transition-all duration-300",
                    checked 
                        ? "right-1 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]" 
                        : "left-1 bg-gray-600"
                )}>
                   {checked && <ShieldCheck size={10} className="text-black" />}
                </div>
            </button>
        </div>
    )

    return (
        <div className="space-y-6">
             <h3 className="flex items-center gap-2 mb-6 font-bold text-white text-xl">
                <span className="text-[var(--cotton-pink)]">02.</span> Safety Protocols
            </h3>
            <div className="gap-4 grid grid-cols-1">
                <Toggle label="Verify Token Mint Authority" checked={config.verifyMint} onToggle={() => onChange('verifyMint', !config.verifyMint)} />
                <Toggle label="Require LP Burn / Lock" checked={config.requireLpBurn} onToggle={() => onChange('requireLpBurn', !config.requireLpBurn)} />
                <Toggle label="Auto-Reject Top 10 Holders > 30%" checked={config.rejectBundles} onToggle={() => onChange('rejectBundles', !config.rejectBundles)} />
                <Toggle label="Freeze Authority Check" checked={config.freezeCheck} onToggle={() => onChange('freezeCheck', !config.freezeCheck)} />
            </div>
        </div>
    )
}

// --- STEP 3: EXECUTION ---
export function StepExecution({ config, onChange }: { config: any, onChange: (k: string, v: any) => void }) {
    
    return (
        <div className="space-y-8">
             <h3 className="flex items-center gap-2 mb-6 font-bold text-white text-xl">
                <span className="text-[var(--cotton-pink)]">03.</span> Execution Engine
            </h3>
            
            {/* Slippage */}
            <div className="space-y-3 bg-black/20 p-5 border border-white/5 rounded-xl">
                <div className="flex justify-between">
                    <label className="font-bold text-gray-400 text-sm uppercase">Slippage Tolerance</label>
                    <span className={cn(
                        "font-mono font-bold text-sm",
                        config.slippage > 5 ? "text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" : "text-green-400"
                    )}>{config.slippage}%</span>
                </div>
                <input 
                    type="range" min="0.1" max="50" step="0.1"
                    value={config.slippage}
                    onChange={(e) => onChange('slippage', parseFloat(e.target.value))}
                    className="bg-gray-700 rounded-lg w-full h-1 accent-[var(--cotton-pink)] appearance-none cursor-pointer"
                />
            </div>

            {/* Priority Fees */}
            <div className="space-y-3">
                 <label className="font-bold text-gray-400 text-sm uppercase">Priority Fee Tier</label>
                 <div className="flex gap-2">
                    {['standard', 'turbo', 'jito_snipe'].map(tier => (
                        <button
                            key={tier}
                            onClick={() => onChange('priority', tier)}
                            className={cn(
                                "flex flex-col flex-1 items-center gap-2 py-4 border rounded-xl transition-all",
                                config.priority === tier 
                                    ? tier === 'jito_snipe' 
                                        ? "bg-purple-500/10 border-purple-500 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                                        : tier === 'turbo'
                                            ? "bg-orange-500/10 border-orange-500 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                                            : "bg-blue-500/10 border-blue-500 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                                    : "bg-white/5 border-white/5 text-gray-500 hover:border-white/20 hover:bg-white/10"

                            )}
                        >
                            {tier === 'jito_snipe' && <Diamond size={20} className="animate-pulse" />}
                            {tier === 'turbo' && <Zap size={20} />}
                            <span className="font-bold text-xs uppercase tracking-widest">{tier.replace('_', ' ')}</span>
                        </button>
                    ))}
                 </div>
            </div>
        </div>
    )
}

// --- STEP 4: EXIT STRATEGY ---
export function StepExit({ config, onChange }: { config: any, onChange: (k: string, v: any) => void }) {
    
    return (
        <div className="space-y-6">
             <h3 className="flex items-center gap-2 mb-6 font-bold text-white text-xl">
                <span className="text-[var(--cotton-pink)]">04.</span> Exit Strategy
            </h3>
            
             <div className="space-y-4">
                 <div className="bg-green-500/5 p-4 border border-green-500/30 rounded-lg">
                     <div className="flex justify-between items-center mb-2">
                         <span className="font-bold text-green-400 text-sm">Take Profit Target</span>
                         <span className="font-mono font-bold text-green-400 text-sm">+{config.takeProfit}%</span>
                     </div>
                     <input 
                        type="range" min="1" max="1000" step="1"
                        value={config.takeProfit}
                        onChange={(e) => onChange('takeProfit', parseFloat(e.target.value))}
                        className="bg-gray-700 rounded-lg w-full h-1 accent-green-500 appearance-none cursor-pointer"
                     />
                 </div>
 
                 <div className="bg-red-500/5 p-4 border border-red-500/30 rounded-lg">
                     <div className="flex justify-between items-center mb-2">
                         <span className="flex items-center gap-2 font-bold text-red-400 text-sm">
                            <ShieldAlert size={14} /> Stop Loss
                         </span>
                         <span className="font-mono font-bold text-red-400 text-sm">-{config.stopLoss}%</span>
                     </div>
                     <input 
                        type="range" min="1" max="90" step="1"
                        value={config.stopLoss}
                        onChange={(e) => onChange('stopLoss', parseFloat(e.target.value))}
                        className="bg-gray-700 rounded-lg w-full h-1 accent-red-500 appearance-none cursor-pointer"
                     />
                 </div>
            </div>
        </div>
    )
}
