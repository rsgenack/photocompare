'use client';

export const GA_MEASUREMENT_ID = 'G-1006GRWNV2';

let analyticsContext = {
  step: undefined,
  comparisonType: undefined,
  imageCount: undefined,
  isMobile: undefined,
  orientation: undefined,
};

function getOrCreateId(key) {
  try {
    const existing = window.localStorage.getItem(key);
    if (existing) return existing;
    const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    window.localStorage.setItem(key, id);
    return id;
  } catch {
    return undefined;
  }
}

function getDeviceInfo() {
  if (typeof window === 'undefined') return {};
  const ua = navigator.userAgent || '';
  const language = navigator.language || 'en';
  const viewport = { w: window.innerWidth, h: window.innerHeight };
  const isMobile = /Mobi|Android/i.test(ua);
  const orientation = window.matchMedia && window.matchMedia('(orientation: landscape)').matches ? 'landscape' : 'portrait';
  return { ua, language, viewport_w: viewport.w, viewport_h: viewport.h, isMobile, orientation };
}

function withDefaults(params = {}) {
  if (typeof window === 'undefined') return params;
  const { ua, language, viewport_w, viewport_h, isMobile, orientation } = getDeviceInfo();
  return {
    ...params,
    step: analyticsContext.step,
    comparison_type: analyticsContext.comparisonType,
    image_count: analyticsContext.imageCount,
    is_mobile: typeof analyticsContext.isMobile === 'boolean' ? analyticsContext.isMobile : isMobile,
    orientation: analyticsContext.orientation || orientation,
    language,
    viewport_w,
    viewport_h,
    referrer: document.referrer || undefined,
    page_location: window.location.href,
    user_id: getOrCreateId('voto_user_id'),
    session_id: getOrCreateId('voto_session_id'),
    user_agent: ua,
  };
}

export function initAnalytics() {
  if (typeof window === 'undefined' || !window.gtag) return;
  const user_id = getOrCreateId('voto_user_id');
  const device = getDeviceInfo();
  window.gtag('set', 'user_properties', {
    user_id,
    language: device.language,
    is_mobile: device.isMobile,
  });
}

export function setAnalyticsContext(partial = {}) {
  analyticsContext = { ...analyticsContext, ...partial };
}

export function trackEvent(action, params = {}) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', action, withDefaults(params));
}

export function trackPageview(url) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('config', GA_MEASUREMENT_ID, { page_path: url });
}

// Convenience helpers for common events
export const Events = {
  startComparison: (count) => trackEvent('start_comparison', { image_count: count }),
  selectPhoto: (side) => trackEvent('select_photo', { side }),
  overlayMode: (mode) => trackEvent('overlay_mode', { mode }),
  zoomChange: (value) => trackEvent('zoom_change', { value }),
  fullscreenEnter: (where) => trackEvent('fullscreen_enter', { where }),
  fullscreenExit: (where) => trackEvent('fullscreen_exit', { where }),
  downloadResults: (format) => trackEvent('download_results', { format }),
  error: (message, code, context) => trackEvent('error', { message, code, ...context }),
};
