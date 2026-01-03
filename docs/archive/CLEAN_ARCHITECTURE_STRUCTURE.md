# Clean Architecture Structure - v2.0.0

## Overview

This document defines the clean architecture reorganization for the Cotton Candy Bot project following the Dependency Rule: **source code dependencies must point only inward toward higher-level policies**.

```
┌─────────────────────────────────────────────┐
│         External Services & UI              │
│   (Frameworks, Drivers, External APIs)      │
├─────────────────────────────────────────────┤
│       Interface Adapters Layer              │
│   (Controllers, Presenters, Gateways)       │
├─────────────────────────────────────────────┤
│        Application Business Rules           │
│     (Use Cases, Application Services)       │
├─────────────────────────────────────────────┤
│       Enterprise Business Rules             │
│        (Entities, Domain Logic)             │
└─────────────────────────────────────────────┘
```

## Target Directory Structure

### Frontend (Next.js)

```
src/
├── domain/                          # Enterprise Business Rules (innermost)
│   ├── entities/
│   │   ├── strategy.entity.ts
│   │   ├── wallet.entity.ts
│   │   ├── trade.entity.ts
│   │   └── portfolio.entity.ts
│   ├── value-objects/
│   │   ├── amount.vo.ts
│   │   ├── token-address.vo.ts
│   │   └── percentage.vo.ts
│   └── types/
│       ├── strategy.types.ts
│       ├── wallet.types.ts
│       └── index.ts
│
├── application/                     # Application Business Rules
│   ├── use-cases/
│   │   ├── trading/
│   │   │   ├── create-strategy.use-case.ts
│   │   │   ├── execute-trade.use-case.ts
│   │   │   └── pause-strategy.use-case.ts
│   │   ├── wallet/
│   │   │   ├── create-burner-wallet.use-case.ts
│   │   │   ├── transfer-funds.use-case.ts
│   │   │   └── get-balance.use-case.ts
│   │   └── portfolio/
│   │       ├── fetch-positions.use-case.ts
│   │       └── calculate-pnl.use-case.ts
│   ├── services/
│   │   ├── strategy.service.ts
│   │   ├── wallet.service.ts
│   │   └── trade.service.ts
│   └── ports/                       # Interfaces (dependency inversion)
│       ├── repositories/
│       │   ├── strategy.repository.interface.ts
│       │   ├── wallet.repository.interface.ts
│       │   └── trade.repository.interface.ts
│       └── services/
│           ├── blockchain.service.interface.ts
│           ├── price-feed.service.interface.ts
│           └── websocket.service.interface.ts
│
├── infrastructure/                  # Interface Adapters & Frameworks
│   ├── adapters/
│   │   ├── repositories/
│   │   │   ├── local-storage-strategy.repository.ts
│   │   │   └── zustand-wallet.repository.ts
│   │   ├── services/
│   │   │   ├── solana-blockchain.service.ts
│   │   │   ├── jupiter-price-feed.service.ts
│   │   │   └── socket-io-websocket.service.ts
│   │   └── gateways/
│   │       ├── jupiter-gateway.ts
│   │       ├── birdeye-gateway.ts
│   │       └── backend-api-gateway.ts
│   ├── http/
│   │   ├── api-client.ts
│   │   └── endpoints.ts
│   └── websocket/
│       ├── socket-client.ts
│       └── event-handlers.ts
│
├── presentation/                    # UI Components & Presenters
│   ├── components/
│   │   ├── features/
│   │   │   ├── trading/
│   │   │   │   ├── StrategyConfigPanel.tsx
│   │   │   │   ├── ExecutionTerminal.tsx
│   │   │   │   └── ActivePositions.tsx
│   │   │   ├── wallet/
│   │   │   │   ├── WalletLab.tsx
│   │   │   │   └── BurnerWalletManager.tsx
│   │   │   └── portfolio/
│   │   │       ├── PortfolioOverview.tsx
│   │   │       └── PnLChart.tsx
│   │   ├── shared/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Tooltip.tsx
│   │   └── layouts/
│   │       ├── DashboardLayout.tsx
│   │       └── AuthLayout.tsx
│   ├── presenters/
│   │   ├── strategy.presenter.ts
│   │   ├── wallet.presenter.ts
│   │   └── portfolio.presenter.ts
│   ├── view-models/
│   │   ├── strategy.view-model.ts
│   │   ├── wallet.view-model.ts
│   │   └── portfolio.view-model.ts
│   └── state/
│       ├── stores/
│       │   ├── tradingStore.ts
│       │   └── walletStore.ts
│       └── providers/
│           ├── SolanaProvider.tsx
│           └── WalletProvider.tsx
│
├── app/                             # Next.js App Router (Framework Layer)
│   ├── (dashboard)/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── strategies/
│   │   │   └── page.tsx
│   │   └── wallet-lab/
│   │       └── page.tsx
│   ├── api/                         # API Routes (if frontend needs them)
│   │   └── proxy/
│   │       └── route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── lib/                             # Shared Utilities (cross-cutting)
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── cn.ts
│   └── constants/
│       ├── tokens.ts
│       └── config.ts
│
└── tests/                           # Test files mirror src structure
    ├── domain/
    ├── application/
    ├── infrastructure/
    └── presentation/
```

