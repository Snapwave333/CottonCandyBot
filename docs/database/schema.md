# Database Schema Documentation

**Version:** 1.0.0
**Last Updated:** 2025-12-29
**Storage Engine:** LowDB (JSON file)
**File Location:** `server/db.json`

## Overview

The system uses a lightweight, JSON-based database (`lowdb`) suitable for local execution and single-instance deployments. The database is persisted to a `db.json` file in the server directory.

## Schema Structure

The root JSON object contains the following collections:

```json
{
  "strategies": [],
  "wallets": [],
  "logs": [],
  "settings": {}
}
```

### Collections

#### 1. Wallets (`wallets`)

Stores information about managed Solana wallets (Burner Wallets).

| Field | Type | Description |
|-------|------|-------------|
| `publicKey` | String | The base58 public key of the wallet. Primary Key. |
| `encryptedKey` | String | The private key encrypted with the system's `SECRET_KEY`. |
| `label` | String | User-defined label for the wallet (e.g., "Swarm 1"). |
| `balance` | Number | Cached balance. For Paper mode, this is simulated USD. For Live, it's SOL (lamports). |
| `isPaper` | Boolean | Indicates if this wallet is a simulation wallet. |
| `clusterId` | String | (Optional) ID of the wallet cluster this wallet belongs to. |

**Example:**
```json
{
  "publicKey": "5yst...",
  "encryptedKey": "a7f2...",
  "label": "Main Bot",
  "balance": 100,
  "isPaper": true
}
```

#### 2. Settings (`settings`)

Global configuration for the bot.

| Field | Type | Description |
|-------|------|-------------|
| `defaultPaperBalanceUSD` | Number | Starting balance for new paper wallets. |
| `isPaperMode` | Boolean | Global switch for trading mode (Paper vs. Live). |

**Example:**
```json
{
  "defaultPaperBalanceUSD": 100,
  "isPaperMode": true
}
```

#### 3. Strategies (`strategies`)

Active and past trading strategies.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique UUID. |
| `type` | String | Strategy type (SNIPER, DCA, DIP_CATCHER, etc.). |
| `status` | String | Current state (IDLE, RUNNING, PAUSED). |
| `config` | Object | Strategy-specific configuration (targetToken, amount, etc.). |
| `logs` | Array | Execution logs specific to this strategy. |
| `createdAt` | Number | Timestamp. |

**Example:**
```json
{
  "id": "uuid-123",
  "type": "SNIPER",
  "status": "RUNNING",
  "config": {
    "targetToken": "EPjFW...",
    "amountInSol": 1.0
  },
  "logs": [],
  "createdAt": 1700000000000
}
```

#### 4. Logs (`logs`)

System-wide logs (optional, primarily used for debugging).

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | Number | Unix timestamp. |
| `message` | String | Log message. |
| `type` | String | Level (INFO, ERROR, WARNING). |

## Data Retention & Archiving

- **Persistence:** Data is written to disk asynchronously on every write operation.
- **Backup:** It is recommended to back up `db.json` regularly.
- **Optimization:** The database is loaded into memory. Large log history should be pruned periodically to prevent memory issues.
