# SELLO — Compliance Infrastructure for Stellar

> **Verify once, access everything.** The compliance SDK that gives any Stellar app KYC/KYB verification and on-chain attestations in under a day.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Built on Stellar](https://img.shields.io/badge/Built%20on-Stellar-brightgreen)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Smart%20Contracts-Soroban-purple)](https://soroban.stellar.org)

## What is SELLO?

SELLO is a compliance infrastructure SDK for the Stellar ecosystem. It provides:

- **KYC/KYB identity verification** via Sumsub/Synaps integration
- **On-chain attestations** stored as non-transferable credentials on Soroban
- **One-line SDK** for any Stellar app to check verification status
- **4 verification tiers** from Basic (email) to Business (KYB)

Users verify once through SELLO and never re-verify for any SELLO-integrated app.

## Quick Start

```bash
# Install the SDK
pnpm add @sello/sdk

# Use it
import { SelloClient } from '@sello/sdk';

const sello = new SelloClient({ network: 'testnet' });
const result = await sello.verify('GADDR...');
// → { verified: true, tier: 2, expiry: 1756000000 }
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    SELLO SDK                         │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ JS/TS SDK│  │ Rust SDK │  │ REST API Gateway  │  │
│  └────┬─────┘  └────┬─────┘  └────────┬──────────┘  │
│       └──────────────┼─────────────────┘             │
│                      ▼                               │
│         ┌────────────────────────┐                   │
│         │   SELLO Core Engine    │                   │
│         └───────────┬────────────┘                   │
│    ┌────────────────┼────────────────┐               │
│    ▼                ▼                ▼               │
│ ┌───────┐    ┌───────────┐    ┌──────────┐          │
│ │Sumsub │    │  Synaps   │    │ Sanctions│          │
│ └───────┘    └───────────┘    └──────────┘          │
└─────────────────────┬───────────────────────────────┘
                      ▼
          ┌──────────────────────┐
          │  Soroban Contracts   │
          │  • AttestationStore  │
          │  • TierRegistry      │
          └──────────────────────┘
```

## Monorepo Structure

```
sello/
├── contracts/              # Soroban smart contracts (Rust)
│   ├── attestation-store/  # KYC attestation storage
│   └── tier-registry/      # Verification tier configuration
├── packages/
│   └── sdk/                # @sello/sdk TypeScript package
├── apps/
│   └── web/                # Next.js frontend + API routes
└── scripts/                # Testnet seeding scripts
```

## Prerequisites

- **Node.js** ≥ 20.0.0
- **pnpm** ≥ 9.0.0
- **Rust** + `stellar` CLI (for smart contracts)
- **Stellar CLI**: `cargo install stellar-cli`

## Development

```bash
# Clone and install
git clone https://github.com/sello-protocol/sello.git
cd sello
pnpm install

# Start the frontend
pnpm dev

# Build smart contracts
cd contracts && cargo build --release

# Run contract tests
pnpm test:contracts

# Seed testnet with 50+ attestations
pnpm seed:testnet
```

## Smart Contracts

### AttestationStore
- `initialize(admin)` — Set contract admin
- `add_verifier(admin, verifier)` — Authorize a verifier
- `issue_attestation(verifier, subject, tier, expiry)` — Mint attestation
- `verify(subject)` → `AttestationResult` — Check status
- `revoke(caller, subject)` — Revoke attestation

### TierRegistry
- `set_tier_config(admin, tier, name, desc, checks)` — Configure tier
- `get_tier_config(tier)` → `TierConfig` — Read config
- `list_tiers()` → `Vec<TierConfig>` — List all tiers

## Verification Tiers

| Tier | Name     | Required Checks                  |
|------|----------|----------------------------------|
| 1    | Basic    | Email + Phone                    |
| 2    | Standard | Government ID + Liveness         |
| 3    | Enhanced | Proof of Address + Source of Funds|
| 4    | Business | KYB + UBO Declaration            |

## Agentic Payments (MPP)

SELLO integrates the [Machine Payments Protocol (MPP)](https://developers.stellar.org/docs/build/agentic-payments/mpp) — Stellar's official standard for AI agent micropayments.

### Paid API Endpoints

| Endpoint | Amount | Description |
|----------|--------|-------------|
| `GET /api/paid/verify/:address` | 0.01 USDC | Single attestation lookup |
| `GET /api/paid/batch-verify?addresses=G...,G...` | 0.05 USDC | Batch verification (up to 10) |

### How It Works

```bash
# 1. Agent requests paid endpoint
curl -i http://localhost:3001/api/paid/verify/GADDR...
# → 402 Payment Required (with payment challenge headers)

# 2. Agent pays via MPP (automatic with @stellar/mpp client)
# → Soroban SAC transfer of 0.01 USDC to STELLAR_RECIPIENT

# 3. Agent retries with signed credential
# → 200 OK { verified: true, tier: 2, paid: true }
```

### Setup

```bash
# Set env vars
export STELLAR_RECIPIENT=G...your_public_key...
export MPP_SECRET_KEY=replace-with-strong-secret

# Start the API
pnpm dev:api

# Fund recipient on testnet
# 1. https://lab.stellar.org/account/fund
# 2. Create USDC trustline
# 3. Get test USDC from https://faucet.circle.com
```

### KYA Roadmap (Know Your Agent)

SELLO extends compliance from humans to AI agents. See the [KYA page](/kya) for the full roadmap:

- **Phase 1** (Current): KYC attestations + MPP paid API
- **Phase 2** (Q3 2026): AgentRegistry contract — agents linked to verified humans
- **Phase 3** (Q4 2026): Full KYA on mainnet with Protocol X-Ray ZK integration

Learn more: [MPP Documentation](https://developers.stellar.org/docs/build/agentic-payments/mpp)

## License

MIT — see [LICENSE](LICENSE) for details.

## Built With

- [Stellar](https://stellar.org) — Network
- [Soroban](https://soroban.stellar.org) — Smart Contracts
- [Sumsub](https://sumsub.com) — KYC Provider
- [Next.js](https://nextjs.org) — Frontend
- [Stellar Wallets Kit](https://stellarwalletskit.dev) — Wallet Integration

---

**SELLO** is an SCF #44 Build Award submission. Built by the team behind Agent Treasury (SCF #43).
