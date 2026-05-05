# @sello/sdk

> **Verify once, access everything.** Compliance SDK for Stellar — check KYC/KYB attestations on Soroban in one line.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Built on Stellar](https://img.shields.io/badge/Built%20on-Stellar-brightgreen)](https://stellar.org)

## Install

```bash
pnpm add @sello/sdk
# or
npm install @sello/sdk
```

## Quick Start

```typescript
import { SelloClient } from '@sello/sdk';

const sello = new SelloClient({ network: 'testnet' });

// Check if a user is verified
const result = await sello.verify('GADDR...');
console.log(result.verified); // true
console.log(result.tier);     // 2 (Standard)

// Boolean convenience
const ok = await sello.isVerified('GADDR...');

// Full attestation data
const att = await sello.getAttestation('GADDR...');
// → { subject, tier, timestamp, expiry, verifier }

// List all tier configurations
const tiers = await sello.listTiers();
```

## API Reference

### `new SelloClient(options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `network` | `'testnet' \| 'mainnet'` | required | Stellar network |
| `rpcUrl` | `string` | Auto | Soroban RPC URL |
| `attestationContractId` | `string` | Auto | AttestationStore contract ID |
| `tierRegistryContractId` | `string` | Auto | TierRegistry contract ID |

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `verify(address)` | `Promise<AttestationResult>` | Check verification status |
| `isVerified(address)` | `Promise<boolean>` | Boolean convenience |
| `getAttestation(address)` | `Promise<Attestation \| null>` | Full attestation data |
| `getTierConfig(tier)` | `Promise<TierConfig>` | Tier configuration |
| `listTiers()` | `Promise<TierConfig[]>` | All tiers |
| `getServer()` | `rpc.Server` | Soroban RPC instance |
| `getNetworkConfig()` | `NetworkConfig` | Current config |

### Types

```typescript
interface AttestationResult {
  verified: boolean;
  tier: number;      // 0-4
  timestamp: number;
  expiry: number;
}

interface TierConfig {
  tier: number;
  name: string;
  description: string;
  requiredChecks: string[];
}
```

## Verification Tiers

| Tier | Name | Checks |
|------|------|--------|
| 1 | Basic | Email + Phone |
| 2 | Standard | Gov ID + Liveness |
| 3 | Enhanced | + Proof of Address + Source of Funds |
| 4 | Business | KYB + UBO Declaration |

## Requirements

- Node.js ≥ 20
- `@stellar/stellar-sdk` (peer dependency, auto-installed)

## License

MIT — [SELLO Protocol](https://github.com/sello-protocol/sello)
