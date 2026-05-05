'use client';
import { useState, useEffect, useCallback } from 'react';
import { useT } from '@/i18n';

interface ContractMetrics {
  totalMinted: number;
  totalRevoked: number;
  activeAttestations: number;
  passRate: string;
}

export default function DashboardContent() {
  const t = useT();
  const [metrics, setMetrics] = useState<ContractMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    try {
      // Fetch total counts via a lightweight API call
      // The API uses SelloClient which queries the real contract
      const res = await fetch('/api/attestation/GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF');
      if (res.ok) {
        const data = await res.json();
        // If we got a real response, the contract is live
        setMetrics({
          totalMinted: data.totalMinted ?? 0,
          totalRevoked: data.totalRevoked ?? 0,
          activeAttestations: (data.totalMinted ?? 0) - (data.totalRevoked ?? 0),
          passRate: data.totalMinted > 0
            ? `${Math.round(((data.totalMinted - data.totalRevoked) / data.totalMinted) * 100)}%`
            : '—',
        });
      }
    } catch {
      // Contract not deployed yet — metrics stay null
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const stats = [
    { label: t('dash.totalVerif'), value: loading ? '...' : String(metrics?.totalMinted ?? 0), icon: '🔐' },
    { label: t('dash.activeAttest'), value: loading ? '...' : String(metrics?.activeAttestations ?? 0), icon: '✅' },
    { label: t('dash.passRate'), value: loading ? '...' : (metrics?.passRate ?? '—'), icon: '📊' },
    { label: t('dash.avgTime'), value: '~3 min', icon: '⏱' },
  ];

  return (
    <section className="section" style={{ minHeight: 'calc(100vh - var(--navbar-height))' }}>
      <div className="container">
        <h1 className="section-title">{t('dash.title')}</h1>
        <p className="section-subtitle" style={{ marginBottom: '48px' }}>{t('dash.subtitle')}</p>
        <div className="grid-4" style={{ marginBottom: '48px' }}>
          {stats.map((s) => (
            <div key={s.label} className="glass-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>{s.value}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div className="grid-2">
          <div className="glass-card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '16px' }}>{t('dash.apiKey')}</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input className="input" type="password" value="sk_test_•••••••••••••••••••" readOnly id="api-key-input" />
              <button className="btn btn-secondary" id="copy-api-key-btn">{t('dash.copy')}</button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '12px' }}>{t('dash.apiKeyDesc')}</p>
          </div>
          <div className="glass-card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '16px' }}>{t('dash.webhook')}</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input className="input" type="url" placeholder={t('dash.webhookPlaceholder')} id="webhook-url-input" />
              <button className="btn btn-primary" id="save-webhook-btn">{t('dash.save')}</button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '12px' }}>{t('dash.webhookDesc')}</p>
          </div>
        </div>
        <div style={{ marginTop: '48px' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '24px' }}>{t('dash.recentTitle')}</h3>
          <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>{t('dash.recentEmpty')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
