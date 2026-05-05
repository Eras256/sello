# SELLO — Project Context

> This file provides AI assistants with full project context.
> Last updated: 2026-05-05

---

## Project Identity

- **Name**: SELLO — Compliance Infrastructure for Stellar
- **Tagline**: Verify once, access everything.
- **License**: MIT
- **SCF Submission**: SCF #44 Build Award
- **Version**: 0.1.0

---

## Monorepo Structure

```
sello/
├── contracts/                   # Soroban smart contracts (Rust, no_std)
│   ├── attestation-store/       # KYC attestation storage (issue/verify/revoke)
│   └── tier-registry/           # Verification tier configuration
├── packages/
│   └── sdk/                     # @sello/sdk — TypeScript SDK (tsup build)
├── apps/
│   ├── web/                     # Next.js 16 frontend (App Router, Turbopack)
│   └── api/                     # Express API server (:3001)
├── scripts/                     # Testnet seeding scripts
├── DESIGN.md                    # Full design system reference
├── vercel.json                  # Vercel deployment config
└── pnpm-workspace.yaml          # Workspace: packages/*, apps/*
```

---

## Tech Stack

| Layer            | Technology                                           |
|------------------|------------------------------------------------------|
| **Package mgr**  | pnpm 9+ with workspaces                              |
| **Frontend**     | Next.js 16 (App Router, React 19, Turbopack)         |
| **Backend API**  | Express 5 with tsx watch (hot-reload)                 |
| **SDK**          | TypeScript, tsup (CJS+ESM+DTS), Vitest               |
| **Contracts**    | Rust, Soroban SDK (`soroban-sdk`), `no_std`           |
| **Blockchain**   | Stellar (Soroban smart contracts)                     |
| **KYC Provider** | Sumsub (webhook + widget integration)                 |
| **Wallet**       | `@creit.tech/stellar-wallets-kit`                     |
| **Testing**      | Vitest (unit), Playwright (e2e), `cargo test` (Rust)  |
| **Deploy**       | Vercel (frontend), pnpm ship                          |
| **Styling**      | Vanilla CSS only — NO Tailwind                        |

---

## Design System

- **Theme**: Dark mode only (no light mode toggle)
- **Aesthetic**: Premium institutional, glassmorphism
- **Primary font**: Inter (Google Fonts, weights 300–900)
- **Code font**: JetBrains Mono / Fira Code
- **Accent color**: Indigo `#6366f1` (`--accent`)
- **Reference**: See `DESIGN.md` for all tokens and component classes
- **Key rule**: Use CSS custom properties from `globals.css` — never hardcode colors/sizes

---

## Key Commands

| Command                | Description                              |
|------------------------|------------------------------------------|
| `pnpm dev`             | Start frontend (Next.js :3000)           |
| `pnpm dev:api`         | Start backend API (Express :3001)        |
| `pnpm dev:all`         | Start frontend + backend in parallel     |
| `pnpm dev:sdk`         | Watch mode for SDK                       |
| `pnpm build`           | Build all packages                       |
| `pnpm test`            | Run all tests (Vitest)                   |
| `pnpm test:contracts`  | Run Rust contract tests (`cargo test`)   |
| `pnpm test:e2e`        | Run Playwright e2e tests                 |
| `pnpm seed:testnet`    | Seed testnet with 50+ attestations       |
| `pnpm lint`            | Lint all packages                        |
| `pnpm ship`            | Deploy to Vercel (production)            |
| `pnpm ship:preview`    | Deploy to Vercel (preview)               |

---

## Smart Contracts

### AttestationStore
- `initialize(admin)` — Set contract admin (one-time)
- `add_verifier(admin, verifier)` — Authorize a verifier
- `remove_verifier(admin, verifier)` — Deauthorize a verifier
- `issue_attestation(verifier, subject, tier, expiry)` — Mint attestation
- `verify(subject)` → `AttestationResult` — Check verification status
- `revoke(caller, subject)` — Revoke attestation (verifier or admin)
- `is_verifier(address)` → `bool` — Check authorization
- `total_minted()` → `u64` — Counter
- `total_revoked()` → `u64` — Counter

### TierRegistry
- `set_tier_config(admin, tier, name, desc, checks)` — Configure tier
- `get_tier_config(tier)` → `TierConfig` — Read config
- `list_tiers()` → `Vec<TierConfig>` — List all tiers

