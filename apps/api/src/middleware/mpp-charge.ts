/**
 * MPP (Machine Payments Protocol) Charge Middleware for Express.
 *
 * Implements the official Stellar MPP charge pattern:
 * https://developers.stellar.org/docs/build/agentic-payments/mpp/charge-guide
 *
 * When MPP env vars are configured and the mppx package is installed,
 * endpoints using this middleware will require a Stellar USDC micropayment
 * before serving the response.
 *
 * When env vars are missing or packages not installed, the middleware logs a
 * warning and passes through (dev/staging mode).
 */

import type { Request, Response, NextFunction } from 'express';

// ── Augmented Express Request ──────────────────────────────────────
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      mppPaid?: boolean;
      mppAmount?: string;
    }
  }
}

// ── Dynamic MPP imports ────────────────────────────────────────────
// These packages may not be installed yet (stellar MPP spec is emerging).
// We use dynamic imports to avoid crashing the server at startup.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Mppx: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Store: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let stellarCharge: any = null;
let USDC_SAC_TESTNET: string = '';
let mppModulesLoaded = false;

async function loadMppModules(): Promise<boolean> {
  if (mppModulesLoaded) return Mppx !== null;

  mppModulesLoaded = true;
  try {
    const mppx = await import('mppx/server');
    Mppx = mppx.Mppx;
    Store = mppx.Store;

    const mppCharge = await import('@stellar/mpp/charge/server');
    stellarCharge = mppCharge.stellar?.charge;

    const mppConst = await import('@stellar/mpp');
    USDC_SAC_TESTNET = mppConst.USDC_SAC_TESTNET || '';

    console.log('[SELLO MPP] ✅ MPP modules loaded');
    return true;
  } catch {
    console.warn(
      '[SELLO MPP] ⚠️  MPP packages (mppx, @stellar/mpp) not installed. ' +
      'Install them when Stellar publishes the official SDK: ' +
      'npm install mppx @stellar/mpp'
    );
    return false;
  }
}

// ── Lazy-loaded MPP instance ───────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mppInstance: any = null;
let mppInitAttempted = false;

async function getMppInstance() {
  if (mppInitAttempted) return mppInstance;
  mppInitAttempted = true;

  const RECIPIENT = process.env.STELLAR_RECIPIENT;
  const MPP_SECRET_KEY = process.env.MPP_SECRET_KEY;

  if (!RECIPIENT || !MPP_SECRET_KEY) {
    console.warn('[SELLO MPP] ⚠️  STELLAR_RECIPIENT or MPP_SECRET_KEY not set. Paid endpoints will pass through without payment gate.');
    return null;
  }

  const loaded = await loadMppModules();
  if (!loaded) return null;

  try {
    mppInstance = Mppx.create({
      secretKey: MPP_SECRET_KEY,
      methods: [
        stellarCharge({
          recipient: RECIPIENT,
          currency: USDC_SAC_TESTNET,
          network: 'stellar:testnet',
          store: Store.memory(),
        }),
      ],
    });

    console.log('[SELLO MPP] ✅ MPP charge middleware initialized');
    console.log(`[SELLO MPP]    Recipient: ${RECIPIENT.slice(0, 8)}...${RECIPIENT.slice(-4)}`);
    return mppInstance;
  } catch (err) {
    console.error('[SELLO MPP] ❌ Failed to initialize MPP:', err);
    return null;
  }
}

// ── Express → Web Request converter ────────────────────────────────
function toWebRequest(req: Request, port: number): globalThis.Request {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const entry of value) {
        headers.append(key, entry);
      }
    } else {
      headers.set(key, value);
    }
  }

  return new globalThis.Request(`http://localhost:${port}${req.url}`, {
    method: req.method,
    headers,
  });
}

// ── Factory function ───────────────────────────────────────────────

/**
 * Creates an Express middleware that gates the endpoint behind an MPP charge.
 *
 * @param amount - USDC amount to charge (e.g., "0.01")
 * @param description - Human-readable description of the charge
 * @returns Express-compatible async handler
 */
export function createMppChargeHandler(amount: string, description: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const mpp = await getMppInstance();

    // If MPP is not configured, pass through (dev mode)
    if (!mpp) {
      next();
      return;
    }

    const port = parseInt(process.env.API_PORT || '3001', 10);
    const webReq = toWebRequest(req, port);

    try {
      const result = await mpp.charge({ amount, description })(webReq);

      if (result.status === 402) {
        // Forward the 402 challenge to the client
        const challenge = result.challenge as globalThis.Response;
        challenge.headers.forEach((value: string, key: string) => res.setHeader(key, value));
        res.status(402).send(await challenge.text());
        return;
      }

      // Payment verified — attach receipt info to request for downstream handlers
      req.mppPaid = true;
      req.mppAmount = amount;
      next();
    } catch (err) {
      console.error('[SELLO MPP] Charge error:', err);
      res.status(500).json({
        error: 'Payment processing failed',
        code: 'MPP_ERROR',
      });
    }
  };
}
