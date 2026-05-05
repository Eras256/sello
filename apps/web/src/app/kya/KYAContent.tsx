'use client';
import { useT } from '@/i18n';

export default function KYAContent() {
  const t = useT();
  return (
    <>
      {/* Hero */}
      <section className="hero" id="kya-hero" style={{ minHeight: '60vh' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="badge badge-warning" style={{ marginBottom: '24px' }}>{t('kya.badge')}</div>
          <h1 className="hero-title">{t('kya.title')}</h1>
          <p className="hero-subtitle">{t('kya.subtitle')}</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/verify" className="btn btn-primary">{t('kya.cta1')}</a>
            <a href="/docs" className="btn btn-secondary">{t('kya.cta2')}</a>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center' }}>
            <div>
              <h2 className="section-title">{t('kya.problemTitle')}</h2>
              <p className="section-subtitle" style={{ marginBottom: '24px' }}>{t('kya.problemSubtitle')}</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {['p1','p2','p3','p4'].map(k => (
                  <li key={k} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ color: 'var(--error)', fontWeight: 700 }}>✗</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{t(`kya.${k}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--warning)', marginBottom: '8px' }}>$1.2T+</div>
              <div style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>{t('kya.projected')}</div>
              <div style={{ padding: '16px', background: 'var(--accent-glow)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-light)' }}>{t('kya.zeroProtocols')}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--accent-light)' }}>{t('kya.linkAgents')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="section">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>{t('kya.solutionTitle')}</h2>
          <p className="section-subtitle" style={{ textAlign: 'center', margin: '0 auto 48px' }}>{t('kya.solutionSubtitle')}</p>
          <div className="grid-3">
            {[{icon:'🔗',k:'chain'},{icon:'💰',k:'limits'},{icon:'🛡️',k:'revoke'}].map(({icon,k}) => (
              <div key={k} className="glass-card" style={{ padding: '24px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', color: 'var(--accent-light)' }}>{t(`kya.${k}`)}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t(`kya.${k}D`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How KYA Works */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>{t('kya.howTitle')}</h2>
          <p className="section-subtitle" style={{ textAlign: 'center', margin: '0 auto 48px' }}>{t('kya.howSubtitle')}</p>
          <div className="step-flow">
            {[1,2,3].map(i => (
              <div key={i} style={{ display: 'contents' }}>
                <div className="step-card">
                  <div className="step-number">{i}</div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>{t(`kya.h${i}`)}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {t(`kya.h${i}d`)}
                    {i === 3 && <> <code style={{ color: 'var(--accent-light)' }}>verifyAgent(agentId)</code></>}
                  </p>
                </div>
                {i < 3 && <span className="step-arrow">→</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MPP */}
      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center' }}>
            <div>
              <div className="badge badge-accent" style={{ marginBottom: '16px' }}>{t('kya.mppBadge')}</div>
              <h2 className="section-title">{t('kya.mppTitle')}</h2>
              <p className="section-subtitle" style={{ marginBottom: '24px' }}>{t('kya.mppSubtitle')}</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['mpp1','mpp2','mpp3','mpp4'].map(k => (
                  <li key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{t(`kya.${k}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="code-block">
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '12px' }}>{t('kya.mppFlow')}</div>
              <code>
                <span className="code-comment">{'// Agent hits paid endpoint'}</span><br />
                <span className="code-keyword">GET</span> /api/paid/verify/GADDR...<br />
                <span className="code-comment">{'// → 402 Payment Required'}</span><br /><br />
                <span className="code-comment">{'// Agent pays 0.01 USDC via MPP'}</span><br /><br />
                <span className="code-comment">{'// → 200 OK + verification result'}</span><br />
                {'{ '}<span className="code-string">&quot;verified&quot;</span>: <span className="code-keyword">true</span>,{' '}<span className="code-string">&quot;paid&quot;</span>: <span className="code-keyword">true</span>{' }'}
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>{t('kya.roadmap')}</h2>
          <p className="section-subtitle" style={{ textAlign: 'center', margin: '0 auto 48px' }}>{t('kya.roadmapSubtitle')}</p>
          <div className="grid-3">
            {[
              { badge: t('kya.live'), badgeCls: 'badge-success', name: t('kya.phase1'), status: t('kya.phase1status'), features: ['p1f1','p1f2','p1f3','p1f4','p1f5','p1f6'], featured: true },
              { badge: t('kya.q3'), badgeCls: 'badge-warning', name: t('kya.phase2'), status: t('kya.phase2status'), features: ['p2f1','p2f2','p2f3','p2f4','p2f5','p2f6'], featured: false },
              { badge: t('kya.q4'), badgeCls: 'badge-accent', name: t('kya.phase3'), status: t('kya.phase3status'), features: ['p3f1','p3f2','p3f3','p3f4','p3f5','p3f6'], featured: false },
            ].map(phase => (
              <div key={phase.name} className={`pricing-card ${phase.featured ? 'featured' : ''}`}>
                <div className={`badge ${phase.badgeCls}`} style={{ marginBottom: '16px' }}>{phase.badge}</div>
                <div className="pricing-name">{phase.name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '16px' }}>{phase.status}</div>
                <ul className="pricing-features">
                  {phase.features.map(f => <li key={f}>{t(`kya.${f}`)}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2 className="section-title">{t('kya.ctaTitle')}</h2>
          <p className="section-subtitle" style={{ margin: '0 auto 32px' }}>{t('kya.ctaSubtitle')}</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/verify" className="btn btn-primary">{t('kya.ctaBtn1')}</a>
            <a href="/pricing" className="btn btn-secondary">{t('kya.ctaBtn2')}</a>
          </div>
        </div>
      </section>
    </>
  );
}
