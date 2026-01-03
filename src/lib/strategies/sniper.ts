import { StrategyInput, TradeSignal } from './types';

export const sniper = (input: StrategyInput): TradeSignal => {
  const { marketData, config } = input;
  const { liquidity, poolAgeMinutes, mintAuthDisabled } = marketData;
  const targetAmount = config.amountInSol || 0.1;

  if (poolAgeMinutes < 5 && liquidity > 5000 && mintAuthDisabled) {
    return {
      action: 'BUY',
      amount: targetAmount,
      reason: `New Pool Detected: ${poolAgeMinutes}m old, $${liquidity} Liquidity.`,
    };
  }

  return { action: 'HOLD', amount: 0, reason: 'Conditions not met for Sniper Strike.' };
};
