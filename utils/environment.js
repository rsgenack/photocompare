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
  // Use the same SVG images across all environments
  const basePath = '/og_svg_images';

  switch (platform) {
    case 'facebook':
      return `${basePath}/facebook1200x630.svg`;
    case 'twitter':
      return `${basePath}/twittercropped2.svg`;
    case 'linkedin':
      return `${basePath}/LinkedIn1200×627.svg`;
    case 'instagram':
      return `${basePath}/instagram.svg`;
    case 'imessage':
      return `${basePath}/linkedin_and_twitter_1x1_v2.svg`;
    default:
      return `${basePath}/facebook1200x630.svg`;
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
  let baseName = '';
  let width = 1200;
  let height = 630;

  switch (platform) {
    case 'facebook':
      baseName = '/og_svg_images/facebook1200x630';
      width = 1200;
      height = 630;
      break;
    case 'twitter':
      // Using 1200 x 630 assets for summary_large_image
      baseName = '/og_svg_images/twittercropped2';
      width = 1200;
      height = 630;
      break;
    case 'imessage':
      // Prefer 1x1 PNG/JPG, fallback to existing SVG v2
      baseName = '/og_svg_images/linkedin_and_twitter_1x1';
      width = 1200;
      height = 1200;
      break;
    case 'linkedin':
      baseName = '/og_svg_images/LinkedIn1200×627';
      width = 1200;
      height = 627;
      break;
    default:
      baseName = '/og_svg_images/facebook1200x630';
      width = 1200;
      height = 630;
  }

  const candidates = [
    { path: `${baseName}.png`, type: 'image/png', width, height },
    { path: `${baseName}.jpg`, type: 'image/jpeg', width, height },
  ];

  // For imessage, the SVG asset uses a different basename with _v2 suffix
  if (platform === 'imessage') {
    candidates.push({
      path: '/og_svg_images/linkedin_and_twitter_1x1_v2.svg',
      type: 'image/svg+xml',
      width,
      height,
    });
  } else {
    candidates.push({ path: `${baseName}.svg`, type: 'image/svg+xml', width, height });
  }

  return candidates;
}

/**
 * Return absolute URL OG image candidates in preferred order.
 */
export function getFullOgImageCandidates(platform = 'facebook') {
  const baseUrl = getBaseUrl();
  return getOgImageCandidates(platform).map((c) => ({ ...c, url: `${baseUrl}${c.path}` }));
}
