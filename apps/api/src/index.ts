import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { SelloClient } from '@sello/sdk';

const app = express();
const PORT = parseInt(process.env.API_PORT || '3001', 10);

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

// ── SDK client ───────────────────────────────────────────────
const sello = new SelloClient({
  network: (process.env.NEXT_PUBLIC_STELLAR_NETWORK as 'testnet' | 'mainnet') || 'testnet',
  rpcUrl: process.env.STELLAR_RPC_URL,
  attestationContractId: process.env.CONTRACT_ATTESTATION_STORE || undefined,
  tierRegistryContractId: process.env.CONTRACT_TIER_REGISTRY || undefined,
});

// ── Health ───────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '0.1.0', network: sello.getNetworkConfig().network });
});

// ── GET /api/attestation/:address ────────────────────────────
app.get('/api/attestation/:address', async (req, res) => {
  const { address } = req.params;

  if (!address || !address.startsWith('G') || address.length !== 56) {
    res.status(400).json({
      error: 'Invalid Stellar address',
      code: 'INVALID_ADDRESS',
      details: 'Address must start with G and be 56 characters.',
    });
    return;
  }

  try {
    const result = await sello.verify(address);
    res.json({
      address,
      verified: result.verified,
      tier: result.tier,
      timestamp: result.timestamp,
      expiry: result.expiry,
      network: sello.getNetworkConfig().network,
    });
  } catch (err) {
    console.error('[SELLO API] Attestation read error:', err);
    res.status(500).json({ error: 'Failed to read attestation', code: 'CONTRACT_ERROR' });
  }
});

// ── POST /api/verify — Start verification session ────────────
app.post('/api/verify', async (req, res) => {
  try {
    const { walletAddress } = req.body as { walletAddress?: string };

    if (!walletAddress || !walletAddress.startsWith('G') || walletAddress.length !== 56) {
      res.status(400).json({
        error: 'Invalid wallet address',
        code: 'INVALID_ADDRESS',
        details: 'Provide a valid Stellar G... address.',
      });
      return;
    }

    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    res.json({
      sessionId,
      walletAddress,
      status: 'pending',
      message: 'Verification session created. Sumsub widget will load with this token.',
      sumsubToken: 'sandbox_mock_token',
    });
  } catch (err) {
    console.error('[SELLO API] Session creation error:', err);
    res.status(500).json({ error: 'Failed to create verification session', code: 'SESSION_ERROR' });
  }
});

// ── POST /api/callback — Sumsub webhook ──────────────────────
app.post('/api/callback', express.text({ type: '*/*' }), async (req, res) => {
  try {
    const signature = req.headers['x-payload-digest'] as string | undefined;
    const webhookSecret = process.env.SUMSUB_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      const sigBuffer = Buffer.from(signature, 'hex');
      const expectedBuffer = Buffer.from(expectedSignature, 'hex');

      if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
        res.status(401).json({ error: 'Invalid webhook signature', code: 'SIGNATURE_INVALID' });
        return;
      }

      const payload = JSON.parse(rawBody);
      const { type, applicantId } = payload as { type?: string; applicantId?: string };

      if (type === 'applicantReviewed' && applicantId) {
        console.log(`[SELLO] Webhook received: ${type} for applicant ${applicantId}`);
        // TODO: check status, determine tier, call contract issue_attestation()
      }

      res.json({ received: true });
      return;
    }

    // Development mode
    res.json({ received: true, mode: 'development' });
  } catch (err) {
    console.error('[SELLO API] Webhook error:', err);
    res.status(500).json({ error: 'Webhook processing failed', code: 'WEBHOOK_ERROR' });
  }
});

// ── GET /api/tiers — List all tier configurations ────────────
app.get('/api/tiers', async (_req, res) => {
  try {
    const tiers = await sello.listTiers();
    res.json({ tiers });
  } catch (err) {
    console.error('[SELLO API] Tier list error:', err);
    res.status(500).json({ error: 'Failed to list tiers', code: 'TIER_ERROR' });
  }
});

