import { StrategyInput, TradeSignal } from './types';

export const accumulator = (input: StrategyInput): TradeSignal => {
  const { config } = input;
  const interval = config.intervalSeconds || 3600;
  const amount = config.amountInSol || 0.01;

  // Simple time-based accumulator logic
  return {
    action: 'BUY',
    amount: amount,
    reason: `Accumulating: Buying ${amount} SOL worth every ${interval}s.`
  };
};
