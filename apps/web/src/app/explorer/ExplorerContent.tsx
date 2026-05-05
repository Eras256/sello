'use client';
import { useState, useCallback } from 'react';
import { useT } from '@/i18n';

interface AttestationData {
  address: string;
  verified: boolean;
  tier: number;
  timestamp: number;
  expiry: number;
  network: string;
}

const TIER_NAMES: Record<number, string> = {
  0: 'Unverified',
  1: 'Basic',
  2: 'Standard',
  3: 'Enhanced',
  4: 'Business',
};

const TIER_COLORS: Record<number, string> = {
  0: 'var(--text-muted)',
  1: 'var(--success)',
  2: 'var(--accent)',
  3: 'var(--warning)',
  4: 'var(--accent-secondary)',
};

export default function ExplorerContent() {
  const t = useT();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<AttestationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const search = useCallback(async () => {
    const address = query.trim();
    if (!address || !address.startsWith('G') || address.length !== 56) {
      setError('Invalid Stellar address. Must start with G and be 56 characters.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/attestation/${address}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to fetch attestation');
        setSearched(true);
        return;
      }
      const data = await res.json();
      setResult(data);
      setSearched(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <section className="section" style={{ minHeight: 'calc(100vh - var(--navbar-height))' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 className="section-title" style={{ textAlign: 'center' }}>{t('explorer.title')}</h1>
        <p className="section-subtitle" style={{ textAlign: 'center', margin: '0 auto 48px' }}>{t('explorer.subtitle')}</p>

        {/* Search */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '48px' }}>
          <input
            className="input"
            id="explorer-search"
            type="text"
            placeholder={t('explorer.placeholder')}
            aria-label="Stellar address to search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
          />
          <button
            className="btn btn-primary"
            id="explorer-search-btn"
            onClick={search}
            disabled={loading}
          >
            {loading ? '...' : t('explorer.btn')}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', borderColor: 'rgba(239,68,68,0.3)' }}>
            <p style={{ color: 'var(--error)', fontSize: '0.875rem', margin: 0 }}>⚠️ {error}</p>
          </div>
        )}

        {/* Result */}
        {result ? (
          <div className="glass-card" style={{ padding: '32px' }} id="explorer-result">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: result.verified ? `${TIER_COLORS[result.tier]}20` : 'var(--bg-tertiary)',
                color: result.verified ? TIER_COLORS[result.tier] : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem',
              }}>
                {result.verified ? '✅' : '❌'}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>
                  {result.verified ? 'Verified' : 'Not Verified'}
                </div>
                <code style={{ color: 'var(--accent-light)', fontSize: '0.8125rem' }}>
                  {result.address.slice(0, 8)}...{result.address.slice(-4)}
                </code>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <DetailRow label="Tier" value={`${result.tier} — ${TIER_NAMES[result.tier] || 'Unknown'}`} color={TIER_COLORS[result.tier]} />
              <DetailRow label="Network" value={result.network} />
              {result.timestamp > 0 && (
                <DetailRow label="Issued" value={new Date(result.timestamp * 1000).toLocaleDateString()} />
              )}
              {result.expiry > 0 && (
                <DetailRow label="Expires" value={new Date(result.expiry * 1000).toLocaleDateString()} />
              )}
              {result.verified && result.expiry > 0 && (
                <DetailRow
                  label="Status"
                  value={result.expiry * 1000 > Date.now() ? '🟢 Active' : '🔴 Expired'}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '64px 32px', textAlign: 'center' }} id="explorer-result">
            <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }}>🔍</div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>
              {searched ? 'No attestation found' : t('explorer.emptyTitle')}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {searched ? 'This address has no on-chain attestation.' : t('explorer.emptyDesc')}
            </p>
          </div>
        )}

        {/* Recent section */}
        <div style={{ marginTop: '48px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-secondary)' }}>{t('explorer.recent')}</h3>
          <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t('explorer.recentEmpty')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function DetailRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: color || 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}
