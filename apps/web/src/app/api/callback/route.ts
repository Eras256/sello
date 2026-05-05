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
      const { type, applicantId } = payload as { type?: string; applicantId?: string };

      if (type === 'applicantReviewed' && applicantId) {
        // In production: check status, determine tier, call contract issue_attestation()
        console.log(`[SELLO] Webhook received: ${type} for applicant ${applicantId}`);
      }

      return NextResponse.json({ received: true });
    }

    // Development mode — accept without signature
    return NextResponse.json({ received: true, mode: 'development' });
  } catch {
    return NextResponse.json(
      { error: 'Webhook processing failed', code: 'WEBHOOK_ERROR' },
      { status: 500 }
    );
  }
}