// ── MPP Paid Endpoints ──────────────────────────────────────────
import { createMppChargeHandler } from './middleware/mpp-charge';

// GET /api/paid/verify/:address — MPP-gated attestation lookup
app.get(
  '/api/paid/verify/:address',
  createMppChargeHandler('0.01', 'SELLO attestation verification'),
  async (req, res) => {
    const rawAddress = req.params.address;
    const address = typeof rawAddress === 'string' ? rawAddress : rawAddress?.[0];

    if (!address || !address.startsWith('G') || address.length !== 56) {
      res.status(400).json({
        error: 'Invalid Stellar address',
        code: 'INVALID_ADDRESS',
        details: 'Address must start with G and be 56 characters.',
      });
      return;
    }

    try {
      const result = await sello.verify(address);
      res.json({
        address,
        verified: result.verified,
        tier: result.tier,
        timestamp: result.timestamp,
        expiry: result.expiry,
        network: sello.getNetworkConfig().network,
        paid: true,
        mppAmount: req.mppAmount ?? '0.01',
      });
    } catch (err) {
      console.error('[SELLO API] Paid attestation read error:', err);
      res.status(500).json({ error: 'Failed to read attestation', code: 'CONTRACT_ERROR' });
    }
  }
);

// GET /api/paid/batch-verify — MPP-gated batch verification
app.get(
  '/api/paid/batch-verify',
  createMppChargeHandler('0.05', 'SELLO batch verification (up to 10 addresses)'),
  async (req, res) => {
    const rawParam = req.query.addresses;
    const addressesParam = typeof rawParam === 'string' ? rawParam : undefined;

    if (!addressesParam) {
      res.status(400).json({
        error: 'Missing addresses query parameter',
        code: 'MISSING_ADDRESSES',
        details: 'Provide comma-separated Stellar addresses: ?addresses=GADDR1,GADDR2,...',
      });
      return;
    }

    const addresses = addressesParam.split(',').map((a) => a.trim()).filter(Boolean);

    if (addresses.length === 0 || addresses.length > 10) {
      res.status(400).json({
        error: 'Invalid address count',
        code: 'INVALID_COUNT',
        details: 'Provide between 1 and 10 comma-separated addresses.',
      });
      return;
    }

    // Validate all addresses
    const invalid = addresses.find((a) => !a.startsWith('G') || a.length !== 56);
    if (invalid) {
      res.status(400).json({
        error: `Invalid Stellar address: ${invalid}`,
        code: 'INVALID_ADDRESS',
      });
      return;
    }

    try {
      const results = await Promise.all(
        addresses.map(async (address) => {
          const result = await sello.verify(address);
          return {
            address,
            verified: result.verified,
            tier: result.tier,
            timestamp: result.timestamp,
            expiry: result.expiry,
          };
        })
      );

      res.json({
        results,
        count: results.length,
        network: sello.getNetworkConfig().network,
        paid: true,
        mppAmount: req.mppAmount ?? '0.05',
      });
    } catch (err) {
      console.error('[SELLO API] Batch verification error:', err);
      res.status(500).json({ error: 'Batch verification failed', code: 'BATCH_ERROR' });
    }
  }
);

// ── Start ────────────────────────────────────────────────────
const hasMpp = !!(process.env.STELLAR_RECIPIENT && process.env.MPP_SECRET_KEY);

app.listen(PORT, () => {
  console.log(`\n  🔒 SELLO API running at http://localhost:${PORT}`);
  console.log(`  📡 Network: ${sello.getNetworkConfig().network}`);
  console.log(`  🩺 Health:  http://localhost:${PORT}/health`);
  if (hasMpp) {
    console.log(`  💰 MPP:     Paid endpoints enabled (/api/paid/*)`);
  } else {
    console.log(`  ⚠️  MPP:     Not configured (set STELLAR_RECIPIENT + MPP_SECRET_KEY)`);
  }
  console.log('');
});
