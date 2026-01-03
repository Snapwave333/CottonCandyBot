# API Reference v2.0.0

## Overview

Complete API documentation for the Cotton Candy Bot trading terminal. This reference covers both REST endpoints and Socket.io real-time events.

**Base URL:** `http://localhost:3001` (configurable via `PORT` environment variable)
**Protocol:** HTTP/HTTPS + WebSocket (Socket.io)
**Version:** 2.0.0
**Last Updated:** 2025-12-29

---

## Table of Contents

- [Authentication](#authentication)
- [REST API Endpoints](#rest-api-endpoints)
  - [Strategy Management](#strategy-management)
  - [Wallet Management](#wallet-management)
  - [Settings](#settings)
  - [Health & Status](#health--status)
- [Socket.io Events](#socketio-events)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Code Examples](#code-examples)

---

## Authentication

**Current Version:** No authentication required (local development)
**Future:** JWT-based authentication planned for v2.1.0

---

## REST API Endpoints

### Strategy Management

#### Create Strategy

Creates a new trading strategy.

```http
POST /api/strategy/create
Content-Type: application/json
```

**Request Body:**

```typescript
interface CreateStrategyRequest {
  type: 'SNIPER' | 'DCA' | 'DIP_CATCHER' | 'MOMENTUM' | 'COPYCAT' | 'CUSTOM';
  config: StrategyConfig;
  walletId?: string; // Optional: defaults to first available wallet
}

interface StrategyConfig {
  targetToken: string; // Solana token mint address
  amountInSol: number; // Trade amount in SOL
  // DCA specific
  intervalSeconds?: number; // Time between buys
  totalAmount?: number; // Total budget for DCA
  // Sniper specific
  maxSlippageBps?: number; // Max slippage in basis points
  // Custom specific
  customLogic?: LogicBlock[];
  // Common
  stopLossPercent?: number; // Auto-sell at loss threshold
  takeProfitPercent?: number; // Auto-sell at profit threshold
}
```

**Example Request:**

```json
{
  "type": "DCA",
  "config": {
    "targetToken": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "amountInSol": 0.1,
    "intervalSeconds": 3600,
    "totalAmount": 10,
    "stopLossPercent": 20,
    "takeProfitPercent": 50
  },
  "walletId": "burner-123"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "strategy": {
    "id": "strat-abc123",
    "type": "DCA",
    "status": "IDLE",
    "config": {
      "targetToken": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "amountInSol": 0.1,
      "intervalSeconds": 3600,
      "totalAmount": 10,
      "stopLossPercent": 20,
      "takeProfitPercent": 50
    },
    "createdAt": 1735488000000,
    "logs": []
  }
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "error": "ValidationError",
  "message": "Invalid target token address",
  "details": {
    "field": "config.targetToken",
    "reason": "Must be a valid Solana address"
  }
}
```

---

#### Start Strategy

Activates a strategy to begin execution.

```http
POST /api/strategy/:id/start
```

**Parameters:**
- `id` (path): Strategy ID

**Response (200 OK):**

```json
{
  "success": true,
  "strategy": {
    "id": "strat-abc123",
    "status": "RUNNING",
    "startedAt": 1735488100000
  }
}
```

---

#### Pause Strategy

Temporarily pauses a running strategy.

```http
POST /api/strategy/:id/pause
```

**Parameters:**
- `id` (path): Strategy ID

**Response (200 OK):**

```json
{
  "success": true,
  "strategy": {
    "id": "strat-abc123",
    "status": "PAUSED",
    "pausedAt": 1735488200000
  }
}
```

---

#### Get All Strategies

Retrieves all strategies with optional filtering.

```http
GET /api/strategy?status=RUNNING&type=DCA
```

**Query Parameters:**
- `status` (optional): Filter by status (IDLE, RUNNING, PAUSED, COMPLETED, FAILED)
- `type` (optional): Filter by type (SNIPER, DCA, etc.)
- `limit` (optional): Number of results (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response (200 OK):**

```json
{
  "success": true,
  "strategies": [
    {
      "id": "strat-abc123",
      "type": "DCA",
      "status": "RUNNING",
      "config": { /* ... */ },
      "createdAt": 1735488000000,
      "lastExecution": 1735491600000,
      "logs": [
        {
          "timestamp": 1735491600000,
          "message": "Executed DCA buy: 0.1 SOL",
          "type": "SUCCESS"
        }
      ]
    }
  ],
  "total": 1,
  "limit": 100,
  "offset": 0
}
```

---

#### Delete Strategy

Deletes a strategy (only if IDLE, PAUSED, or COMPLETED).

```http
DELETE /api/strategy/:id
```

**Parameters:**
- `id` (path): Strategy ID

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Strategy deleted successfully"
}
```

**Error Response (409 Conflict):**

```json
{
  "success": false,
  "error": "ConflictError",
  "message": "Cannot delete running strategy. Pause it first."
}
```

---

### Wallet Management

#### Get All Wallets

Retrieves all burner wallets.

```http
GET /api/wallet
```

**Response (200 OK):**

```json
{
  "success": true,
  "wallets": [
    {
      "publicKey": "7xKW...abc123",
      "label": "Burner #1",
      "balance": 1500000000,
      "balanceSol": 1.5,
      "clusterId": "cluster-001",
      "isPaper": false,
      "createdAt": 1735480000000
    }
  ]
}
```

---

#### Create Burner Wallet

Generates a new AES-256 encrypted burner wallet.

```http
POST /api/wallet/create
Content-Type: application/json
```

**Request Body:**

```json
{
  "label": "Trading Burner #5",
  "clusterId": "cluster-001"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "wallet": {
    "publicKey": "9xKW...xyz789",
    "label": "Trading Burner #5",
    "balance": 0,
    "balanceSol": 0,
    "clusterId": "cluster-001",
    "isPaper": false,
    "createdAt": 1735488300000
  },
  "reminder": "Fund this wallet by sending SOL to 9xKW...xyz789"
}
```

---

#### Create Wallet Swarm

Generates multiple burner wallets at once.

```http
POST /api/wallet/swarm
Content-Type: application/json
```

**Request Body:**

```json
{
  "count": 5,
  "clusterId": "cluster-002",
  "labelPrefix": "Swarm Bot"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "wallets": [
    {
      "publicKey": "1xAB...111",
      "label": "Swarm Bot #1",
      "balance": 0,
      "balanceSol": 0,
      "clusterId": "cluster-002",
      "isPaper": false
    },
    // ... 4 more wallets
  ],
  "count": 5
}
```

---

#### Withdraw from Burner

Transfers SOL from a burner wallet to a destination address.

```http
POST /api/wallet/withdraw
Content-Type: application/json
```

**Request Body:**

```json
{
  "botAddress": "7xKW...abc123",
  "destination": "YourMainWallet...",
  "amount": 1.5
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "signature": "5Kx8...txSignature",
  "amount": 1.5,
  "fee": 0.000005,
  "timestamp": 1735488400000
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "error": "InsufficientBalanceError",
  "message": "Insufficient balance for withdrawal",
  "details": {
    "available": 1.0,
    "requested": 1.5
  }
}
```

---

### Settings

#### Get Settings

Retrieves current bot configuration.

```http
GET /api/settings
```

**Response (200 OK):**

```json
{
  "success": true,
  "settings": {
    "isPaperMode": true,
    "rpcUrl": "https://api.mainnet-beta.solana.com",
    "slippageBps": 50,
    "jitoEnabled": true,
    "jitoTipLamports": 10000,
    "autoRetryEnabled": true,
    "maxRetryAttempts": 3,
    "tickRate": 200
  }
}
```

---

#### Update Settings

Updates bot configuration.

```http
POST /api/settings
Content-Type: application/json
```

**Request Body:**

```json
{
  "isPaperMode": false,
  "slippageBps": 100,
  "jitoTipLamports": 20000
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "settings": {
    "isPaperMode": false,
    "slippageBps": 100,
    "jitoTipLamports": 20000,
    // ... other settings unchanged
  },
  "message": "Settings updated successfully"
}
```

---

### Health & Status

#### Health Check

Checks if the server is running.

```http
GET /health
```

**Response (200 OK):**

```json
{
  "status": "healthy",
  "timestamp": 1735488500000,
  "uptime": 3600,
  "version": "2.0.0"
}
```

---

#### Engine Status

Retrieves trading engine status.

```http
GET /api/engine/status
```

**Response (200 OK):**

```json
{
  "success": true,
  "engine": {
    "isRunning": true,
    "tickRate": 200,
    "activeStrategies": 3,
    "lastTick": 1735488500000,
    "totalExecutions": 147,
    "uptime": 3600000
  }
}
```

---

## Socket.io Events

### Client → Server Events

#### Subscribe to Updates

```typescript
socket.emit('subscribe', { channel: 'strategies' });
socket.emit('subscribe', { channel: 'wallets' });
socket.emit('subscribe', { channel: 'logs' });
```

#### Heartbeat

```typescript
socket.emit('ping');
// Server responds with 'pong'
```

---

### Server → Client Events

#### Strategy Status Update

Emitted when a strategy status changes.

```typescript
socket.on('strategy_status', (data: StrategyStatusEvent) => {
  console.log('Strategy status:', data);
});

interface StrategyStatusEvent {
  strategyId: string;
  oldStatus: StrategyStatus;
  newStatus: StrategyStatus;
  timestamp: number;
}
```

**Example Payload:**

```json
{
  "strategyId": "strat-abc123",
  "oldStatus": "IDLE",
  "newStatus": "RUNNING",
  "timestamp": 1735488600000
}
```

---

#### Trade Execution

Emitted when a trade is executed.

```typescript
socket.on('trade_execution', (data: TradeExecutionEvent) => {
  console.log('Trade executed:', data);
});

interface TradeExecutionEvent {
  strategyId: string;
  success: boolean;
  signature?: string;
  amount: number;
  price: number;
  timestamp: number;
  error?: string;
}
```

**Example Payload:**

```json
{
  "strategyId": "strat-abc123",
  "success": true,
  "signature": "5Kx8...txSignature",
  "amount": 0.1,
  "price": 0.000123,
  "timestamp": 1735488700000
}
```

---

#### Wallet Balance Update

Emitted when a wallet balance changes.

```typescript
socket.on('wallet_update', (data: WalletUpdateEvent) => {
  console.log('Wallet updated:', data);
});

interface WalletUpdateEvent {
  publicKey: string;
  oldBalance: number;
  newBalance: number;
  balanceSol: number;
  timestamp: number;
}
```

**Example Payload:**

```json
{
  "publicKey": "7xKW...abc123",
  "oldBalance": 1500000000,
  "newBalance": 1400000000,
  "balanceSol": 1.4,
  "timestamp": 1735488800000
}
```

---

#### Log Message

Emitted for real-time system logs.

```typescript
socket.on('log', (data: LogEvent) => {
  console.log(`[${data.type}] ${data.message}`);
});

interface LogEvent {
  timestamp: number;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARNING';
  context?: Record<string, any>;
}
```

**Example Payload:**

```json
{
  "timestamp": 1735488900000,
  "message": "Engine tick completed in 45ms",
  "type": "INFO",
  "context": {
    "tickNumber": 12345,
    "activeStrategies": 3,
    "duration": 45
  }
}
```

---

## Error Handling

### Error Response Format

All errors follow a consistent structure:

```typescript
interface ErrorResponse {
  success: false;
  error: string; // Error type/code
  message: string; // Human-readable message
  details?: Record<string, any>; // Additional context
  stack?: string; // Stack trace (dev mode only)
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `ValidationError` | 400 | Invalid request parameters |
| `InsufficientBalanceError` | 400 | Wallet balance too low |
| `StrategyNotFoundError` | 404 | Strategy ID not found |
| `WalletNotFoundError` | 404 | Wallet not found |
| `ConflictError` | 409 | Resource state conflict |
| `RpcError` | 503 | Solana RPC unavailable |
| `JupiterError` | 503 | Jupiter API unavailable |
| `InternalError` | 500 | Unexpected server error |

---

## Rate Limiting

**Current Version:** No rate limiting (local development)
**Future:** Planned for v2.1.0

- 100 requests per minute per IP
- 10 strategy creations per hour per IP
- WebSocket connection limit: 5 per IP

---

## Code Examples

### JavaScript/TypeScript

#### Create and Start a DCA Strategy

```typescript
import axios from 'axios';
import io from 'socket.io-client';

const API_BASE = 'http://localhost:3001';
const socket = io(API_BASE);

async function createDCAStrategy() {
  // Create strategy
  const response = await axios.post(`${API_BASE}/api/strategy/create`, {
    type: 'DCA',
    config: {
      targetToken: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      amountInSol: 0.1,
      intervalSeconds: 3600,
      totalAmount: 10,
    },
  });

  const { strategy } = response.data;
  console.log('Strategy created:', strategy.id);

  // Subscribe to execution events
  socket.on('trade_execution', (data) => {
    if (data.strategyId === strategy.id) {
      console.log('Trade executed:', data);
    }
  });

  // Start strategy
  await axios.post(`${API_BASE}/api/strategy/${strategy.id}/start`);
  console.log('Strategy started');
}

createDCAStrategy();
```

---

#### Monitor Wallet Balances

```typescript
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected to server');
  socket.emit('subscribe', { channel: 'wallets' });
});

socket.on('wallet_update', (data) => {
  console.log(`Wallet ${data.publicKey}: ${data.balanceSol} SOL`);

  if (data.newBalance < 100000000) {
    // Less than 0.1 SOL
    console.warn(`Low balance alert: ${data.publicKey}`);
  }
});
```

---

### Python

#### Create Wallet Swarm

```python
import requests

API_BASE = 'http://localhost:3001'

def create_wallet_swarm(count: int):
    response = requests.post(f'{API_BASE}/api/wallet/swarm', json={
        'count': count,
        'labelPrefix': 'Python Bot',
        'clusterId': 'cluster-python'
    })

    data = response.json()
    if data['success']:
        print(f"Created {data['count']} wallets:")
        for wallet in data['wallets']:
            print(f"  - {wallet['publicKey']} ({wallet['label']})")
    else:
        print(f"Error: {data['message']}")

create_wallet_swarm(5)
```

---

### cURL

#### Get All Running Strategies

```bash
curl -X GET 'http://localhost:3001/api/strategy?status=RUNNING' \
  -H 'Content-Type: application/json' | jq
```

#### Withdraw from Burner Wallet

```bash
curl -X POST 'http://localhost:3001/api/wallet/withdraw' \
  -H 'Content-Type: application/json' \
  -d '{
    "botAddress": "7xKW...abc123",
    "destination": "YourWallet...",
    "amount": 1.5
  }' | jq
```

---

## Versioning

This API follows [Semantic Versioning](https://semver.org/):

- **Major version** changes indicate breaking changes
- **Minor version** changes add functionality in a backward-compatible manner
- **Patch version** changes are backward-compatible bug fixes

**Current Version:** 2.0.0
**Previous Version:** 1.0.0 (deprecated)

---

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture overview
- [CLEAN_ARCHITECTURE_STRUCTURE.md](./CLEAN_ARCHITECTURE_STRUCTURE.md) - Code structure
- [STYLE_GUIDE.md](./STYLE_GUIDE.md) - Coding conventions

---

## Support

For API issues or questions:
- GitHub Issues: [github.com/your-repo/cotton-candy-bot/issues](https://github.com)
- Documentation: [docs/](./README.md)
