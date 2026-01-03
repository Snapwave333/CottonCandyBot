# API Reference

The Cotton Candy Terminal operates on a distributed architecture with a Node.js backend managing high-frequency trading logic and a Next.js frontend for visualization.

## REST API Endpoints (Backend: Port 3001)

### Wallet Management

#### `GET /api/wallet`
Retrieves a list of all server-side wallets (Burners).
- **Response**: `Array<WalletObject>`

#### `POST /api/wallet/create`
Generates a new AES-256 encrypted burner wallet.
- **Body**: `{ "label": string }`
- **Response**: `{ "publicKey": string }`

#### `POST /api/wallet/swarm`
Generates a batch of burner wallets for trade distribution.
- **Body**: `{ "count": number }`
- **Response**: `Array<{ "publicKey": string, "label": string }>`

#### `POST /api/wallet/withdraw`
Transfers SOL from a burner wallet to a destination.
- **Body**: `{ "botAddress": string, "destination": string, "amount": number }`
- **Response**: `{ "signature": string }`

### System Settings

#### `GET /api/settings`
Retrieves current bot configuration.
- **Response**: `SettingsObject`

#### `POST /api/settings`
Updates bot configuration (e.g., Paper Mode, RPC URL).
- **Body**: `Partial<SettingsObject>`

---

## Socket.io Events

The frontend subscribes to real-time events for live updates.

### Subscribed Events (Received by Client)

| Event | Description | Data Format |
|-------|-------------|-------------|
| `wallet_update` | Triggered on balance changes. | `{ "publicKey": string, "balance": number }` |
| `log` | Real-time execution logs. | `{ "timestamp": number, "message": string, "type": "info" \| "success" \| "error" }` |
| `trade_execution` | Result of a strategy-triggered trade. | `{ "success": boolean, "signature": string, "amount": number }` |

### Published Events (Sent by Client)

| Event | Description | Payload |
|-------|-------------|---------|
| `ping` | Heartbeat keep-alive. | `null` |
