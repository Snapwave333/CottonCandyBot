console.log('Server script loaded');
import 'dotenv/config';
import express from 'express';
import http from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';

import Engine from './lib/Engine.js';
import { initAuth, requireAuth, rateLimiter } from './lib/auth.js';
import { getDb } from './lib/db.js';
import { errorHandler, asyncHandler, createError } from './lib/errors.js';

const validateEnvironment = () => {
  const required = ['SECRET_KEY', 'SOLANA_RPC_URL'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (process.env.NODE_ENV === 'production' && !process.env.API_KEY) {
    throw new Error('API_KEY is required in production mode');
  }

  if (process.env.SECRET_KEY.length < 32) {
    throw new Error('SECRET_KEY must be at least 32 characters');
  }
};

validateEnvironment();

initAuth();

// --- Startup Validation ---
const requiredEnvVars = ['SECRET_KEY', 'SOLANA_RPC_URL'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
    console.error(`\n❌ CRITICAL STARTUP ERROR: Missing Environment Variables: ${missingVars.join(', ')}`);
    console.error("   Please ensure .env file is correctly configured.\n");
    process.exit(1);
}

if (!process.env.SECRET_KEY || process.env.SECRET_KEY.length < 32) {
    console.warn("\n⚠️  SECURITY WARNING: SECRET_KEY is too short or weak. Please check .env.\n");
}
// ----------------------------

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(rateLimiter);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const engine = new Engine(io);
engine.start();

const authMiddleware = requireAuth; // Enable read authentication for production security

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/api/wallet', authMiddleware, async (_req, res) => {
  const db = await getDb();
  res.json(db.data.wallets);
});

app.post('/api/wallet/create', authMiddleware, async (req, res) => {
  const { Keypair } = await import('@solana/web3.js');
  const { encrypt } = await import('./lib/crypto.js');
  const db = await getDb();
  
  const newWallet = Keypair.generate();
  const encryptedKey = encrypt(Buffer.from(newWallet.secretKey).toString('hex'), process.env.SECRET_KEY);
  
  const walletEntry = {
    publicKey: newWallet.publicKey.toBase58(),
    encryptedKey: encryptedKey,
    balance: db.data.settings.isPaperMode ? (db.data.settings.defaultPaperBalanceUSD / 20) : 0, // Mock SOL balance if paper
    label: req.body.label || 'Bot Wallet',
    isPaper: db.data.settings.isPaperMode
  };
  
  db.data.wallets.push(walletEntry);
  await db.write();
  
  res.json({ publicKey: walletEntry.publicKey });
});

app.post('/api/wallet/swarm', authMiddleware, async (req, res) => {
  const { count = 5 } = req.body;
  const { Keypair } = await import('@solana/web3.js');
  const { encrypt } = await import('./lib/crypto.js');
  const db = await getDb();
  
  const newWallets = [];
  for (let i = 0; i < count; i++) {
    const kp = Keypair.generate();
    const encryptedKey = encrypt(Buffer.from(kp.secretKey).toString('hex'), process.env.SECRET_KEY);
    const walletEntry = {
      publicKey: kp.publicKey.toBase58(),
      encryptedKey: encryptedKey,
      balance: db.data.settings.isPaperMode ? (db.data.settings.defaultPaperBalanceUSD / 20) : 0,
      label: `Swarm ${i + 1}`,
      isPaper: db.data.settings.isPaperMode
    };
    db.data.wallets.push(walletEntry);
    newWallets.push({ publicKey: walletEntry.publicKey, label: walletEntry.label });
  }
  
  await db.write();
  res.json(newWallets);
});

app.get('/api/settings', authMiddleware, async (_req, res) => {
  const db = await getDb();
  res.json(db.data.settings);
});

app.get('/api/portfolio/history', authMiddleware, async (_req, res) => {
  const db = await getDb();
  res.json(db.data.portfolioHistory || []);
});

app.post('/api/settings', authMiddleware, async (req, res) => {
  const db = await getDb();
  db.data.settings = { ...db.data.settings, ...req.body };
  db.data.settings = { ...db.data.settings, ...req.body };
  await db.write();
  res.json(db.data.settings);
});

