import { NextResponse } from 'next/server';

/** POST /api/verify — Start a verification session */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { walletAddress } = body as { walletAddress?: string };

    if (!walletAddress || !walletAddress.startsWith('G') || walletAddress.length !== 56) {
      return NextResponse.json(
        { error: 'Invalid wallet address', code: 'INVALID_ADDRESS', details: 'Provide a valid Stellar G... address.' },
        { status: 400 }
      );
    }

    // In production, this generates a Sumsub access token
    // For sandbox/development, return a mock session
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    return NextResponse.json({
      sessionId,
      walletAddress,
      status: 'pending',
      message: 'Verification session created. Sumsub widget will load with this token.',
      // In production: token from Sumsub generateAccessToken()
      sumsubToken: 'sandbox_mock_token',
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create verification session', code: 'SESSION_ERROR' },
      { status: 500 }
    );
  }
}
