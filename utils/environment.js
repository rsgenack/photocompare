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
  // PNG assets optimized per platform, as requested
  const basePath = '/og_svg_images';

  switch (platform) {
    case 'facebook':
      return `${basePath}/facebook1200x630.png`;
    case 'twitter':
      // Prefer 1x1 square for Twitter; fallback handled by getTwitterImagePath
      return `${basePath}/linkedin_and_twitter_1x1.png`;
    case 'linkedin':
      return `${basePath}/LinkedIn1200×627.png`;
    case 'instagram':
      return `${basePath}/instagram.png`;
    case 'imessage':
      // iMessage should use the Instagram square to avoid multi-image previews
      return `${basePath}/instagram.png`;
    default:
      return `${basePath}/facebook1200x630.png`;
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
      return [{ path: '/og_svg_images/facebook1200x630.png', type: 'image/png', width: 1200, height: 630 }];
    case 'linkedin':
      return [{ path: '/og_svg_images/LinkedIn1200×627.png', type: 'image/png', width: 1200, height: 627 }];
    case 'twitter':
      return [{ path: '/og_svg_images/linkedin_and_twitter_1x1.png', type: 'image/png', width: 1200, height: 1200 }];
    case 'instagram':
    case 'imessage':
      return [{ path: '/og_svg_images/instagram.png', type: 'image/png', width: 1200, height: 1200 }];
    default:
      return [{ path: '/og_svg_images/facebook1200x630.png', type: 'image/png', width: 1200, height: 630 }];
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
  const baseUrl = getBaseUrl();
  const primary = `${baseUrl}/og_svg_images/linkedin_and_twitter_1x1.png`;
  const fallback = `${baseUrl}/og_svg_images/twittercropped1.png`;
  return primary;
}
