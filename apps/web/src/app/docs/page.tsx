import type { Metadata } from 'next';
import DocsContent from './DocsContent';
export const metadata: Metadata = { title: 'Documentation — SELLO SDK', description: 'Complete SDK documentation for SELLO.' };
export default function DocsPage() { return <DocsContent />; }
