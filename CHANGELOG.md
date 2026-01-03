# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-01-02

### Added

- **E2E Testing**: Comprehensive Playwright test suite for Dashboard, Navigation, and Visual Regression.
- **Rate Limiting**: Configurable `RATE_LIMIT_MAX_REQUESTS` in `.env` (defaulted to 10k for dev/testing).

### Fixed

- **Wallet Lab**: Resolved `ERR_ABORTED` connection errors by moving backend to port 3021.
- **Authentication**: Fixed middleware to correctly initialize API keys in development mode.
- **Stability**: Resolved infinite backend restart loops by updating `nodemon` ignore patterns.
- **Port Conflicts**: Eliminated conflicts between Frontend (3000) and Backend (defaulting to 3000/3001).

### Changed

- **Backend Port**: Default port successfully migrated to `3021`.

## [2.0.1] - 2025-12-30

### Fixed
- **Build System**: Resolved `postcss` and `tailwindcss` configuration issues.
- **Dependencies**: Updated installation instructions to use `--legacy-peer-deps` to resolve peer dependency conflicts with wallet adapters.
- **Server**: Fixed `EADDRINUSE` handling in development environment.
- **Fonts**: Resolved `next/font` loading issues by ensuring proper dependency installation.

## [2.0.0] - 2025-12-29

### Major Release: Documentation & Architecture Overhaul

This release represents a comprehensive transformation of the Cotton Candy Bot project with enterprise-grade documentation, clean architecture patterns, and professional-quality diagrams.

### Added

#### Documentation Suite
- **UML 2.5 Architecture Diagrams** (PlantUML format)
  - System architecture component diagram
  - Domain model class diagram
  - Trade execution sequence diagram
  - Deployment topology diagram
  - Strategy lifecycle state machine diagram
- **Comprehensive Style Guide** based on Airbnb/Google conventions
  - TypeScript/JavaScript coding standards
  - React/JSX best practices
  - Node.js backend patterns
  - File naming conventions
  - Git commit message standards
- **Clean Architecture Documentation**
  - Layer-by-layer structure definition
  - Dependency injection patterns
  - Repository interfaces
  - Use case examples
- **Enhanced API Reference v2.0**
  - Complete REST endpoint documentation
  - Socket.io event specifications
  - Code examples in TypeScript, Python, and cURL
  - Error handling guidelines
- **Migration Guide v1.0.0 → v2.0.0**
  - Step-by-step migration instructions
  - Rollback procedures
  - Breaking changes documentation
  - Troubleshooting guide

#### Automation & Tooling
- **Structure Validation Script** (`scripts/validate-structure.js`)
  - Directory structure compliance checker
  - File naming convention validator
  - Import path verifier
  - Documentation completeness checker
- **Diagram Generation Script** (`scripts/generate-diagrams.sh`)
  - Automated PNG/SVG/PDF export from PlantUML
  - HTML index page generator
  - Multi-platform support (macOS/Linux/Windows/Docker)
- **Quality Assurance Report Generator**
  - Comprehensive verification test suite
  - Documentation coverage analysis
  - Code quality metrics

#### Project Structure
- `docs/diagrams/` - UML diagram source files and exports
- `docs/CLEAN_ARCHITECTURE_STRUCTURE.md` - Architecture blueprint
- `docs/STYLE_GUIDE.md` - Coding standards reference
- `docs/API_REFERENCE_V2.md` - Complete API documentation
- `docs/MIGRATION_GUIDE.md` - Upgrade instructions
- `scripts/validate-structure.js` - Automated validation
- `scripts/generate-diagrams.sh` - Diagram export automation

### Changed

#### File Naming Conventions
- **React Components**: Migrated to PascalCase (e.g., `StrategyPanel.tsx`)
  - Previously: `strategy-config.tsx`
  - Now: `StrategyConfig.tsx`
- **TypeScript Utilities**: Standardized to camelCase (e.g., `formatCurrency.ts`)
- **Backend Classes**: PascalCase for classes, camelCase for utilities
- **Directory Names**: Consistent kebab-case across project

#### Import Paths
- Introduced `@/` path alias for cleaner imports
- Deprecated deep relative imports (`../../../`)
- Example: `import { Strategy } from '@/domain/entities/strategy.entity'`

#### API Endpoints (Breaking Changes)
- **Strategy Creation**: `POST /api/strategy` → `POST /api/strategy/create`
- **Request Schema**: Parameters now wrapped in `config` object
- **Socket.io Events**:
  - `strategy_update` → `strategy_status`
  - `balance_update` → `wallet_update`

#### Documentation Standards
- All docs now include version numbers and last-updated dates
- Mermaid diagrams replaced with UML 2.5 PlantUML diagrams
- Cross-references between related documentation files
- Accessibility-compliant alt text for all diagrams

### Improved

#### Code Organization
- Prepared structure for clean architecture migration (Phase 2)
- Defined domain/application/infrastructure/presentation layers
- Established repository and use case patterns
- Created dependency injection guidelines

#### Developer Experience
- Automated validation reduces manual review time
- Comprehensive examples in multiple languages
- Clear migration path from v1.0.0
- Troubleshooting guides for common issues

#### Maintainability
- Consistent naming conventions improve code discoverability
- Layer separation enables independent testing
- Documentation stays synchronized with code via validation scripts

### Fixed
- Inconsistent file naming across frontend/backend
- Missing metadata in architecture diagrams
- Incomplete error handling documentation
- Ambiguous import paths

### Security
- Documented AES-256-GCM encryption standards
- Environment variable management best practices
- Burner wallet security model clarification

### Deprecated
- Relative import paths (use `@/` aliases instead)
- Old API endpoint `/api/strategy` (use `/api/strategy/create`)
- Socket.io event names `strategy_update`, `balance_update`
- Legacy file naming conventions (kebab-case for components)

### Migration Notes

**Breaking Changes:** This version introduces breaking changes in API endpoints and file structure. Please review [MIGRATION_GUIDE.md](./docs/MIGRATION_GUIDE.md) before upgrading.

**Estimated Migration Time:** 2-4 hours for existing installations

**Compatibility:**
- Node.js: v18.0.0+ (unchanged)
- Next.js: 14.2.3 (unchanged)
- Solana Web3.js: ^1.91.0 (unchanged)

---

## [1.0.0] - 2025-12-29

### Added
- Complete project overhaul of documentation and structure.
- Implementation-level Mermaid diagrams for system architecture and trade flows.
- Standardized API reference and architecture deep-dive.
- Modular feature-based component organization.

### Changed
- Refactored all source files to follow kebab-case naming conventions.
- Standardized UI components and layout metadata.

---

## [0.1.0] - 2025-12-28

### Added
- Initial project scaffolding (Next.js 14, Tailwind, Solana Web3).
- Headless Strategy Engine with 200ms tick loop.
- Hybrid Wallet System (Main Wallet + Swarm Burners).
- Real-time Dashboard with Token Sniffer and Portfolio tracking.

---

## Release Links

- [v2.0.0 Documentation](./docs/)
- [v2.0.0 Migration Guide](./docs/MIGRATION_GUIDE.md)
- [v2.0.0 API Reference](./docs/API_REFERENCE_V2.md)

## Feedback & Contributions

Found an issue or have a suggestion? Please open an issue on our [GitHub repository](https://github.com/your-repo/cotton-candy-bot/issues).
