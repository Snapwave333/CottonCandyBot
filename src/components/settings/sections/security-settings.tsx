import { useState } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { TechInput } from '../ui/tech-input';
import { CyberSwitch } from '../ui/cyber-switch';
import { Lock, Eye, EyeOff } from 'lucide-react';

export function SecuritySettings() {
  const { autoLockTimer, panicModeEnabled, actions } = useSettingsStore();
  const [showBurnerKeys, setShowBurnerKeys] = useState(false);
  const [password, setPassword] = useState('');

  return (
    <div className="slide-in-from-right-4 space-y-8 animate-in duration-500 fade-in">
        <div>
            <h2 className="mb-2 font-bold text-white text-2xl">Security Protocols</h2>
            <p className="text-gray-400 text-sm">Access control and emergency fail-safes.</p>
        </div>

        <section className="space-y-6">
            <div className="flex items-center gap-4">
                <TechInput 
                    type="number"
                    label="Auto-Lock Timer (Minutes)"
                    value={autoLockTimer}
                    onChange={(e) => actions.setAutoLockTimer(parseInt(e.target.value))}
                    saved={true}
                />
            </div>

            <CyberSwitch 
                label="MASTER KILL SWITCH (Auto-Sell on 20% Drawdown)"
                checked={panicModeEnabled}
                onCheckedChange={actions.togglePanicMode}
            />

            {/* Burner Wallet Export Area */}
            <div className="relative bg-red-500/5 p-6 border border-red-500/20 rounded-xl overflow-hidden">
                <div className="top-0 right-0 absolute opacity-10 p-2">
                    <Lock size={60} className="text-red-500" />
                </div>
                
                <h3 className="flex items-center gap-2 mb-4 font-bold text-red-400">
                    <Lock size={16} /> Restricted Area: Private Keys
                </h3>

                {!showBurnerKeys ? (
                    <div className="space-y-4">
                        <TechInput 
                            type="password"
                            placeholder="Enter Session Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button 
                             onClick={() => setShowBurnerKeys(true)}
                             className="bg-red-500/10 hover:bg-red-500/20 py-2 border border-red-500/30 rounded-lg w-full font-bold text-red-400 text-xs uppercase transition-colors"
                        >
                            Reveal Keys
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-black/80 p-4 border border-red-500/20 rounded-lg font-mono text-[10px] text-gray-400 break-all">
                            [ENCRYPTED_KEY_DATA_DISPLAYED_HERE]
                        </div>
                        <button 
                             onClick={() => setShowBurnerKeys(false)}
                             className="text-gray-500 hover:text-white text-xs"
                        >
                            Hide Sensitive Data
                        </button>
                    </div>
                )}
            </div>
        </section>
    </div>
  );
}
