# Troubleshooting Guide

**Version:** 1.0.0
**Last Updated:** 2025-12-29

## Common Issues

### 1. "Server Disconnected" or API Errors
**Symptoms:** Red status indicator, data not loading.
**Causes:**
- Backend server is not running.
- Port 3021 is blocked.
**Solution:**
- Check the terminal running the server.
- Restart the server: `npm run dev` in `server/`.

### 2. "Insufficient Funds" (Live Mode)
**Symptoms:** Transactions failing.
**Solution:**
- Check the balance of the specific *Burner Wallet* assigned to the strategy, not just your total portfolio.
- Send more SOL to the wallet address shown in Wallet Lab.

### 3. Transactions Dropping / Timeout
**Symptoms:** Logs show "Timeout" or "Blockhash not found".
**Causes:**
- Solana network congestion.
- Poor RPC node performance.
**Solution:**
- Upgrade your RPC URL in `server/.env`.
- Increase priority fees (if configurable in settings).

### 4. "Secret Key Length Error"
**Error:** `SECRET_KEY must be at least 32 characters`
**Solution:**
- Edit `server/.env` and make the `SECRET_KEY` longer.

### 5. Build/Install Errors
**Error:** `EADDRINUSE: address already in use :::3021` or `:::3000`
**Solution:**
- The server port is busy. Kill the existing process:
  - **Windows:** `taskkill /F /IM node.exe`
  - **Mac/Linux:** `lsof -i :3021` then `kill -9 <PID>`

### 6. "ERR_ABORTED" or Connection Refused
**Symptoms:** White screen or console errors when navigating to pages like `/wallet-lab`.
**Causes:**
- Backend port conflict (e.g., trying to use 3000 which is taken by Frontend).
- Authentication middleware rejecting requests in Development.
**Solution:**
- Ensure `server/.env` has `PORT=3021`.
- Verify `client/.env.local` or `src/store/useTradingStore.ts` uses `http://localhost:3021`.

### 7. Infinite Server Restart Loop
**Symptoms:** Terminal spammed with `[nodemon] restarting due to changes...`
**Causes:**
- `nodemon` is watching `db.json` which changes on every request.
**Solution:**
- Update `package.json` ignore pattern: `nodemon server/index.js --ignore db.json`.

### 8. "429 Too Many Requests"
**Symptoms:** API calls failing during tests or high load.
**Solution:**
- Increase `RATE_LIMIT_MAX_REQUESTS` in `server/.env` (e.g., to 10000).

**Error:** `PostCSS plugin tailwindcss requires PostCSS 8`
**Solution:**
- Ensure `postcss.config.js` is present and configured correctly.
- Run `npm install --legacy-peer-deps` to ensure compatible versions.

**Error:** `next/font` module not found
**Solution:**
- This usually indicates a dependency installation failure. Run `npm install --legacy-peer-deps` again.

## Diagnostic Procedures

### Viewing Logs
- **Frontend:** Check the "System Logs" panel on the dashboard.
- **Backend:** Check the terminal output where `node index.js` is running.

### Resetting the Database
If data is corrupted:
1. Stop the server.
2. Delete or rename `server/db.json`.
3. Restart the server (a new `db.json` will be created).
4. **Warning:** This deletes all wallets and settings!

## Support
For technical support, please open an issue on the GitHub repository.
