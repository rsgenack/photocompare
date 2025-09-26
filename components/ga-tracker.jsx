'use client';

import { initAnalytics, setAnalyticsContext, trackPageview } from '@/utils/analytics';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function GATracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    initAnalytics();
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    trackPageview(url);
    setAnalyticsContext({ step: pathname?.replace(/^\//, '') || 'home' });
  }, [pathname, searchParams]);

  return null;
}
