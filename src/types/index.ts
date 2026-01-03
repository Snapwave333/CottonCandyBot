export type TradingMode = 'PAPER' | 'LIVE';

export type StrategyType = 'SNIPER' | 'DCA' | 'DIP_CATCHER' | 'MOMENTUM' | 'COPYCAT' | 'CUSTOM' | 'TOP_200';

export interface LogicBlock {
  trigger: string;
  condition: 'GT' | 'LT' | 'EQ';
  value: number;
  action: 'BUY' | 'SELL';
  amount?: number;
}

export interface StrategyConfig {
  targetToken: string;
  amountInSol: number;
  intervalSeconds?: number; // DCA
  dipThresholdPercent?: number; // Dip Catcher
  targetWallet?: string; // Copycat
  customLogic?: LogicBlock[]; // Custom
  stopLossPercent?: number;
  takeProfitPercent?: number;
}

export interface ActiveStrategy {
  id: string;
  type: StrategyType;
  config: StrategyConfig;
  status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'STOPPED';
  logs: StrategyLog[];
  createdAt: number;
}

export interface StrategyLog {
  timestamp: number;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARNING';
}

export interface TokenMetadata {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  priceUsdc?: number;
  isDanger?: boolean; // RugCheck
}

export interface PortfolioPosition {
  mint: string;
  symbol: string;
  amount: number;
  averageEntryPrice: number;
  currentPrice: number;
  pnlPercent: number;
  valueUsdc: number;
}

export type WalletType = 'MAIN' | 'SOLO' | 'CLUSTER_NODE' | 'SWARM_DRONE';

export interface BurnerWallet {
  publicKey: string;
  encryptedKey?: string;
  label: string;
  type: WalletType;
  clusterId?: string;
  balance: number; // In lamports (real) or USD (paper)
  isPaper: boolean;
}

export interface WalletCluster {
  id: string;
  name: string;
  color: string; // Hex code (Neon Pink, Cyan, Purple)
  walletIds: string[];
}

