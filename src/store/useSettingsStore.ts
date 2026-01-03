import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SettingsState {
  // Network
  rpcUrl: string;
  rpcEndpoints: string[];
  activeRpcIndex: number;
  useBackupNodes: boolean;
  
  // Execution
  useJito: boolean;
  slippage: number; // Percentage
  priorityFee: 'eco' | 'standard' | 'turbo';
  
  // Alerts
  telegramToken: string;
  telegramChatId: string;
  telegramEnabled: boolean;
  discordWebhook: string;
  
  // Security
  autoLockTimer: number; // Minutes
  panicModeEnabled: boolean;
  autoSellDrawdown: boolean;
  autonomousManagementEnabled: boolean;
  performanceGuardEnabled: boolean;
  
  // Appearance
  themeAccent: 'neon' | 'matrix' | 'cyber';
  themeMode: 'dark' | 'light';
  chartType: 'candle' | 'line' | 'heikin';

  actions: {
    setRpcUrl: (url: string) => void;
    toggleBackupNodes: () => void;
    toggleJito: () => void;
    setSlippage: (val: number) => void;
    setPriorityFee: (level: 'eco' | 'standard' | 'turbo') => void;
    setTelegramToken: (token: string) => void;
    setTelegramChatId: (chatId: string) => void;
    toggleTelegram: () => void;
    setDiscordWebhook: (url: string) => void;
    setRpcEndpoints: (endpoints: string[]) => void;
    rotateRpc: () => void;
    setAutoLockTimer: (min: number) => void;
    togglePanicMode: () => void;
    toggleAutoSell: () => void;
    toggleAutonomousManagement: () => void;
    togglePerformanceGuard: () => void;
    setThemeAccent: (accent: 'neon' | 'matrix' | 'cyber') => void;
    setThemeMode: (mode: 'dark' | 'light') => void;
    setChartType: (type: 'candle' | 'line' | 'heikin') => void;
  }
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      rpcUrl: 'https://api.mainnet-beta.solana.com',
      rpcEndpoints: ['https://api.mainnet-beta.solana.com'],
      activeRpcIndex: 0,
      useBackupNodes: false,
      useJito: true,
      slippage: 1,
      priorityFee: 'standard',
      telegramToken: '',
      telegramChatId: '',
      telegramEnabled: false,
      discordWebhook: '',
      autoLockTimer: 15,
      panicModeEnabled: false,
      autoSellDrawdown: false,
      autonomousManagementEnabled: false,
      performanceGuardEnabled: true,
      themeAccent: 'neon',
      themeMode: 'dark',
      chartType: 'candle',

      actions: {
        setRpcUrl: (rpcUrl) => set({ rpcUrl }),
        toggleBackupNodes: () => set((state) => ({ useBackupNodes: !state.useBackupNodes })),
        toggleJito: () => set((state) => ({ useJito: !state.useJito })),
        setSlippage: (slippage) => set({ slippage }),
        setPriorityFee: (priorityFee) => set({ priorityFee }),
        setTelegramToken: (telegramToken) => set({ telegramToken }),
        setTelegramChatId: (telegramChatId) => set({ telegramChatId }),
        toggleTelegram: () => set((state) => ({ telegramEnabled: !state.telegramEnabled })),
        setDiscordWebhook: (discordWebhook) => set({ discordWebhook }),
        setRpcEndpoints: (rpcEndpoints) => set({ rpcEndpoints, activeRpcIndex: 0 }),
        rotateRpc: () => set((state) => {
            const nextIndex = (state.activeRpcIndex + 1) % state.rpcEndpoints.length;
            return { 
                activeRpcIndex: nextIndex,
                rpcUrl: state.rpcEndpoints[nextIndex]
            };
        }),
        setAutoLockTimer: (autoLockTimer) => set({ autoLockTimer }),
        togglePanicMode: () => set((state) => ({ panicModeEnabled: !state.panicModeEnabled })),
        toggleAutoSell: () => set((state) => ({ autoSellDrawdown: !state.autoSellDrawdown })),
        toggleAutonomousManagement: () => set((state) => ({ autonomousManagementEnabled: !state.autonomousManagementEnabled })),
        togglePerformanceGuard: () => set((state) => ({ performanceGuardEnabled: !state.performanceGuardEnabled })),
        setThemeAccent: (themeAccent) => set({ themeAccent }),
        setThemeMode: (themeMode) => {
            set({ themeMode });
            if (typeof document !== 'undefined') {
                if (themeMode === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
        },
        setChartType: (chartType) => set({ chartType }),
      }
    }),
    {
      name: 'cotton-settings-storage',
      partialize: (state) => Object.fromEntries(
        Object.entries(state).filter(([key]) => key !== 'actions')
      ),
    }
  )
);
