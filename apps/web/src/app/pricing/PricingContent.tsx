'use client';
import { useT } from '@/i18n';

export default function PricingContent() {
  const t = useT();
  const plans = [
    { name: t('pricing.free'), price: t('pricing.freePrice'), period: t('pricing.freePeriod'), desc: t('pricing.freeDesc'),
      features: ['pf.sdk', 'pf.unlimited', 'pf.community', 'pf.4tiers', 'pf.soroban'].map(k => t(k)),
      cta: t('pricing.getStarted'), featured: false },
    { name: t('pricing.starter'), price: t('pricing.starterPrice'), period: t('pricing.starterPeriod'), desc: t('pricing.starterDesc'),
      features: ['pf.500', 'pf.devDash', 'pf.apiWebhooks', 'pf.emailSupport', 'pf.analytics'].map(k => t(k)),
      cta: t('pricing.startTrial'), featured: false },
    { name: t('pricing.growth'), price: t('pricing.growthPrice'), period: t('pricing.growthPeriod'), desc: t('pricing.growthDesc'),
      features: ['pf.2000', 'pf.priority', 'pf.customWebhook', 'pf.advAnalytics', 'pf.multiTier', 'pf.sla'].map(k => t(k)),
      cta: t('pricing.startTrial'), featured: true },
    { name: t('pricing.enterprise'), price: t('pricing.enterprisePrice'), period: t('pricing.enterprisePeriod'), desc: t('pricing.enterpriseDesc'),
      features: ['pf.unlimitedV', 'pf.dedicated', 'pf.customTier', 'pf.onPrem', 'pf.travelRule', 'pf.soc2'].map(k => t(k)),
      cta: t('pricing.contactSales'), featured: false },
  ];
  const faqs = [
    { q: t('pricing.f1q'), a: t('pricing.f1a') },
    { q: t('pricing.f2q'), a: t('pricing.f2a') },
    { q: t('pricing.f3q'), a: t('pricing.f3a') },
    { q: t('pricing.f4q'), a: t('pricing.f4a') },
  ];

  return (
    <section className="section" style={{ minHeight: 'calc(100vh - var(--navbar-height))' }}>
      <div className="container">
        <h1 className="section-title" style={{ textAlign: 'center' }}>{t('pricing.title')}</h1>
        <p className="section-subtitle" style={{ textAlign: 'center', margin: '0 auto 48px' }}>{t('pricing.subtitle')}</p>
        <div className="grid-4" style={{ alignItems: 'start' }}>
          {plans.map((plan) => (
            <div key={plan.name} className={`pricing-card ${plan.featured ? 'featured' : ''}`}>
              {plan.featured && <div className="badge badge-accent" style={{ marginBottom: '16px' }}>{t('pricing.mostPopular')}</div>}
              <div className="pricing-name">{plan.name}</div>
              <div className="pricing-price">{plan.price}<span>{plan.period}</span></div>
              <div className="pricing-desc">{plan.desc}</div>
              <ul className="pricing-features">
                {plan.features.map((f) => <li key={f}>{f}</li>)}
              </ul>
              <button className={`btn ${plan.featured ? 'btn-primary' : 'btn-secondary'}`} style={{ width: '100%', justifyContent: 'center' }}>{plan.cta}</button>
            </div>
          ))}
        </div>
        <div className="glass-card" style={{ padding: '32px', marginTop: '48px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px' }}>{t('pricing.moreTitle')}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            {t('pricing.moreDesc')} <strong style={{ color: 'var(--accent-light)' }}>$1.50 – $3.00</strong> {t('pricing.perCheck')}
          </p>
        </div>
        <div style={{ marginTop: '80px', maxWidth: '720px', margin: '80px auto 0' }}>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '32px' }}>{t('pricing.faqTitle')}</h2>
          {faqs.map((faq) => (
            <div key={faq.q} className="glass-card" style={{ padding: '24px', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '8px' }}>{faq.q}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
