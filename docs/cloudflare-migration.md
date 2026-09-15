# Cloudflare Pages Migration Guide

This guide walks through deploying VOTOGRAPHER from Vercel to Cloudflare Pages.

## Prerequisites

- Cloudflare account with access to Pages
- GitHub repo: `rsgenack/photocompare`
- Domain `votographer.com` (currently on Vercel)

## 1. Create Cloudflare Pages Project

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com/).
2. Go to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
3. Select the `rsgenack/photocompare` repository.
4. Choose the branch to deploy (typically `main` for production).

## 2. Build Settings

Use one of these configurations:

### Option A: Framework preset (recommended)

| Setting | Value |
|---------|-------|
| Framework preset | **Next.js (Static HTML Export)** |
| Build command | `npm run build` |
| Build output directory | `out` |
| Root directory | `/` (repo root) |

### Option B: Custom build

| Setting | Value |
|---------|-------|
| Build command | `npm install --legacy-peer-deps && npm run build` |
| Build output directory | `out` |
| Root directory | `/` (repo root) |

### Environment variables

| Variable | Value |
|----------|-------|
| `NODE_VERSION` | `20` |

Cloudflare Pages sets `CF_PAGES`, `CF_PAGES_URL`, and `CF_PAGES_BRANCH` automatically. The app uses these for preview URL detection in `utils/environment.js`.

## 3. Deploy Preview Branch First

Before cutting over production DNS:

1. Deploy the `cursor/cloudflare-pages-migration` branch (or merge to `main` first).
2. Open the Cloudflare Pages preview URL.
3. Verify all routes load on direct refresh:
   - `/`
   - `/compare`
   - `/start`
   - `/type`
   - `/upload`
4. Confirm Google Analytics events in the GA4 realtime view (`G-1006GRWNV2`).

## 4. Add Custom Domain

1. In the Pages project, go to **Custom domains**.
2. Add `votographer.com` and `www.votographer.com` (if used).
3. Cloudflare will provide DNS records to add if the domain is not already on Cloudflare.

## 5. DNS Cutover

1. **Add domain to Cloudflare** (if not already):
   - Transfer DNS management to Cloudflare nameservers.
2. **Point domain to Pages**:
   - Cloudflare usually creates a CNAME to `<project>.pages.dev` automatically when you add the custom domain.
3. **Remove from Vercel**:
   - In Vercel project settings, remove `votographer.com` from domains.
   - Optionally disable Vercel auto-deploy (see below).
4. Wait for DNS propagation (typically minutes with Cloudflare).

## 6. Verify Production

After cutover, confirm:

- [ ] `https://votographer.com` loads
- [ ] Deep links work (`/compare`, `/start`, `/type`, `/upload`)
- [ ] Security headers present (check with [securityheaders.com](https://securityheaders.com) or browser devtools)
- [ ] Google Analytics receives pageviews in GA4 Realtime
- [ ] OG/social preview images use `https://votographer.com` URLs

## 7. Optional: Disable Vercel Auto-Deploy

After successful cutover:

1. In Vercel → Project Settings → Git → disable automatic deployments, **or**
2. Disconnect the GitHub integration entirely.

You can also delete `vercel.json` from the repo once Vercel is fully decommissioned. It is kept during migration for rollback safety.

## Rollback Plan

If issues arise after cutover:

1. Re-add `votographer.com` in Vercel project domains.
2. Point DNS back to Vercel (or revert Cloudflare DNS records).
3. Re-enable Vercel auto-deploy if disabled.

## Technical Notes

- **Static export**: The app uses `output: 'export'` in `v0-user-next.config.mjs`, generating static HTML in `out/`.
- **Redirects**: `public/_redirects` ensures SPA-style deep links work on Cloudflare Pages.
- **Security headers**: `public/_headers` adds HSTS, X-Frame-Options, Referrer-Policy, and X-Content-Type-Options.
- **No server features**: This app has no API routes or middleware; all routes are pre-rendered at build time.
