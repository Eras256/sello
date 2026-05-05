import type { Metadata } from 'next';
import VerifyContent from './VerifyContent';

export const metadata: Metadata = {
  title: 'Verify Your Identity — SELLO',
  description: 'Connect your Stellar wallet and verify your identity to receive an on-chain attestation.',
};

export default function VerifyPage() {
  return <VerifyContent />;
}
