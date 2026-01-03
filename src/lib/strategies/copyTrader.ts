import { StrategyInput, TradeSignal } from './types';

export const copyTrader = (input: StrategyInput): TradeSignal => {
  const { config } = input;
  const targetWallet = config.targetWallet;

  if (!targetWallet) {
    return { action: 'HOLD', amount: 0, reason: 'No target wallet set for Copycat.' };
  }

  // This would typically involve a websocket listener for the target wallet.
  // For now, we stub the logic.
  return { 
    action: 'HOLD', 
    amount: 0, 
    reason: `Monitoring ${targetWallet.slice(0, 4)}......${targetWallet.slice(-4)} for copy opportunities.` 
  };
};
