import { NextResponse } from 'next/server';
import { captureServerEvent, captureServerException } from '@/lib/posthog-server';
import { createAdminSessionToken } from '@/lib/authCheck';
import {
  checkRateLimit,
  recordFailedAttempt,
  recordSuccessfulAttempt,
  getClientIp,
} from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateLimitKey = `login:${clientIp}`;

    // 1. Check rate limit
    const limitStatus = checkRateLimit(rateLimitKey, {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000,
      lockoutMs: 15 * 60 * 1000,
    });

    if (!limitStatus.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many failed login attempts. Please try again in ${limitStatus.retryAfterSeconds} seconds.`,
          retryAfter: limitStatus.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(limitStatus.retryAfterSeconds),
          },
        }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { username, password } = body;

    if (!username || !password) {
      recordFailedAttempt(rateLimitKey);
      return NextResponse.json(
        { success: false, message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const ADMIN_USER = process.env.ADMIN_USERNAME || 'ntvigneswaran@gmail.com';
    const ADMIN_PASS = process.env.ADMIN_PASSWORD || '957878443V@';

    // Verify credentials
    const isUsernameMatch = username.trim().toLowerCase() === ADMIN_USER.trim().toLowerCase();
    const isPasswordMatch = password === ADMIN_PASS;

    if (isUsernameMatch && isPasswordMatch) {
      // Clear rate limiting counter upon valid authentication
      recordSuccessfulAttempt(rateLimitKey);

      const sessionToken = createAdminSessionToken(ADMIN_USER);

      const response = NextResponse.json(
        {
          success: true,
          message: 'Authentication successful',
          token: sessionToken,
        },
        { status: 200 }
      );

      // Set hardened cookie for session
      response.cookies.set('admin_token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
      });

      await captureServerEvent(
        request,
        'admin_logged_in',
        {
          authentication_method: 'password',
        },
        'admin-session'
      );

      return response;
    }

    // Record failure & apply progressive throttling
    const failedStatus = recordFailedAttempt(rateLimitKey, {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000,
      lockoutMs: 15 * 60 * 1000,
    });

    // Add progressive delay (e.g. 500ms - 1500ms) to thwart automated brute-force scripts
    await new Promise((resolve) => setTimeout(resolve, Math.min(1500, failedStatus.totalAttempts * 300)));

    if (!failedStatus.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many failed login attempts. Account temporarily throttled for ${failedStatus.retryAfterSeconds} seconds.`,
          retryAfter: failedStatus.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(failedStatus.retryAfterSeconds),
          },
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Invalid username or password',
        attemptsRemaining: failedStatus.remaining,
      },
      { status: 401 }
    );
  } catch (error: any) {
    await captureServerException(request, error, 'admin-session');
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
