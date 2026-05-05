import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import { Navbar, Footer } from '@/components/Shell';

export const metadata: Metadata = {
  title: 'SELLO — Verify Once, Access Everything',
  description: 'The compliance SDK that gives any Stellar app KYC/KYB verification and on-chain attestations in under a day. Verify once through SELLO, access the entire Stellar ecosystem.',
  keywords: ['Stellar', 'Soroban', 'KYC', 'compliance', 'attestation', 'blockchain', 'identity', 'verification'],
  openGraph: {
    title: 'SELLO — Verify Once, Access Everything',
    description: 'Compliance infrastructure for Stellar. One SDK, one verification, every app.',
    type: 'website',
    siteName: 'SELLO Protocol',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
