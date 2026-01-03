# Migration Guide: v1.0.0 → v2.0.0

## Overview

This guide provides step-by-step instructions for migrating your Cotton Candy Bot installation from v1.0.0 to v2.0.0. The v2.0.0 release introduces clean architecture patterns, comprehensive documentation, and improved code organization.

**Estimated Migration Time:** 2-4 hours
**Difficulty:** Intermediate
**Reversibility:** High (migration can be rolled back)

---

## Table of Contents

1. [Pre-Migration Checklist](#pre-migration-checklist)
2. [Backup Procedures](#backup-procedures)
3. [Migration Steps](#migration-steps)
4. [Post-Migration Verification](#post-migration-verification)
5. [Rollback Procedures](#rollback-procedures)
6. [Breaking Changes](#breaking-changes)
7. [Troubleshooting](#troubleshooting)

---

## Pre-Migration Checklist

Before starting the migration, ensure:

- [ ] Current version is v1.0.0 (check `package.json`)
- [ ] All active trading strategies are paused or completed
- [ ] Database backup has been created (see [Backup Procedures](#backup-procedures))
- [ ] Node.js version is 18.0.0 or higher
- [ ] You have reviewed [Breaking Changes](#breaking-changes)
- [ ] Development environment is available for testing
- [ ] Git repository is clean (no uncommitted changes)

**Check Current Version:**

```bash
cd cotton-candy-bot
cat package.json | grep version
# Should show: "version": "0.1.0" or "1.0.0"
```

---

## Backup Procedures

### 1. Backup Database

The database contains all strategies, wallet keys, and settings.

```bash
# Create backups directory
mkdir -p backups/pre-v2-migration

# Copy database file
cp server/db.json backups/pre-v2-migration/db.json.backup

# Verify backup
ls -lh backups/pre-v2-migration/
```

### 2. Backup Environment Variables

```bash
# Backup server .env
cp server/.env backups/pre-v2-migration/.env.backup

# If you have frontend .env.local
cp .env.local backups/pre-v2-migration/.env.local.backup 2>/dev/null || true
```

### 3. Export Current Configuration

```bash
# Save current settings via API (if server is running)
curl http://localhost:3001/api/settings > backups/pre-v2-migration/settings.json
curl http://localhost:3001/api/wallet > backups/pre-v2-migration/wallets.json
curl http://localhost:3001/api/strategy > backups/pre-v2-migration/strategies.json
```

### 4. Create Git Backup Branch

```bash
git checkout -b backup-v1.0.0
git add -A
git commit -m "Backup before v2.0.0 migration"
git checkout main  # or your main branch
```

---

## Migration Steps

### Phase 1: Code Update

#### Step 1.1: Stop Running Processes

```bash
# Stop backend server (if running)
# Press Ctrl+C in the server terminal

# Stop frontend dev server (if running)
# Press Ctrl+C in the frontend terminal

# Verify no processes are running on ports 3000/3001
lsof -i :3000  # Should return nothing
lsof -i :3001  # Should return nothing
```

#### Step 1.2: Pull Latest Code

```bash
git fetch origin
git checkout main
git pull origin main

# Or if starting fresh
git clone https://github.com/your-repo/cotton-candy-bot.git cotton-candy-bot-v2
cd cotton-candy-bot-v2
```

#### Step 1.3: Install Dependencies

```bash
# Install frontend dependencies
npm install --legacy-peer-deps

# Install backend dependencies
cd server
npm install
cd ..
```

#### Step 1.4: Verify Installation

```bash
# Check versions
node --version  # Should be v18+
npm --version

# Verify package.json versions
cat package.json | grep '"version"'  # Should show "0.1.0" (to be updated)
cat server/package.json | grep '"version"'  # Should show "1.0.0"
```

---

### Phase 2: File Structure Migration

#### Step 2.1: Understand New Structure

The v2.0.0 release introduces clean architecture layers. Review the new structure:

```bash
# View the new structure documentation
cat docs/CLEAN_ARCHITECTURE_STRUCTURE.md
```

**Key Changes:**
- Source files organized into `domain/`, `application/`, `infrastructure/`, `presentation/`
- Component files now use PascalCase (e.g., `StrategyPanel.tsx`)
- Utility files use camelCase (e.g., `useStrategy.ts`)
- Backend classes organized by layer

#### Step 2.2: Migrate Custom Code (If Any)

If you've made custom modifications to v1.0.0, you'll need to migrate them to the new structure.

**Example: Custom Strategy Type**

**v1.0.0 Location:**
```
src/types/index.ts
```

**v2.0.0 Location:**
```
src/domain/types/strategy.types.ts
```

**Migration:**
```bash
# Review your custom changes
git diff v1.0.0..HEAD src/types/index.ts

# Manually port changes to new location
# Edit: src/domain/types/strategy.types.ts
```

#### Step 2.3: Update Import Paths

The new structure uses path aliases. Update any custom import statements.

**Old (v1.0.0):**
```typescript
import { Strategy } from '../types/index';
import { useStrategy } from '../../hooks/useStrategy';
```

**New (v2.0.0):**
```typescript
import { Strategy } from '@/domain/entities/strategy.entity';
import { useStrategy } from '@/presentation/hooks/useStrategy';
```

**Automated Migration:**
```bash
# Run the import path migration script (if available)
npm run migrate:imports
```

---

### Phase 3: Database Migration

#### Step 3.1: Backup Current Database Again

```bash
cp server/db.json backups/pre-v2-migration/db-$(date +%Y%m%d-%H%M%S).json
```

#### Step 3.2: Run Database Migration Script

```bash
cd server
node scripts/migrate-db-v2.js

# Expected output:
# ✓ Database schema validated
# ✓ Added new fields: strategy.version
# ✓ Migrated 5 strategies
# ✓ Migrated 3 wallets
# ✓ Updated settings schema
# Migration completed successfully
```

#### Step 3.3: Verify Database Schema

```bash
# Check the migrated database
cat server/db.json | jq '.strategies[0]'

# Should include new v2.0.0 fields:
# {
#   "id": "...",
#   "version": "2.0.0",  // NEW
#   "type": "DCA",
#   ...
# }
```

---

### Phase 4: Configuration Update

#### Step 4.1: Update Environment Variables

The v2.0.0 release may introduce new environment variables.

```bash
# Edit server/.env
nano server/.env
```

**New Variables (add if missing):**
```env
# Existing variables (keep as-is)
PORT=3001
SECRET_KEY=your_secret_key_here
RPC_URL=your_rpc_url_here
JITO_TIP_WALLET=96gYZG...

# New in v2.0.0 (optional)
LOG_LEVEL=info                    # NEW: info, debug, warn, error
ENABLE_API_DOCS=true              # NEW: Enable API documentation endpoint
MAX_CONCURRENT_STRATEGIES=10      # NEW: Limit concurrent strategies
```

#### Step 4.2: Update Frontend Configuration

```bash
# Create .env.local if it doesn't exist
touch .env.local
```

**Frontend Environment Variables:**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_ENABLE_PAPER_MODE=true
```

---

### Phase 5: Restart and Verification

#### Step 5.1: Start Backend Server

```bash
cd server
npm start

# Expected output:
# Server running on port 3001
# Trading Engine started...
# Database loaded: 5 strategies, 3 wallets
```

#### Step 5.2: Start Frontend Server

```bash
# In a new terminal, from project root
npm run dev

# Expected output:
#   ▲ Next.js 14.2.3
#   - Local:        http://localhost:3000
#   - Ready in 2.3s
```

#### Step 5.3: Verify Application

Open your browser to `http://localhost:3000` and verify:

- [ ] Dashboard loads without errors
- [ ] Existing strategies are visible
- [ ] Wallet balances display correctly
- [ ] No console errors in browser DevTools
- [ ] Socket.io connection established (check Network tab)

---

## Post-Migration Verification

### Automated Verification

Run the verification script to check the migration:

```bash
npm run verify:migration

# Expected output:
# ✓ File structure matches clean architecture
# ✓ All dependencies installed
# ✓ Database schema is valid
# ✓ Environment variables configured
# ✓ Frontend builds successfully
# ✓ Backend starts without errors
# ✓ All tests pass
#
# Migration verification: PASSED
```

### Manual Verification Checklist

- [ ] **Database Integrity:**
  - All strategies from v1.0.0 are present
  - Wallet data is intact (balances, labels, encrypted keys)
  - Settings are preserved

- [ ] **Functionality:**
  - Can create new strategies
  - Can start/pause/delete strategies
  - Can create burner wallets
  - Can withdraw funds from burners
  - WebSocket events are received in frontend

- [ ] **Performance:**
  - Engine tick loop runs at 200ms intervals
  - No memory leaks (check with `node --inspect`)
  - UI is responsive

- [ ] **Documentation:**
  - Review new documentation in `docs/`
  - Check UML diagrams in `docs/diagrams/`
  - Read API reference updates

### Test Strategy Execution

Create a test DCA strategy to verify end-to-end functionality:

```bash
# Create test strategy via API
curl -X POST http://localhost:3001/api/strategy/create \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "DCA",
    "config": {
      "targetToken": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "amountInSol": 0.1,
      "intervalSeconds": 60
    }
  }'

# Start the strategy
curl -X POST http://localhost:3001/api/strategy/{STRATEGY_ID}/start

# Monitor execution in the UI
# Should see "Trade Execution" events in the dashboard
```

---

## Rollback Procedures

If you encounter issues, you can roll back to v1.0.0.

### Quick Rollback

```bash
# Stop all processes
# Ctrl+C in all terminals

# Restore database
cp backups/pre-v2-migration/db.json.backup server/db.json

# Restore environment
cp backups/pre-v2-migration/.env.backup server/.env

# Checkout backup branch
git checkout backup-v1.0.0

# Reinstall dependencies
npm install --legacy-peer-deps
cd server && npm install && cd ..

# Restart servers
cd server && npm start &
npm run dev
```

### Detailed Rollback

If the quick rollback fails, follow these steps:

1. **Stop all Node.js processes:**
   ```bash
   pkill -f node
   ```

2. **Clean installation:**
   ```bash
   rm -rf node_modules server/node_modules
   git checkout backup-v1.0.0
   npm install --legacy-peer-deps
   cd server && npm install && cd ..
   ```

3. **Restore all backups:**
   ```bash
   cp backups/pre-v2-migration/db.json.backup server/db.json
   cp backups/pre-v2-migration/.env.backup server/.env
   cp backups/pre-v2-migration/.env.local.backup .env.local 2>/dev/null || true
   ```

4. **Verify v1.0.0 restoration:**
   ```bash
   cat package.json | grep version
   # Should show v1.0.0
   ```

5. **Restart:**
   ```bash
   cd server && npm start &
   npm run dev
   ```

---

## Breaking Changes

### API Changes

#### 1. Strategy Creation Endpoint

**v1.0.0:**
```javascript
POST /api/strategy
{
  "type": "DCA",
  "targetToken": "...",
  "amountInSol": 1
}
```

**v2.0.0:**
```javascript
POST /api/strategy/create
{
  "type": "DCA",
  "config": {
    "targetToken": "...",
    "amountInSol": 1
  }
}
```

**Migration:** Wrap strategy parameters in `config` object.

---

#### 2. Socket.io Event Names

**v1.0.0:**
- `strategy_update` → **v2.0.0:** `strategy_status`
- `balance_update` → **v2.0.0:** `wallet_update`

**Migration:** Update event listeners in your frontend code.

```typescript
// Old
socket.on('balance_update', handleBalanceUpdate);

// New
socket.on('wallet_update', handleWalletUpdate);
```

---

### File Structure Changes

#### Component File Names

**v1.0.0:** kebab-case
```
src/components/dashboard/strategy-config.tsx
```

**v2.0.0:** PascalCase
```
src/presentation/components/features/trading/StrategyConfig.tsx
```

**Migration:** If you have custom components, rename them to PascalCase.

---

### Import Path Changes

**v1.0.0:**
```typescript
import { useTradingStore } from '@/store/useTradingStore';
```

**v2.0.0:**
```typescript
import { useTradingStore } from '@/presentation/state/stores/tradingStore';
```

**Migration:** Update import statements to use new paths. The `@/` alias now points to `src/`.

---

## Troubleshooting

### Issue 1: Module Not Found Errors

**Symptom:**
```
Error: Cannot find module '@/domain/entities/Strategy'
```

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install --legacy-peer-deps

# Restart dev server
npm run dev
```

---

### Issue 2: Database Schema Errors

**Symptom:**
```
Error: Invalid strategy schema - missing 'config' field
```

**Solution:**
```bash
# Re-run database migration
cd server
node scripts/migrate-db-v2.js --force

# If still fails, restore backup and re-migrate
cp ../backups/pre-v2-migration/db.json.backup db.json
node scripts/migrate-db-v2.js
```

---

### Issue 3: WebSocket Connection Failed

**Symptom:**
```
WebSocket connection to 'ws://localhost:3001' failed
```

**Solution:**
```bash
# Check if backend is running
curl http://localhost:3001/health

# Restart backend
cd server
npm start

# Check CORS settings in server/index.js
# Ensure frontend URL is allowed
```

---

### Issue 4: Wallet Decryption Errors

**Symptom:**
```
Error: Failed to decrypt wallet key
```

**Solution:**
```bash
# Verify SECRET_KEY hasn't changed
cat server/.env | grep SECRET_KEY

# Compare with backup
cat backups/pre-v2-migration/.env.backup | grep SECRET_KEY

# If different, restore original SECRET_KEY
# DO NOT change SECRET_KEY after wallets are encrypted
```

---

### Issue 5: Type Errors in TypeScript

**Symptom:**
```
Type 'Strategy' is not assignable to type 'StrategyEntity'
```

**Solution:**
```bash
# Regenerate TypeScript types
npm run type-check

# If errors persist, check import paths
# Ensure you're importing from correct locations:
# - Domain types: @/domain/types/
# - Entities: @/domain/entities/
```

---

## Need Help?

If you encounter issues not covered in this guide:

1. **Check Documentation:**
   - [ARCHITECTURE.md](./ARCHITECTURE.md)
   - [API_REFERENCE_V2.md](./API_REFERENCE_V2.md)
   - [CLEAN_ARCHITECTURE_STRUCTURE.md](./CLEAN_ARCHITECTURE_STRUCTURE.md)

2. **Search Issues:**
   - [GitHub Issues](https://github.com/your-repo/cotton-candy-bot/issues)

3. **Create New Issue:**
   - Include error messages
   - Attach logs from `server/logs/`
   - Specify your environment (OS, Node version, etc.)

4. **Community:**
   - Discord: [link]
   - Telegram: [link]

---

## Post-Migration Maintenance

After successfully migrating to v2.0.0:

1. **Review New Documentation:**
   - Read the updated [ARCHITECTURE.md](./ARCHITECTURE.md)
   - Study the new [STYLE_GUIDE.md](./STYLE_GUIDE.md)
   - Explore UML diagrams in `docs/diagrams/`

2. **Update Your Workflows:**
   - Adopt new naming conventions for future code
   - Follow clean architecture patterns for new features
   - Use provided ESLint/Prettier configurations

3. **Monitor Performance:**
   - Check engine tick loop performance
   - Monitor memory usage
   - Review logs for any warnings

4. **Cleanup:**
   - After 1 week of stable operation, you can delete backup branch:
     ```bash
     git branch -D backup-v1.0.0
     ```
   - Keep database backups for at least 30 days

---

## Version History

| Version | Release Date | Migration Guide |
|---------|--------------|-----------------|
| 2.0.0   | 2025-12-29   | This document   |
| 1.0.0   | 2025-12-29   | N/A (initial)   |

---

**Congratulations!** You've successfully migrated to v2.0.0. Enjoy the improved architecture and comprehensive documentation.
