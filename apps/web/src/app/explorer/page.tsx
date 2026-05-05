import type { Metadata } from 'next';
import ExplorerContent from './ExplorerContent';
export const metadata: Metadata = { title: 'Attestation Explorer — SELLO', description: 'Search any Stellar address to check its verification status.' };
export default function ExplorerPage() { return <ExplorerContent />; }
