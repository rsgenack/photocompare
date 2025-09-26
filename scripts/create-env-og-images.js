#!/usr/bin/env node

/**
 * Script to create environment-specific OG images
 * This script creates simple placeholder images with environment labels
 * You can replace these with your actual environment-specific designs
 */

const fs = require('fs');
const path = require('path');

// Simple SVG template for creating OG images
function createOgImageSvg(environment, platform, dimensions) {
  const { width, height } = dimensions;
  const bgColor = environment === 'development' ? '#ff6b6b' :
                  environment === 'preview' ? '#4ecdc4' : '#2c3e50';

  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${bgColor}"/>
  <text x="50%" y="40%" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="48" font-weight="bold">
    VOTOGRAPHER
  </text>
  <text x="50%" y="60%" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24">
    ${environment.toUpperCase()} ENVIRONMENT
  </text>
  <text x="50%" y="75%" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18">
    ${platform.toUpperCase()} OG IMAGE
  </text>
</svg>`;
}

// Image dimensions for different platforms
const imageDimensions = {
  facebook: { width: 1200, height: 630 },
  twitter: { width: 1200, height: 600 },
  linkedin: { width: 1200, height: 627 },
  instagram: { width: 1080, height: 1080 }
};

// Create environment-specific images
const environments = ['dev', 'staging'];
const platforms = ['facebook', 'twitter', 'linkedin', 'instagram'];

environments.forEach(env => {
  const envDir = path.join(__dirname, '..', 'public', 'VOTOGRAPHER_OG', env);

  platforms.forEach(platform => {
    const svgContent = createOgImageSvg(env, platform, imageDimensions[platform]);
    const filename = platform === 'facebook' ? 'facebook1200x630.png' :
                    platform === 'twitter' ? 'twittercropped2.png' :
                    platform === 'linkedin' ? 'LinkedIn1200x627.png' :
                    'instagram.png';

    const svgPath = path.join(envDir, filename.replace('.png', '.svg'));

    fs.writeFileSync(svgPath, svgContent);
    console.log(`Created ${env}/${filename.replace('.png', '.svg')}`);
  });
});

console.log('\nEnvironment-specific OG images created!');
console.log('Note: These are SVG placeholders. You can:');
console.log('1. Convert them to PNG using an online converter or ImageMagick');
console.log('2. Replace them with your actual environment-specific designs');
console.log('3. Use them as-is (SVG works for OG images too)');
