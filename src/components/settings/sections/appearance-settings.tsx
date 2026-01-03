import { useSettingsStore } from '@/store/useSettingsStore';
import { cn } from '@/lib/utils';
// Removed unused Palette import

export function AppearanceSettings() {
  const { themeAccent, themeMode, chartType, actions } = useSettingsStore();

  return (
    <div className="slide-in-from-right-4 space-y-8 animate-in duration-500 fade-in">
        <div>
            <h2 className="mb-2 font-bold text-white text-2xl">UI Appearance</h2>
            <p className="text-gray-400 text-sm">Customize the visual dashboard experience.</p>
        </div>

        <section className="space-y-6">
            
            <div className="space-y-2">
                <label className="font-bold text-[10px] text-gray-500 uppercase tracking-widest">Interface Mode</label>
                <div className="flex gap-4">
                    <button
                        onClick={() => actions.setThemeMode('dark')}
                        className={cn(
                            "group relative flex-1 border-2 rounded-xl h-16 overflow-hidden transition-all",
                            themeMode === 'dark' 
                                ? "border-white shadow-lg" 
                                : "border-white/10 hover:border-white/30"
                        )}
                    >
                        <div className="absolute inset-0 bg-black/80" />
                        <div className="relative flex justify-center items-center gap-2 h-full font-bold text-white text-xs uppercase">
                            <span>🌙</span> Cyber (Dark)
                        </div>
                    </button>
                    
                    <button
                        onClick={() => actions.setThemeMode('light')}
                        className={cn(
                            "group relative flex-1 border-2 rounded-xl h-16 overflow-hidden transition-all",
                            themeMode === 'light' 
                                ? "border-white shadow-lg ring-2 ring-white/20" 
                                : "border-white/10 hover:border-white/30"
                        )}
                    >
                        <div className="absolute inset-0 bg-white/80" />
                        <div className="relative flex justify-center items-center gap-2 h-full font-bold text-slate-900 text-xs uppercase">
                            <span>☀️</span> Frost (Light)
                        </div>
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <label className="font-bold text-[10px] text-gray-500 uppercase tracking-widest">Accent Theme</label>
                <div className="gap-4 grid grid-cols-3">
                    {(['neon', 'matrix', 'cyber'] as const).map((theme) => (
                         <div 
                           key={theme}
                           onClick={() => actions.setThemeAccent(theme)}
                           className={cn(
                             "relative border-2 rounded-xl h-20 overflow-hidden transition-all cursor-pointer",
                             themeAccent === theme ? "border-white shadow-xl scale-[1.02]" : "border-white/10 hover:border-white/30"
                           )}
                         >
                            <div className={cn(
                                "absolute inset-0 opacity-50",
                                theme === 'neon' ? "bg-gradient-to-br from-purple-500 to-blue-500" :
                                theme === 'matrix' ? "bg-gradient-to-br from-green-500 to-black" :
                                "bg-gradient-to-br from-pink-500 to-yellow-500"
                            )}/>
                            <div className="absolute inset-0 flex justify-center items-center shadow-black drop-shadow-md font-bold text-white text-xs uppercase">
                                {theme}
                            </div>
                         </div>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="font-bold text-[10px] text-gray-500 uppercase tracking-widest">Preferred Chart Style</label>
                <div className="flex gap-2 bg-black/40 p-1 border border-white/10 rounded-lg w-fit">
                    {(['candle', 'line', 'heikin'] as const).map(type => (
                         <button
                            key={type}
                            onClick={() => actions.setChartType(type)}
                            className={cn(
                                "px-4 py-2 rounded-md font-bold text-xs uppercase transition-all",
                                chartType === type 
                                    ? "bg-white/10 text-white"
                                    : "text-gray-500 hover:text-gray-300"
                            )}
                         >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

        </section>
    </div>
  );
}
