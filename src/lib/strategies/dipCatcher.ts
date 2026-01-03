import { StrategyInput, TradeSignal } from './types';

export const dipCatcher = (input: StrategyInput): TradeSignal => {
  const { marketData, config } = input;
  const { rsi, priceChange24h } = marketData;
  const targetAmount = config.amountInSol || 0.1;

  // Dip Catcher logic: RSI < 30 (Oversold) + significant daily drop
  if (rsi && rsi < 30 && priceChange24h < -10) {
    return {
      action: 'BUY',
      amount: targetAmount,
      reason: `Panic Dump Detected: RSI ${rsi.toFixed(2)} (Oversold), -${Math.abs(priceChange24h)}% 24h Change.`,
    };
  }

  return { action: 'HOLD', amount: 0, reason: 'Market is stable or not oversold enough.' };
};
