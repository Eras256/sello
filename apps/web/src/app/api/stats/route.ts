import { NextResponse } from 'next/server';
import { SelloClient } from '@sello/sdk';

/** Lazy-initialized SDK client */
let selloClient: SelloClient | null = null;

function getClient(): SelloClient {
  if (!selloClient) {
    selloClient = new SelloClient({
      network: (process.env.NEXT_PUBLIC_STELLAR_NETWORK as 'testnet' | 'mainnet') || 'testnet',
      rpcUrl: process.env.NEXT_PUBLIC_STELLAR_RPC_URL || undefined,
      attestationContractId: process.env.NEXT_PUBLIC_CONTRACT_ATTESTATION_STORE || undefined,
      tierRegistryContractId: process.env.NEXT_PUBLIC_CONTRACT_TIER_REGISTRY || undefined,
    });
  }
  return selloClient;
}

/** GET /api/stats — Read protocol metrics from Soroban contract */
export async function GET() {
  try {
    const client = getClient();
    const stats = await client.getStats();

    return NextResponse.json({
      totalMinted: stats.totalMinted,
      totalRevoked: stats.totalRevoked,
      activeAttestations: stats.active,
      network: client.getNetworkConfig().network,
      contractId: client.getNetworkConfig().attestationContractId,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to read stats', code: 'CONTRACT_ERROR' },
      { status: 500 }
    );
  }
}
