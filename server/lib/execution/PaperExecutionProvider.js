import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getDb } from '../db.js';

export class PaperExecutionProvider {
  constructor(io) {
    this.io = io;
  }

  async executeTrade(strategy, quote, jupiterQuoteApi = 'https://quote-api.jup.ag/v6/quote') {
    const db = await getDb();
    const { targetToken, amountInSol } = strategy.config;
    const DEFAULT_SLIPPAGE_BPS = 50;

    // Fetch quote if not provided
    let jupiterQuote = quote;
    if (!jupiterQuote) {
      jupiterQuote = await this.getJupiterQuote(
        'So11111111111111111111111111111111111111112',
        targetToken,
        amountInSol * LAMPORTS_PER_SOL,
        DEFAULT_SLIPPAGE_BPS,
        jupiterQuoteApi
      );
    }

    if (!jupiterQuote) {
      const errorLog = {
        timestamp: Date.now(),
        message: `[PAPER] Failed to get Jupiter quote for ${targetToken}`,
        type: 'ERROR'
      };
      strategy.logs.push(errorLog);
      this.io.emit('strategy_log', { strategyId: strategy.id, log: errorLog });
      await db.write();
      return { success: false, error: 'Quote failed' };
    }

    const tokenAmount = Number.parseInt(jupiterQuote.outAmount) / Math.pow(10, jupiterQuote.outputMint.decimals || 6);
    const effectivePrice = amountInSol / tokenAmount;

    const log = {
      timestamp: Date.now(),
      message: `[PAPER] Executed ${strategy.type}: Bought ${tokenAmount.toFixed(2)} tokens for ${amountInSol} SOL at ${effectivePrice.toFixed(8)} SOL/token`,
      type: 'SUCCESS'
    };

    strategy.logs.push(log);
    this.io.emit('strategy_log', { strategyId: strategy.id, log });

    if (strategy.type === 'SNIPER') {
      strategy.status = 'IDLE';
    }

    await db.write();
    return { success: true, signature: 'paper_sim_' + Math.random().toString(36).slice(2), quote: jupiterQuote };
  }

  async getJupiterQuote(inputMint, outputMint, amount, slippageBps, apiEndpoint) {
    try {
      const params = new URLSearchParams({
        inputMint,
        outputMint,
        amount: amount.toString(),
        slippageBps: slippageBps.toString()
      });

      const response = await fetch(`${apiEndpoint}?${params}`);
      if (!response.ok) {
        throw new Error(`Jupiter quote API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      this.io.emit('error', { message: `Jupiter quote failed: ${error.message}` });
      return null;
    }
  }
}
