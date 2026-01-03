import { BurnerWallet, TokenMetadata } from '@/types';

export interface StrategyInput {
  marketData: TokenMetadata & { 
    priceChange24h: number;
    volume24h: number;
    liquidity: number;
    poolAgeMinutes: number;
    mintAuthDisabled: boolean;
    rsi?: number;
  };
  portfolio: {
    balance: number;
    holdings: any[];
  };
  config: any;
}

export interface TradeSignal {
  action: 'BUY' | 'SELL' | 'HOLD';
  amount: number;
  reason: string;
}
