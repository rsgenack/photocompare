# Environment-Specific OG Images

This project now uses **consistent SVG Open Graph (OG) images** across all environments for optimal performance and consistency.

## How It Works

The system automatically detects the current environment and serves the appropriate base URL with the same SVG images:

- **Development** (`NODE_ENV=development`): Uses `localhost:3000` with SVG images
- **Preview/Staging** (`VERCEL_ENV=preview`): Uses Vercel preview URL with SVG images
- **Production** (`VERCEL_ENV=production`): Uses `votographer.com` with SVG images

## File Structure

```
public/og_svg_images/
├── facebook1200x630.svg         # Facebook OG image (1200x630)
├── twittercropped2.svg          # Twitter OG image
├── LinkedIn1200×627.svg         # LinkedIn OG image (1200x627)
├── instagram.svg                # Instagram OG image
├── linkedin_and_twitter_1x1.svg # Alternative 1x1 format
└── linkedin_and_twitter_1x1_v2.svg # Alternative 1x1 format v2
```

## Benefits of SVG OG Images

- **Scalable**: Perfect quality at any size
- **Smaller file sizes**: Often much smaller than PNGs
- **Consistent quality**: No pixelation or compression artifacts
- **Cross-platform compatibility**: Works on all social media platforms
- **Easy to maintain**: Single source of truth for all environments

## Environment Detection Logic

The system detects environments in this order:
1. `VERCEL_ENV` environment variable (for Vercel deployments)
2. `NODE_ENV` environment variable (fallback)
3. Defaults to 'development'

## URLs Generated

- **Development**: `http://localhost:3000/og_svg_images/facebook1200x630.svg`
- **Preview**: `https://[vercel-url]/og_svg_images/facebook1200x630.svg`
- **Production**: `https://votographer.com/og_svg_images/facebook1200x630.svg`

## Social Media Platforms Supported

- **Facebook**: `facebook1200x630.svg` (1200x630)
- **Twitter**: `twittercropped2.svg` (1200x600)
- **LinkedIn**: `LinkedIn1200×627.svg` (1200x627)
- **Instagram**: `instagram.svg` (1080x1080)

## Files Modified

- `utils/environment.js` - Simplified environment detection and URL generation
- `app/layout.jsx` - Dynamic metadata configuration
- `scripts/test-env-config.js` - Testing script

## Testing

Test the environment detection:
```bash
node scripts/test-env-config.js
```

## Key Changes Made

1. **Updated Path**: Now uses `/og_svg_images/` instead of `/VOTOGRAPHER_OG/`
2. **SVG-Only**: All OG images are now SVG format for better quality and smaller file sizes
3. **Consistent Images**: Same images across all environments (only base URL changes)
4. **Cleaner Structure**: Uses the new organized `og_svg_images` folder

This approach provides the best balance of consistency, performance, and maintainability across all deployment environments.