app.post('/api/settings/reset', authMiddleware, async (req, res) => {
  try {
    await engine.reset();
    res.json({ success: true, message: 'System reset successfully' });
  } catch (e) {
    console.error("Reset failed:", e);
    res.status(500).json({ error: 'Failed to reset system' });
  }
});

// Strategy Endpoints
app.get('/api/strategies', authMiddleware, async (_req, res) => {
  const db = await getDb();
  res.json(db.data.strategies);
});

app.post('/api/strategies', authMiddleware, async (req, res) => {
  const db = await getDb();
  const strategy = req.body;
  
  if (!strategy.id || !strategy.type) {
    throw createError.validationError('Invalid strategy data');
  }

  db.data.strategies.push(strategy);
  await db.write();
  
  engine.io.emit('log', { timestamp: Date.now(), message: `New strategy created: ${strategy.id} (${strategy.type})`, type: 'INFO' });
  res.json(strategy);
});

app.delete('/api/strategies/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const db = await getDb();
  
  const initialLength = db.data.strategies.length;
  db.data.strategies = db.data.strategies.filter(s => s.id !== id);
  
  if (db.data.strategies.length < initialLength) {
    // If running, stop the monitor
    if (engine.poolMonitors.has(id)) {
      const subId = engine.poolMonitors.get(id);
      engine.connection.removeOnLogsListener(subId);
      engine.poolMonitors.delete(id);
    }
    await db.write();
    engine.io.emit('log', { timestamp: Date.now(), message: `Strategy deleted: ${id}`, type: 'INFO' });
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Strategy not found' });
  }
});

app.patch('/api/strategies/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const db = await getDb();
  
  const strategy = db.data.strategies.find(s => s.id === id);
  if (!strategy) {
    return res.status(404).json({ error: 'Strategy not found' });
  }

  Object.assign(strategy, updates);
  await db.write();
  
  engine.io.emit('log', { timestamp: Date.now(), message: `Strategy updated: ${id}`, type: 'INFO' });
  res.json(strategy);
});

app.post('/api/strategies/:id/trade', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { action, amount, type } = req.body;
  
  if (!action || !amount || !type) {
    return res.status(400).json({ error: "Missing required parameters: action, amount, type" });
  }

  try {
     const result = await engine.executeManualTrade(id, action, amount);
     res.json(result);
  } catch (e) {
     console.error("Manual trade failed", e);
     res.status(500).json({ error: e.message });
  }
});

// --- Data Endpoints (Proxies) ---

app.get('/api/token/risk/:address', authMiddleware, async (req, res) => {
  const { address } = req.params;
  try {
    // Proxy to RugCheck
    const response = await fetch(`https://api.rugcheck.xyz/v1/tokens/${address}/report/summary`);
    if (!response.ok) {
       // Fallback or specific error handling
       console.warn(`RugCheck failed for ${address}: ${response.status}`);
       return res.status(response.status).json({ error: 'Failed to fetch risk report' });
    }
    const data = await response.json();
    res.json(data);
  } catch (e) {
    console.error("Risk fetch failed:", e);
    res.status(500).json({ error: "Failed to fetch risk data" });
  }
});