### Verification Tiers

| Tier | Name     | Required Checks                           |
|------|----------|-------------------------------------------|
| 1    | Basic    | Email, Phone                              |
| 2    | Standard | Government ID, Liveness                   |
| 3    | Enhanced | Proof of Address, Source of Funds          |
| 4    | Business | Company Registration, UBO Declaration      |

---

## SDK API Surface (`@sello/sdk`)

```typescript
import { SelloClient } from '@sello/sdk';

const sello = new SelloClient({
  network: 'testnet',       // 'testnet' | 'mainnet'
  rpcUrl?: string,           // Custom Soroban RPC URL
  attestationContractId?: string,
  tierRegistryContractId?: string,
});

// Core methods
await sello.verify(address)         → AttestationResult
await sello.isVerified(address)     → boolean
await sello.getAttestation(address) → Attestation | null
await sello.getTierConfig(tier)     → TierConfig
await sello.listTiers()             → TierConfig[]
sello.getServer()                   → StellarSdk.rpc.Server
sello.getNetworkConfig()            → { network, rpcUrl, attestationContractId, tierRegistryContractId }
```

### Exported Types
- `SelloNetwork` — `'testnet' | 'mainnet'`
- `SelloClientOptions` — Constructor config
- `AttestationResult` — `{ verified, tier, timestamp, expiry }`
- `Attestation` — `{ subject, tier, timestamp, expiry, verifier }`
- `TierConfig` — `{ tier, name, description, requiredChecks }`

### Exported Constants
- `TESTNET_ATTESTATION_STORE`, `MAINNET_ATTESTATION_STORE`
- `TESTNET_TIER_REGISTRY`, `MAINNET_TIER_REGISTRY`
- `TIER_NAMES`

---

## Frontend Pages

| Route        | Component               | Description                        |
|--------------|--------------------------|------------------------------------|
| `/`          | `page.tsx`               | Hero, stats, how-it-works, CTA     |
| `/verify`    | `verify/page.tsx`        | Verification flow (wallet connect) |
| `/explorer`  | `explorer/page.tsx`      | Attestation explorer               |
| `/dashboard` | `dashboard/page.tsx`     | User dashboard                     |
| `/docs`      | `docs/page.tsx`          | SDK documentation                  |
| `/pricing`   | `pricing/page.tsx`       | Pricing plans                      |

### API Routes
- `POST /api/verify` — Start verification session
- `POST /api/callback` — Sumsub webhook (HMAC-SHA256 signature verification)
- `GET /api/attestation/[address]` — Read attestation from contract

---

## Styling Rules

1. **Vanilla CSS only** — NO Tailwind, NO CSS-in-JS
2. Use CSS custom properties from `globals.css` (never hardcode hex values)
3. Use existing component classes: `.glass-card`, `.btn-primary`, `.btn-secondary`, `.badge-*`, `.pricing-card`, `.section`, `.container`, `.grid-*`
4. For layout-specific styles, use inline `style={{}}` props (established pattern in codebase)
5. Dark mode only — no `prefers-color-scheme` media queries
6. Inter font only — loaded via Google Fonts in `globals.css`

---

## Code Rules

1. **Strict TypeScript** — `strict: true`, no `any` types
2. **Server Components by default** — add `'use client'` only when hooks/interactivity needed
3. **All interactive elements** need unique `id` attributes (for Playwright e2e)
4. **All interactive elements** need `aria-label` or visible label text
5. **External links** must use `target="_blank" rel="noopener noreferrer"`
6. **Imports**: Use `type` imports for type-only imports (`import type { ... }`)
7. **Error handling**: Return safe defaults, don't throw in SDK methods (verify returns `{ verified: false }`)
8. **Contract errors**: Use `Result<(), AttestationError>` with typed error enum

---

## Environment Variables

```env
# KYC Provider
SUMSUB_APP_TOKEN=
SUMSUB_SECRET_KEY=
SUMSUB_WEBHOOK_SECRET=

# Stellar / Soroban
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
STELLAR_SECRET_KEY=

# Contracts (populated after deployment)
CONTRACT_ATTESTATION_STORE=
CONTRACT_TIER_REGISTRY=

# Frontend (public)
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_CONTRACT_ATTESTATION_STORE=
NEXT_PUBLIC_CONTRACT_TIER_REGISTRY=

# API
API_PORT=3001
API_KEY=
NODE_ENV=development
```
