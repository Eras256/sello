'use client';

import { useLanguage, type Locale } from '@/i18n/LanguageContext';

const flags: Record<Locale, string> = { en: '🇺🇸', es: '🇲🇽' };
const labels: Record<Locale, string> = { en: 'EN', es: 'ES' };

export default function LanguageSelector() {
  const { locale, setLocale } = useLanguage();
  const next: Locale = locale === 'en' ? 'es' : 'en';

  return (
    <button
      onClick={() => setLocale(next)}
      className="lang-toggle"
      id="lang-toggle"
      aria-label={`Switch to ${labels[next]}`}
      title={`Switch to ${labels[next]}`}
    >
      <span className="lang-flag">{flags[locale]}</span>
      <span className="lang-label">{labels[locale]}</span>
    </button>
  );
}
