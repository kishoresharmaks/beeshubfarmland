import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.JWT_SECRET ||
  'beeshub_farmland_admin_secure_key_2026_@auth';

/**
 * Creates a cryptographically signed session token for authenticated administrators.
 */
export function createAdminSessionToken(username = 'admin'): string {
  const timestamp = Date.now();
  const payload = `${username}:${timestamp}`;
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  const encodedPayload = Buffer.from(payload).toString('base64url');
  return `${encodedPayload}.${hmac}`;
}

/**
 * Verifies if a token is a valid signed administrator session token or legacy key.
 */
export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  if (!token || typeof token !== 'string') return false;

  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const [encodedPayload, providedHmac] = parts;
    const payload = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    const expectedHmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');

    // Prevent timing attacks via constant-time comparison
    const providedBuffer = Buffer.from(providedHmac, 'hex');
    const expectedBuffer = Buffer.from(expectedHmac, 'hex');

    if (providedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
      return false;
    }

    const [, tsString] = payload.split(':');
    const createdAt = parseInt(tsString, 10);
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 days token expiration

    if (isNaN(createdAt) || Date.now() - createdAt > maxAgeMs) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Validates if the incoming request belongs to an authenticated administrator.
 * Accepts NextRequest, standard Request, or checks cookie store via next/headers.
 */
export function isAuthenticatedAdmin(req?: NextRequest | Request): boolean {
  let token: string | undefined;

  // 1. Check cookies via Next.js next/headers (works across all App Router route handlers)
  try {
    const cookieStore = cookies();
    token = cookieStore.get('admin_token')?.value;
  } catch {
    // cookies() may throw if called outside request lifecycle
  }

  // 2. Check req.cookies if passed as NextRequest
  if (!token && req && 'cookies' in req && typeof (req as NextRequest).cookies?.get === 'function') {
    token = (req as NextRequest).cookies.get('admin_token')?.value;
  }

  // 3. Check Authorization header or Cookie header from standard Request
  if (!token && req && req.headers) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      token = authHeader.substring(7).trim();
    }

    if (!token) {
      const rawCookie = req.headers.get('cookie');
      if (rawCookie) {
        const match = rawCookie.match(/admin_token=([^;]+)/);
        if (match) {
          token = decodeURIComponent(match[1].trim());
        }
      }
    }
  }

  return verifyAdminSessionToken(token);
}

/**
 * Standard 401 Unauthorized response
 */
export function unauthenticatedResponse(
  message = 'Unauthorized. Administrator credentials or session required.'
) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status: 401 }
  );
}

/**
 * Standard 403 Forbidden response
 */
export function forbiddenResponse(
  message = 'Forbidden. Insufficient administrative privileges.'
) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status: 403 }
  );
}
