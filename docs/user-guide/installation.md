# Installation & Setup Guide

**Version:** 2.0.0
**Last Updated:** 2025-12-29

## System Requirements

- **OS:** Windows, macOS, or Linux
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **Memory:** 4GB RAM minimum recommended

## Prerequisites

1. **Solana RPC URL:** You need a high-speed RPC provider (e.g., Helius, QuickNode) for live trading.
2. **Jito Key (Optional):** For MEV protection.

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd cotton-candy-bot
```

### 2. Install Dependencies

You need to install dependencies for both the root (frontend) and the server.

```bash
# Install Frontend Dependencies (using legacy-peer-deps to resolve conflicts)
npm install --legacy-peer-deps

# Install Server Dependencies
cd server
npm install
cd ..
```

### 3. Configuration

Create `.env` files for both the frontend and server.

**Server (`server/.env`):**
```env
PORT=3001
# 32-character random string for encryption
SECRET_KEY=your_super_secret_key_must_be_32_bytes
# Solana RPC URL
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/...
# For production auth
API_KEY=your_access_token
NODE_ENV=development
```

**Frontend (`.env`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Running the Application

You can run both the frontend and backend concurrently.

**Option A: Development Mode (Recommended)**
From the root directory:
```bash
npm run dev
```
This typically starts the Next.js app on `http://localhost:3000` and the Express server on `http://localhost:3001`.

**Option B: Manual Start**

**Terminal 1 (Server):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

## Initial Setup

1. Open your browser to `http://localhost:3000`.
2. You will see the Dashboard.
3. The bot defaults to **Paper Mode**.
4. Go to **Wallet Lab** to generate your first wallet or swarm.
5. Go to **Settings** to verify your connection to the backend.

## Troubleshooting Installation

- **Error: `SECRET_KEY must be at least 32 characters`**
  - Ensure your `server/.env` SECRET_KEY is long enough.
- **Error: `Module not found`**
  - Make sure you ran `npm install` in *both* the root and `server/` directories.
- **Connection Refused**
  - Ensure the backend server is running on port 3001.
