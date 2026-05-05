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

/** GET /api/attestation/[address] — Read attestation status from Soroban contract */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  // Validate Stellar address format
  if (!address || !address.startsWith('G') || address.length !== 56) {
    return NextResponse.json(
      { error: 'Invalid Stellar address', code: 'INVALID_ADDRESS', details: 'Address must start with G and be 56 characters.' },
      { status: 400 }
    );
  }

  try {
    const client = getClient();
    const result = await client.verify(address);

    return NextResponse.json({
      address,
      verified: result.verified,
      tier: result.tier,
      timestamp: result.timestamp,
      expiry: result.expiry,
      network: client.getNetworkConfig().network,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to read attestation', code: 'CONTRACT_ERROR' },
      { status: 500 }
    );
  }
}