### Backend (Node.js)

```
server/
├── domain/                          # Enterprise Business Rules
│   ├── entities/
│   │   ├── Strategy.js
│   │   ├── BurnerWallet.js
│   │   └── Trade.js
│   ├── value-objects/
│   │   ├── Amount.js
│   │   ├── PublicKey.js
│   │   └── Percentage.js
│   └── repositories/                # Interfaces only
│       ├── IStrategyRepository.js
│       └── IWalletRepository.js
│
├── application/                     # Application Business Rules
│   ├── use-cases/
│   │   ├── strategy/
│   │   │   ├── CreateStrategy.js
│   │   │   ├── ExecuteStrategy.js
│   │   │   └── PauseStrategy.js
│   │   ├── wallet/
│   │   │   ├── CreateBurnerWallet.js
│   │   │   ├── WithdrawFunds.js
│   │   │   └── UpdateBalances.js
│   │   └── trading/
│   │       ├── ExecuteTrade.js
│   │       └── SimulateTrade.js
│   ├── services/
│   │   ├── StrategyOrchestrator.js
│   │   ├── TradingEngine.js
│   │   └── WalletManager.js
│   └── ports/                       # Interfaces
│       ├── IBlockchainService.js
│       ├── IPriceFeedService.js
│       └── IEncryptionService.js
│
├── infrastructure/                  # Interface Adapters & Frameworks
│   ├── adapters/
│   │   ├── repositories/
│   │   │   ├── LowdbStrategyRepository.js
│   │   │   └── LowdbWalletRepository.js
│   │   ├── services/
│   │   │   ├── SolanaBlockchainService.js
│   │   │   ├── JupiterPriceFeedService.js
│   │   │   └── AesCryptoService.js
│   │   └── gateways/
│   │       ├── JupiterGateway.js
│   │       ├── BirdEyeGateway.js
│   │       └── JitoGateway.js
│   ├── database/
│   │   ├── lowdb-client.js
│   │   └── migrations/
│   └── web/
│       ├── controllers/
│       │   ├── StrategyController.js
│       │   ├── WalletController.js
│       │   └── SettingsController.js
│       ├── middleware/
│       │   ├── errorHandler.js
│       │   └── validator.js
│       ├── routes/
│       │   ├── strategy.routes.js
│       │   ├── wallet.routes.js
│       │   └── settings.routes.js
│       └── sockets/
│           ├── SocketManager.js
│           └── event-emitters/
│               ├── WalletEmitter.js
│               └── StrategyEmitter.js
│
├── presentation/                    # External Interfaces
│   ├── http/
│   │   └── server.js                # Express app setup
│   └── cli/
│       └── commands/                # Optional CLI tools
│
├── config/
│   ├── environment.js
│   └── constants.js
│
├── lib/                             # Legacy code (to be refactored)
│   ├── Engine.js                    # DEPRECATED - moved to application/
│   ├── ExecutionEngine.js           # DEPRECATED - moved to application/
│   ├── db.js                        # DEPRECATED - moved to infrastructure/
│   └── crypto.js                    # DEPRECATED - moved to infrastructure/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env
├── index.js                         # Application entry point
└── package.json
```

