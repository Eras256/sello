import type { Metadata } from 'next';
import HomeContent from './HomeContent';

export const metadata: Metadata = {
  title: 'SELLO — Verify Once, Access Everything | Compliance for Stellar',
  description: 'The compliance SDK that gives any Stellar app KYC/KYB verification and on-chain attestations. Zero shared compliance infrastructure — until now.',
};

export default function HomePage() {
  return <HomeContent />;
}
