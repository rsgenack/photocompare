/**
 * Environment detection utilities
 */

export function getEnvironment() {
  // Check for Vercel environment first
  if (process.env.VERCEL_ENV) {
    return process.env.VERCEL_ENV; // 'production', 'preview', 'development'
  }

  // Fallback to NODE_ENV
  if (process.env.NODE_ENV === 'production') {
    return 'production';
  }

  if (process.env.NODE_ENV === 'development') {
    return 'development';
  }

  // Default to development
  return 'development';
}

export function getBaseUrl() {
  const env = getEnvironment();

  switch (env) {
    case 'production':
      return 'https://votographer.com';
    case 'preview':
      // Vercel preview deployments get a unique URL
      return process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://votographer.com';
    case 'development':
      return 'http://localhost:3000';
    default:
      return 'https://votographer.com';
  }
}

export function getOgImagePath(platform = 'facebook') {
  // Prefer the optimal format per platform (JPG for photographic 1.91:1 assets,
  // PNG for text-forward square creatives)
  const basePath = '/og_svg_images';

  switch (platform) {
    case 'facebook':
      return `${basePath}/facebook1200x630.jpg`;
    case 'twitter':
      // Twitter Summary Card Large Image (2:1) rendered as high-quality JPG
      return `${basePath}/twittercropped2.jpg`;
    case 'linkedin':
      return `${basePath}/LinkedIn1200×627.png`;
    case 'instagram':
      return `${basePath}/instagram.jpg`;
    case 'imessage':
    case 'whatsapp':
    case 'universal':
    case 'default':
      // Messaging apps favour square PNGs to avoid awkward cropping
      return `${basePath}/instagram.png`;
    default:
      return `${basePath}/facebook1200x630.jpg`;
  }
}

export function getFullOgImageUrl(platform = 'facebook') {
  const baseUrl = getBaseUrl();
  const imagePath = getOgImagePath(platform);
  return `${baseUrl}${imagePath}`;
}

/**
 * Return relative-path OG image candidates in preferred order (PNG, JPG, SVG)
 * including MIME type and recommended dimensions for each platform.
 */
export function getOgImageCandidates(platform = 'facebook') {
  // Return a SINGLE candidate per platform to avoid duplicate previews in certain apps
  switch (platform) {
    case 'facebook':
      return [{ path: '/og_svg_images/facebook1200x630.jpg', type: 'image/jpeg', width: 1200, height: 630 }];
    case 'linkedin':
      return [{ path: '/og_svg_images/LinkedIn1200×627.png', type: 'image/png', width: 1200, height: 627 }];
    case 'twitter':
      return [{ path: '/og_svg_images/twittercropped2.jpg', type: 'image/jpeg', width: 1200, height: 600 }];
    case 'instagram':
    case 'imessage':
    case 'whatsapp':
    case 'universal':
    case 'default':
      return [{ path: '/og_svg_images/instagram.png', type: 'image/png', width: 1200, height: 1200 }];
    default:
      return [{ path: '/og_svg_images/facebook1200x630.jpg', type: 'image/jpeg', width: 1200, height: 630 }];
  }
}

/**
 * Return absolute URL OG image candidates in preferred order.
 */
export function getFullOgImageCandidates(platform = 'facebook') {
  const baseUrl = getBaseUrl();
  return getOgImageCandidates(platform).map((c) => ({ ...c, url: `${baseUrl}${c.path}` }));
}

// Helper for Twitter-specific image with safe fallback
export function getTwitterImageUrl() {
  const twitterCandidate = getFullOgImageCandidates('twitter')[0];
  if (twitterCandidate) {
    return twitterCandidate.url;
  }

  const fallbackCandidate = getFullOgImageCandidates('universal')[0];
  return fallbackCandidate ? fallbackCandidate.url : undefined;
}