## Layer Responsibilities

### 1. Domain Layer (Innermost)
**Purpose:** Contains enterprise business rules that are true regardless of the application

**Rules:**
- NO dependencies on outer layers
- NO framework dependencies
- NO I/O operations
- Pure business logic only

**Contains:**
- Entities (Strategy, Wallet, Trade)
- Value Objects (Amount, TokenAddress)
- Domain Events
- Repository Interfaces

**Example:**
```typescript
// domain/entities/strategy.entity.ts
export class Strategy {
  private constructor(
    public readonly id: string,
    public readonly type: StrategyType,
    private config: StrategyConfig,
    private status: StrategyStatus
  ) {}

  static create(type: StrategyType, config: StrategyConfig): Strategy {
    // Business validation
    if (config.amountInSol <= 0) {
      throw new Error('Amount must be positive');
    }
    return new Strategy(generateId(), type, config, 'IDLE');
  }

  canExecute(currentTime: number): boolean {
    // Pure business logic
    if (this.status !== 'RUNNING') return false;
    if (!this.lastExecution) return true;
    return currentTime - this.lastExecution >= this.config.intervalMs;
  }

  execute(): void {
    if (!this.canExecute(Date.now())) {
      throw new Error('Cannot execute strategy');
    }
    this.status = 'EXECUTING';
    this.lastExecution = Date.now();
  }
}
```

### 2. Application Layer
**Purpose:** Contains application-specific business rules (use cases)

**Rules:**
- Depends only on Domain layer
- NO framework dependencies
- Orchestrates domain entities
- Defines interfaces (ports) for infrastructure

**Contains:**
- Use Cases
- Application Services
- DTOs (Data Transfer Objects)
- Port Interfaces

**Example:**
```typescript
// application/use-cases/trading/create-strategy.use-case.ts
import { Strategy } from '@/domain/entities/strategy.entity';
import { IStrategyRepository } from '@/application/ports/repositories/strategy.repository.interface';

export class CreateStrategyUseCase {
  constructor(private strategyRepository: IStrategyRepository) {}

  async execute(input: CreateStrategyInput): Promise<StrategyOutput> {
    const strategy = Strategy.create(input.type, input.config);
    await this.strategyRepository.save(strategy);
    return this.toOutput(strategy);
  }

  private toOutput(strategy: Strategy): StrategyOutput {
    return {
      id: strategy.id,
      type: strategy.type,
      status: strategy.status,
    };
  }
}
```

### 3. Infrastructure Layer
**Purpose:** Implements interfaces defined by Application layer

**Rules:**
- Depends on Application and Domain layers
- CAN use frameworks and external libraries
- Implements repository interfaces
- Handles I/O operations

**Contains:**
- Repository Implementations
- External Service Adapters
- Database Clients
- HTTP Clients

**Example:**
```typescript
// infrastructure/adapters/repositories/local-storage-strategy.repository.ts
import { IStrategyRepository } from '@/application/ports/repositories/strategy.repository.interface';
import { Strategy } from '@/domain/entities/strategy.entity';

export class LocalStorageStrategyRepository implements IStrategyRepository {
  private readonly STORAGE_KEY = 'strategies';

  async save(strategy: Strategy): Promise<void> {
    const strategies = this.getAll();
    strategies.push(strategy);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(strategies));
  }

  async findById(id: string): Promise<Strategy | null> {
    const strategies = this.getAll();
    const data = strategies.find(s => s.id === id);
    return data ? this.toDomain(data) : null;
  }

  private getAll(): any[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private toDomain(data: any): Strategy {
    // Reconstitute domain entity from storage
    return Strategy.reconstitute(data);
  }
}
```

