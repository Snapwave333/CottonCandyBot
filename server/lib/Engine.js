import { Connection, PublicKey } from '@solana/web3.js';
import { getDb } from './db.js';
import { getTop200Tokens, fetchTokenPrice } from './MarketScanner.js';
import { ExecutionEngine } from './ExecutionEngine.js';

export class Engine {
  constructor(io) {
    this.io = io;
    this.isRunning = false;
    this.tickRate = 200;
    this.intervalId = null;
    this.connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com');
    this.executionEngine = new ExecutionEngine(this.connection, io);
    this.lastBalanceUpdate = null;
    this.poolMonitors = new Map();
    this.marketData = []; // Central cache
    this.RAYDIUM_PROGRAM_ID = new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8');
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    // Force all existing strategies to STOPPED on boot
    const db = await getDb();
    if (!db.data.stats) db.data.stats = { realizedPnL: 0, totalTrades: 0, winRate: 0 };
    let madeChanges = false;
    
    // const isPaper = db.data.settings.isPaperMode; // Removed as part of auto-stop fix
    
    db.data.strategies.forEach(s => {
      // ALWAYS stop strategies on boot to prevent auto-start (User Request)
      if (s.status !== 'STOPPED') {
        s.status = 'STOPPED';
        madeChanges = true;
        this.io.emit('log', { timestamp: Date.now(), message: `Safety Lock: Auto-stopped strategy ${s.id} on boot.`, type: 'WARN' });
      }
    });

    if (madeChanges) {
      await db.write();
      this.io.emit('log', { timestamp: Date.now(), message: 'System Cold Start: Strategies checked.', type: 'INFO' });
    }

    this.io.emit('log', { timestamp: Date.now(), message: 'Trading Engine initialized.', type: 'SUCCESS' });

    // Start background scanner
    this.startMarketScanner();

    // Start Monitoring (Independent of Trading Loop)
    this.startMonitoring();

    this.intervalId = setInterval(async () => {
      await this.tick();
    }, this.tickRate);
  }

  startMarketScanner() {
     getTop200Tokens().then(data => { this.marketData = data; });
     setInterval(async () => {
         try {
             const data = await getTop200Tokens();
             if (data && data.length > 0) {
                 this.marketData = data;
             }
         } catch(e) {
             console.error("Background Scan Error", e);
         }
     }, 60000); // 60s refresh
  }

  startMonitoring() {
      if (this.monitorIntervalId) return;

      this.monitorIntervalId = setInterval(async () => {
          try {
              const db = await getDb();
              const now = Date.now();

              // Balance Update (10s)
              if (!this.lastBalanceUpdate || now - this.lastBalanceUpdate > 10000) {
                  await this.updateBalances(db);
                  this.lastBalanceUpdate = now;
              }

              // Portfolio Snapshot (2.5s - Balanced)
              if (!this.lastPortfolioSnapshot || now - this.lastPortfolioSnapshot > 2500) {
                  await this.recordPortfolioSnapshot(db);
                  this.lastPortfolioSnapshot = now;
              }

              if (now - this.lastBalanceUpdate > 2500 || now - this.lastPortfolioSnapshot > 2500) {
                 await db.write();
              }
          } catch(e) {
              console.error("Monitoring Loop Error:", e);
          }
      }, 1000); 
  }

