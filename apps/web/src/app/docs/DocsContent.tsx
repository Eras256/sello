'use client';
import { useT } from '@/i18n';

export default function DocsContent() {
  const t = useT();
  const methods = [
    { name: 'new SelloClient(options)', desc: 'Create a new SELLO client instance.', params: 'network: "testnet" | "mainnet", rpcUrl?: string, attestationContractId?: string' },
    { name: 'verify(address)', desc: 'Check verification status. Returns AttestationResult.', params: 'address: string (Stellar G... key)' },
    { name: 'isVerified(address)', desc: 'Quick boolean check — is this address verified?', params: 'address: string' },
    { name: 'getAttestation(address)', desc: 'Get full attestation data or null if not found.', params: 'address: string' },
    { name: 'getTierConfig(tier)', desc: 'Get configuration for a specific verification tier.', params: 'tier: number (1-4)' },
    { name: 'listTiers()', desc: 'List all 4 verification tier configurations.', params: 'none' },
  ];
  const tiers = [
    { tier: 1, name: t('verify.t1'), checks: 'Email + Phone', use: t('docs.t1use') },
    { tier: 2, name: t('verify.t2'), checks: 'Gov ID + Liveness', use: t('docs.t2use') },
    { tier: 3, name: t('verify.t3'), checks: 'PoA + Source of Funds', use: t('docs.t3use') },
    { tier: 4, name: t('verify.t4'), checks: 'KYB + UBO', use: t('docs.t4use') },
  ];

  return (
    <section className="section" style={{ minHeight: 'calc(100vh - var(--navbar-height))' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        <h1 className="section-title">{t('docs.title')}</h1>
        <p className="section-subtitle" style={{ marginBottom: '48px' }}>{t('docs.subtitle')}</p>

        <div id="installation" style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px' }}>{t('docs.install')}</h2>
          <div className="code-block">
            <code>
              <span className="code-comment">{t('docs.installComment')}</span><br />
              pnpm add @sello/sdk<br />
              <span className="code-comment"># or</span><br />
              npm install @sello/sdk<br />
              <span className="code-comment"># or</span><br />
              yarn add @sello/sdk
            </code>
          </div>
        </div>

        <div id="quick-start" style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px' }}>{t('docs.quickstart')}</h2>
          <div className="code-block">
            <code>
              <span className="code-keyword">import</span> {'{ SelloClient }'} <span className="code-keyword">from</span> <span className="code-string">&apos;@sello/sdk&apos;</span>;<br /><br />
              <span className="code-comment">{'// 1. Create a client for testnet'}</span><br />
              <span className="code-keyword">const</span> sello = <span className="code-keyword">new</span> <span className="code-function">SelloClient</span>({'{ '}network: <span className="code-string">&apos;testnet&apos;</span>{' }'});<br /><br />
              <span className="code-comment">{'// 2. Check if a user is verified'}</span><br />
              <span className="code-keyword">const</span> result = <span className="code-keyword">await</span> sello.<span className="code-function">verify</span>(<span className="code-string">&apos;GADDR...&apos;</span>);<br />
              console.log(result);<br />
              <span className="code-comment">{'// → { verified: true, tier: 2, timestamp: 1746000000, expiry: 1756000000 }'}</span><br /><br />
              <span className="code-comment">{'// 3. Quick boolean check'}</span><br />
              <span className="code-keyword">const</span> isKYCd = <span className="code-keyword">await</span> sello.<span className="code-function">isVerified</span>(<span className="code-string">&apos;GADDR...&apos;</span>);<br />
              <span className="code-comment">{'// → true'}</span>
            </code>
          </div>
        </div>

        <div id="api-reference" style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px' }}>{t('docs.apiRef')}</h2>
          {methods.map((m) => (
            <div key={m.name} className="glass-card" style={{ padding: '20px 24px', marginBottom: '12px' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--accent-light)', marginBottom: '8px' }}>{m.name}</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '8px' }}>{m.desc}</p>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Params: <code>{m.params}</code></div>
            </div>
          ))}
        </div>

        <div id="tiers" style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px' }}>{t('docs.tiers')}</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>{t('docs.tierCol')}</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>{t('docs.nameCol')}</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>{t('docs.checksCol')}</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>{t('docs.useCol')}</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((ti) => (
                  <tr key={ti.tier} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px' }}><span className="badge badge-accent">{ti.tier}</span></td>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{ti.name}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{ti.checks}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{ti.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div id="contracts">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px' }}>{t('docs.contracts')}</h2>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('docs.attestStore')}</div>
              <code style={{ fontSize: '0.875rem', color: 'var(--accent-light)' }}>{t('docs.toDeploy')}</code>
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('docs.tierReg')}</div>
              <code style={{ fontSize: '0.875rem', color: 'var(--accent-light)' }}>{t('docs.toDeploy')}</code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
