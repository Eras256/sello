'use client';
import { useT } from '@/i18n';

export default function ExplorerContent() {
  const t = useT();
  return (
    <section className="section" style={{ minHeight: 'calc(100vh - var(--navbar-height))' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 className="section-title" style={{ textAlign: 'center' }}>{t('explorer.title')}</h1>
        <p className="section-subtitle" style={{ textAlign: 'center', margin: '0 auto 48px' }}>{t('explorer.subtitle')}</p>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '48px' }}>
          <input className="input" id="explorer-search" type="text" placeholder={t('explorer.placeholder')} aria-label="Stellar address to search" />
          <button className="btn btn-primary" id="explorer-search-btn">{t('explorer.btn')}</button>
        </div>
        <div className="glass-card" style={{ padding: '64px 32px', textAlign: 'center' }} id="explorer-result">
          <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }}>🔍</div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>{t('explorer.emptyTitle')}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t('explorer.emptyDesc')}</p>
        </div>
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
