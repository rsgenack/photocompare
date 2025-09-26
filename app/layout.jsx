import { getBaseUrl, getFullOgImageCandidates } from '@/utils/environment';
import Script from 'next/script';
import { Suspense, Fragment } from 'react';
import './globals.css';

// Get environment-specific URLs and OG image candidates
const baseUrl = getBaseUrl();
const facebookCandidates = getFullOgImageCandidates('facebook');
const twitterCandidates = getFullOgImageCandidates('twitter');
const imessageCandidates = getFullOgImageCandidates('imessage');

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: 'VOTOGRAPHER',
  description: 'Compare and rank your photos',
  generator: 'v0.dev',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/apple-touch-icon.png', sizes: '180x180', rel: 'apple-touch-icon' },
    ],
  },
  openGraph: {
    title: 'VOTOGRAPHER',
    description: 'Find your best photos, easily and enjoyably',
    url: baseUrl,
    siteName: 'VOTOGRAPHER',
    images: [
      // Prefer PNG/JPG; include SVG as last fallback
      ...facebookCandidates.map((c) => ({
        url: c.url,
        width: c.width,
        height: c.height,
        alt: 'VOTOGRAPHER Open Graph Image',
      })),
      ...imessageCandidates.map((c) => ({
        url: c.url,
        width: c.width,
        height: c.height,
        alt: 'VOTOGRAPHER Square Image',
      })),
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VOTOGRAPHER',
    description: 'Find your best photos, easily and enjoyably',
    images: [twitterCandidates[0]?.url || facebookCandidates[0]?.url],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        {/* Force OG/Twitter link tags for scrapers that don't parse Next metadata */}
        <link rel="canonical" href={baseUrl} />
        <meta property="og:title" content="VOTOGRAPHER" />
        <meta property="og:description" content="Find your best photos, easily and enjoyably" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={baseUrl} />
        {facebookCandidates.map((c, idx) => (
          <Fragment key={`og-image-fb-group-${idx}`}>
            <meta property="og:image" content={c.url} />
            <meta property="og:image:width" content={String(c.width)} />
            <meta property="og:image:height" content={String(c.height)} />
            <meta property="og:image:type" content={c.type} />
            <meta property="og:image:secure_url" content={c.url} />
          </Fragment>
        ))}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="VOTOGRAPHER" />
        <meta name="twitter:description" content="Find your best photos, easily and enjoyably" />
        <meta name="twitter:image" content={twitterCandidates[0]?.url || facebookCandidates[0]?.url} />
        {/* Square image for iMessage/SMS (additional og:image group) */}
        {imessageCandidates.map((c, idx) => (
          <Fragment key={`og-image-im-group-${idx}`}>
            <meta property="og:image" content={c.url} />
            <meta property="og:image:width" content={String(c.width)} />
            <meta property="og:image:height" content={String(c.height)} />
            <meta property="og:image:type" content={c.type} />
            <meta property="og:image:secure_url" content={c.url} />
          </Fragment>
        ))}
        {/* OG Logo */}
        <meta property="og:logo" content={`${baseUrl}/favicon.svg`} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Google Analytics */}
        <Script
          id="ga-load"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-1006GRWNV2"
        />
        <Script id="ga-config" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1006GRWNV2');
          `}
        </Script>
        <Suspense fallback={null}>
          <GATracker />
        </Suspense>
        <main>{children}</main>
        <footer className="container mx-auto mt-12 text-center border-t border-black pt-4">
          <div className="mb-1">
            <span
              className="font-display font-black text-lg inline-block"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgb(209, 17, 73), rgb(241, 113, 5), rgb(255, 186, 8), rgb(177, 207, 95), rgb(144, 224, 243), rgb(123, 137, 239))',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'rgb(209, 17, 73)',
                lineHeight: '1.25rem',
              }}
            >
              VOTOGRAPHER
            </span>
          </div>
          <p className="font-medium text-black font-sans">
            © {new Date().getFullYear()} VOTOGRAPHER | REBECCA GENACK
          </p>
        </footer>
      </body>
    </html>
  );
}

import GATracker from '@/components/ga-tracker';
import './globals.css';

