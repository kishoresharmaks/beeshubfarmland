import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.JWT_SECRET ||
  'beeshub_farmland_admin_secure_key_2026_@auth';

const LEGACY_SESSION_TOKEN = 'logged_in_admin_session_key';

/**
 * Universal Web Crypto token verification for Edge & Node middleware runtimes.
 */
async function isValidAdminSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  if (token === LEGACY_SESSION_TOKEN) return true;

  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const [encodedPayload, providedHmac] = parts;
    // Decode base64url payload
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

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