### 4. Presentation Layer (Outermost)
**Purpose:** User interface and external interface implementation

**Rules:**
- Depends on Application and Infrastructure layers
- Handles UI framework specifics
- Converts use case outputs to view models

**Contains:**
- React Components
- Presenters/View Models
- UI State Management
- Next.js Pages

**Example:**
```typescript
// presentation/components/features/trading/StrategyConfigPanel.tsx
import { CreateStrategyUseCase } from '@/application/use-cases/trading/create-strategy.use-case';
import { LocalStorageStrategyRepository } from '@/infrastructure/adapters/repositories/local-storage-strategy.repository';

export function StrategyConfigPanel() {
  const createStrategy = async (type: string, config: any) => {
    // Dependency injection
    const repository = new LocalStorageStrategyRepository();
    const useCase = new CreateStrategyUseCase(repository);

    const result = await useCase.execute({ type, config });
    // Update UI with result
  };

  return <div>{/* UI code */}</div>;
}
```

## Dependency Injection

### Backend (Node.js)
Use a simple factory pattern or DI container:

```javascript
// infrastructure/di/container.js
import { CreateStrategyUseCase } from '../../application/use-cases/strategy/CreateStrategy.js';
import { LowdbStrategyRepository } from '../adapters/repositories/LowdbStrategyRepository.js';
import { SolanaBlockchainService } from '../adapters/services/SolanaBlockchainService.js';

export class DIContainer {
  constructor() {
    this.instances = new Map();
  }

  // Repositories
  getStrategyRepository() {
    if (!this.instances.has('StrategyRepository')) {
      this.instances.set('StrategyRepository', new LowdbStrategyRepository());
    }
    return this.instances.get('StrategyRepository');
  }

  // Services
  getBlockchainService() {
    if (!this.instances.has('BlockchainService')) {
      this.instances.set('BlockchainService', new SolanaBlockchainService());
    }
    return this.instances.get('BlockchainService');
  }

  // Use Cases
  getCreateStrategyUseCase() {
    return new CreateStrategyUseCase(
      this.getStrategyRepository(),
      this.getBlockchainService()
    );
  }
}

export const container = new DIContainer();
```

### Frontend (React)
Use React Context for DI:

```typescript
// presentation/providers/DIProvider.tsx
const DIContext = createContext<DIContainer | null>(null);

export function DIProvider({ children }: { children: ReactNode }) {
  const container = useMemo(() => new DIContainer(), []);
  return <DIContext.Provider value={container}>{children}</DIContext.Provider>;
}

export function useUseCase<T>(factory: (container: DIContainer) => T): T {
  const container = useContext(DIContext);
  if (!container) throw new Error('DIProvider not found');
  return useMemo(() => factory(container), [container]);
}

// Usage in components
function MyComponent() {
  const createStrategy = useUseCase(c => c.getCreateStrategyUseCase());
  // ...
}
```

## Migration Strategy

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed step-by-step migration instructions from v1.0.0 to v2.0.0.

## Benefits of Clean Architecture

1. **Independent of Frameworks**: Business logic doesn't depend on Next.js, React, or Express
2. **Testable**: Business rules can be tested without UI, database, or external services
3. **Independent of UI**: UI can change without affecting business rules
4. **Independent of Database**: Can swap lowdb for PostgreSQL without touching domain logic
5. **Independent of External Services**: Can swap Jupiter for another DEX aggregator easily

## Related Documentation

- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - How to migrate from v1.0.0 to v2.0.0
- [STYLE_GUIDE.md](./STYLE_GUIDE.md) - Airbnb/Google coding conventions
- [ARCHITECTURE.md](./ARCHITECTURE.md) - High-level architecture overview
