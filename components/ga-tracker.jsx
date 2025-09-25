'use client';

import { trackPageview } from '@/utils/analytics';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function GATracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    trackPageview(url);
  }, [pathname, searchParams]);

  return null;
}
