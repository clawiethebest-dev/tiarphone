'use client';

import { useEffect } from 'react';
import { useTracker } from '@/lib/tracker';

export function TrackerProvider({ children }: { children: React.ReactNode }) {
  const tracker = useTracker();

  useEffect(() => {
    // Tracker auto-initializes in useTracker
  }, [tracker]);

  return <>{children}</>;
}
