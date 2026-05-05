import type { Metadata } from 'next';
import KYAContent from './KYAContent';
export const metadata: Metadata = { title: 'KYA — Know Your Agent | SELLO', description: 'SELLO extends compliance from humans to AI agents. Know Your Agent (KYA) brings identity and accountability to autonomous software on Stellar.' };
export default function KYAPage() { return <KYAContent />; }
