import { VersionedTransaction, LAMPORTS_PER_SOL, Keypair, TransactionMessage } from '@solana/web3.js';
import { getDb } from '../db.js';
import { decrypt } from '../crypto.js';
import { createJitoTipInstruction, JITO_ENDPOINTS } from '../jito.js';
import bs58 from 'bs58';

export class RealExecutionProvider {
  constructor(connection, io) {
    this.connection = connection;
    this.io = io;
    this.JUPITER_QUOTE_API = 'https://quote-api.jup.ag/v6/quote';
    this.JUPITER_SWAP_API = 'https://quote-api.jup.ag/v6/swap';
    this.DEFAULT_SLIPPAGE_BPS = 50;
  }

  async getTipAmount() {
    const db = await getDb();
    const priority = db.data.settings.priorityFee || 'standard';
    switch (priority) {
      case 'eco': return 1000;
      case 'turbo': return 100000;
      case 'standard':
      default: return 10000;
    }
  }

  async retryWithBackoff(fn, retries = 3, baseDelay = 500) {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === retries - 1) throw error;
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async executeTrade(strategy, quote) {
    const db = await getDb();

    try {
      const wallet = db.data.wallets.find(w => w.publicKey === strategy.walletPublicKey);
      if (!wallet) {
        throw new Error('Wallet not found for strategy');
      }

      const privateKeyHex = decrypt(wallet.encryptedKey, process.env.SECRET_KEY);
      const keypair = Keypair.fromSecretKey(Buffer.from(privateKeyHex, 'hex'));

      const { targetToken, amountInSol } = strategy.config;
      const inputMint = 'So11111111111111111111111111111111111111112';

      let jupiterQuote = quote;

      if (!jupiterQuote) {
        // Retry quote fetching
        jupiterQuote = await this.retryWithBackoff(() => 
          this.getJupiterQuote(
            inputMint,
            targetToken,
            amountInSol * LAMPORTS_PER_SOL
          ), 3, 300);
      }

      if (!jupiterQuote) {
        throw new Error('Failed to get Jupiter quote after retries');
      }

      // Retry swap transaction generation
      const swapTransaction = await this.retryWithBackoff(async () => {
         const swapResponse = await fetch(this.JUPITER_SWAP_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              quoteResponse: jupiterQuote,
              userPublicKey: keypair.publicKey.toString(),
              wrapAndUnwrapSol: true,
              dynamicComputeUnitLimit: true,
              prioritizationFeeLamports: 'auto'
            })
          });

          if (!swapResponse.ok) {
            throw new Error(`Jupiter swap API error: ${swapResponse.status}`);
          }
          
          const { swapTransaction } = await swapResponse.json();
          return swapTransaction;
      }, 3, 300);


      const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

      transaction.sign([keypair]);

      const tipAmount = await this.getTipAmount();
      const jitoTipIx = createJitoTipInstruction(keypair.publicKey, tipAmount);

      const bundleResult = await this.submitJitoBundle([transaction], jitoTipIx, keypair);

      if (!bundleResult.success) {
        throw new Error(`Jito bundle failed: ${bundleResult.error}`);
      }

      const successLog = {
        timestamp: Date.now(),
        message: `[LIVE] Trade executed successfully. Bundle ID: ${bundleResult.bundleId}`,
        type: 'SUCCESS'
      };

      strategy.logs.push(successLog);
      this.io.emit('strategy_log', { strategyId: strategy.id, log: successLog });

      if (strategy.type === 'SNIPER') {
        strategy.status = 'IDLE';
      }

      await db.write();

      return {
        success: true,
        bundleId: bundleResult.bundleId,
        signature: bundleResult.signature,
        outAmount: jupiterQuote.outAmount
      };

    } catch (error) {
      const errorLog = {
        timestamp: Date.now(),
        message: `[LIVE] Execution failed: ${error.message}`,
        type: 'ERROR'
      };

      strategy.logs.push(errorLog);
      this.io.emit('strategy_log', { strategyId: strategy.id, log: errorLog });

      await db.write();

      return { success: false, error: error.message };
    }
  }

  async executeSell(strategy, position) {
    const db = await getDb();
    
    try {
        const wallet = db.data.wallets.find(w => w.publicKey === strategy.walletPublicKey);
        if (!wallet) throw new Error('Wallet not found for strategy');

        const privateKeyHex = decrypt(wallet.encryptedKey, process.env.SECRET_KEY);
        const keypair = Keypair.fromSecretKey(Buffer.from(privateKeyHex, 'hex'));

        const inputMint = strategy.config.targetToken;
        const outputMint = 'So11111111111111111111111111111111111111112'; // SOL
        const amount = position.tokenAmount; // Raw integer amount from original quote

        if (!amount || amount <= 0) {
            throw new Error('Invalid token amount for sell');
        }

        // Fetch Quote for Sell
        const jupiterQuote = await this.retryWithBackoff(() => 
            this.getJupiterQuote(inputMint, outputMint, amount, strategy.config.slippage * 100), 3, 300
        );

        if (!jupiterQuote) throw new Error('Failed to get Jupiter SELL quote');

        // Execute Swap
        const swapTransaction = await this.retryWithBackoff(async () => {
            const swapResponse = await fetch(this.JUPITER_SWAP_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quoteResponse: jupiterQuote,
                userPublicKey: keypair.publicKey.toString(),
                wrapAndUnwrapSol: true,
                dynamicComputeUnitLimit: true,
                prioritizationFeeLamports: 'auto'
            })
            });

            if (!swapResponse.ok) throw new Error(`Jupiter swap API error: ${swapResponse.status}`);
            const { swapTransaction } = await swapResponse.json();
            return swapTransaction;
        }, 3, 300);

        const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
        const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
        transaction.sign([keypair]);

        const tipAmount = await this.getTipAmount();
        const jitoTipIx = createJitoTipInstruction(keypair.publicKey, tipAmount);

        const bundleResult = await this.submitJitoBundle([transaction], jitoTipIx, keypair);

        if (!bundleResult.success) throw new Error(`Jito SELL bundle failed: ${bundleResult.error}`);

        const successLog = {
            timestamp: Date.now(),
            message: `[LIVE] 💰 SELL EXECUTED. Bundle: ${bundleResult.bundleId}`,
            type: 'SUCCESS'
        };
        this.io.emit('strategy_log', { strategyId: strategy.id, log: successLog });
        return { success: true, signature: bundleResult.signature };

    } catch (error) {
         const errorLog = {
            timestamp: Date.now(),
            message: `[LIVE] SELL FAILED: ${error.message}`,
            type: 'ERROR'
        };
        this.io.emit('strategy_log', { strategyId: strategy.id, log: errorLog });
        return { success: false, error: error.message };
    }
  }

  async getJupiterQuote(inputMint, outputMint, amount, slippageBps = this.DEFAULT_SLIPPAGE_BPS) {
    try {
      const params = new URLSearchParams({
        inputMint,
        outputMint,
        amount: amount.toString(),
        slippageBps: slippageBps.toString()
      });

      const response = await fetch(`${this.JUPITER_QUOTE_API}?${params}`);
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Jupiter quote API error: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
       // Let the retry handler manage the loop, just propagate or log
       // If we catch here and return null, retry loop needs to check for null. 
       // Better to throw so retry loop catches.
      console.warn(`[Jupiter] Quote fetch warning: ${error.message}`);
      throw error;
    }
  }

  async submitJitoBundle(transactions, tipInstruction, keypair) {
    try {
      // VersionedTransaction cannot use .add(). We must compile it properly.
      const blockhash = (await this.connection.getLatestBlockhash('confirmed')).blockhash;
      const messageV0 = new TransactionMessage({
        payerKey: keypair.publicKey,
        recentBlockhash: blockhash,
        instructions: [tipInstruction],
      }).compileToV0Message();

      const tipTransaction = new VersionedTransaction(messageV0);
      tipTransaction.sign([keypair]);

      const serializedTransactions = [
        ...transactions.map(tx => bs58.encode(tx.serialize())),
        bs58.encode(tipTransaction.serialize())
      ];

      const endpoint = JITO_ENDPOINTS.mainnet;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'sendBundle',
          params: [serializedTransactions]
        })
      });

      if (!response.ok) {
        throw new Error(`Jito bundle submission failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`Jito error: ${data.error.message}`);
      }

      return {
        success: true,
        bundleId: data.result,
        signature: transactions[0].signatures[0].toString()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
