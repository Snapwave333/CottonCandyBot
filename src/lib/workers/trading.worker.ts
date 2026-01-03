import { StrategyEvaluator } from '@/lib/strategies/StrategyEvaluator';
import { sanitizeSymbol, SECURITY_CONFIG } from '@/lib/security/securityConfig';

// Define Worker Context
const ctx: Worker = self as any;

let intervalId: NodeJS.Timeout | null = null;
let state = {
  botStatus: 'STOPPED',
  strategies: [],
  tickerData: [] as any[],
  paperBalance: 0,
  mode: 'PAPER',
};

ctx.onmessage = (e) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'UPDATE_STATE':
      state = { ...state, ...payload };
      break;
      
    case 'START':
     if (intervalId) clearInterval(intervalId);
     intervalId = setInterval(runTradingLoop, 5000);
     ctx.postMessage({ type: 'LOG', payload: { message: 'Worker: Trading Loop Started', logType: 'INFO' } });
     break;

    case 'STOP':
      if (intervalId) clearInterval(intervalId);
      intervalId = null;
      ctx.postMessage({ type: 'LOG', payload: { message: 'Worker: Trading Loop Stopped', logType: 'INFO' } });
      break;
  }
};

function runTradingLoop() {
  if (state.botStatus !== 'RUNNING') return;
  if (SECURITY_CONFIG.EMERGENCY_HALT) return;
  if (!state.tickerData || state.tickerData.length === 0) return;

  state.strategies.forEach((strategy: any) => {
    if (strategy.status !== 'RUNNING') return;

    // 1. Sanitization
    const safeSymbol = sanitizeSymbol(strategy.config.targetToken || '');
    const token = state.tickerData.find((t: any) => sanitizeSymbol(t.symbol) === safeSymbol) || state.tickerData[0];
    
    // 2. Prepare Input
    const input = {
        marketData: {
          ...(token as any || {}),
          priceChange24h: (token as any).change24h || 0,
          volume24h: 50000, 
          liquidity: 10000,
          poolAgeMinutes: 10,
          mintAuthDisabled: true,
          rsi: 50,
        },
        portfolio: {
          balance: state.paperBalance,
          holdings: [],
        },
        config: strategy.config,
    };

    // 3. Evaluate
    try {
        const signal = StrategyEvaluator.evaluate(strategy, input as any);

        if (signal.action !== 'HOLD') {
            ctx.postMessage({ 
                type: 'TRADE_SIGNAL', 
                payload: { 
                    strategyId: strategy.id, 
                    action: signal.action, 
                    amount: signal.amount,
                    reason: signal.reason,
                    tokenSymbol: token.symbol
                } 
            });
        }
    } catch (err: any) {
        ctx.postMessage({ type: 'LOG', payload: { message: `Worker Error: ${err.message}`, logType: 'ERROR' } });
    }
  });
}
