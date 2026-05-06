'use client';

import { useState } from 'react';
import { useT } from '@/i18n';
import LanguageSelector from './LanguageSelector';
import WalletButton from './WalletButton';

export function Navbar() {
  const t = useT();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="navbar" id="main-nav">
      <div className="navbar-inner">
        <a href="/" className="navbar-logo" id="nav-logo">
          SELLO<span className="dot"></span>
        </a>
        <ul className={`navbar-links ${isMenuOpen ? 'open' : ''}`} id="nav-links" onClick={() => setIsMenuOpen(false)}>
          <li><a href="/">{t('nav.home')}</a></li>
          <li><a href="/verify">{t('nav.verify')}</a></li>
          <li><a href="/explorer">{t('nav.explorer')}</a></li>
          <li><a href="/dashboard">{t('nav.dashboard')}</a></li>
          <li><a href="/docs">{t('nav.docs')}</a></li>
          <li><a href="/kya">{t('nav.kya')}</a></li>
          <li><a href="/pricing">{t('nav.pricing')}</a></li>
        </ul>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LanguageSelector />
          <WalletButton />
          <button 
            className="mobile-menu-btn" 
            id="mobile-menu-toggle" 
            aria-label="Toggle navigation menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </nav>
  );
}

export function Footer() {
  const t = useT();
  return (
    <footer className="footer" id="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h4>SELLO Protocol</h4>
            <p style={{ color: 'var(--text-tertiary)', lineHeight: '1.6', fontSize: '0.875rem' }}>
              {t('footer.desc')}
            </p>
          </div>
          <div className="footer-col">
            <h4>{t('footer.product')}</h4>
            <a href="/docs">{t('footer.documentation')}</a>
            <a href="/pricing">{t('nav.pricing')}</a>
            <a href="/explorer">{t('footer.explorer')}</a>
            <a href="/verify">{t('footer.getVerified')}</a>
          </div>
          <div className="footer-col">
            <h4>{t('footer.developers')}</h4>
            <a href="https://github.com/sello-protocol" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://www.npmjs.com/package/@sello/sdk" target="_blank" rel="noopener noreferrer">npm Package</a>
            <a href="/docs">{t('footer.sdkRef')}</a>
          </div>
          <div className="footer-col">
            <h4>{t('footer.community')}</h4>
            <a href="https://discord.gg/stellardev" target="_blank" rel="noopener noreferrer">Discord</a>
            <a href="https://twitter.com/SelloProtocol" target="_blank" rel="noopener noreferrer">Twitter</a>
            <a href="https://stellar.org" target="_blank" rel="noopener noreferrer">Stellar.org</a>
          </div>
        </div>
        <div style={{ textAlign: 'center', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
          <p>{t('footer.copy')}</p>
        </div>
      </div>
    </footer>
  );
}
