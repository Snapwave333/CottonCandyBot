import { cn } from "@/lib/utils";
import { 
  Network, 
  Zap, 
  Bell, 
  ShieldAlert, 
  Palette, 
  Cpu, 
  Activity 
} from "lucide-react";

interface SidebarNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: 'network', label: 'Network', icon: Network },
  { id: 'execution', label: 'Execution', icon: Zap },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'security', label: 'Security', icon: ShieldAlert },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

export function SidebarNav({ activeTab, onTabChange }: SidebarNavProps) {
  return (
    <div className="flex flex-col bg-black/20 backdrop-blur-md border border-white/5 rounded-2xl h-full overflow-hidden">
        {/* Nav Items */}
        <div className="flex-1 space-y-1 py-4">
            {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            "relative flex items-center gap-3 px-6 py-4 border-l-2 w-full font-medium text-sm transition-all",
                            isActive 
                              ? "border-[var(--cotton-blue)] bg-[var(--cotton-blue)]/10 text-[var(--cotton-blue)]" 
                              : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                        {isActive && (
                            <div className="right-4 absolute bg-[var(--cotton-blue)] shadow-[0_0_10px_var(--cotton-blue)] rounded-full w-1.5 h-1.5" />
                        )}
                    </button>
                )
            })}
        </div>

        {/* System Health Widget */}
        <div className="p-4 border-white/5 border-t">
            <div className="space-y-3 bg-black/40 p-4 border border-white/5 rounded-xl">
                <div className="flex items-center gap-2 mb-1 text-[10px] text-gray-400 uppercase tracking-widest">
                    <Activity size={12} className="text-green-500" />
                    System Vitality
                </div>
                
                <div className="space-y-1">
                    <div className="flex justify-between text-gray-400 text-xs">
                        <span>CPU Load</span>
                        <span className="font-mono text-green-400">12%</span>
                    </div>
                    <div className="bg-white/10 rounded-full w-full h-1 overflow-hidden">
                        <div className="bg-green-500/50 w-[12%] h-full" />
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between text-gray-400 text-xs">
                        <span>Memory</span>
                        <span className="font-mono text-[var(--cotton-blue)]">400MB</span>
                    </div>
                    <div className="bg-white/10 rounded-full w-full h-1 overflow-hidden">
                        <div className="bg-[var(--cotton-blue)]/50 w-[35%] h-full" />
                    </div>
                </div>

                <div className="flex justify-between items-center mt-2 pt-2 border-white/5 border-t">
                    <span className="text-[10px] text-gray-500">Uptime</span>
                    <span className="font-mono text-[10px] text-white">4d 2h 15m</span>
                </div>
            </div>
        </div>
    </div>
  );
}
