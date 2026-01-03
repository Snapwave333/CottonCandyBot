# User Manual

**Version:** 2.0.0
**Last Updated:** 2025-12-30

## Introduction
Cotton Candy Bot is a powerful tool for automating Solana trading strategies. This manual covers the core features and workflows.

## Dashboard Overview
The Dashboard is your command center. It displays:
- **Active Strategies:** Running bots.
- **Portfolio:** Current holdings (Real or Paper).
- **Analytics:** Real-time Win Rate, Total Trades, and PnL tracking.
- **Logs:** Real-time system events.
- **Control Panel:** Start/Stop/Pause global controls.

## Features

### 1. Trading Modes
- **Paper Mode (Default):** Simulates trading with fake money ($100 default). Perfect for testing strategies without risk.
- **Live Mode:** Executes real transactions on the Solana blockchain. **Use with caution.**

### 2. Error Handling & Notifications
- **Toast Notifications:** The bot now provides real-time feedback for all actions.
  - **Success:** Green toasts for successful trades or saved settings.
  - **Error:** Red toasts for failed transactions or validation errors.
- **Circuit Breaker:** If the bot encounters 3 consecutive critical errors (e.g., transaction failures), it will automatically pause and play an audible alarm to protect your funds.

### 3. User Interface
- **Neon Scrollbars:** Custom-themed scrollbars for a consistent aesthetic.
- **Neon Scrollbars:** Custom-themed scrollbars for a consistent aesthetic.
- **Responsive Charts:** Real-time P/L charts using Lightweight Charts, optimized for performance.
- **Live Analytics:** Track your **Win Rate**, **Total Trades**, and **Realized/Unrealized PnL** directly on the dashboard.

### 4. Wallet Lab
Located in the "Wallet" tab.
- **Create Wallet:** Generates a single burner wallet.
- **Create Swarm:** Generates multiple wallets (e.g., 5) for distributed trading.
- **Withdraw:** Send funds from a bot wallet to your main wallet.

### 3. Strategy Configuration
You can configure different types of strategies:
- **Sniper:** Buys a token immediately upon liquidity detection (requires specific configuration).
- **DCA (Dollar Cost Averaging):** Buys a fixed amount at set intervals.
- **Dip Catcher:** Buys when price drops by X%.

## Workflows

### How to Start a Paper Trade
1. Ensure the toggle in the header says **Paper**.
2. Go to **Strategies**.
3. Click **New Strategy**.
4. Select **Sniper** or **Custom**.
5. Enter a target Token Mint Address (e.g., `EPjFW...` for USDC).
6. Set amount (e.g., 0.1 SOL).
7. Click **Start**.
8. Watch the Real-time P/L Chart updates.
9. Watch the **Logs** for "Paper BUY" events.

### How to Switch to Live Trading
1. **Warning:** Ensure you have backed up your wallet keys.
2. Fund your generated Bot Wallet (copy address from Wallet Lab).
3. Toggle the switch in the header to **Live**.
4. The system will now sign and send real transactions using your RPC.

## Keyboard Shortcuts
- `Esc`: Close modals.
- `Ctrl + /`: Toggle command palette (if enabled).

## Accessibility
- The UI supports high-contrast dark mode by default.
- All form inputs are labeled for screen readers.
