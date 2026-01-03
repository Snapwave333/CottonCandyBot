import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ActiveStrategy, PortfolioPosition, StrategyLog, TradingMode, BurnerWallet } from '@/types';
import { io, Socket } from 'socket.io-client';
import { WalletFactory } from '@/lib/wallets/WalletFactory';
import { get, set, del } from 'idb-keyval';
import { exportLogsToCSV } from '@/lib/utils/CSVExport';
import { NotificationService } from '@/lib/utils/NotificationService';
import { useSettingsStore } from '@/store/useSettingsStore';
import { safeMath } from '@/lib/utils/safeMath';

interface TradingState {
  mode: TradingMode;
  botStatus: 'STOPPED' | 'RUNNING' | 'PAUSED';
  paperBalance: number;
  liveBalance: number;
  paperPositions: PortfolioPosition[];
  strategies: ActiveStrategy[];
  globalLogs: StrategyLog[];
  realizedPnL: number;
  unrealizedPnL: number;
  winRate: number;
  totalTrades: number;
  apiKey: string;
  botWallets: BurnerWallet[];
  _socket: Socket | null;
  swarmConfig: { autoSort: boolean };
  
  // Actions
  setApiKey: (key: string) => void;
  setMode: (mode: TradingMode) => Promise<void>;
  setBotStatus: (status: 'STOPPED' | 'RUNNING' | 'PAUSED') => Promise<void>;
  addLog: (message: string, type?: StrategyLog['type']) => void;
  setLiveBalance: (balance: number) => void;
  
  // Backend Sync Actions
  syncWithBackend: () => Promise<void>;
  executeTrade: (strategyId: string, action: 'BUY' | 'SELL', amount: number) => Promise<void>;
  organizeSwarm: () => void;
  initSocket: () => void;
  
  // Paper Trading Actions
  resetPaperBalance: () => void;
  executePaperTrade: (mint: string, side: 'BUY' | 'SELL', amount: number, price: number) => void;
  
  // QoL Actions
  exportHistory: () => void;
  rotateRpc: () => void;
  
  // Updated Actions with Password
  createSwarm: (count: number, sessionPassword: string) => Promise<void>;
  createSoloVault: (label: string, sessionPassword: string) => Promise<void>;
  createBotWallet: (sessionPassword: string) => Promise<void>;

