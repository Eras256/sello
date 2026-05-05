'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const Hero3D = dynamic(() => import('@/components/Hero3D'), {
  ssr: false,
  loading: () => null,
});

/**
 * Client-side hero wrapper that overlays the 3D scene behind the hero text.
 * Uses dynamic import with ssr:false to prevent WebGL from running on the server.
 */
export default function HeroScene() {
  return (
    <Suspense fallback={null}>
      <Hero3D />
    </Suspense>
  );
}
