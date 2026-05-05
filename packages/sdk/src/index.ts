/**
 * SELLO SDK — Verify once, access everything.
 *
 * Compliance infrastructure SDK for the Stellar ecosystem.
 * Provides KYC/KYB identity verification and on-chain attestation
 * querying via Soroban smart contracts.
 *
 * @packageDocumentation
 */

export { SelloClient } from './client';
export type {
  AttestationResult,
  Attestation,
  TierConfig,
  SelloClientOptions,
  SelloNetwork,
} from './types';
export {
  TESTNET_ATTESTATION_STORE,
  MAINNET_ATTESTATION_STORE,
  TESTNET_TIER_REGISTRY,
  MAINNET_TIER_REGISTRY,
  TIER_NAMES,
} from './constants';
