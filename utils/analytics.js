'use client';

export const GA_MEASUREMENT_ID = 'G-1006GRWNV2';

export function trackEvent(action, params = {}) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', action, params);
}

export function trackPageview(url) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('config', GA_MEASUREMENT_ID, { page_path: url });
}
