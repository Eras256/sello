/**
 * SelloClient — Main entry point for the SELLO SDK.
 *
 * Provides methods to verify addresses, read attestations,
 * and query tier configurations from the SELLO Soroban contracts.
 *
 * @example
 * ```typescript
 * import { SelloClient } from '@sello/sdk';
 *
 * // Initialize client for testnet
 * const sello = new SelloClient({ network: 'testnet' });
 *
 * // Check if a user is verified
 * const result = await sello.verify('GADDR...');
 * console.log(result.verified); // true
 * console.log(result.tier);     // 2
 * ```
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import type {
  AttestationResult,
  Attestation,
  TierConfig,
  SelloClientOptions,
  SelloNetwork,
} from './types';
import {
  RPC_URLS,
  NETWORK_PASSPHRASES,
  TESTNET_ATTESTATION_STORE,
  MAINNET_ATTESTATION_STORE,
  TESTNET_TIER_REGISTRY,
  MAINNET_TIER_REGISTRY,
} from './constants';

export class SelloClient {
  private readonly network: SelloNetwork;
  private readonly rpcUrl: string;
  private readonly attestationContractId: string;
  private readonly tierRegistryContractId: string;
  private readonly server: StellarSdk.rpc.Server;
  private readonly networkPassphrase: string;

  constructor(options: SelloClientOptions) {
    this.network = options.network;
    this.rpcUrl = options.rpcUrl ?? RPC_URLS[this.network];
    this.networkPassphrase = NETWORK_PASSPHRASES[this.network];

    // Resolve contract addresses
    this.attestationContractId =
      options.attestationContractId ??
      (this.network === 'mainnet'
        ? MAINNET_ATTESTATION_STORE
        : TESTNET_ATTESTATION_STORE);

    this.tierRegistryContractId =
      options.tierRegistryContractId ??
      (this.network === 'mainnet'
        ? MAINNET_TIER_REGISTRY
        : TESTNET_TIER_REGISTRY);

    // Initialize Soroban RPC server
    this.server = new StellarSdk.rpc.Server(this.rpcUrl);
  }

  /**
   * Verify an address — check if it has a valid, non-expired attestation.
   *
   * @param address - Stellar public key (G...) to verify
   * @returns Attestation result with verification status, tier, and expiry
   *
   * @example
   * ```typescript
   * const result = await sello.verify('GABC...');
   * if (result.verified) {
   *   console.log(`User is verified at tier ${result.tier}`);
   * }
   * ```
   */
  async verify(address: string): Promise<AttestationResult> {
    try {
      const contract = new StellarSdk.Contract(this.attestationContractId);

      // Use a constant dummy account for read-only simulation
      // (source account doesn't matter for simulateTransaction)
      const dummyAccount = new StellarSdk.Account(
        'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
        '0',
      );

      const tx = new StellarSdk.TransactionBuilder(dummyAccount, {
        fee: '100',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          contract.call(
            'verify',
            new StellarSdk.Address(address).toScVal(),
          )
        )
        .setTimeout(30)
        .build();

      const simResult = await this.server.simulateTransaction(tx);

      if (
        StellarSdk.rpc.Api.isSimulationSuccess(simResult) &&
        simResult.result
      ) {
        const returnVal = simResult.result.retval;
        return this.parseAttestationResult(returnVal);
      }

      // No attestation found — return unverified
      return {
        verified: false,
        tier: 0,
        timestamp: 0,
        expiry: 0,
      };
    } catch {
      // On any error, return unverified rather than throwing
      return {
        verified: false,
        tier: 0,
        timestamp: 0,
        expiry: 0,
      };
    }
  }

  /**
   * Check if an address is verified (convenience boolean).
   *
   * @param address - Stellar public key to check
   * @returns true if the address has a valid attestation
   */
  async isVerified(address: string): Promise<boolean> {
    const result = await this.verify(address);
    return result.verified;
  }

  /**
   * Get the full attestation data for an address.
   *
   * @param address - Stellar public key
   * @returns Full attestation data or null if not found
   */
  async getAttestation(address: string): Promise<Attestation | null> {
    const result = await this.verify(address);
    if (!result.verified) {
      return null;
    }

    return {
      subject: address,
      tier: result.tier,
      timestamp: result.timestamp,
      expiry: result.expiry,
      verifier: '', // Verifier address not returned by verify() — use contract directly
    };
  }

  /**
   * Get the configuration for a specific tier.
   * Queries the TierRegistry contract on-chain. Falls back to static
   * data only when the contract is not yet deployed.
   *
   * @param tier - Tier ID (1-4)
   * @returns Tier configuration
   */
  async getTierConfig(tier: number): Promise<TierConfig> {
    if (tier < 1 || tier > 4) {
      throw new Error(`Invalid tier: ${tier}. Must be 1-4.`);
    }

    // Try real contract call if contract ID is set
    if (this.tierRegistryContractId) {
      try {
        const contract = new StellarSdk.Contract(this.tierRegistryContractId);
        const account = new StellarSdk.Account(
          'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
          '0',
        );

        const tx = new StellarSdk.TransactionBuilder(account, {
          fee: '100',
          networkPassphrase: this.networkPassphrase,
        })
          .addOperation(
            contract.call(
              'get_tier_config',
              StellarSdk.nativeToScVal(tier, { type: 'u32' }),
            ),
          )
          .setTimeout(30)
          .build();

        const simResult = await this.server.simulateTransaction(tx);

        if (
          StellarSdk.rpc.Api.isSimulationSuccess(simResult) &&
          simResult.result
        ) {
          const parsed = StellarSdk.scValToNative(simResult.result.retval);
          return {
            tier: Number(parsed.tier ?? tier),
            name: String(parsed.name ?? `Tier ${tier}`),
            description: String(parsed.description ?? ''),
            requiredChecks: Array.isArray(parsed.required_checks)
              ? parsed.required_checks.map(String)
              : [],
          };
        }
      } catch {
        // Fall through to static data
      }
    }

    // Fallback: static tier data (used when contract is not deployed)
    return this.getStaticTierConfig(tier);
  }

  /**
   * List all available verification tiers.
   *
   * @returns Array of all tier configurations
   */
  async listTiers(): Promise<TierConfig[]> {
    // Try real contract call if contract ID is set
    if (this.tierRegistryContractId) {
      try {
        const contract = new StellarSdk.Contract(this.tierRegistryContractId);
        const account = new StellarSdk.Account(
          'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
          '0',
        );

        const tx = new StellarSdk.TransactionBuilder(account, {
          fee: '100',
          networkPassphrase: this.networkPassphrase,
        })
          .addOperation(contract.call('list_tiers'))
          .setTimeout(30)
          .build();

        const simResult = await this.server.simulateTransaction(tx);

        if (
          StellarSdk.rpc.Api.isSimulationSuccess(simResult) &&
          simResult.result
        ) {
          const parsed = StellarSdk.scValToNative(simResult.result.retval);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((t: Record<string, unknown>) => ({
              tier: Number(t.tier ?? 0),
              name: String(t.name ?? ''),
              description: String(t.description ?? ''),
              requiredChecks: Array.isArray(t.required_checks)
                ? t.required_checks.map(String)
                : [],
            }));
          }
        }
      } catch {
        // Fall through to static data
      }
    }

    return Promise.all([1, 2, 3, 4].map((tier) => this.getStaticTierConfig(tier)));
  }

  /**
   * Static tier data fallback (used when contract is not deployed).
   */
  private getStaticTierConfig(tier: number): TierConfig {
    const staticTiers: Record<number, TierConfig> = {
      1: { tier: 1, name: 'Basic', description: 'Email and phone verification', requiredChecks: ['email', 'phone'] },
      2: { tier: 2, name: 'Standard', description: 'Government ID and liveness check', requiredChecks: ['email', 'phone', 'government_id', 'liveness'] },
      3: { tier: 3, name: 'Enhanced', description: 'Proof of address and source of funds', requiredChecks: ['email', 'phone', 'government_id', 'liveness', 'proof_of_address', 'source_of_funds'] },
      4: { tier: 4, name: 'Business', description: 'KYB — company registration and UBO declaration', requiredChecks: ['company_registration', 'ubo_declaration', 'director_id', 'proof_of_address'] },
    };
    const config = staticTiers[tier];
    if (!config) throw new Error(`Invalid tier: ${tier}. Must be 1-4.`);
    return config;
  }

  /**
   * Get protocol statistics from the AttestationStore contract.
   *
   * @returns Total minted, total revoked, and active count
   */
  async getStats(): Promise<{ totalMinted: number; totalRevoked: number; active: number }> {
    try {
      const contract = new StellarSdk.Contract(this.attestationContractId);
      const dummyAccount = new StellarSdk.Account(
        'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
        '0',
      );

      // Call total_minted
      const txMinted = new StellarSdk.TransactionBuilder(dummyAccount, {
        fee: '100',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(contract.call('total_minted'))
        .setTimeout(30)
        .build();

      const simMinted = await this.server.simulateTransaction(txMinted);
      let totalMinted = 0;
      if (StellarSdk.rpc.Api.isSimulationSuccess(simMinted) && simMinted.result) {
        totalMinted = Number(StellarSdk.scValToNative(simMinted.result.retval));
      }

      // Call total_revoked
      const txRevoked = new StellarSdk.TransactionBuilder(dummyAccount, {
        fee: '100',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(contract.call('total_revoked'))
        .setTimeout(30)
        .build();

      const simRevoked = await this.server.simulateTransaction(txRevoked);
      let totalRevoked = 0;
      if (StellarSdk.rpc.Api.isSimulationSuccess(simRevoked) && simRevoked.result) {
        totalRevoked = Number(StellarSdk.scValToNative(simRevoked.result.retval));
      }

      return {
        totalMinted,
        totalRevoked,
        active: totalMinted - totalRevoked,
      };
    } catch {
      return { totalMinted: 0, totalRevoked: 0, active: 0 };
    }
  }

  /**
   * Get the Soroban RPC server instance (for advanced usage).
   */
  getServer(): StellarSdk.rpc.Server {
    return this.server;
  }

  /**
   * Get the current network configuration.
   */
  getNetworkConfig(): {
    network: SelloNetwork;
    rpcUrl: string;
    attestationContractId: string;
    tierRegistryContractId: string;
  } {
    return {
      network: this.network,
      rpcUrl: this.rpcUrl,
      attestationContractId: this.attestationContractId,
      tierRegistryContractId: this.tierRegistryContractId,
    };
  }

  // ── Private Helpers ─────────────────────────────────────────────────

  private parseAttestationResult(scVal: StellarSdk.xdr.ScVal): AttestationResult {
    try {
      const parsed = StellarSdk.scValToNative(scVal);
      return {
        verified: Boolean(parsed.verified ?? false),
        tier: Number(parsed.tier ?? 0),
        timestamp: Number(parsed.timestamp ?? 0),
        expiry: Number(parsed.expiry ?? 0),
      };
    } catch {
      return {
        verified: false,
        tier: 0,
        timestamp: 0,
        expiry: 0,
      };
    }
  }
}