  async reset() {
      const db = await getDb();
      
      // SAFETY CHECK: ONLY ALLOW RESET IN PAPER MODE
      if (!db.data.settings.isPaperMode) {
          this.io.emit('log', { timestamp: Date.now(), message: '⛔ Reset blocked: Only allowed in Paper Mode.', type: 'ERROR' });
          return; 
      }

      this.io.emit('log', { timestamp: Date.now(), message: '⚠️ PAPER TRADING RESET INITIATED...', type: 'WARNING' });
      
      // 1. Stop everything
      if (this.isRunning) {
        this.stop();
      }

      // 2. Wipe Runtime Data
      db.data.stats = { realizedPnL: 0, totalTrades: 0, winRate: 0 };
      db.data.logs = [];
      db.data.portfolioHistory = [];
      
      // 3. Reset Paper Wallet Balance
      if (db.data.wallets) {
          const paperWallet = db.data.wallets.find(w => w.isPaper);
          if (paperWallet) {
              paperWallet.balance = (db.data.settings.defaultPaperBalanceUSD || 100); 
              paperWallet.positions = []; 
          }
      }

      // 4. Stop All Strategies & Clear Their State
      if (db.data.strategies) {
          db.data.strategies.forEach(s => {
              s.status = 'STOPPED';
              s.positions = [];
              s.lastExecution = 0;
              s.executedAmount = 0;
              s.lastTradeToken = "";
              s.lastTradeTime = 0;
          });
      }

      await db.write();

      // Clear Runtime cache if any
      this.portfolioHistory = [];

      // 5. Restart
      this.io.emit('log', { timestamp: Date.now(), message: '✅ Paper Data Wiped. Restarting...', type: 'SUCCESS' });
      
      setTimeout(() => {
          this.start();
          // FORCE CLEAR FRONTEND
          this.io.emit('portfolio_update', {
              timestamp: Date.now(),
              paperValue: db.data.settings.defaultPaperBalanceUSD || 100,
              liveValue: 0,
              realizedPnL: 0,
              unrealizedPnL: 0,
              winRate: 0,
              totalTrades: 0,
              positions: []
          });
          this.io.emit('log', { timestamp: Date.now(), message: '♻️ Engine Restarted with Clean State.', type: 'INFO' });
      }, 1000);
  }

  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    clearInterval(this.intervalId); // Stop Trading Loop
    // Do NOT stop monitorIntervalId - keep live data flowing
    
    for (const [strategyId, subscriptionId] of this.poolMonitors.entries()) {
      this.connection.removeOnLogsListener(subscriptionId);
      this.poolMonitors.delete(strategyId);
    }

