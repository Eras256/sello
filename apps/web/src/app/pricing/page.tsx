import type { Metadata } from 'next';
import PricingContent from './PricingContent';
export const metadata: Metadata = { title: 'Pricing — SELLO', description: 'Simple, transparent pricing for SELLO compliance infrastructure.' };
export default function PricingPage() { return <PricingContent />; }
