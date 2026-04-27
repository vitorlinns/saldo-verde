'use client';

import { useEffect } from 'react';

type ScrollProps = {
  children: React.ReactNode;
};

export default function SmoothScroll({ children }: ScrollProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let lenis: any = null;
    let rafId: number | null = null;

    import('lenis').then(({ default: Lenis }) => {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smoothWheel: true,
        smoothTouch: true,
        touchMultiplier: 2,
        wheelMultiplier: 1,
        infinite: false,
      } as any);

      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };

      rafId = requestAnimationFrame(raf);
    });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
