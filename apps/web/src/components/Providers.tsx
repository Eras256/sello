'use client';

import { LanguageProvider } from '@/i18n/LanguageContext';
import { translations } from '@/i18n';
import { WalletProvider } from './WalletProvider';
import type { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider translations={translations}>
      <WalletProvider>
        {children}
      </WalletProvider>
    </LanguageProvider>
  );
}
