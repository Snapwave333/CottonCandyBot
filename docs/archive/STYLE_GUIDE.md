# Cotton Candy Bot - Style Guide v2.0.0

## Overview

This style guide defines the coding standards for the Cotton Candy Bot project, based on industry-leading conventions from Airbnb and Google style guides, adapted for our TypeScript/JavaScript codebase.

**Version:** 2.0.0
**Last Updated:** 2025-12-29
**Status:** Active

## Table of Contents

- [General Principles](#general-principles)
- [File Naming Conventions](#file-naming-conventions)
- [TypeScript/JavaScript Style](#typescriptjavascript-style)
- [React/JSX Style](#reactjsx-style)
- [Node.js Backend Style](#nodejs-backend-style)
- [Documentation Standards](#documentation-standards)
- [Git Commit Messages](#git-commit-messages)

---

## General Principles

### The Four Pillars

1. **Clarity over Cleverness**: Code should be self-explanatory
2. **Consistency**: Follow established patterns throughout the codebase
3. **Simplicity**: Prefer simple solutions to complex ones
4. **Testability**: Write code that's easy to test

### Code Review Checklist

- [ ] Follows naming conventions
- [ ] Has appropriate documentation
- [ ] Includes error handling
- [ ] Is properly typed (TypeScript)
- [ ] Has no console.log statements (use proper logging)
- [ ] Passes ESLint without warnings

---

## File Naming Conventions

### General Rules

Based on **Airbnb JavaScript Style Guide** with adaptations for Next.js/React.

#### React Components

```
Format: PascalCase for component files
Extension: .tsx for TypeScript components

Examples:
✅ StrategyConfigPanel.tsx
✅ ExecutionTerminal.tsx
✅ BurnerWalletManager.tsx

❌ strategy-config-panel.tsx
❌ executionTerminal.tsx
❌ burner_wallet_manager.tsx
```

#### Non-Component TypeScript Files

```
Format: camelCase for utilities, services, hooks
Extension: .ts for TypeScript

Examples:
✅ useStrategy.ts (hooks)
✅ strategyService.ts (services)
✅ formatCurrency.ts (utilities)
✅ tokenValidator.ts (validators)

❌ UseStrategy.ts
❌ strategy_service.ts
❌ format-currency.ts
```

#### JavaScript Backend Files

```
Format: PascalCase for classes, camelCase for utilities
Extension: .js (with ES modules)

Examples:
✅ StrategyController.js (class)
✅ ExecutionEngine.js (class)
✅ strategyRoutes.js (router)
✅ errorHandler.js (middleware)

❌ strategy-controller.js
❌ execution_engine.js
```

#### Test Files

```
Format: Match source file name + .test or .spec
Extension: .test.ts, .test.tsx, .spec.ts

Examples:
✅ StrategyConfigPanel.test.tsx
✅ strategyService.spec.ts
✅ ExecutionEngine.test.js

❌ strategyConfigPanelTest.tsx
❌ test_strategy_service.ts
```

#### Directory Names

```
Format: kebab-case for all directories
Exceptions: Special Next.js directories like app/, api/

Examples:
✅ use-cases/
✅ domain-entities/
✅ strategy-management/
✅ components/features/trading/

❌ useCases/
❌ DomainEntities/
❌ strategy_management/
```

### File Organization

```
src/
├── domain/
│   ├── entities/
│   │   ├── Strategy.entity.ts        # Class name: Strategy
│   │   └── BurnerWallet.entity.ts    # Class name: BurnerWallet
│   └── value-objects/
│       └── Amount.vo.ts              # Class name: Amount
├── application/
│   ├── use-cases/
│   │   └── createStrategy.useCase.ts # Function: createStrategyUseCase
│   └── services/
│       └── tradingService.ts         # Export: tradingService
├── presentation/
│   ├── components/
│   │   ├── StrategyPanel.tsx         # Component: StrategyPanel
│   │   └── WalletCard.tsx            # Component: WalletCard
│   └── hooks/
│       └── useStrategy.ts            # Hook: useStrategy
└── lib/
    └── utils/
        └── formatters.ts             # Export: formatCurrency, formatDate
```

---

## TypeScript/JavaScript Style

Based on **Google TypeScript Style Guide** and **Airbnb JavaScript Style Guide**.

### 1. Type Annotations

```typescript
// ✅ GOOD: Explicit return types for public functions
export function calculatePnL(entry: number, current: number): number {
  return ((current - entry) / entry) * 100;
}

// ❌ BAD: Missing return type
export function calculatePnL(entry: number, current: number) {
  return ((current - entry) / entry) * 100;
}

// ✅ GOOD: Interface for object shapes
interface StrategyConfig {
  targetToken: string;
  amountInSol: number;
  intervalSeconds?: number;
}

// ❌ BAD: Using 'any'
function processConfig(config: any) {
  // ...
}

// ✅ GOOD: Proper typing
function processConfig(config: StrategyConfig): void {
  // ...
}
```

### 2. Naming Conventions

```typescript
// Constants: SCREAMING_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_SLIPPAGE_BPS = 50;

// Variables/Functions: camelCase
let strategyCount = 0;
function executeStrategy() {}

// Classes/Interfaces/Types: PascalCase
class ExecutionEngine {}
interface StrategyConfig {}
type StrategyType = 'SNIPER' | 'DCA';

// Private class members: prefix with underscore (optional)
class Engine {
  private _connection: Connection;
  private _isRunning: boolean;

  // Or without prefix (preferred in modern TS)
  private connection: Connection;
  private isRunning: boolean;
}

// Boolean variables: prefix with is, has, should, can
const isActive = true;
const hasBalance = wallet.balance > 0;
const shouldExecute = strategy.status === 'RUNNING';
const canTrade = hasBalance && isActive;
```

### 3. Functions

```typescript
// ✅ GOOD: Arrow functions for callbacks
const filtered = strategies.filter((s) => s.status === 'RUNNING');

// ✅ GOOD: Named functions for top-level declarations
export function createStrategy(config: StrategyConfig): Strategy {
  // ...
}

// ✅ GOOD: Async/await over promises
async function fetchQuote(inputMint: string, outputMint: string): Promise<Quote> {
  const response = await fetch(`/api/quote?input=${inputMint}&output=${outputMint}`);
  return response.json();
}

// ❌ BAD: Promise chains when async/await is clearer
function fetchQuote(inputMint: string, outputMint: string): Promise<Quote> {
  return fetch(`/api/quote?input=${inputMint}&output=${outputMint}`)
    .then((res) => res.json());
}

// ✅ GOOD: Default parameters
function executeWithRetry(fn: () => Promise<void>, maxAttempts: number = 3) {
  // ...
}

// ❌ BAD: Manual default handling
function executeWithRetry(fn: () => Promise<void>, maxAttempts?: number) {
  const attempts = maxAttempts || 3;
  // ...
}
```

### 4. Destructuring

```typescript
// ✅ GOOD: Object destructuring
const { targetToken, amountInSol, intervalSeconds } = strategyConfig;

// ❌ BAD: Accessing properties repeatedly
const token = strategyConfig.targetToken;
const amount = strategyConfig.amountInSol;

// ✅ GOOD: Array destructuring
const [first, second] = wallets;

// ✅ GOOD: Destructuring in function parameters
function createStrategy({ type, config }: CreateStrategyInput): Strategy {
  // ...
}
```

### 5. Template Literals

```typescript
// ✅ GOOD: Template literals for string interpolation
const message = `Executed ${strategy.type} strategy for ${amount} SOL`;

// ❌ BAD: String concatenation
const message = 'Executed ' + strategy.type + ' strategy for ' + amount + ' SOL';

// ✅ GOOD: Multi-line strings
const query = `
  SELECT * FROM strategies
  WHERE status = 'RUNNING'
  AND created_at > '2025-01-01'
`;
```

### 6. Error Handling

```typescript
// ✅ GOOD: Custom error classes
export class InsufficientBalanceError extends Error {
  constructor(
    public required: number,
    public available: number
  ) {
    super(`Insufficient balance: required ${required}, available ${available}`);
    this.name = 'InsufficientBalanceError';
  }
}

// ✅ GOOD: Proper error handling
async function executeTrade(strategy: Strategy): Promise<TradeResult> {
  try {
    const quote = await fetchQuote(strategy.config.targetToken);
    return await submitTransaction(quote);
  } catch (error) {
    if (error instanceof InsufficientBalanceError) {
      logger.warn('Insufficient balance', { error });
      throw error;
    }
    logger.error('Unexpected error executing trade', { error });
    throw new Error('Trade execution failed');
  }
}

// ❌ BAD: Silent error swallowing
async function executeTrade(strategy: Strategy) {
  try {
    const quote = await fetchQuote(strategy.config.targetToken);
    return await submitTransaction(quote);
  } catch (error) {
    console.log('Error:', error);
    return null; // Silent failure!
  }
}
```

### 7. Imports/Exports

```typescript
// ✅ GOOD: Named exports (preferred)
export function createStrategy() {}
export class ExecutionEngine {}

// ✅ GOOD: Grouped imports
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Jupiter } from '@jup-ag/core';

// ✅ GOOD: Import ordering
// 1. External libraries
import React from 'react';
import { Connection } from '@solana/web3.js';

// 2. Internal absolute imports (@/)
import { Strategy } from '@/domain/entities/Strategy.entity';
import { useStrategy } from '@/presentation/hooks/useStrategy';

// 3. Relative imports
import { formatCurrency } from '../utils/formatters';

// ❌ BAD: Mixed ordering
import { formatCurrency } from '../utils/formatters';
import React from 'react';
import { Strategy } from '@/domain/entities/Strategy.entity';
```

---

## React/JSX Style

Based on **Airbnb React/JSX Style Guide**.

### 1. Component Definition

```tsx
// ✅ GOOD: Function component with TypeScript
interface StrategyPanelProps {
  strategy: Strategy;
  onExecute: (strategyId: string) => void;
  isLoading?: boolean;
}

export function StrategyPanel({ strategy, onExecute, isLoading = false }: StrategyPanelProps) {
  return (
    <div className="strategy-panel">
      <h2>{strategy.type}</h2>
      <button onClick={() => onExecute(strategy.id)} disabled={isLoading}>
        Execute
      </button>
    </div>
  );
}

// ❌ BAD: No prop types, inline defaults
export function StrategyPanel({ strategy, onExecute, isLoading }) {
  return (
    <div className="strategy-panel">
      <h2>{strategy.type}</h2>
      <button onClick={() => onExecute(strategy.id)} disabled={isLoading || false}>
        Execute
      </button>
    </div>
  );
}
```

### 2. Hooks

```tsx
// ✅ GOOD: Hooks at top level, proper dependencies
export function StrategyPanel({ strategyId }: { strategyId: string }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Strategy | null>(null);

  useEffect(() => {
    async function loadStrategy() {
      setLoading(true);
      try {
        const strategy = await fetchStrategy(strategyId);
        setData(strategy);
      } finally {
        setLoading(false);
      }
    }
    loadStrategy();
  }, [strategyId]);

  if (loading) return <Spinner />;
  if (!data) return <Error message="Strategy not found" />;

  return <div>{data.type}</div>;
}

// ❌ BAD: Missing dependencies, no loading state
export function StrategyPanel({ strategyId }: { strategyId: string }) {
  const [data, setData] = useState<Strategy | null>(null);

  useEffect(() => {
    fetchStrategy(strategyId).then(setData);
  }, []); // Missing strategyId dependency!

  return <div>{data?.type}</div>; // Potential null reference
}
```

### 3. Event Handlers

```tsx
// ✅ GOOD: Named handler functions
export function StrategyPanel({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSubmit(formData);
  };

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}

// ❌ BAD: Inline handlers (hard to test/debug)
export function StrategyPanel({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(new FormData(e.currentTarget));
      }}
    >
      {/* ... */}
    </form>
  );
}
```

### 4. Conditional Rendering

```tsx
// ✅ GOOD: Early returns for simple conditions
export function StrategyStatus({ strategy }: { strategy: Strategy }) {
  if (!strategy) return null;
  if (strategy.status === 'IDLE') return <Badge>Idle</Badge>;
  if (strategy.status === 'RUNNING') return <Badge variant="success">Running</Badge>;
  return <Badge variant="error">Unknown</Badge>;
}

// ✅ GOOD: Ternary for inline conditions
export function StrategyCard({ isActive }: { isActive: boolean }) {
  return (
    <div className={isActive ? 'card card-active' : 'card'}>
      {isActive ? <ActiveIndicator /> : <IdleIndicator />}
    </div>
  );
}

// ❌ BAD: Nested ternaries (hard to read)
export function StrategyCard({ status }: { status: string }) {
  return (
    <div>{status === 'RUNNING' ? <Active /> : status === 'IDLE' ? <Idle /> : <Unknown />}</div>
  );
}
```

### 5. Props

```tsx
// ✅ GOOD: Explicit props interface
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({ children, variant = 'primary', onClick, disabled }: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

// ❌ BAD: Spreading all props (loses type safety)
export function Button({ children, ...props }: any) {
  return <button {...props}>{children}</button>;
}
```

---

## Node.js Backend Style

Based on **Google JavaScript Style Guide** and Node.js best practices.

### 1. Module Structure

```javascript
// ✅ GOOD: ES modules with proper imports
import { Connection, PublicKey } from '@solana/web3.js';
import { getDb } from './database/lowdb-client.js';
import { logger } from './lib/logger.js';

export class ExecutionEngine {
  constructor(connection, io) {
    this.connection = connection;
    this.io = io;
  }

  async executeTrade(strategy, quote) {
    // ...
  }
}

// ❌ BAD: CommonJS (unless required for compatibility)
const { Connection } = require('@solana/web3.js');

class ExecutionEngine {
  // ...
}

module.exports = { ExecutionEngine };
```

### 2. Error Handling

```javascript
// ✅ GOOD: Proper async error handling
export async function executeStrategy(strategyId) {
  const db = await getDb();
  const strategy = db.data.strategies.find((s) => s.id === strategyId);

  if (!strategy) {
    throw new StrategyNotFoundError(strategyId);
  }

  if (strategy.status !== 'RUNNING') {
    throw new InvalidStrategyStateError(strategy.status, 'RUNNING');
  }

  try {
    const result = await executeTrade(strategy);
    await updateStrategyStatus(strategyId, 'COMPLETED');
    return result;
  } catch (error) {
    logger.error('Strategy execution failed', { strategyId, error });
    await updateStrategyStatus(strategyId, 'FAILED');
    throw error;
  }
}

// ❌ BAD: Swallowing errors
export async function executeStrategy(strategyId) {
  try {
    const strategy = await getStrategy(strategyId);
    return await executeTrade(strategy);
  } catch (error) {
    console.log('Error:', error);
    return null; // Silent failure
  }
}
```

### 3. Logging

```javascript
// ✅ GOOD: Structured logging
import { logger } from './lib/logger.js';

export class TradingEngine {
  async processTrade(strategy) {
    logger.info('Processing trade', {
      strategyId: strategy.id,
      type: strategy.type,
      amount: strategy.config.amountInSol,
    });

    try {
      const result = await this.executeTrade(strategy);
      logger.info('Trade executed successfully', {
        strategyId: strategy.id,
        signature: result.signature,
      });
      return result;
    } catch (error) {
      logger.error('Trade execution failed', {
        strategyId: strategy.id,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}

// ❌ BAD: console.log in production
export class TradingEngine {
  async processTrade(strategy) {
    console.log('Processing:', strategy.id);
    const result = await this.executeTrade(strategy);
    console.log('Done:', result);
    return result;
  }
}
```

---

## Documentation Standards

### 1. JSDoc Comments

```typescript
/**
 * Executes a trading strategy with the given configuration.
 *
 * This function validates the strategy, fetches a quote from Jupiter,
 * and submits the transaction to Solana via Jito bundles.
 *
 * @param strategy - The strategy configuration to execute
 * @param options - Execution options (slippage, retry attempts, etc.)
 * @returns A promise resolving to the trade result with signature
 * @throws {InsufficientBalanceError} When wallet balance is insufficient
 * @throws {SlippageExceededError} When actual slippage exceeds tolerance
 *
 * @example
 * ```typescript
 * const result = await executeStrategy(
 *   { type: 'DCA', config: { targetToken: 'EPjF...', amountInSol: 1 } },
 *   { maxSlippageBps: 50 }
 * );
 * console.log('Transaction:', result.signature);
 * ```
 */
export async function executeStrategy(
  strategy: Strategy,
  options: ExecutionOptions = {}
): Promise<TradeResult> {
  // Implementation
}
```

### 2. File Headers

```typescript
/**
 * @fileoverview Execution engine for trading strategies.
 *
 * This module handles the execution of DCA, Sniper, and custom strategies
 * by orchestrating quote fetching, transaction building, and submission.
 *
 * @author Cotton Candy Team
 * @version 2.0.0
 * @since 2025-12-29
 */
```

### 3. Inline Comments

```typescript
// ✅ GOOD: Comments explain WHY, not WHAT
// Jupiter requires a 30s timeout to prevent stale quotes in volatile markets
const QUOTE_TIMEOUT_MS = 30_000;

// Retry with exponential backoff to handle temporary RPC congestion
await retryWithBackoff(() => connection.sendTransaction(tx));

// ❌ BAD: Comments explain obvious code
// Loop through strategies
for (const strategy of strategies) {
  // Execute the strategy
  await execute(strategy);
}
```

---

## Git Commit Messages

Based on **Conventional Commits** specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring (no feature/bug changes)
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, tooling

### Examples

```
✅ GOOD:
feat(strategy): add momentum-based trading strategy

Implement momentum strategy that buys when price increases
by configured threshold percentage within timeframe.

- Add MomentumStrategy class
- Update strategy types
- Add configuration validation

Closes #123

✅ GOOD:
fix(wallet): prevent race condition in balance updates

Balance updates were occurring simultaneously from UI and
engine tick loop, causing inconsistent state.

- Add mutex lock for balance updates
- Queue concurrent update requests
- Add integration test for concurrent updates

Fixes #456

❌ BAD:
updated stuff

❌ BAD:
Fix bug
```

---

## ESLint Configuration

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "next/core-web-vitals",
    "airbnb-typescript",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { "argsIgnorePattern": "^_" }
    ],
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "no-console": ["error", { "allow": ["warn", "error"] }]
  }
}
```

---

## Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

---

## Related Documentation

- [CLEAN_ARCHITECTURE_STRUCTURE.md](./CLEAN_ARCHITECTURE_STRUCTURE.md) - Project structure
- [API_REFERENCE.md](./API_REFERENCE.md) - API documentation
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Migration instructions

## References

- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Conventional Commits](https://www.conventionalcommits.org/)
