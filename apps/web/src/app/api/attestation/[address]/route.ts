import { NextResponse } from 'next/server';

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
    // In production, this reads from the Soroban contract via RPC
    // For now, return a mock response for development
    return NextResponse.json({
      address,
      verified: false,
      tier: 0,
      timestamp: 0,
      expiry: 0,
      network: process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet',
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to read attestation', code: 'CONTRACT_ERROR' },
      { status: 500 }
    );
  }
}
