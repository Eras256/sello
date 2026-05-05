/**
 * Contract addresses and constants for the SELLO protocol.
 */

/** AttestationStore contract address on Stellar Testnet */
export const TESTNET_ATTESTATION_STORE = 'CBFQHNPKRBBLZR4C34GJQ2DAOMABHJRARGP6SVZCPXTRIZQXTDLMVFOR';

/** AttestationStore contract address on Stellar Mainnet */
export const MAINNET_ATTESTATION_STORE = '';

/** TierRegistry contract address on Stellar Testnet */
export const TESTNET_TIER_REGISTRY = 'CDOGGHMW4TKO7IUVI3FVZ5IWTERSUJPQOBQP3SEHL3J2PA6IQUI6KL76';

/** TierRegistry contract address on Stellar Mainnet */
export const MAINNET_TIER_REGISTRY = '';

/** AgentRegistry (KYA) contract address on Stellar Testnet */
export const TESTNET_AGENT_REGISTRY = 'CDL4BCLA77FQBHQCIPXHQ5ONEMBHAOLEQCAIB4SCADBDWKLMISWV7HSF';

/** AgentRegistry (KYA) contract address on Stellar Mainnet */
export const MAINNET_AGENT_REGISTRY = '';

/** Default Soroban RPC URLs by network */
export const RPC_URLS: Record<string, string> = {
  testnet: 'https://soroban-testnet.stellar.org',
  mainnet: 'https://soroban-rpc.stellar.org',
};

/** Network passphrases */
export const NETWORK_PASSPHRASES: Record<string, string> = {
  testnet: 'Test SDF Network ; September 2015',
  mainnet: 'Public Global Stellar Network ; September 2015',
};

/** Human-readable tier names */
export const TIER_NAMES: Record<number, string> = {
  0: 'Unverified',
  1: 'Basic',
  2: 'Standard',
  3: 'Enhanced',
  4: 'Business',
};

/** Tier descriptions */
export const TIER_DESCRIPTIONS: Record<number, string> = {
  1: 'Email + phone verification',
  2: 'Government ID + liveness check',
  3: 'Proof of address + source of funds',
  4: 'KYB — company registration + UBO',
};
