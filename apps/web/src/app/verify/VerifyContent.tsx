'use client';
import { useState, useCallback, useEffect } from 'react';
import { useT } from '@/i18n';
import { useWallet } from '@/components/WalletProvider';

type VerifyPhase = 'connect' | 'select-tier' | 'processing' | 'done';

interface AttestationResult {
  tier: number;
  tierName: string;
  timestamp: number;
  expiry: number;
  txHash: string;
  network: string;
}

const PROCESS_STEPS = ['scanningDoc', 'checkingLiveness', 'mintingAttest', 'writingChain'] as const;

export default function VerifyContent() {
  const t = useT();
  const { address, connect, shortAddress, connecting } = useWallet();

  const tiers = [
    { tier: 1, name: t('verify.t1'), desc: t('verify.t1d'), time: '~2 min', color: 'var(--success)' },
    { tier: 2, name: t('verify.t2'), desc: t('verify.t2d'), time: '~5 min', color: 'var(--accent)' },
    { tier: 3, name: t('verify.t3'), desc: t('verify.t3d'), time: '~15 min', color: 'var(--warning)' },
    { tier: 4, name: t('verify.t4'), desc: t('verify.t4d'), time: '~30 min', color: 'var(--accent-secondary)' },
  ];

  const [phase, setPhase] = useState<VerifyPhase>('connect');
  const [selectedTier, setSelectedTier] = useState(2);
  const [processStep, setProcessStep] = useState(0);
  const [attestation, setAttestation] = useState<AttestationResult | null>(null);

  // Auto-advance to step 2 when wallet connects
  useEffect(() => {
    if (address && phase === 'connect') setPhase('select-tier');
  }, [address, phase]);

  // Auto-set to connect if wallet disconnects
  useEffect(() => {
    if (!address) {
      setPhase('connect');
      setAttestation(null);
    }
  }, [address]);

  const steps = [t('verify.step1'), t('verify.step2'), t('verify.step3')];
  const activeStep = phase === 'connect' ? 0 : phase === 'select-tier' ? 1 : phase === 'processing' ? 1 : 2;

  // Verification process — calls the backend API endpoints
  const startVerification = useCallback(async () => {
    setPhase('processing');
    setProcessStep(0);

    // Step 1: Create verification session via API
    setProcessStep(0);
    let sessionOk = false;
    try {
      const sessionRes = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });
      if (sessionRes.ok) {
        sessionOk = true;
      }
    } catch {
      // API may not be running — continue with visual flow
    }
    await new Promise((r) => setTimeout(r, 800));

    // Step 2: Simulated KYC processing (Sumsub sandbox would go here)
    setProcessStep(1);
    await new Promise((r) => setTimeout(r, 1000));

    // Step 3: Check attestation status from contract
    setProcessStep(2);
    let contractResult = null;
    try {
      const attRes = await fetch('/api/attestation/' + address);
      if (attRes.ok) {
        contractResult = await attRes.json();
      }
    } catch {
      // Continue with simulated result
    }
    await new Promise((r) => setTimeout(r, 800));

    // Step 4: Finalize
    setProcessStep(3);
    await new Promise((r) => setTimeout(r, 600));

    const now = Math.floor(Date.now() / 1000);
    const tierNames = ['', t('verify.t1'), t('verify.t2'), t('verify.t3'), t('verify.t4')];

    // Use real contract data if available, otherwise simulated
    if (contractResult && contractResult.verified) {
      setAttestation({
        tier: contractResult.tier,
        tierName: tierNames[contractResult.tier] || `Tier ${contractResult.tier}`,
        timestamp: contractResult.timestamp,
        expiry: contractResult.expiry,
        txHash: `ATT_${contractResult.timestamp}_${contractResult.tier}`,
        network: contractResult.network || 'testnet',
      });
    } else {
      // Sandbox demo result (when contract not deployed or not yet attested)
      setAttestation({
        tier: selectedTier,
        tierName: tierNames[selectedTier] || `Tier ${selectedTier}`,
        timestamp: now,
        expiry: now + 365 * 24 * 60 * 60,
        txHash: sessionOk
          ? `SESS_${now}_${selectedTier}`
          : `DEMO_${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        network: 'testnet',
      });
    }
    setPhase('done');
  }, [address, selectedTier, t]);

  const reset = () => {
    setPhase(address ? 'select-tier' : 'connect');
    setAttestation(null);
    setProcessStep(0);
  };

  return (
    <section className="section" style={{ minHeight: 'calc(100vh - var(--navbar-height))' }}>
      <div className="container" style={{ maxWidth: '640px' }}>
        <h1 className="section-title" style={{ textAlign: 'center' }}>{t('verify.title')}</h1>
        <p className="section-subtitle" style={{ textAlign: 'center', margin: '0 auto 48px' }}>{t('verify.subtitle')}</p>

        {/* ── Step Indicator ────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '48px', flexWrap: 'wrap' }}>
          {steps.map((step, i) => {
            const completed = i < activeStep;
            const active = i === activeStep;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: completed ? 'var(--success)' : active ? 'var(--accent)' : 'var(--bg-tertiary)',
                  color: completed || active ? 'white' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8125rem', fontWeight: 700,
                  transition: 'all 0.3s ease',
                }}>
                  {completed ? '✓' : i + 1}
                </div>
                <span style={{
                  color: completed ? 'var(--success)' : active ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: '0.875rem', fontWeight: 500,
                  transition: 'color 0.3s ease',
                }}>{step}</span>
                {i < 2 && <span style={{ color: 'var(--text-muted)', margin: '0 8px' }}>—</span>}
              </div>
            );
          })}
        </div>

        {/* ── Step 1: Connect Wallet ────────────────────────────── */}
        {phase === 'connect' && (
          <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }} id="verify-card">
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔗</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>{t('verify.connectTitle')}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '0.9375rem' }}>{t('verify.connectDesc')}</p>
            <button
              className="btn btn-primary"
              id="verify-connect-btn"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={connect}
              disabled={connecting}
            >
              {connecting ? '…' : t('verify.connectBtn')}
            </button>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '16px' }}>{t('verify.privacy')}</p>
          </div>
        )}

        {/* ── Step 2: Select Tier + Start ───────────────────────── */}
        {phase === 'select-tier' && (
          <div id="verify-tier-select">
            {/* Connected badge */}
            <div className="glass-card" style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }} />
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--success)' }}>{t('verify.walletConnected')}</div>
                <code style={{ color: 'var(--accent-light)', fontSize: '0.8125rem' }}>{shortAddress}</code>
              </div>
            </div>

            {/* Tier Selection */}
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px' }}>{t('verify.selectTier')}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>{t('verify.selectTierDesc')}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {tiers.map((ti) => (
                <button
                  key={ti.tier}
                  onClick={() => setSelectedTier(ti.tier)}
                  className="glass-card"
                  style={{
                    padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                    borderColor: selectedTier === ti.tier ? 'var(--accent)' : undefined,
                    background: selectedTier === ti.tier ? 'var(--accent-glow)' : undefined,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: selectedTier === ti.tier ? ti.color : `${ti.color}20`,
                      color: selectedTier === ti.tier ? 'white' : ti.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.2s ease',
                    }}>{ti.tier}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{ti.name}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{ti.desc}</div>
                    </div>
                  </div>
                  <span className="badge badge-accent">{ti.time}</span>
                </button>
              ))}
            </div>

            <button
              className="btn btn-primary"
              id="start-verification-btn"
              style={{ width: '100%', justifyContent: 'center', padding: '16px 24px', fontSize: '1rem' }}
              onClick={startVerification}
            >
              {t('verify.startVerif')} — {tiers[selectedTier - 1]?.name}
            </button>
          </div>
        )}

        {/* ── Processing ───────────────────────────────────────── */}
        {phase === 'processing' && (
          <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }} id="verify-processing">
            <div className="wallet-spinner" style={{ width: '48px', height: '48px', margin: '0 auto 24px', borderWidth: '3px' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>{t('verify.processing')}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '0.9375rem' }}>{t('verify.processingDesc')}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '320px', margin: '0 auto' }}>
              {PROCESS_STEPS.map((key, i) => {
                const done = i < processStep;
                const active = i === processStep;
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px', transition: 'opacity 0.3s ease', opacity: i > processStep ? 0.3 : 1 }}>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                      background: done ? 'var(--success)' : active ? 'var(--accent)' : 'var(--bg-tertiary)',
                      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700,
                    }}>
                      {done ? '✓' : active ? <span className="wallet-spinner" style={{ width: '12px', height: '12px', borderWidth: '2px' }} /> : ''}
                    </div>
                    <span style={{ fontSize: '0.875rem', color: done ? 'var(--success)' : active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {t(`verify.${key}`)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Step 3: Done — Attestation Result ─────────────────── */}
        {phase === 'done' && attestation && (
          <div id="verify-result">
            <div className="glass-card" style={{ padding: '48px', textAlign: 'center', marginBottom: '24px', borderColor: 'rgba(34,197,94,0.3)' }}>
              <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎉</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px', color: 'var(--success)' }}>
                {t('verify.success')}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '480px', margin: '0 auto' }}>
                {t('verify.successDesc')}
              </p>
            </div>

            {/* Attestation details card */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Row label={t('verify.attestId')} value={attestation.txHash} mono />
                <Row label={t('verify.tierLabel')} value={`${attestation.tier} — ${attestation.tierName}`} badge color={tiers[attestation.tier - 1]?.color} />
                <Row label={t('verify.addressLabel')} value={shortAddress || ''} mono />
                <Row label={t('verify.issuedLabel')} value={new Date(attestation.timestamp * 1000).toLocaleDateString()} />
                <Row label={t('verify.expiresLabel')} value={new Date(attestation.expiry * 1000).toLocaleDateString()} />
                <Row label={t('verify.networkLabel')} value={attestation.network} badge />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <a href={`/explorer`} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                {t('verify.viewExplorer')}
              </a>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={reset}>
                {t('verify.verifyAnother')}
              </button>
            </div>
          </div>
        )}

        {/* ── Tier Reference (only shown in connect/select phases) */}
        {(phase === 'connect') && (
          <div style={{ marginTop: '48px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '24px', textAlign: 'center' }}>{t('verify.tiersTitle')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tiers.map((ti) => (
                <div key={ti.tier} className="glass-card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${ti.color}20`, color: ti.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem' }}>{ti.tier}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{ti.name}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{ti.desc}</div>
                    </div>
                  </div>
                  <span className="badge badge-accent">{ti.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Helper: Detail Row ────────────────────────────────────── */
function Row({ label, value, mono, badge, color }: { label: string; value: string; mono?: boolean; badge?: boolean; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
      {badge ? (
        <span className="badge badge-accent" style={color ? { background: `${color}20`, color } : undefined}>{value}</span>
      ) : (
        <span style={{ fontSize: '0.875rem', fontWeight: 600, fontFamily: mono ? 'monospace' : undefined, color: mono ? 'var(--accent-light)' : 'var(--text-primary)' }}>{value}</span>
      )}
    </div>
  );
}
