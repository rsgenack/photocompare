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
