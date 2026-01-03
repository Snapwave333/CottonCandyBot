# Troubleshooting Procedures - Cotton Candy Bot v2.1.0-beta

## Common Issues

### 1. Port 3000 or 3021 Already in Use
- **Symtom**: The application fails to start with an `EADDRINUSE` error.
- **Fix**: Identify the process using the port and terminate it, or change the port in `.env`.
  - Windows: `netstat -ano | findstr :3000`
  - Linux: `lsof -i :3000`

### 2. Missing Dependencies
- **Symtom**: `Error: Cannot find module '...'`
- **Fix**: Re-run `install.bat` or execute `npm install --production --legacy-peer-deps`.

### 3. Solana RPC Connection Failures
- **Symtom**: Dashboard shows 0 balance or "Disconnected" status.
- **Fix**: Verify your `SOLANA_RPC_URL` in `.env`. Ensure your network is not blocking the RPC endpoint. Use a premium RPC provider for better stability.

### 4. Hydration Mismatch Warnings
- **Symtom**: Console warnings about server/client HTML mismatch.
- **Fix**: These are often benign in beta but can be resolved by ensuring your system clock is synchronized.

## Getting Help
If you encounter an issue not listed here, please:
1. Check the logs in the `./logs/` directory.
2. Open an issue on GitHub with the relevant log snippets.
