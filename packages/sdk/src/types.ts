/**
 * Type definitions for the SELLO SDK.
 * All types are exported from the main index.
 */

/** Supported Stellar networks */
export type SelloNetwork = 'testnet' | 'mainnet';

/** Configuration options for the SelloClient */
export interface SelloClientOptions {
  /** Target Stellar network */
  network: SelloNetwork;
  /** Custom Soroban RPC URL (overrides default for network) */
  rpcUrl?: string;
  /** Custom AttestationStore contract ID (overrides default for network) */
  attestationContractId?: string;
  /** Custom TierRegistry contract ID (overrides default for network) */
  tierRegistryContractId?: string;
}

/** Result of verifying an address — lightweight status check */
export interface AttestationResult {
  /** Whether the address has a valid, non-expired attestation */
  verified: boolean;
  /** Verification tier (0 if not verified; 1=Basic, 2=Standard, 3=Enhanced, 4=Business) */
  tier: number;
  /** Unix timestamp when the attestation was issued */
  timestamp: number;
  /** Unix timestamp when the attestation expires */
  expiry: number;
}

/** Full attestation data including verifier info */
export interface Attestation {
  /** The verified subject's Stellar address */
  subject: string;
  /** Verification tier */
  tier: number;
  /** Unix timestamp of issuance */
  timestamp: number;
  /** Unix timestamp of expiry */
  expiry: number;
  /** Address of the verifier who issued this attestation */
  verifier: string;
}

/** Configuration for a verification tier */
export interface TierConfig {
  /** Tier ID (1-4) */
  tier: number;
  /** Human-readable tier name */
  name: string;
  /** Description of what this tier requires */
  description: string;
  /** List of required verification checks */
  requiredChecks: string[];
}

// ── KYA (Know Your Agent) — Phase 2 Roadmap ─────────────────────

/** Status of an AI agent registered through SELLO KYA */
export type AgentStatus = 'active' | 'suspended' | 'revoked';

/** Agent identity record for Know Your Agent (KYA) — Phase 2 roadmap */
export interface AgentRecord {
  /** Unique identifier for the agent */
  agentId: string;
  /** Stellar G... address of the verified human sponsor */
  owner: string;
  /** Human-readable name of the agent */
  name: string;
  /** List of permitted capabilities (e.g., ["transfer", "swap", "query"]) */
  capabilities: string[];
  /** Maximum spending per transaction in stroops */
  spendingLimit: string;
  /** Maximum daily spending in stroops */
  dailyLimit: string;
  /** Unix timestamp when the agent was registered */
  createdAt: number;
  /** Unix timestamp of last recorded activity */
  lastActive: number;
  /** Current agent status */
  status: AgentStatus;
}

// ── MPP (Machine Payments Protocol) ─────────────────────────────

/** Payment receipt from an MPP-gated API call */
export interface MppReceipt {
  /** Stellar transaction hash */
  txHash: string;
  /** Amount paid (in USDC) */
  amount: string;
  /** Currency contract ID (SAC) */
  currency: string;
  /** Stellar address of the payer */
  payer: string;
  /** Stellar address of the recipient */
  recipient: string;
  /** Unix timestamp of the payment */
  timestamp: number;
}

