'use server';

import { NextResponse } from 'next/server';

export function middleware(req: Request) {
  // Enforce HTTPS and canonical host in production only
  // Works on Vercel and most proxies via x-forwarded-proto
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const url = req.nextUrl.clone();
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) return NextResponse.next();

  const proto = (req.headers.get('x-forwarded-proto') || '').toLowerCase();
  const hostHeader = req.headers.get('host') || url.host;

  // Redirect http -> https
  if (proto && proto !== 'https') {
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  // Canonicalize www to apex domain
  if (hostHeader && hostHeader.startsWith('www.')) {
    url.host = hostHeader.replace(/^www\./, 'votographer.com');
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};


