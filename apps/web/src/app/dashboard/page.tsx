import type { Metadata } from 'next';
import DashboardContent from './DashboardContent';
export const metadata: Metadata = { title: 'Developer Dashboard — SELLO', description: 'Manage your SELLO API keys, view verification analytics, and configure webhooks.' };
export default function DashboardPage() { return <DashboardContent />; }
