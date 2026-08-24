'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initAllPixels, trackPageView, PIXEL_CONFIG } from '@/lib/pixels';
import { storeTrafficSource } from '@/lib/traffic-source';

// Multi-Platform Pixel Configuration
const pixelConfig = {
  ...PIXEL_CONFIG,
  facebook: ['1035868502633279'],
  tiktok: ['D9SE8ARC77U40SOI9EG0'],
  snapchat: [],
  google: [],
  twitter: [],
};

export function PixelProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    initAllPixels(pixelConfig);
    storeTrafficSource();
  }, []);

  useEffect(() => {
    trackPageView();
  }, [pathname]);

  return <>{children}</>;
}
