import { useSettingsStore } from '@/store/useSettingsStore';
import { Zap } from 'lucide-react';

export function ExecutionSettings() {
  const { useJito, slippage, priorityFee, actions } = useSettingsStore();

  return (
    <div className="slide-in-from-right-4 space-y-8 animate-in duration-500 fade-in">
        <div>
            <h2 className="mb-2 font-bold text-white text-2xl">Execution Logic</h2>
            <p className="text-gray-400 text-sm">Fine-tune transaction routing and fee capability.</p>
        </div>

        <section className="space-y-6">
            {/* Jito Toggle */}
            <div className="flex justify-between items-center bg-white/5 p-4 border border-white/5 rounded-xl">
                <div className="space-y-1">
                    <div className="font-medium text-gray-200">MEV Shield (Route via Jito)</div>
                    <div className="text-gray-500 text-xs">Bundles transactions to avoid sandwich attacks.</div>
                </div>
                <label className="inline-flex relative items-center cursor-pointer">
                    <input type="checkbox" checked={useJito} onChange={actions.toggleJito} className="sr-only peer" />
                    <div className="after:top-[2px] after:left-[2px] after:absolute bg-gray-700 after:bg-white peer-checked:bg-[var(--cotton-pink)] after:border after:border-gray-300 rounded-full after:rounded-full peer-focus:outline-none ring-0 peer-focus:ring-[var(--cotton-pink)]/20 peer-focus:ring-4 w-11 after:w-5 h-6 after:h-5 after:content-[''] after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
            </div>

            {/* Slippage Slider */}
            <div className="space-y-3 bg-white/5 p-4 border border-white/5 rounded-xl">
                <div className="flex justify-between items-center">
                    <label className="font-medium text-gray-300 text-sm">Default Slippage</label>
                    <span className="font-mono text-[var(--cotton-blue)]">{slippage}%</span>
                </div>
                
                {/* Custom Slider Simulation since Radix might need install, using standard range for safety */}
                <input 
                  type="range" 
                  min="0.1" 
                  max="10" 
                  step="0.1"
                  value={slippage}
                  onChange={(e) => actions.setSlippage(Number.parseFloat(e.target.value))}
                  className="bg-gray-700 rounded-lg w-full h-2 accent-[var(--cotton-blue)] appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-500">
                    <span>0.1%</span>
                    <span>5%</span>
                    <span>10%</span>
                </div>
            </div>

            {/* Priority Fee Segmented Control */}
            <div className="space-y-2">
                <label className="font-bold text-[10px] text-gray-500 uppercase tracking-widest">Priority Fee Tier</label>
                <div className="gap-2 grid grid-cols-3 bg-black/40 p-1 border border-white/10 rounded-xl">
                    {(['eco', 'standard', 'turbo'] as const).map((tier) => (
                        <button
                            key={tier}
                            onClick={() => actions.setPriorityFee(tier)}
                            className={
                                priorityFee === tier 
                                    ? "bg-[var(--cotton-blue)] text-black shadow-[0_0_10px_rgba(169,222,249,0.4)]"
                                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                            }
                        >
                            {tier}
                        </button>
                    ))}
                </div>
                <p className="pt-1 text-[10px] text-gray-500 text-right">
                    {priorityFee === 'turbo' ? 'Maximum speed. Higher Cost.' : priorityFee === 'eco' ? 'Lowest cost. Slower confirmation.' : 'Balanced speed and cost.'}
                </p>
            </div>
            {/* Paper Trading Balance */}
            <div className="space-y-3 bg-white/5 p-4 border border-white/5 rounded-xl">
               <div className="flex justify-between items-center">
                  <label className="font-medium text-gray-300 text-sm">Initial Paper Balance (USD)</label>
                  <Zap size={14} className="text-[var(--cotton-blue)]" />
               </div>
               <div className="flex gap-2">
                   <div className="relative flex-1">
                       <span className="top-1/2 left-3 absolute text-gray-500 -translate-y-1/2">$</span>
                       <input 
                          type="number"
                          defaultValue={100} 
                          placeholder="100"
                          className="bg-gray-700 py-2 pl-6 rounded-lg outline-none focus:ring-[var(--cotton-blue)] focus:ring-1 w-full font-mono text-sm"
                          onBlur={async (e) => {
                             const val = Number.parseFloat(e.target.value);
                             if (!Number.isNaN(val)) {
                                try {
                                    /* Direct backend sync since this is a server-side setting */
                                    await fetch('http://localhost:3021/api/settings', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ defaultPaperBalanceUSD: val })
                                    });
                                } catch (err) {
                                    console.error("Failed to sync paper balance", err);
                                }
                             }
                          }}
                       />
                   </div>
               </div>
               <p className="text-[10px] text-gray-500">
                   Sets the starting balance for new paper trading sessions.
               </p>
            </div>
        </section>
    </div>
  );
}
