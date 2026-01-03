# API Reference

**Version:** 2.0.0
**Last Updated:** 2025-12-30
**Base URL:** `http://localhost:3021/api`

## Overview

The Cotton Candy Bot API provides endpoints for managing wallets, settings, strategies, and bot operations. It is a RESTful API served by an Express.js server.

## Authentication

- **Development:** Authentication is bypassed.
- **Production:** Requires `Authorization: Bearer <API_KEY>` header.
- **Errors:** Returns `401 Unauthorized` if the key is missing or invalid.

## Endpoints

### Health Check

**GET** `/health`

Checks if the API server is running.

- **Response:**
  ```json
  {
    "status": "ok",
    "timestamp": 1700000000000
  }
  ```

### Portfolio Management

#### Get Portfolio History

**GET** `/portfolio/history`

Retrieves historical portfolio value snapshots (Paper vs Live) for charting.

- **Response:**
  ```json
  [
    {
      "timestamp": 1700000000000,
      "paperValue": 105.00,
      "liveValue": 0.00
    }
  ]
  ```

### Strategy Management

#### Get Strategies

**GET** `/strategies`

Retrieves all active strategies.

- **Response:** Array of `Strategy` objects.

#### Create Strategy

**POST** `/strategies`

Adds a new trading strategy.

- **Body:**
  ```json
  {
    "id": "sniper-123",
    "type": "SNIPER",
    "config": { ... }
  }
  ```

#### Update Strategy

**PATCH** `/strategies/:id`

Updates a strategy's status or configuration.

- **Body:**
  ```json
  {
    "status": "RUNNING"
  }
  ```

#### Delete Strategy

**DELETE** `/strategies/:id`

Removes a strategy and stops its active listeners.

### Wallet Management

#### Get Wallets

**GET** `/wallet`

Retrieves a list of all managed wallets.

- **Response:** Array of `Wallet` objects.
  ```json
  [
    {
      "publicKey": "...",
      "encryptedKey": "...",
      "balance": 100,
      "label": "Bot Wallet",
      "isPaper": true
    }
  ]
  ```

#### Create Wallet

**POST** `/wallet/create`

Generates a new Solana keypair and stores it securely.

- **Body:**
  ```json
  {
    "label": "My New Wallet"
  }
  ```
- **Response:**
  ```json
  {
    "publicKey": "..."
  }
  ```

#### Create Swarm

**POST** `/wallet/swarm`

Generates multiple wallets at once for swarm trading strategies.

- **Body:**
  ```json
  {
    "count": 5
  }
  ```
- **Response:** Array of created wallets (public keys and labels).
  ```json
  [
    { "publicKey": "...", "label": "Swarm 1" },
    { "publicKey": "...", "label": "Swarm 2" }
  ]
  ```

#### Withdraw Funds

**POST** `/wallet/withdraw`

Transfers SOL from a managed wallet to an external destination.

- **Body:**
  ```json
  {
    "botAddress": "...",
    "destination": "...",
    "amount": 1.5
  }
  ```
- **Response:**
  ```json
  {
    "signature": "..."
  }
  ```

### Settings

#### Get Settings

**GET** `/settings`

Retrieves current global bot settings.

- **Response:**
  ```json
  {
    "defaultPaperBalanceUSD": 100,
    "isPaperMode": true
  }
  ```

#### Update Settings

**POST** `/settings`

Updates global bot settings.

- **Body:** Partial settings object.
  ```json
  {
    "isPaperMode": false
  }
  ```
- **Response:** Updated settings object.

## Error Handling

The API uses standard HTTP status codes:
- `200`: Success
- `400`: Validation Error
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

Error responses follow this format:
```json
{
  "error": "Error message description"
}
```
