import { NextResponse } from 'next/server';
import crypto from 'crypto';

/** POST /api/callback — Sumsub webhook callback */
export async function POST(request: Request) {
  try {
    // Verify webhook signature (HMAC-SHA256)
    const signature = request.headers.get('x-payload-digest');
    const webhookSecret = process.env.SUMSUB_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const rawBody = await request.text();
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      // Use timing-safe comparison to prevent timing attacks
      const sigBuffer = Buffer.from(signature, 'hex');
      const expectedBuffer = Buffer.from(expectedSignature, 'hex');

      if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
        return NextResponse.json(
          { error: 'Invalid webhook signature', code: 'SIGNATURE_INVALID' },
          { status: 401 }
        );
      }

      const payload = JSON.parse(rawBody);
      const { type, applicantId, externalUserId } = payload as { type?: string; applicantId?: string; externalUserId?: string };

      if (type === 'applicantReviewed' && externalUserId) {
        // Here externalUserId must be the Stellar wallet address passed during init
        const walletAddress = externalUserId;
        const tier = 2; // Default tier for Sumsub review
        const expiry = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60); // 1 year
        
        console.log(`[SELLO] Webhook received: ${type} for applicant ${applicantId} (wallet: ${walletAddress})`);
        
        if (process.env.STELLAR_SECRET_KEY) {
          try {
            const SelloClient = (await import('@sello/sdk')).SelloClient;
            const client = new SelloClient({
              network: 'testnet',
              rpcUrl: process.env.NEXT_PUBLIC_STELLAR_RPC_URL,
              attestationContractId: process.env.NEXT_PUBLIC_CONTRACT_ATTESTATION_STORE,
            });
            
            const txHash = await client.issueAttestation(
              walletAddress, 
              tier, 
              expiry, 
              process.env.STELLAR_SECRET_KEY
            );
            console.log(`[SELLO] Attestation issued successfully! TxHash: ${txHash}`);
          } catch (e) {
            console.error(`[SELLO] Failed to issue attestation on-chain:`, e);
          }
        } else {
          console.error(`[SELLO] Cannot issue attestation: STELLAR_SECRET_KEY is missing`);
        }
      }

      return NextResponse.json({ received: true });
    }

    // Development mode — accept without signature
    return NextResponse.json({ received: true, mode: 'development' });
  } catch (error) {
    console.error('[SELLO] Webhook processing failed:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', code: 'WEBHOOK_ERROR' },
      { status: 500 }
    );
  }
}
