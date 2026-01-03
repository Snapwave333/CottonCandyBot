import React, { useState } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { TechInput } from '../ui/tech-input';
import { CyberSwitch } from '../ui/cyber-switch';
import { Wifi, Activity, Plus, Trash2, RefreshCcw } from 'lucide-react';

export function NetworkSettings() {
  const { rpcUrl, rpcEndpoints, activeRpcIndex, useBackupNodes, actions } = useSettingsStore();
  const [latency, setLatency] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [newRpc, setNewRpc] = useState('');

  const handlePing = () => {
    setIsPinging(true);
    // Mock Ping for current RPC
    setTimeout(() => {
        setLatency(Math.floor(Math.random() * 40) + 10); // 10-50ms
        setIsPinging(false);
    }, 800);
  };

  const addRpc = () => {
    if (newRpc && !rpcEndpoints.includes(newRpc)) {
        actions.setRpcEndpoints([...rpcEndpoints, newRpc]);
        setNewRpc('');
    }
  };

  const removeRpc = (index: number) => {
    if (rpcEndpoints.length > 1) {
        const updated = rpcEndpoints.filter((_, i) => i !== index);
        actions.setRpcEndpoints(updated);
    }
  };

  return (
    <div className="slide-in-from-right-4 space-y-8 animate-in duration-500 fade-in">
        <div>
            <h2 className="mb-2 font-bold text-white text-2xl">Network Configuration</h2>
            <p className="text-gray-400 text-sm">Manage RPC endpoints and connection resiliency.</p>
        </div>

        <div className="space-y-6">
            <div className="space-y-4">
                <label className="block font-medium text-gray-300 text-sm">RPC Endpoints Priority List</label>
                <div className="space-y-2">
                    {rpcEndpoints.map((url, idx) => (
                        <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg border ${idx === activeRpcIndex ? 'bg-[var(--cotton-blue)]/10 border-[var(--cotton-blue)]/30' : 'bg-white/5 border-white/10'}`}>
                            <div className="flex-1 px-2 font-mono text-white text-sm truncate">
                                {url}
                                {idx === activeRpcIndex && <span className="ml-2 font-bold text-[10px] text-[var(--cotton-blue)] uppercase tracking-wider">Active</span>}
                            </div>
                            <button 
                                onClick={() => removeRpc(idx)}
                                disabled={rpcEndpoints.length <= 1}
                                className="disabled:opacity-30 p-2 text-gray-400 hover:text-red-400 transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2">
                    <div className="flex-1">
                        <TechInput 
                            value={newRpc}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRpc(e.target.value)}
                            placeholder="https://new-rpc-endpoint.com"
                            label=""
                        />
                    </div>
                    <button 
                        onClick={addRpc}
                        className="flex justify-center items-center bg-white/5 hover:bg-white/10 p-3 border border-white/10 rounded-lg h-[46px] transition-colors"
                    >
                        <Plus size={20} className="text-[var(--cotton-blue)]" />
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center bg-white/5 p-4 border border-white/10 rounded-xl">
                <div className="flex flex-col">
                    <span className="font-bold text-gray-400 text-xs uppercase tracking-widest">Resiliency</span>
                    <span className="text-white text-sm">Enable Backup Node Failover</span>
                </div>
                <CyberSwitch 
                    checked={useBackupNodes}
                    onCheckedChange={actions.toggleBackupNodes}
                />
            </div>

            <div className="flex gap-2">
                <button 
                  onClick={handlePing}
                  disabled={isPinging}
                  className="flex flex-1 justify-center items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-3 border border-white/10 rounded-lg transition-colors"
                >
                    {isPinging ? (
                        <Activity size={16} className="text-[var(--cotton-blue)] animate-spin" />
                    ) : (
                        <Wifi size={16} className={latency && latency < 50 ? "text-green-400" : "text-gray-400"} />
                    )}
                    <span className={latency && latency < 50 ? "text-green-400 font-mono text-sm" : "text-gray-400 text-sm"}>
                        {latency ? `Ping: ${latency}ms` : 'Test Connection'}
                    </span>
                </button>

                <button 
                    onClick={() => actions.rotateRpc()}
                    className="flex justify-center items-center bg-white/5 hover:bg-white/10 p-3 px-4 border border-white/10 rounded-lg transition-colors"
                    title="Rotate to next RPC"
                >
                    <RefreshCcw size={16} className="text-gray-400" />
                </button>
            </div>
            
            <div className="bg-yellow-500/5 mt-4 p-4 border border-yellow-500/10 rounded-xl">
                <p className="text-yellow-500/80 text-xs">
                    <span className="font-bold">Note:</span> High-frequency trading requires a premium RPC. Using public nodes may result in rate limits. The bot will automatically rotate through the list if the current endpoint fails.
                </p>
            </div>
        </div>
    </div>
  );
}
