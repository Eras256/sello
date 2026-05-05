'use client';

import { useT } from '@/i18n';
import HeroScene from '@/components/HeroScene';

export default function HomeContent() {
  const t = useT();

  return (
    <>
      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section className="hero" id="hero-section">
        <HeroScene />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="badge badge-accent" style={{ marginBottom: '24px' }}>
            {t('home.badge')}
          </div>
          <h1 className="hero-title" id="hero-title">
            {t('home.title').split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </h1>
          <p className="hero-subtitle" id="hero-subtitle">{t('home.subtitle')}</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/verify" className="btn btn-primary" id="cta-verify">{t('home.cta1')}</a>
            <a href="/docs" className="btn btn-secondary" id="cta-docs">{t('home.cta2')}</a>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────────────── */}
      <section className="stats-bar" id="stats-bar">
        <div className="stat-item">
          <div className="stat-value" id="stat-attestations">50+</div>
          <div className="stat-label">{t('home.stat1')}</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">0</div>
          <div className="stat-label">{t('home.stat2')}</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">4</div>
          <div className="stat-label">{t('home.stat3')}</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">&lt;1 Day</div>
          <div className="stat-label">{t('home.stat4')}</div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────── */}
      <section className="section" id="how-it-works">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>{t('home.howTitle')}</h2>
          <p className="section-subtitle" style={{ textAlign: 'center', margin: '0 auto 48px' }}>{t('home.howSubtitle')}</p>
          <div className="step-flow">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>{t('home.step1')}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                {t('home.step1d')} <code style={{ color: 'var(--accent-light)' }}>pnpm add @sello/sdk</code>
              </p>
            </div>
            <span className="step-arrow">→</span>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>{t('home.step2')}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('home.step2d')}</p>
            </div>
            <span className="step-arrow">→</span>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>{t('home.step3')}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('home.step3d')}</p>
            </div>
            <span className="step-arrow">→</span>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>{t('home.step4')}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                {t('home.step4d')} <code style={{ color: 'var(--accent-light)' }}>verify(addr)</code>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── The Problem ───────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }} id="the-problem">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center' }}>
            <div>
              <h2 className="section-title">{t('home.problemTitle')}</h2>
              <p className="section-subtitle" style={{ marginBottom: '24px' }}>{t('home.problemSubtitle')}</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {['problem1', 'problem2', 'problem3', 'problem4'].map((k) => (
                  <li key={k} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ color: 'var(--error)', fontWeight: 700 }}>✗</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{t(`home.${k}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--error)', marginBottom: '8px' }}>60-80%</div>
              <div style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>{t('home.dropoff')}</div>
              <div style={{ marginTop: '24px', padding: '16px', background: 'var(--success-glow)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>→ 0%</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--success)' }}>{t('home.withSello')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── For Developers ────────────────────────────────────────────── */}
      <section className="section" id="for-developers">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>{t('home.devTitle')}</h2>
          <p className="section-subtitle" style={{ textAlign: 'center', margin: '0 auto 48px' }}>{t('home.devSubtitle')}</p>
          <div className="grid-2">
            <div className="code-block">
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '12px' }}>TypeScript</div>
              <code>
                <span className="code-keyword">import</span> {'{ SelloClient }'} <span className="code-keyword">from</span> <span className="code-string">&apos;@sello/sdk&apos;</span>;<br /><br />
                <span className="code-comment">{'// Initialize — one line'}</span><br />
                <span className="code-keyword">const</span> sello = <span className="code-keyword">new</span> <span className="code-function">SelloClient</span>({'{ '}network: <span className="code-string">&apos;testnet&apos;</span>{' }'});<br /><br />
                <span className="code-comment">{'// Check any address'}</span><br />
                <span className="code-keyword">const</span> result = <span className="code-keyword">await</span> sello.<span className="code-function">verify</span>(<span className="code-string">&apos;GADDR...&apos;</span>);<br />
                <span className="code-comment">{'// → { verified: true, tier: 2, expiry: 1756000000 }'}</span>
              </code>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {([
                ['forAnchors', 'forAnchorsD'],
                ['forDefi', 'forDefiD'],
                ['forWallets', 'forWalletsD'],
              ] as const).map(([title, desc]) => (
                <div key={title} className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', color: 'var(--accent-light)' }}>{t(`home.${title}`)}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t(`home.${desc}`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="section" style={{ textAlign: 'center', background: 'var(--bg-secondary)' }} id="cta-section">
        <div className="container">
          <h2 className="section-title">{t('home.ctaTitle')}</h2>
          <p className="section-subtitle" style={{ margin: '0 auto 32px' }}>{t('home.ctaSubtitle')}</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/verify" className="btn btn-primary" id="cta-bottom-verify">{t('home.ctaBtn1')}</a>
            <a href="/pricing" className="btn btn-secondary" id="cta-bottom-pricing">{t('home.ctaBtn2')}</a>
          </div>
        </div>
      </section>
    </>
  );
}
