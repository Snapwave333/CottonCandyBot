export type Tier = 'SOLO' | 'CLUSTER' | 'SWARM';

export interface BotWallet {
  publicKey: string;
  label: string;
  balance: number;
  isPaper?: boolean;
  encryptedKey?: string;
  strategyId?: string; // Optional: ID involved in current strategy
}

export interface ClusterGroup {
  id: string;
  name: string;
  strategyId: string;
  wallets: BotWallet[];
}
