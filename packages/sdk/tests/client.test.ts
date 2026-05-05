import { describe, it, expect, vi } from 'vitest';
import { SelloClient } from '../src/client';

describe('SelloClient', () => {
  it('should create a client with testnet config', () => {
    const client = new SelloClient({ network: 'testnet' });
    const config = client.getNetworkConfig();

    expect(config.network).toBe('testnet');
    expect(config.rpcUrl).toBe('https://soroban-testnet.stellar.org');
  });

  it('should create a client with mainnet config', () => {
    const client = new SelloClient({ network: 'mainnet' });
    const config = client.getNetworkConfig();

    expect(config.network).toBe('mainnet');
    expect(config.rpcUrl).toBe('https://soroban-rpc.stellar.org');
  });

  it('should accept custom RPC URL', () => {
    const customUrl = 'https://custom-rpc.example.com';
    const client = new SelloClient({
      network: 'testnet',
      rpcUrl: customUrl,
    });

    expect(client.getNetworkConfig().rpcUrl).toBe(customUrl);
  });

  it('should accept custom contract IDs', () => {
    const client = new SelloClient({
      network: 'testnet',
      attestationContractId: 'CTEST123',
      tierRegistryContractId: 'CTEST456',
    });

    const config = client.getNetworkConfig();
    expect(config.attestationContractId).toBe('CTEST123');
    expect(config.tierRegistryContractId).toBe('CTEST456');
  });

  describe('getTierConfig', () => {
    const client = new SelloClient({ network: 'testnet' });

    it('should return tier 1 config', async () => {
      const config = await client.getTierConfig(1);
      expect(config.tier).toBe(1);
      expect(config.name).toBe('Basic');
      expect(config.requiredChecks).toContain('email');
      expect(config.requiredChecks).toContain('phone');
    });

    it('should return tier 2 config', async () => {
      const config = await client.getTierConfig(2);
      expect(config.tier).toBe(2);
      expect(config.name).toBe('Standard');
      expect(config.requiredChecks).toContain('government_id');
      expect(config.requiredChecks).toContain('liveness');
    });

    it('should return tier 3 config', async () => {
      const config = await client.getTierConfig(3);
      expect(config.tier).toBe(3);
      expect(config.name).toBe('Enhanced');
      expect(config.requiredChecks).toContain('proof_of_address');
    });

    it('should return tier 4 config', async () => {
      const config = await client.getTierConfig(4);
      expect(config.tier).toBe(4);
      expect(config.name).toBe('Business');
      expect(config.requiredChecks).toContain('company_registration');
    });

    it('should throw for invalid tier', async () => {
      await expect(client.getTierConfig(0)).rejects.toThrow('Invalid tier');
      await expect(client.getTierConfig(5)).rejects.toThrow('Invalid tier');
    });
  });

  describe('listTiers', () => {
    it('should return all 4 tiers', async () => {
      const client = new SelloClient({ network: 'testnet' });
      const tiers = await client.listTiers();

      expect(tiers).toHaveLength(4);
      expect(tiers[0].tier).toBe(1);
      expect(tiers[3].tier).toBe(4);
    });
  });

  describe('verify (offline)', () => {
    it('should return unverified for network errors', async () => {
      const client = new SelloClient({
        network: 'testnet',
        rpcUrl: 'https://invalid-rpc.example.com',
        attestationContractId: 'CINVALID',
      });

      const result = await client.verify(
        'GABC2DFGHI3JKLMNO4PQRSTU5VWXYZ67ABCDEF8GHIJKLMNO9PQRSTUVW'
      );

      expect(result.verified).toBe(false);
      expect(result.tier).toBe(0);
    });
  });
});
