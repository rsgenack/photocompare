'use client';

import { useBreakpoints } from './use-breakpoints';

export function useMobile() {
  const { isMobile } = useBreakpoints();
  return isMobile;
}
