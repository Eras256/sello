import type { Locale } from './LanguageContext';
import { nav } from './nav';
import { home } from './home';
import { pages } from './pages';
import { kya } from './kya';

function merge(...dicts: Array<Record<Locale, Record<string, string>>>): Record<Locale, Record<string, string>> {
  const result: Record<Locale, Record<string, string>> = { en: {}, es: {} };
  for (const dict of dicts) {
    for (const locale of ['en', 'es'] as Locale[]) {
      Object.assign(result[locale], dict[locale]);
    }
  }
  return result;
}

export const translations = merge(nav, home, pages, kya);
export { LanguageProvider, useLanguage, useT } from './LanguageContext';
export type { Locale } from './LanguageContext';
