import Script from 'next/script';
import { Suspense } from 'react';
import './globals.css';

export const metadata = {
  title: 'VOTOGRAPHER',
  description: 'Compare and rank your photos',
  generator: 'v0.dev',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'VOTOGRAPHER',
    description: 'Find your best photos, easily and enjoyably',
    url: 'https://photocompare-qfb161gpp-rsgenacks-projects.vercel.app',
    siteName: 'VOTOGRAPHER',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VOTOGRAPHER Final Rankings',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VOTOGRAPHER',
    description: 'Find your best photos, easily and enjoyably',
    images: ['/og-image.png'],
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
