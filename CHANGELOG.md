# Changelog

All notable changes to the SELLO protocol will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Testnet deployment script (`scripts/deploy-testnet.ts`)
- `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`
- SDK README for npm publication
- Contracts README with API documentation
- Real contract integration for SDK `getTierConfig()` and `listTiers()`
- Next.js API route connected to real Soroban contract
- Dashboard with live on-chain metrics

### Changed
- Explorer page now queries real attestation data from contract
- Verify flow connects to backend API instead of simulating
- Seed script now deploys, initializes, and issues sample attestations

### Fixed
- SDK `getTierConfig()` no longer returns static data
- API attestation route reads from Soroban contract via SDK

## [0.1.0] — 2026-05-01

### Added
- **Smart Contracts** (Soroban/Rust)
  - `AttestationStore` contract — issue, verify, revoke attestations (661 LOC, 11 tests)
  - `TierRegistry` contract — configure verification tiers (406 LOC, 8 tests)
  - Custom error types with `contracterror`
  - Event emission for all state mutations
  - TTL management for persistent and instance storage
  - Optimized release profile (LTO, strip symbols, codegen-units=1)

- **SDK** (`@sello/sdk`)
  - `SelloClient` class with `verify()`, `isVerified()`, `getAttestation()`
  - `getTierConfig()` and `listTiers()` tier querying
  - Dual CJS/ESM build with tsup
  - Type definitions for all public APIs
  - 9 unit tests (vitest)

- **Frontend** (Next.js)
  - Landing page with 3D hero (Three.js/R3F)
  - Wallet integration (Stellar Wallets Kit)
  - 3-step verification flow UI
  - Explorer page for attestation lookup
  - Dashboard with metrics display
  - Documentation page with SDK reference
  - Pricing page with 4 tier cards
  - KYA (Know Your Agent) roadmap page
  - Internationalization (EN/ES) with ~250 keys
  - Responsive design with glass-morphism design system

- **API** (Express)
  - `/api/attestation/:address` — read attestation
  - `/api/verify` — create verification session
  - `/api/callback` — Sumsub webhook with HMAC verification
  - `/api/tiers` — list tier configurations
  - `/api/paid/verify/:address` — MPP-gated paid endpoint
  - `/api/paid/batch-verify` — MPP-gated batch verification

- **CI/CD**
  - GitHub Actions with 4 jobs (contracts, sdk, web, lint)
  - Issue and PR templates
  - Vercel deployment configuration

- **Infrastructure**
  - pnpm workspace monorepo
  - Testnet seed script with Friendbot funding
  - Environment variable documentation (`.env.example`)

### Security
- No PII stored on-chain (by design)
- Webhook HMAC-SHA256 signature verification with timing-safe comparison
- Address format validation on all endpoints
- CORS origin restriction on API

[Unreleased]: https://github.com/sello-protocol/sello/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/sello-protocol/sello/releases/tag/v0.1.0
