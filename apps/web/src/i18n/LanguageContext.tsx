'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export type Locale = 'en' | 'es';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

// Shorthand hook
export function useT() {
  return useLanguage().t;
}

export function LanguageProvider({
  children,
  translations,
}: {
  children: ReactNode;
  translations: Record<Locale, Record<string, string>>;
}) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sello-lang') as Locale | null;
    if (saved === 'en' || saved === 'es') setLocaleState(saved);
    setMounted(true);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('sello-lang', l);
    document.documentElement.lang = l;
  }, []);

  const t = useCallback(
    (key: string): string => {
      const effectiveLocale = mounted ? locale : 'en';
      return translations[effectiveLocale]?.[key] ?? translations['en']?.[key] ?? key;
    },
    [locale, mounted, translations],
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
