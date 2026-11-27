import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.JWT_SECRET ||
  'beeshub_farmland_admin_secure_key_2026_@auth';

/**
 * Universal Web Crypto token verification for Edge & Node middleware runtimes.
 */
async function isValidAdminSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;

  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const [encodedPayload, providedHmac] = parts;
    const binaryStr = atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    const [, tsString] = binaryStr.split(':');
    const createdAt = parseInt(tsString, 10);
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000;

    if (isNaN(createdAt) || Date.now() - createdAt > maxAgeMs) {
      return false;
    }

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(SESSION_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const sigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(binaryStr));
    const expectedHmac = Array.from(new Uint8Array(sigBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return providedHmac === expectedHmac;
  } catch {
    return false;
  }
}

function buildCspHeader(): string {
  const isDev = process.env.NODE_ENV !== 'production';
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    ...(isDev ? ["'unsafe-eval'"] : []),
    'https://checkout.razorpay.com',
    'https://utt.impactcdn.com',
    'https://*.posthog.com',
  ].join(' ');

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com https://checkout.razorpay.com https://*.posthog.com https://*.i.posthog.com https://utt.impactcdn.com",
    "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminToken = request.cookies.get('admin_token')?.value;

    const isAuthed = await isValidAdminSession(adminToken);
    if (!isAuthed) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const cspHeader = buildCspHeader();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico|images/|uploads/|robots.txt|sitemap.xml|llms.txt|llms-full.txt).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
