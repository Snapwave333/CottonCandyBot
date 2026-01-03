import { useRef, useEffect } from 'react';
import { useTradingStore } from '@/store/useTradingStore';
import { useTickerStore } from '@/store/useTickerStore';
import { useHybridTicker } from './useHybridTicker';

export function useTradingEngine() {
  const { botStatus, strategies, mode, paperBalance, addLog, executeTrade } = useTradingStore();
  
  // Initialize data fetching (keeps TickerStore updated)
  useHybridTicker(); 
  
  const workerRef = useRef<Worker | null>(null);

  // 1. Initialize Worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('../lib/workers/trading.worker.ts', import.meta.url));

    workerRef.current.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'LOG') {
        addLog(payload.message, payload.logType);
      } else if (type === 'TRADE_SIGNAL') {
        addLog(`[WORKER] Signal: ${payload.action} ${payload.tokenSymbol} (${payload.reason})`, 'INFO');
        // Execute Trade via Store
        executeTrade(payload.strategyId, payload.action, payload.amount); 
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // 2. Sync State to Worker
  useEffect(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'UPDATE_STATE',
        payload: { botStatus, strategies, mode, paperBalance }
      });
      
      if (botStatus === 'RUNNING') {
        workerRef.current.postMessage({ type: 'START' });
      } else {
        workerRef.current.postMessage({ type: 'STOP' });
      }
    }
  }, [botStatus, strategies, mode, paperBalance]);

  // 3. Sync Ticker Data to Worker (Transient Subscription)
  useEffect(() => {
    const unsub = useTickerStore.subscribe(
      (state) => state.tickerData,
      (tickerData) => {
        if (workerRef.current && tickerData.length > 0) {
          workerRef.current.postMessage({
            type: 'UPDATE_STATE',
            payload: { tickerData }
          });
        }
      }
    );
    return () => unsub();
  }, []);

  return null;
}
