/**
 * In-memory sliding-window rate limiter for sensitive authentication & API endpoints.
 * Thread-safe for single-node Node.js runtime with automatic memory cleanup.
 */

interface RateLimitEntry {
  attempts: number;
  firstAttemptAt: number;
  lastAttemptAt: number;
  lockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 10 minutes to avoid memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.lockedUntil && entry.lockedUntil < now) {
        rateLimitStore.delete(key);
      } else if (!entry.lockedUntil && now - entry.lastAttemptAt > 60 * 60 * 1000) {
        rateLimitStore.delete(key);
      }
    }
  }, 10 * 60 * 1000).unref?.();
}

export interface RateLimitOptions {
  windowMs?: number; // Time window in ms (default 15 minutes)
  maxAttempts?: number; // Max failures before lockout (default 5)
  lockoutMs?: number; // Lockout duration in ms (default 15 minutes)
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  totalAttempts: number;
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 mins
  const maxAttempts = options.maxAttempts || 5;
  const lockoutMs = options.lockoutMs || 15 * 60 * 1000; // 15 mins
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  if (!entry) {
    return {
      allowed: true,
      remaining: maxAttempts,
      retryAfterSeconds: 0,
      totalAttempts: 0,
    };
  }

  // Check if actively locked out
  if (entry.lockedUntil && entry.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((entry.lockedUntil - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
      totalAttempts: entry.attempts,
    };
  }

  // If window expired, reset entry
  if (now - entry.firstAttemptAt > windowMs) {
    rateLimitStore.delete(key);
    return {
      allowed: true,
      remaining: maxAttempts,
      retryAfterSeconds: 0,
      totalAttempts: 0,
    };
  }

  // Check if max attempts reached
  if (entry.attempts >= maxAttempts) {
    entry.lockedUntil = now + lockoutMs;
    const retryAfterSeconds = Math.ceil(lockoutMs / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
      totalAttempts: entry.attempts,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, maxAttempts - entry.attempts),
    retryAfterSeconds: 0,
    totalAttempts: entry.attempts,
  };
}

export function recordFailedAttempt(
  key: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const windowMs = options.windowMs || 15 * 60 * 1000;
  const maxAttempts = options.maxAttempts || 5;
  const lockoutMs = options.lockoutMs || 15 * 60 * 1000;
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  if (!entry || now - entry.firstAttemptAt > windowMs) {
    entry = {
      attempts: 1,
      firstAttemptAt: now,
      lastAttemptAt: now,
    };
  } else {
    entry.attempts += 1;
    entry.lastAttemptAt = now;
  }

  if (entry.attempts > maxAttempts) {
    entry.lockedUntil = now + lockoutMs;
  }

  rateLimitStore.set(key, entry);

  const isLocked = !!(entry.lockedUntil && entry.lockedUntil > now);
  const retryAfterSeconds = isLocked ? Math.ceil((entry.lockedUntil! - now) / 1000) : 0;

  return {
    allowed: !isLocked,
    remaining: Math.max(0, maxAttempts - entry.attempts),
    retryAfterSeconds,
    totalAttempts: entry.attempts,
  };
}

export function recordSuccessfulAttempt(key: string): void {
  rateLimitStore.delete(key);
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}
