'use server';

import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Enforce HTTPS and canonical host in production only
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) return NextResponse.next();

  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || url.host || '';
  const protoHeader = (request.headers.get('x-forwarded-proto') || '').toLowerCase();
  const proto = protoHeader || (url.protocol?.replace(':', '') || '');

  // Redirect http -> https (only if clearly non-https)
  if (proto && proto !== 'https') {
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  // Canonicalize www only for our domain to avoid breaking previews
  const isOurDomain = /(^|\.)votographer\.com$/i.test(host);
  if (isOurDomain && host.startsWith('www.')) {
    url.host = host.replace(/^www\./i, 'votographer.com');
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};