app.get('/api/token/quote', authMiddleware, async (req, res) => {
  const { inputMint, outputMint, amount, slippageBps = 50 } = req.query;

  if (!inputMint || !outputMint || !amount) {
    return res.status(400).json({ error: "Missing required query params: inputMint, outputMint, amount" });
  }

  try {
    // Proxy to Jupiter Quote API
    const url = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`;
    const response = await fetch(url);
    if (!response.ok) {
       const errText = await response.text();
       console.warn(`Jupiter quote failed: ${response.status} - ${errText}`);
       return res.status(response.status).json({ error: 'Failed to fetch quote', details: errText });
    }
    const data = await response.json();
    res.json(data);
  } catch (e) {
    console.error("Quote fetch failed:", e);
    res.status(500).json({ error: "Failed to fetch quote" });
  }
});

app.get('/api/token/info/:address', authMiddleware, async (req, res) => {
  const { address } = req.params;
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
    if (!response.ok) {
       return res.status(response.status).json({ error: 'Failed to fetch token info' });
    }
    const data = await response.json();
    res.json(data);
  } catch (e) {
    console.error("Token info fetch failed:", e);
    res.status(500).json({ error: "Failed to fetch token data" });
  }
});

app.get('/api/proxy/image', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('URL required');

  try {
    const decodedUrl = decodeURIComponent(url);
    // console.log(`Proxying image: ${decodedUrl}`); // Optional logging

    const response = await fetch(decodedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    
    // Forward content-type
    const contentType = response.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);
    
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    
    // Pipe data
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (e) {
    console.error(`Image proxy failed for ${url}:`, e.message);
    // Return a 404 so the frontend onError handler triggers the fallback
    res.status(404).send('Error fetching image');
  }
});

// Import at the top (I'll need to do a multi-replace or just add it if I can't edit top easily, but wait, `server/index.js` imports `Engine` from `./lib/Engine.js`. I can import `getTop200Tokens` similarly.)

app.get('/api/market/ticker', authMiddleware, async (req, res) => {
  try {
    // data is already cached
    const { getTop200Tokens } = await import('./lib/MarketScanner.js');
    const data = await getTop200Tokens();
    res.json(data);
  } catch (e) {
    console.error("Market data fetch failed:", e);
    // If rate limit error or empty, return what we have or empty array
    res.json([]); 
  }
});

app.post('/api/wallet/withdraw', authMiddleware, asyncHandler(async (req, res) => {
  const { botAddress, destination, amount } = req.body;

  if (!botAddress || !destination || !amount) {
    throw createError.validationError('botAddress, destination, and amount are required');
  }

  const { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, sendAndConfirmTransaction, Keypair } = await import('@solana/web3.js');
  const { decrypt } = await import('./lib/crypto.js');
  const db = await getDb();

  const wallet = db.data.wallets.find(w => w.publicKey === botAddress);
  if (!wallet) {
    throw createError.walletNotFound(botAddress);
  }
  
  if (wallet.isPaper) {
    wallet.balance -= (amount * LAMPORTS_PER_SOL);
    await db.write();
    return res.json({ signature: 'simulated_signature', status: 'success' });
  }

  const privateKeyHex = decrypt(wallet.encryptedKey, process.env.SECRET_KEY);
  const fromKp = Keypair.fromSecretKey(Buffer.from(privateKeyHex, 'hex'));

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromKp.publicKey,
      toPubkey: new PublicKey(destination),
      lamports: amount * LAMPORTS_PER_SOL,
    })
  );

  const signature = await sendAndConfirmTransaction(engine.connection, transaction, [fromKp]);
  res.json({ signature });
}));

app.use(errorHandler);

const PORT = process.env.PORT || 3021;

io.on('connection', (socket) => {
  engine.io.emit('log', { timestamp: Date.now(), message: `Client connected: ${socket.id}`, type: 'INFO' });

  socket.on('disconnect', () => {
    engine.io.emit('log', { timestamp: Date.now(), message: `Client disconnected: ${socket.id}`, type: 'INFO' });
  });
});

process.on('unhandledRejection', (reason) => {
  engine.io.emit('log', { timestamp: Date.now(), message: `Unhandled Rejection: ${reason}`, type: 'ERROR' });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  if (typeof engine !== 'undefined' && engine?.io) {
    engine.io.emit('log', { timestamp: Date.now(), message: `Uncaught Exception: ${error.message}`, type: 'ERROR' });
  }
  process.exit(1);
});

process.on('SIGTERM', () => {
  engine.io.emit('log', { timestamp: Date.now(), message: 'SIGTERM received, shutting down gracefully', type: 'INFO' });
  engine.stop();
  server.close(() => {
    process.exit(0);
  });
});

server.listen(PORT, () => {
  console.log(`Cotton Candy Engine running on port ${PORT}`);
  engine.io.emit('log', { timestamp: Date.now(), message: `Cotton Candy Engine running on port ${PORT}`, type: 'INFO' });
});
