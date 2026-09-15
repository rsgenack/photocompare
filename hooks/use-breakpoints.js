'use client';

import { useEffect, useMemo, useState } from 'react';

// Tailwind default breakpoints
// sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function useBreakpoints() {
  const [matches, setMatches] = useState({
    smUp: false,
    mdUp: false,
    lgUp: false,
    xlUp: false,
    x2lUp: false,
  });

  useEffect(() => {
    const queries = {
      sm: window.matchMedia(`(min-width: ${BREAKPOINTS.sm}px)`),
      md: window.matchMedia(`(min-width: ${BREAKPOINTS.md}px)`),
      lg: window.matchMedia(`(min-width: ${BREAKPOINTS.lg}px)`),
      xl: window.matchMedia(`(min-width: ${BREAKPOINTS.xl}px)`),
      x2l: window.matchMedia(`(min-width: ${BREAKPOINTS['2xl']}px)`),
    };

    const update = () => {
      setMatches({
        smUp: queries.sm.matches,
        mdUp: queries.md.matches,
        lgUp: queries.lg.matches,
        xlUp: queries.xl.matches,
        x2lUp: queries.x2l.matches,
      });
    };

    // Initial
    update();

    // Subscribe
    Object.values(queries).forEach((mql) => mql.addEventListener('change', update));
    return () => {
      Object.values(queries).forEach((mql) => mql.removeEventListener('change', update));
    };
  }, []);

  const derived = useMemo(() => {
    const current = matches.x2lUp
      ? '2xl'
      : matches.xlUp
      ? 'xl'
      : matches.lgUp
      ? 'lg'
      : matches.mdUp
      ? 'md'
      : matches.smUp
      ? 'sm'
      : 'base';

    const isMobile = !matches.mdUp; // < md
    const isTablet = matches.mdUp && !matches.lgUp; // md ≤ w < lg
    const isDesktop = matches.lgUp; // ≥ lg

    return { current, isMobile, isTablet, isDesktop };
  }, [matches]);

  return { ...matches, ...derived };
}

// Helper: choose value by breakpoint
export function useBreakpointValue(values) {
  const { current } = useBreakpoints();
  // Priority order: 2xl > xl > lg > md > sm > base
  if (current === '2xl' && values['2xl'] !== undefined) return values['2xl'];
  if (current === 'xl' && values.xl !== undefined) return values.xl;
  if (current === 'lg' && values.lg !== undefined) return values.lg;
  if (current === 'md' && values.md !== undefined) return values.md;
  if (current === 'sm' && values.sm !== undefined) return values.sm;
  return values.base;
}
