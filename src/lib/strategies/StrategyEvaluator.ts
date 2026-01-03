import { ActiveStrategy, StrategyType } from '@/types';
import { StrategyInput, TradeSignal } from './types';
import { sniper } from './sniper';
import { momentum } from './momentum';
import { dipCatcher } from './dipCatcher';
import { copyTrader } from './copyTrader';
import { accumulator } from './accumulator';

export class StrategyEvaluator {
  static evaluate(strategy: ActiveStrategy, input: StrategyInput): TradeSignal {
    switch (strategy.type) {
      case 'SNIPER':
        return sniper(input);
      case 'MOMENTUM':
        return momentum(input);
      case 'DIP_CATCHER':
        return dipCatcher(input);
      case 'COPYCAT':
        return copyTrader(input);
      case 'DCA':
        return accumulator(input);
      default:
        return { action: 'HOLD', amount: 0, reason: 'Unknown strategy type.' };
    }
  }
}