  // Strategy Management
  addStrategy: (strategy: ActiveStrategy) => Promise<void>;
  updateStrategyStatus: (id: string, status: ActiveStrategy['status']) => Promise<void>;
  removeStrategy: (id: string) => Promise<void>;
  resetData: () => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3021';

export const useTradingStore = create<TradingState>()(
  persist(
    (set, get) => ({
      mode: 'PAPER',
      botStatus: 'STOPPED',
      paperBalance: 5,
      liveBalance: 0,
      realizedPnL: 0,
      unrealizedPnL: 0,
      winRate: 0,
      totalTrades: 0,
      paperPositions: [],
      strategies: [],
      globalLogs: [],
      botWallets: [],
      apiKey: 'dev_api_key_12345678901234567890123456789012',
      _socket: null as Socket | null,
      swarmConfig: { autoSort: true },

      setApiKey: (apiKey: string) => set({ apiKey }),

      addLog: (message: string, type: StrategyLog['type'] = 'INFO') => {
        set((state) => ({
          globalLogs: [{ timestamp: Date.now(), message, type }, ...state.globalLogs].slice(0, 100)
        }));
      },

      setMode: async (mode: TradingMode) => {
        set({ mode });
        const { apiKey } = get();
        try {
          await fetch(`${API_URL}/api/settings`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({ isPaperMode: mode === 'PAPER' })
          });
        } catch (e) {
          console.error('Failed to sync mode to backend:', e);
        }
      },

      setBotStatus: async (status) => {
        const state = get();
        const strategies = Array.isArray(state.strategies) ? state.strategies : [];
        const { apiKey, addLog } = state;
        
        if (status === 'RUNNING' && strategies.length === 0) {
          addLog('Cannot start bot: No strategies loaded.', 'ERROR');
          return;
        }

        set({ botStatus: status });
        
        // Sync all strategies to the same status
        const nextStrategyStatus = status === 'RUNNING' ? 'RUNNING' : 
                                 status === 'PAUSED' ? 'PAUSED' : 'STOPPED';
        
        const updatePromises = strategies.map(s => 
          fetch(`${API_URL}/api/strategies/${s.id}`, {
            method: 'PATCH',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}` 
            },
            body: JSON.stringify({ status: nextStrategyStatus })
          }).catch(e => console.error(`Failed to sync strategy ${s.id}:`, e))
        );

        await Promise.all(updatePromises);
        
        // Update local strategies state to reflect changes
        set((state) => ({
          strategies: (Array.isArray(state.strategies) ? state.strategies : []).map(s => ({ ...s, status: nextStrategyStatus }))
        }));

        const logMsg = status === 'RUNNING' ? 'Swarm RUNNING' : 
                       status === 'PAUSED' ? 'Swarm PAUSED' : 'Swarm STOPPED';
        const logType: StrategyLog['type'] = status === 'RUNNING' ? 'SUCCESS' : 'WARNING';
        addLog(logMsg, logType);
      },

      initSocket: () => {
          const { _socket, addLog, apiKey } = get();
          if (_socket) return;

          const socket = io(API_URL, {
              auth: { token: apiKey },
              transports: ['websocket'],
              reconnectionAttempts: 5
          });

          socket.on('connect', () => {
              addLog('🔌 Socket Connected to Neural Engine', 'SUCCESS');
          });

          socket.on('disconnect', () => {
              addLog('🔌 Socket Disconnected', 'WARNING');
          });

          socket.on('log', (log: StrategyLog) => {
             addLog(log.message, log.type);
          });

          socket.on('portfolio_update', (data: any) => {

              // Update paper balance and positions from backend
              if (data) {
                  set((state) => ({
                      paperBalance: data.paperValue || state.paperBalance,
                      realizedPnL: data.realizedPnL || 0,
                      unrealizedPnL: data.unrealizedPnL || 0,
                      winRate: data.winRate || 0,
                      totalTrades: data.totalTrades || 0,
                      // Ideally backend sends full positions. For now, we trust local state for positions 
                      // unless backend sends them deep in the future.
                      // Actually, let's allow backend to override if it sends 'positions'
                      paperPositions: data.positions || state.paperPositions 
                  }));
              }
                  // set({ paperBalance: data.totalValue }); 
                  // actually, let's keep local simulation authoritative for immediate feedback, 
                  // but update history if needed. 
                  // For this step, let's just log it to verify flow.
                  // console.log("Received portfolio update", data);
          });
          
          socket.on('strategy_update', (updatedStrategy: ActiveStrategy) => {
              set(state => ({
                  strategies: state.strategies.map(s => s.id === updatedStrategy.id ? updatedStrategy : s)
              }));
          });

          set({ _socket: socket });
      },

      syncWithBackend: async () => {
        const { apiKey } = get();
        get().initSocket(); // Ensure socket is init on sync

        try {
          // Fetch Alerts
          const alertsRes = await fetch(`${API_URL}/api/alerts`, {
             headers: { 'Authorization': `Bearer ${apiKey}` }
          });
          const settingsRes = await fetch(`${API_URL}/api/settings`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
          });
          const settings = await settingsRes.json();
          
          const walletsRes = await fetch(`${API_URL}/api/wallet`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
          });
          const wallets = await walletsRes.json();
          
          const strategiesRes = await fetch(`${API_URL}/api/strategies`, {
             headers: { 'Authorization': `Bearer ${apiKey}` }
          });
          const strategiesData = await strategiesRes.json();
          const strategies = Array.isArray(strategiesData) ? strategiesData : [];

          set({ 
            mode: settings.isPaperMode ? 'PAPER' : 'LIVE',
            paperBalance: settings.defaultPaperBalanceUSD,
            botWallets: Array.isArray(wallets) ? wallets : [],
            strategies: strategies
          });
        } catch (e) {
          console.error('Failed to sync with backend:', e);
        }
      },

      createSwarm: async (count: number, sessionPassword: string) => {
        const { botWallets, addLog } = get();
        const { maxWallets } = WalletFactory.getSafetyLimits();

        if (botWallets.length + count > maxWallets) {
          addLog(`Swarm Expansion Blocked: Max limit of ${maxWallets} wallets reached.`, 'WARNING');
          return;
        }

        addLog(`Initiating Swarm Deployment: Spawning ${count} Drone Wallets...`, 'INFO');
        const newDrones = await WalletFactory.spawn(count, 'SWARM_DRONE', sessionPassword);
        
        set((state) => ({ 
          botWallets: [...state.botWallets, ...newDrones] 
        }));

        addLog(`Swarm Deployment Complete: ${count} Wallets Online.`, 'SUCCESS');
      },

      createSoloVault: async (label: string, sessionPassword: string) => {
        const vault = await WalletFactory.createSoloVault(label, sessionPassword);
        set((state) => ({ botWallets: [...state.botWallets, vault] }));
        get().addLog(`Security Vault Created: ${vault.publicKey.slice(0, 8)}...`, 'SUCCESS');
      },

      executeTrade: async (strategyId, action, amount) => {
        const { mode, paperBalance, addLog } = get();
        
        if (mode === 'PAPER') {
          // Simulation logic
          const fee = 0.0005; // SOL gas fee
          const totalCost = amount + fee;

          if (paperBalance < totalCost && action === 'BUY') {
            addLog(`Trade Failed: Insufficient Paper Balance (${paperBalance.toFixed(4)} SOL).`, 'ERROR');
            return;
          }

          set((state) => ({
            paperBalance: action === 'BUY' ? state.paperBalance - totalCost : state.paperBalance + amount,
          }));

          addLog(`[PAPER] ${action} Order Executed: ${amount} SOL.`, 'SUCCESS');
          
          const settings = useSettingsStore.getState();
          if (settings.telegramEnabled && settings.telegramToken && settings.telegramChatId) {
            NotificationService.sendTelegram(
              settings.telegramToken,
              settings.telegramChatId,
              NotificationService.formatTradeAlert('PAPER', action, 'SOL', amount, 0)
            );
          }
        } else {
          // LIVE logic calling real backend
          const { apiKey } = get();
          addLog(`[LIVE] Requesting execution for ${action} ${amount} SOL...`, 'INFO');
          
          try {
             // We need a strategy reference. If strategyId is valid use it, otherwise use a default or first available 'MANUAL' strategy
             // For this iteration, we assume strategyId is valid.
             if(!strategyId) {
                throw new Error("Strategy ID required for live execution");
             }

             const res = await fetch(`${API_URL}/api/strategies/${strategyId}/trade`, {
               method: 'POST',
               headers: { 
                 'Content-Type': 'application/json', 
                 'Authorization': `Bearer ${apiKey}`
               },
               body: JSON.stringify({ action, amount, type: 'MANUAL' })
             });

             if (!res.ok) {
               const errorData = await res.json();
               throw new Error(errorData.error || "Execution rejected by backend");
             }
             
             const result = await res.json();
             addLog(`[LIVE] Trade Executed! Signature: ${result.signature?.slice(0,8)}...`, 'SUCCESS');

          } catch (e: any) {
             console.error("Live trade failed:", e);
             addLog(`[LIVE] Execution Failed: ${e.message}`, 'ERROR');
          }
        }
      },
      setLiveBalance: (balance: number) => set({ liveBalance: balance }),


      resetPaperBalance: () => set({ paperBalance: 100, paperPositions: [] }),

      executePaperTrade: (mint: string, side: 'BUY' | 'SELL', amount: number, price: number) => {
        // Simplified mock logic for now
        set((state) => {
          let newBalance = state.paperBalance;
          const newPositions = [...state.paperPositions];
          const existingPosIndex = newPositions.findIndex((p) => p.mint === mint);

          if (side === 'BUY') {
            const cost = safeMath.mul(amount, price);
            if (state.paperBalance >= cost) {
              newBalance = safeMath.sub(newBalance, cost);
              if (existingPosIndex >= 0) {
                const pos = newPositions[existingPosIndex];
                const currentVal = safeMath.mul(pos.amount, pos.averageEntryPrice);
                const totalVal = safeMath.add(currentVal, cost);
                const newAmount = safeMath.add(pos.amount, amount);
                newPositions[existingPosIndex] = {
                  ...pos,
                  amount: newAmount,
                  averageEntryPrice: safeMath.div(totalVal, newAmount),
                };
              } else {
                newPositions.push({
                  mint,
                  symbol: 'UNKNOWN',
                  amount,
                  averageEntryPrice: price,
                  currentPrice: price,
                  pnlPercent: 0,
                  valueUsdc: safeMath.mul(amount, price),
                });
              }
              const currentLogs = state.globalLogs || [];
              const newSuccessLog: StrategyLog = { timestamp: Date.now(), message: `Paper BUY: ${amount} @ $${price}`, type: 'SUCCESS' };
              return { paperBalance: newBalance, paperPositions: newPositions, globalLogs: [newSuccessLog, ...currentLogs] };
            } else {
               const currentLogs = state.globalLogs || [];
               const newErrorLog: StrategyLog = { timestamp: Date.now(), message: `Paper Trade Failed: Insufficient Balance`, type: 'ERROR' };
               return { globalLogs: [newErrorLog, ...currentLogs] };
            }
          } else {
            // SELL - simplistic logic
             if (existingPosIndex >= 0) {
                 const pos = newPositions[existingPosIndex];
                 const revenue = safeMath.mul(pos.amount, price);
                 newBalance = safeMath.add(newBalance, revenue);
                 newPositions.splice(existingPosIndex, 1);
                 
                 const currentLogs = state.globalLogs || [];
                 const newSuccessLog: StrategyLog = { timestamp: Date.now(), message: `Paper SELL: ${pos.amount} @ $${price}`, type: 'SUCCESS' };
                 return { paperBalance: newBalance, paperPositions: newPositions, globalLogs: [newSuccessLog, ...currentLogs] };
             }
             return { ...state };
          }
        });
      },

      addStrategy: async (strategy: ActiveStrategy) => {
        const { apiKey } = get();
        // Optimistic update
        set((state) => ({ strategies: [...(Array.isArray(state.strategies) ? state.strategies : []), strategy] }));
        
        try {
           const res = await fetch(`${API_URL}/api/strategies`, {
             method: 'POST',
             headers: { 
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${apiKey}` 
             },
             body: JSON.stringify(strategy)
           });
           if (!res.ok) {
             throw new Error(`Backend rejected strategy: ${res.status} ${res.statusText}`);
           }
        } catch (e) {
          console.error('Failed to add strategy to backend:', e);
          set((state) => ({ strategies: (Array.isArray(state.strategies) ? state.strategies : []).filter((s) => s.id !== strategy.id) }));
        }
      },
      
      updateStrategyStatus: async (id: string, status: ActiveStrategy['status']) => {
        const originalStrategies = get().strategies;
        set((state) => ({
          strategies: (Array.isArray(state.strategies) ? state.strategies : []).map((s) => s.id === id ? { ...s, status } : s)
        }));
        
        const { apiKey } = get();
        try {
           const res = await fetch(`${API_URL}/api/strategies/${id}`, {
             method: 'PATCH',
             headers: { 
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${apiKey}` 
             },
             body: JSON.stringify({ status })
           });

           if (!res.ok) {
             throw new Error(`Failed to update status: ${res.status}`);
           }
        } catch (e) {
           console.error('Failed to update strategy status:', e);
           set({ strategies: originalStrategies });
        }
      },

      removeStrategy: async (id: string) => {
        const originalStrategies = get().strategies;
        set((state) => ({
          strategies: (Array.isArray(state.strategies) ? state.strategies : []).filter((s) => s.id !== id)
        }));

        const { apiKey } = get();
        try {
           const res = await fetch(`${API_URL}/api/strategies/${id}`, {
             method: 'DELETE',
             headers: { 'Authorization': `Bearer ${apiKey}` }
          });
           
           if (!res.ok) {
             throw new Error(`Failed to delete strategy: ${res.status}`);
           }
        } catch (e) {
           console.error('Failed to delete strategy:', e);
           set({ strategies: originalStrategies });
        }
      },

      createBotWallet: async (sessionPassword: string) => {
        await get().createSwarm(1, sessionPassword);
      },

      organizeSwarm: () => {
        get().addLog('Network topology reorganized.', 'INFO');
        get().syncWithBackend();
      },

      rotateRpc: () => {
        useSettingsStore.getState().actions.rotateRpc();
        get().addLog('RPC Endpoint Rotated.', 'INFO');
      },

      resetData: async () => {
        const { apiKey, syncWithBackend, addLog } = get();
        try {
          const res = await fetch(`${API_URL}/api/settings/reset`, {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${apiKey}` 
            }
          });
          
          if (!res.ok) {
            throw new Error(`Reset failed: ${res.statusText}`);
          }
          
          addLog('System Reset Successful', 'SUCCESS');
          await syncWithBackend();
        } catch (e: any) {
          console.error('Failed to reset data:', e);
          addLog(`Reset Failed: ${e.message}`, 'ERROR');
        }
      },
      exportHistory: () => {
        const { globalLogs } = get();
        exportLogsToCSV(globalLogs);
      },
    }),
    {
      name: 'cotton-candy-store-v2',
      storage: {
        getItem: async (name) => {
          const value = await get(name);
          return value || null;
        },
        setItem: async (name, value) => {
          await set(name, value);
        },
        removeItem: async (name) => {
          await del(name);
        },
      },
      partialize: (state) => ({ 
        mode: state.mode, 
        paperBalance: state.paperBalance, 
        paperPositions: state.paperPositions,
        strategies: state.strategies,
        apiKey: state.apiKey,
        botWallets: state.botWallets,
      }) as any,
    }
  )
);
