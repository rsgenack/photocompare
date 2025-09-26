#!/usr/bin/env node

/**
 * Test script to verify environment-specific OG image configuration
 */

// Mock different environments for testing
const originalEnv = process.env;

function testEnvironment(envName, expectedBaseUrl, expectedImagePath) {
  console.log(`\n🧪 Testing ${envName} environment:`);

  // Set environment variables
  if (envName === 'development') {
    process.env.NODE_ENV = 'development';
    delete process.env.VERCEL_ENV;
  } else if (envName === 'preview') {
    process.env.VERCEL_ENV = 'preview';
    process.env.VERCEL_URL = 'photocompare-git-feature-branch.vercel.app';
  } else if (envName === 'production') {
    process.env.VERCEL_ENV = 'production';
    delete process.env.VERCEL_URL;
  }

  // Import the utility functions
  const { getEnvironment, getBaseUrl, getOgImagePath, getFullOgImageUrl } = require('../utils/environment.js');

  const actualEnv = getEnvironment();
  const actualBaseUrl = getBaseUrl();
  const actualImagePath = getOgImagePath('facebook');
  const actualFullUrl = getFullOgImageUrl('facebook');

  console.log(`  Environment: ${actualEnv} ${actualEnv === envName ? '✅' : '❌'}`);
  console.log(`  Base URL: ${actualBaseUrl} ${actualBaseUrl === expectedBaseUrl ? '✅' : '❌'}`);
  console.log(`  Image Path: ${actualImagePath} ${actualImagePath === expectedImagePath ? '✅' : '❌'}`);
  console.log(`  Full URL: ${actualFullUrl}`);

  // Reset environment
  process.env = { ...originalEnv };
}

// Test different environments
testEnvironment('development', 'http://localhost:3000', '/og_svg_images/facebook1200x630.svg');
testEnvironment('preview', 'https://photocompare-git-feature-branch.vercel.app', '/og_svg_images/facebook1200x630.svg');
testEnvironment('production', 'https://votographer.com', '/og_svg_images/facebook1200x630.svg');

console.log('\n🎉 Environment-specific OG image configuration test completed!');
console.log('\n📋 Summary:');
console.log('• Development: Uses localhost:3000 with SVG images');
console.log('• Preview/Staging: Uses Vercel preview URL with SVG images');
console.log('• Production: Uses votographer.com with SVG images');
console.log('• All environments now use the same SVG files for consistency');
