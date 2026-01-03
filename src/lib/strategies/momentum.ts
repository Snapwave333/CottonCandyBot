import { StrategyInput, TradeSignal } from './types';

export const momentum = (input: StrategyInput): TradeSignal => {
  const { marketData, config } = input;
  const { priceChange24h, volume24h } = marketData;
  const targetAmount = config.amountInSol || 0.1;

  // Simple momentum: Price up > 5% in 24h + high volume (mock threshold)
  if (priceChange24h > 5 && volume24h > 100000) {
    return {
      action: 'BUY',
      amount: targetAmount,
      reason: `Momentum Detected: +${priceChange24h}% 24h Change, $${volume24h} Volume.`,
    };
  }

  return { action: 'HOLD', amount: 0, reason: 'No significant momentum detected.' };
};