    this.io.emit('log', { timestamp: Date.now(), message: 'Trading Engine stopped', type: 'WARNING' });
  }

  async tick() {
    try {
      const db = await getDb();
      const activeStrategies = db.data.strategies.filter(s => s.status === 'RUNNING');
      const isPaper = db.data.settings.isPaperMode;

      // Parallelize strategy processing
      if (activeStrategies.length > 0) {
          await Promise.all(activeStrategies.map(strategy => this.processStrategy(strategy, isPaper)));
          await db.write();
      }
      
    } catch (error) {
      this.io.emit('log', {
        timestamp: Date.now(),
        message: `Engine tick error: ${error.message}`,
        type: 'ERROR'
      });
    }
  }

  async recordPortfolioSnapshot(db) {
    // initialize if missing (for safety)
    if (!db.data.portfolioHistory) db.data.portfolioHistory = [];

    // Calculate base paper value from settings + PnL
    const startingBalance = db.data.settings.defaultPaperBalanceUSD;
    // For live value, sum up wallet balances. This is approximate as it doesn't query chain every 5s (too heavy)
    // We rely on occasional wallet updates or just cached values in db.wallets
    const liveValue = db.data.wallets 
        ? db.data.wallets.filter(w => !w.isPaper).reduce((acc, w) => acc + (w.balance || 0), 0)
        : 0;

    // Calculate PnL
    // Unrealized: Sum of (Current Value - Cost Basis) for all active positions
    // Realized: Sum of realizedPnL from closed trades in portfolioHistory (or a separate realizedPnL tracker if we had one, but we'll infer or track it)
    
    // For now, let's track realizedPnL in `db.data.stats` or similar if it existed.
    // If not, we can sum it up from closed positions if we stored them. 
    // SIMPLIFICATION: We will stick to Unrealized PnL for now based on paper positions, and 0 for Realized until we close trades.
    
    let unrealizedPnL = 0;

    // 1. Calculate PnL from Paper Wallets (Manual Trades)
    if (db.data.wallets && db.data.wallets.length > 0) {
        const paperWallet = db.data.wallets.find(w => w.isPaper);
        if (paperWallet && paperWallet.positions) {
            paperWallet.positions.forEach(pos => {
                const currentPrice = this.marketData.find(t => t.address === pos.mint)?.price || pos.averagePrice;
                unrealizedPnL += (pos.amount * currentPrice) - (pos.amount * pos.averagePrice);
            });
        }
    }

    // 2. Calculate PnL from Active Strategies (Bot Trades)
    (db.data.strategies || []).forEach(s => {
        if (s.positions && Array.isArray(s.positions)) {
             s.positions.forEach(p => {
                 const marketInfo = this.getMarketToken(p.symbol);
                 const currentPrice = marketInfo ? marketInfo.current_price : p.entry;
                 const valueUsdc = p.amount * currentPrice;
                 const costUsdc = p.amount * p.entry;
                 unrealizedPnL += (valueUsdc - costUsdc);
              });
        }
    });

    // Realized PnL - To be tracked in db.data.stats.realizedPnL
    const realizedPnL = db.data.stats?.realizedPnL || 0;
    const winRate = db.data.stats?.winRate || 0;
    const totalTrades = db.data.stats?.totalTrades || 0;

    // Aggregate Active Positions from Strategies
    const allPositions = [];
    (db.data.strategies || []).forEach(s => {
        if (s.positions && Array.isArray(s.positions)) {
             s.positions.forEach(p => {
                 const marketInfo = this.getMarketToken(p.symbol);
                 const currentPrice = marketInfo ? marketInfo.current_price : p.entry;
                 const valueUsdc = p.amount * currentPrice;
                 const pnlPercent = p.entry > 0 ? ((currentPrice - p.entry) / p.entry) * 100 : 0;

                 allPositions.push({
                     mint: p.symbol, // Using symbol as mint/ID for now if address unavailable
                     symbol: p.symbol,
                     amount: p.amount,
                     averageEntryPrice: p.entry,
                     currentPrice: currentPrice,
                     pnlPercent: pnlPercent,
                     valueUsdc: valueUsdc
                 });
             });
        }
    });

    const snapshot = {
        timestamp: Date.now(),
        paperValue: startingBalance + unrealizedPnL + realizedPnL,
        liveValue,
        realizedPnL,
        unrealizedPnL,
        winRate,
        totalTrades,
        positions: allPositions // Send aggregated positions to frontend
    };

    db.data.portfolioHistory.push(snapshot);

    // Keep history manageable (e.g., last 24h at 5s intervals = 17280 points. Let's cap at 2000 for now)
    if (db.data.portfolioHistory.length > 2000) {
        db.data.portfolioHistory.shift();
    }

      // Emit update so frontend can update chart immediately
      this.io.emit('portfolio_update', snapshot);

      await db.write();
  }

  async updateBalances(db) {
    try {
      if (!db.data.wallets || db.data.wallets.length === 0) return;

      const wallets = db.data.wallets.filter(w => !w.isPaper); // Only update real wallets via RPC
      if (wallets.length === 0) return;

      // Parallelize balance updates to avoid head-of-line blocking
      const results = await Promise.allSettled(wallets.map(async (wallet) => {
          const pubKey = new PublicKey(wallet.publicKey);
          const balance = await this.connection.getBalance(pubKey);
          return { wallet, balance };
      }));

      let hasUpdates = false;

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          if (result.value.wallet.balance !== result.value.balance) {
            result.value.wallet.balance = result.value.balance;
            hasUpdates = true;
          }
        } else {
          // Silent fail for individual wallet update is fine, just log debug if needed
          // console.debug(`Failed to update balance for wallet: ${result.reason}`);
        }
      });

      if (hasUpdates) {
        await db.write();
        this.io.emit('wallets_update', db.data.wallets);
      }
    } catch (error) {
       console.error("Critical error in updateBalances:", error);
    }
  }

  async startPoolMonitor(strategy) {
    if (this.poolMonitors.has(strategy.id)) return;

    const { targetToken } = strategy.config;

    try {
      const subscriptionId = this.connection.onLogs(
        this.RAYDIUM_PROGRAM_ID,
        async (logs) => {
          const tokenMentioned = logs.logs.some(log => log.includes(targetToken));

          if (tokenMentioned) {
            this.io.emit('strategy_log', {
              strategyId: strategy.id,
              log: {
                timestamp: Date.now(),
                message: `🎯 LIQUIDITY DETECTED! Token: ${targetToken}`,
                type: 'SUCCESS'
              }
            });

            const executionResult = await this.executionEngine.executeTrade(strategy, null); 
            strategy.lastExecution = Date.now();
            
            // Do NOT complete strategy immediately - Switch to Monitoring for TP/SL
            // strategy.status = 'COMPLETED'; 
            
            // Initialize Position Tracking
            strategy.positions = strategy.positions || [];
            // fetching current price for entry might be tricky if we just sniped liquidity. 
            // We'll rely on MarketScanner or assume 'snipe' price. 
            // Ideally we get price from execution result, but for now let's use a placeholder fetch or assumption.
            // Let's assume entry is effectively "now" and we will fetch price in main loop.
            const marketToken = this.getMarketToken(targetToken);
            const entryPrice = marketToken ? marketToken.current_price : 0; 
            
            strategy.positions.push({
                symbol: targetToken,
                entry: entryPrice, // Critical: If 0, TP/SL logic needs to handle grace period
                amount: strategy.config.amountInSol, // Approx
                tokenAmount: executionResult.outAmount || 0, // Actual tokens received
                timestamp: Date.now()
            });

            this.connection.removeOnLogsListener(subscriptionId);
            this.poolMonitors.delete(strategy.id);

            const db = await getDb();
            await db.write();
          }
        },
        'processed'
      );

      this.poolMonitors.set(strategy.id, subscriptionId);

      this.io.emit('strategy_log', {
        strategyId: strategy.id,
        log: {
          timestamp: Date.now(),
          message: `👀 MONITORING STARTED: Raydium Logs for ${targetToken}`,
          type: 'INFO'
        }
      });
      // Global log for visibility
      this.io.emit('log', { timestamp: Date.now(), message: `Started monitoring pool for ${targetToken} (Strategy: ${strategy.id.slice(0,6)})`, type: 'INFO' });

    } catch (error) {
      this.io.emit('log', {
        timestamp: Date.now(),
        message: `Failed to start pool monitor: ${error.message}`,
        type: 'ERROR'
      });
    }
  }

  getMarketToken(symbol) {
    if (!this.marketData) return null;
    return this.marketData.find(t => t.symbol.toUpperCase() === symbol.toUpperCase());
  }

  async processSniperStrategy(strategy, isPaper) {
    const { targetToken } = strategy.config;
    if (!targetToken) {
        // Fallback: If no target token is set, behave like "Top 200 Hunter"
        // This allows the default "Sniper" strategy to be an auto-trader without config.
        return this.processTop200Strategy(strategy, isPaper);
        
        /* 
        // Old Auto-Pause Logic
        strategy.status = 'PAUSED';
        this.io.emit('strategy_update', strategy);
        this.io.emit('log', { 
            timestamp: Date.now(), 
            message: `Strategy ${strategy.id.slice(0,6)} Auto-Paused: Target Token required.`, 
            type: 'WARNING' 
        });
        return; 
        */
    }

    // Enrich with Scanner Data
    // Enrich with Scanner Data
    const marketInfo = this.getMarketToken(targetToken);
    const rankInfo = marketInfo ? ` (Rank #${marketInfo.market_cap_rank})` : '';

    // --- TP/SL MONITORING START (SNIPER) ---
    const currentPositions = strategy.positions || [];
    for (let i = currentPositions.length - 1; i >= 0; i--) {
        const position = currentPositions[i];
        
        // If entry price was missing (snipe race condition), try to backfill
        if (!position.entry || position.entry === 0) {
             const livePrice = await fetchTokenPrice(position.symbol);
             if (livePrice > 0) {
                 position.entry = livePrice;
                 this.io.emit('log', { timestamp: Date.now(), message: `✅ Entry Price Lock: ${position.symbol} @ $${position.entry}`, type: 'INFO' });
             } else if (marketInfo && marketInfo.current_price > 0) {
                 position.entry = marketInfo.current_price;
                 this.io.emit('log', { timestamp: Date.now(), message: `✅ Entry Price Lock: ${position.symbol} @ $${position.entry}`, type: 'INFO' });
             }
        }

        if (marketInfo && position.entry > 0) {
            const currentPrice = marketInfo.current_price;
            const entryPrice = position.entry;
            const priceChange = ((currentPrice - entryPrice) / entryPrice) * 100;
            
            const takeProfit = strategy.config.takeProfit || 20; // Default 20%
            const stopLoss = strategy.config.stopLoss || 10;     // Default 10%
            
            let action = null;
            let reason = '';
            
            if (priceChange >= takeProfit) {
                action = 'SELL';
                reason = `🎯 SNIPER TP TRIGGERED: +${priceChange.toFixed(2)}%`;
            } else if (priceChange <= -stopLoss) {
                action = 'SELL';
                reason = `🛑 SNIPER SL TRIGGERED: ${priceChange.toFixed(2)}%`;
            }
            
            if (action === 'SELL') {
                 this.io.emit('log', { timestamp: Date.now(), message: `${reason} for ${position.symbol}`, type: action === 'SELL' && priceChange > 0 ? 'SUCCESS' : 'WARNING' });
                 
                 if (isPaper) {
                     this.io.emit('log', { timestamp: Date.now(), message: `📄 PAPER SNIPE CLOSE: Closing ${position.symbol} @ $${currentPrice}`, type: 'INFO' });
                     strategy.positions.splice(i, 1);
                     strategy.status = 'COMPLETED'; // Snipe is done after TP/SL
                 } else {
                     // Live Sell Logic
                     this.io.emit('log', { timestamp: Date.now(), message: `LIVE SNIPE CLOSE TRIGGERED: ${position.symbol} (Attempting Jito Bundle)...`, type: 'INFO' });
                     
                     // Execute Real Sell
                     const result = await this.executionEngine.executeSell(strategy, position);
                     
                     if (result.success) {
                         this.io.emit('log', { timestamp: Date.now(), message: `✅ LIVE SELL CONFIRMED: ${position.symbol}. Signature: ${result.signature}`, type: 'SUCCESS' });
                         strategy.positions.splice(i, 1);
                         strategy.status = 'COMPLETED';
                     } else {
                         this.io.emit('log', { timestamp: Date.now(), message: `❌ LIVE SELL FAILED: ${result.error}`, type: 'ERROR' });
                         // Retry logic or manual intervention needed? For now, we keep position to retry next tick if conditions persist.
                     }
                 }
            }
        }
    }
    // --- TP/SL MONITORING END ---

    // Don't buy again if we already have a position
    if (currentPositions.length > 0) return;

    if (isPaper) {
      if (!strategy.lastExecution) {
        this.io.emit('log', { timestamp: Date.now(), message: `📄 PAPER MODE: Simulating Snipe for ${targetToken}${rankInfo}...`, type: 'INFO' });
        
        let entryPrice = marketInfo ? marketInfo.current_price : 0;
        
        if (entryPrice === 0) {
            // ASYNC NON-BLOCKING FETCH
            if (strategy.isFetchingPrice) return; 
            
            strategy.isFetchingPrice = true;
            fetchTokenPrice(targetToken).then(async (price) => {
                strategy.isFetchingPrice = false;
                if (price > 0) {
                    strategy.positions = strategy.positions || [];
                    strategy.positions.push({
                        symbol: targetToken,
                        entry: price, 
                        amount: strategy.config.amountInSol,
                        timestamp: Date.now()
                    });
                     // Need to persist this async update
                    const db = await getDb();
                    await db.write();
                    
                    this.io.emit('log', { timestamp: Date.now(), message: `✅ PAPER SNIPE SECURED: ${targetToken} @ $${price} (Async Fetch)`, type: 'SUCCESS' });
                }
            }).catch(e => {
                strategy.isFetchingPrice = false;
                console.error("Async Fetch Failed", e);
            });
            
            return; // Exit this tick, wait for async fetch
        }

        strategy.lastExecution = Date.now();
        strategy.positions = strategy.positions || [];
        strategy.positions.push({
            symbol: targetToken,
            entry: entryPrice, 
            amount: strategy.config.amountInSol,
            timestamp: Date.now()
        });
        
        this.io.emit('log', { timestamp: Date.now(), message: `✅ PAPER SNIPE SECURED: ${targetToken} @ $${entryPrice} (Instant)`, type: 'SUCCESS' });
      }
      return;
    }

    if (!this.poolMonitors.has(strategy.id)) {
      await this.startPoolMonitor(strategy);
    } else {
        // Heartbeat for active montioring
        if (Math.random() < 0.05) { 
             const extraInfo = marketInfo ? ` | Vol: $${(marketInfo.total_volume/1000).toFixed(0)}k` : '';
            this.io.emit('log', { timestamp: Date.now(), message: `... Scanning Solana logs for ${targetToken}${rankInfo}${extraInfo}...`, type: 'DEBUG' });
        }
    }
  }

  async processDCAStrategy(strategy, isPaper) {
    const { intervalMs, totalAmount, amountPerOrder, targetToken } = strategy.config;
    const lastExecution = strategy.lastExecution || 0;

    if (Date.now() - lastExecution < intervalMs) {
      return;
    }
    
    console.log(`[DCA DEBUG] Processing ${strategy.id} for ${targetToken}. IsPaper: ${isPaper}`);

    const marketInfo = this.getMarketToken(targetToken);
    const rankMsg = marketInfo ? ` [Rank #${marketInfo.market_cap_rank}]` : '';

    if (isPaper) {
       this.io.emit('log', { timestamp: Date.now(), message: `📄 PAPER DCA: Buying ${amountPerOrder} SOL of ${targetToken}${rankMsg}...`, type: 'INFO' });
       // ... (existing DCA logic)
       strategy.lastExecution = Date.now();
       strategy.executedAmount = (strategy.executedAmount || 0) + amountPerOrder;
       this.io.emit('log', { timestamp: Date.now(), message: `✅ PAPER DCA EXECUTED. Progress: ${strategy.executedAmount}/${totalAmount}`, type: 'SUCCESS' });
       
       if (strategy.executedAmount >= totalAmount) {
         strategy.status = 'COMPLETED';
         this.io.emit('log', { timestamp: Date.now(), message: `🏁 PAPER DCA STRATEGY COMPLETED.`, type: 'SUCCESS' });
       }
       return;
    }

    this.io.emit('log', { timestamp: Date.now(), message: `⏰ DCA TRIGGER: Executing buy for ${targetToken}${rankMsg}...`, type: 'INFO' });
    
    // Execute Trade
    const result = await this.executionEngine.executeTrade(strategy, null);
    
    if (result.success) {
      strategy.lastExecution = Date.now();
      strategy.executedAmount = (strategy.executedAmount || 0) + amountPerOrder;
      
      this.io.emit('log', { timestamp: Date.now(), message: `✅ DCA BUY EXECUTED. Progress: ${strategy.executedAmount}/${totalAmount}`, type: 'SUCCESS' });

      if (strategy.executedAmount >= totalAmount) {
        strategy.status = 'COMPLETED';
         this.io.emit('log', { timestamp: Date.now(), message: `🏁 DCA STRATEGY COMPLETED.`, type: 'SUCCESS' });
      }
    } else {
        this.io.emit('log', { timestamp: Date.now(), message: `❌ DCA execution failed: ${result.error || 'Unknown error'}`, type: 'ERROR' });
    }
  }


  async processTop200Strategy(strategy, isPaper) {
    // Use the Engine's central market cache instead of fetching per strategy
    // This assumes the Engine.startScannerLoop() is running.
    // If not, we trigger a fetch but strictly throttled.
    
    // Zero latency access to memory cache
    const marketData = this.marketData || [];
    
    if (marketData.length === 0) {
        return; // No data yet, skip tick
    }
    
    const { minChange24h = 5, maxPositions = 5, amountPerPosition = 0.1, minVolume = 100000 } = strategy.config;
    
    // Check Max Positions
    // Check Max Positions
    const currentPositions = strategy.positions || [];
    
    // --- TP/SL MONITORING START ---
    // Iterate through open positions to check for Exit Signals
    // Using a for loop to allow async await
    for (let i = currentPositions.length - 1; i >= 0; i--) {
        const position = currentPositions[i];
        const tokenData = this.getMarketToken(position.symbol);
        
        if (tokenData) {
            const currentPrice = tokenData.current_price;
            const entryPrice = position.entry;
            const priceChange = ((currentPrice - entryPrice) / entryPrice) * 100;
            
            const takeProfit = strategy.config.takeProfit || 20;
            const stopLoss = strategy.config.stopLoss || 10;
            
            let action = null;
            let reason = '';
            
            if (priceChange >= takeProfit) {
                action = 'SELL';
                reason = `🎯 TAKE PROFIT Triggered: +${priceChange.toFixed(2)}%`;
            } else if (priceChange <= -stopLoss) {
                action = 'SELL';
                reason = `🛑 STOP LOSS Triggered: ${priceChange.toFixed(2)}%`;
            }
            
            if (action === 'SELL') {
                this.io.emit('log', { timestamp: Date.now(), message: `${reason} for ${position.symbol}`, type: action === 'SELL' && priceChange > 0 ? 'SUCCESS' : 'WARNING' });
                
                if (isPaper) {
                    this.io.emit('log', { timestamp: Date.now(), message: `📄 PAPER SELL: Closing ${position.symbol} @ $${currentPrice}`, type: 'INFO' });
                    // Remove position
                    strategy.positions.splice(i, 1);
                } else {
                    // LIVE EXECUTION
                    this.io.emit('log', { timestamp: Date.now(), message: `LIVE TP/SL TRIGGERED for ${position.symbol}: ${priceChange.toFixed(2)}% (Attempting Sell)...`, type: 'INFO' });
                    
                    const result = await this.executionEngine.executeSell(strategy, position);
                    
                    if (result.success) {
                        this.io.emit('log', { timestamp: Date.now(), message: `✅ LIVE SELL EXECUTED: ${position.symbol}. Signature: ${result.signature}`, type: 'SUCCESS' });
                        strategy.positions.splice(i, 1);
                    } else {
                        this.io.emit('log', { timestamp: Date.now(), message: `❌ LIVE SELL FAILED: ${result.error}`, type: 'ERROR' });
                    }
                }
            }
        }
    }
    // --- TP/SL MONITORING END ---

    if (currentPositions.length >= maxPositions) {
       return;
    }
    
    // 1. Identify Opportunities with Volume Filter
    const opportunities = marketData.filter(token => {
        return token.price_change_percentage_24h > minChange24h && 
               token.total_volume > minVolume &&
               token.symbol.toUpperCase() !== 'SOL' &&
               token.symbol.toUpperCase() !== 'USDC' &&
               token.symbol.toUpperCase() !== 'USDT' &&
               // Don't buy if already holding
               !currentPositions.some(p => p.symbol === token.symbol.toUpperCase());
    });


    // 2. Manage Portfolio
    const topPick = opportunities[0];

    if (topPick) {
       const lastTradeToken = strategy.lastTradeToken;
       const lastTradeTime = strategy.lastTradeTime || 0;
       
       // Debounce re-buys of the same token (e.g., 5 minutes)
       if (lastTradeToken !== topPick.symbol || (Date.now() - lastTradeTime > 300000)) {
           this.io.emit('log', { timestamp: Date.now(), message: `🚀 DETECTED MOMENTUM: ${topPick.symbol} (+${topPick.price_change_percentage_24h.toFixed(2)}% | Vol $${(topPick.total_volume/1000000).toFixed(1)}M)`, type: 'SUCCESS' });
           
           const execConfig = {
               ...strategy,
               config: {
                   ...strategy.config,
                   targetToken: topPick.symbol.toUpperCase(), 
                   amountInSol: amountPerPosition
               }
           };

           if (isPaper) {
               this.io.emit('log', { timestamp: Date.now(), message: `📄 PAPER BUY: ${amountPerPosition} SOL of ${topPick.symbol} @ $${topPick.current_price}`, type: 'INFO' });
               strategy.positions = strategy.positions || [];
               strategy.positions.push({ 
                   symbol: topPick.symbol.toUpperCase(), 
                   entry: topPick.current_price, 
                   amount: amountPerPosition / topPick.current_price, // Approx amount
                   timestamp: Date.now() 
               });
               strategy.lastTradeToken = topPick.symbol;
               strategy.lastTradeTime = Date.now();
           } else {
               const result = await this.executionEngine.executeTrade(execConfig, null);
               if (result.success) {
                   strategy.lastTradeToken = topPick.symbol;
                   strategy.lastTradeTime = Date.now();
                   this.io.emit('log', { timestamp: Date.now(), message: `✅ BOUGHT ${topPick.symbol}`, type: 'SUCCESS' });
                   
                   // Track Live Position
                   strategy.positions = strategy.positions || [];
                   strategy.positions.push({ 
                       symbol: topPick.symbol.toUpperCase(), 
                       entry: topPick.current_price, 
                       amount: amountPerPosition / topPick.current_price, // Approx amount for display
                       tokenAmount: result.outAmount || 0, // Actual tokens for sell
                       timestamp: Date.now() 
                   });
               }
           }
       }
    }
  }

  async processStrategy(strategy, isPaper) {
    if (strategy.type === 'SNIPER') {
      await this.processSniperStrategy(strategy, isPaper);
    } else if (strategy.type === 'DCA') {
      await this.processDCAStrategy(strategy, isPaper);
    } else if (strategy.type === 'TOP_200') {
      await this.processTop200Strategy(strategy, isPaper);
    }
  }


  async addLog(message, type = 'info') {
    const db = await getDb();
    const log = {
      timestamp: Date.now(),
      message,
      type
    };
    db.data.logs.push(log);
    
    // Ensure logs don't grow indefinitely in memory/db
    if (db.data.logs.length > 500) db.data.logs.shift();
    
    await db.write();
    this.io.emit('log', log);
  }
}

export default Engine;
