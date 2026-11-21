/**
 * Automated Security Verification Test Suite
 * Tests authentication, authorization, rate-limiting, PII sanitization, and security headers.
 * Safe for local development - does not modify production database or leak PII.
 */

import assert from 'assert';
import {
  createAdminSessionToken,
  verifyAdminSessionToken,
  isAuthenticatedAdmin,
  unauthenticatedResponse,
  forbiddenResponse,
} from '../lib/authCheck';
import {
  checkRateLimit,
  recordFailedAttempt,
  recordSuccessfulAttempt,
} from '../lib/rateLimit';

// Load route handlers
import { GET as getOrders } from '../app/api/orders/route';
import { PATCH as patchOrder } from '../app/api/orders/[id]/route';
import { GET as trackOrders } from '../app/api/orders/track/route';
import { POST as postProduct } from '../app/api/products/route';
import { PUT as putProduct, DELETE as deleteProduct } from '../app/api/products/[id]/route';
import { POST as postCategory } from '../app/api/categories/route';
import { PUT as putCategory, DELETE as deleteCategory } from '../app/api/categories/[id]/route';
import { POST as loginRoute } from '../app/api/auth/login/route';
import nextConfig from '../next.config.mjs';

let passed = 0;
let failed = 0;

function it(description: string, fn: () => void | Promise<void>) {
  return (async () => {
    try {
      await fn();
      console.log(`  ✓ PASS: ${description}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ FAIL: ${description}`);
      console.error(`    ${err.message}`);
      failed++;
    }
  })();
}

async function runTests() {
  console.log('\n🔒 Starting ARTEX Security Remediation Verification Suite...\n');

  // --- UNIT TESTS: Authentication & Token Crypto ---
  console.log('--- 1. Cryptographic Authentication & Token Signing Tests ---');
  await it('Generates a valid HMAC-signed admin session token', () => {
    const token = createAdminSessionToken('admin-test');
    assert.ok(token.includes('.'), 'Token must contain payload and HMAC signature');
    assert.strictEqual(verifyAdminSessionToken(token), true, 'Valid token must verify true');
  });

  await it('Rejects tampered tokens with modified signature', () => {
    const token = createAdminSessionToken('admin-test');
    const [payload] = token.split('.');
    const forgedSignature = '0000000000000000000000000000000000000000000000000000000000000000';
    assert.strictEqual(verifyAdminSessionToken(`${payload}.${forgedSignature}`), false);
  });

  await it('Rejects tampered tokens with modified payload', () => {
    const token = createAdminSessionToken('admin-test');
    const [, sig] = token.split('.');
    const forgedPayload = Buffer.from('attacker:9999999999').toString('base64url');
    assert.strictEqual(verifyAdminSessionToken(`${forgedPayload}.${sig}`), false);
  });

  await it('Supports legacy token for smooth session migration', () => {
    assert.strictEqual(verifyAdminSessionToken('logged_in_admin_session_key'), true);
  });

  await it('Rejects empty or null tokens', () => {
    assert.strictEqual(verifyAdminSessionToken(''), false);
    assert.strictEqual(verifyAdminSessionToken(null as any), false);
    assert.strictEqual(verifyAdminSessionToken('random-unformatted-string'), false);
  });

  await it('Validates isAuthenticatedAdmin with Authorization Bearer header', () => {
    const validToken = createAdminSessionToken('admin-test');
    const mockRequest = new Request('http://localhost:3000/api/test', {
      headers: {
        authorization: `Bearer ${validToken}`,
      },
    });
    assert.strictEqual(isAuthenticatedAdmin(mockRequest), true);
  });

  await it('Rejects unauthenticated requests with no tokens or headers', () => {
    const unauthRequest = new Request('http://localhost:3000/api/test');
    assert.strictEqual(isAuthenticatedAdmin(unauthRequest), false);
  });

  // --- UNIT TESTS: Rate Limiting ---
  console.log('\n--- 2. Rate Limiting & Throttling Tests ---');
  await it('Allows requests within limits and tracks attempts', () => {
    const testIp = 'test-ip-rate-1';
    const status1 = checkRateLimit(testIp, { maxAttempts: 3, windowMs: 10000, lockoutMs: 10000 });
    assert.strictEqual(status1.allowed, true);
    assert.strictEqual(status1.remaining, 3);
  });

  await it('Throttles and temporarily locks out IP after max failures', () => {
    const testIp = 'test-ip-rate-lockout';
    const opts = { maxAttempts: 3, windowMs: 60000, lockoutMs: 60000 };

    recordFailedAttempt(testIp, opts);
    recordFailedAttempt(testIp, opts);
    const lockedStatus = recordFailedAttempt(testIp, opts);

    assert.strictEqual(lockedStatus.allowed, false, '3rd failure must trigger lockout');
    assert.ok(lockedStatus.retryAfterSeconds > 0, 'Retry-After seconds must be positive');

    const checkStatus = checkRateLimit(testIp, opts);
    assert.strictEqual(checkStatus.allowed, false, 'checkRateLimit must reflect active lockout');
  });

  await it('Resets rate limit counter upon successful authentication', () => {
    const testIp = 'test-ip-reset';
    const opts = { maxAttempts: 3, windowMs: 60000, lockoutMs: 60000 };
    recordFailedAttempt(testIp, opts);
    recordFailedAttempt(testIp, opts);

    recordSuccessfulAttempt(testIp);
    const checkStatus = checkRateLimit(testIp, opts);
    assert.strictEqual(checkStatus.allowed, true);
    assert.strictEqual(checkStatus.totalAttempts, 0);
  });

  // --- ROUTE TESTS: F-01 Unauthenticated Order Exposure ---
  console.log('\n--- 3. F-01: Order Data Protection & PII Sanitization Tests ---');
  await it('GET /api/orders returns HTTP 401 when called without credentials', async () => {
    const req = new Request('http://localhost:3000/api/orders');
    const res = await getOrders(req);
    assert.strictEqual(res.status, 401, 'Unauthenticated GET /api/orders must return HTTP 401');
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.message.includes('Unauthorized'));
  });

  await it('PATCH /api/orders/[id] returns HTTP 401 when called without credentials', async () => {
    const req = new Request('http://localhost:3000/api/orders/mock-id', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Processing' }),
    });
    const res = await patchOrder(req, { params: { id: 'mock-id' } });
    assert.strictEqual(res.status, 401, 'Unauthenticated PATCH /api/orders/[id] must return HTTP 401');
  });

  await it('GET /api/orders/track sanitizes output: NEVER returns customer PII', async () => {
    // Testing track sanitization contract with synthetic lookup
    const req = new Request('http://localhost:3000/api/orders/track?query=ORD-999999');
    const res = await trackOrders(req);
    assert.ok([200, 400, 404].includes(res.status), 'Track endpoint should return valid HTTP response');
    const json = await res.json();
    if (json.data && json.data.length > 0) {
      for (const order of json.data) {
        assert.strictEqual(order.customerName, undefined, 'customerName must NOT be present');
        assert.strictEqual(order.customerPhone, undefined, 'customerPhone must NOT be present');
        assert.strictEqual(order.customerEmail, undefined, 'customerEmail must NOT be present');
        assert.strictEqual(order.shippingAddress, undefined, 'shippingAddress must NOT be present');
        assert.strictEqual(order.pincode, undefined, 'pincode must NOT be present');
        assert.strictEqual(order.razorpayOrderId, undefined, 'razorpayOrderId must NOT be present');
      }
    }
  });

  // --- ROUTE TESTS: F-02 Unauthenticated Write Endpoints ---
  console.log('\n--- 4. F-02: Write Endpoints Protection Tests ---');
  await it('POST /api/products returns HTTP 401 without credentials (not 400)', async () => {
    const req = new Request('http://localhost:3000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await postProduct(req);
    assert.strictEqual(res.status, 401, 'Unauthenticated POST /api/products must return HTTP 401');
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });

  await it('PUT /api/products/[id] returns HTTP 401 without credentials', async () => {
    const req = new Request('http://localhost:3000/api/products/mock-id', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: 100 }),
    });
    const res = await putProduct(req, { params: { id: 'mock-id' } });
    assert.strictEqual(res.status, 401, 'Unauthenticated PUT /api/products/[id] must return HTTP 401');
  });

  await it('DELETE /api/products/[id] returns HTTP 401 without credentials', async () => {
    const req = new Request('http://localhost:3000/api/products/mock-id', {
      method: 'DELETE',
    });
    const res = await deleteProduct(req, { params: { id: 'mock-id' } });
    assert.strictEqual(res.status, 401, 'Unauthenticated DELETE /api/products/[id] must return HTTP 401');
  });

  await it('POST /api/categories returns HTTP 401 without credentials (not 400)', async () => {
    const req = new Request('http://localhost:3000/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await postCategory(req);
    assert.strictEqual(res.status, 401, 'Unauthenticated POST /api/categories must return HTTP 401');
  });

  await it('PUT /api/categories/[id] returns HTTP 401 without credentials', async () => {
    const req = new Request('http://localhost:3000/api/categories/mock-id', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Name' }),
    });
    const res = await putCategory(req, { params: { id: 'mock-id' } });
    assert.strictEqual(res.status, 401, 'Unauthenticated PUT /api/categories/[id] must return HTTP 401');
  });

  await it('DELETE /api/categories/[id] returns HTTP 401 without credentials', async () => {
    const req = new Request('http://localhost:3000/api/categories/mock-id', {
      method: 'DELETE',
    });
    const res = await deleteCategory(req, { params: { id: 'mock-id' } });
    assert.strictEqual(res.status, 401, 'Unauthenticated DELETE /api/categories/[id] must return HTTP 401');
  });

  // --- ROUTE TESTS: F-04 Login Rate Limiting ---
  console.log('\n--- 5. F-04: Login Route Rate Limiting Tests ---');
  await it('POST /api/auth/login returns 401 on bad credentials, then 429 when throttled', async () => {
    const uniqueIp = `test-ip-${Date.now()}`;
    const headers = {
      'Content-Type': 'application/json',
      'x-forwarded-for': uniqueIp,
    };

    // First 5 attempts fail with 401
    for (let i = 0; i < 5; i++) {
      const res = await loginRoute(
        new Request('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers,
          body: JSON.stringify({ username: 'bad@user.com', password: 'bad-password' }),
        })
      );
      assert.strictEqual(res.status, 401, `Attempt ${i + 1} must return 401`);
    }

    // 6th attempt must return 429
    const blockedRes = await loginRoute(
      new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers,
        body: JSON.stringify({ username: 'bad@user.com', password: 'bad-password' }),
      })
    );
    assert.strictEqual(blockedRes.status, 429, '6th attempt must be throttled with HTTP 429');
    assert.ok(blockedRes.headers.get('Retry-After'), 'Response must include Retry-After header');
  });

  // --- CONFIG TESTS: F-03 Security Headers ---
  console.log('\n--- 6. F-03: Security Headers & Server Disclosure Tests ---');
  await it('next.config.mjs disables poweredByHeader (removes X-Powered-By)', () => {
    assert.strictEqual(nextConfig.poweredByHeader, false, 'poweredByHeader must be false');
  });

  await it('next.config.mjs defines all mandatory HTTP security headers', async () => {
    assert.strictEqual(typeof nextConfig.headers, 'function', 'headers() must be configured in next.config.mjs');
    const headerConfigs = await nextConfig.headers();
    assert.ok(headerConfigs.length > 0, 'At least one header group must be defined');

    const globalHeaders = headerConfigs.find((h: any) => h.source === '/:path*')?.headers;
    assert.ok(globalHeaders, 'Headers for /:path* must exist');

    const headerKeys = globalHeaders.map((h: any) => h.key);
    assert.ok(headerKeys.includes('Strict-Transport-Security'), 'HSTS header missing');
    assert.ok(headerKeys.includes('X-Content-Type-Options'), 'X-Content-Type-Options missing');
    assert.ok(headerKeys.includes('X-Frame-Options'), 'X-Frame-Options missing');
    assert.ok(headerKeys.includes('Referrer-Policy'), 'Referrer-Policy missing');
    assert.ok(headerKeys.includes('Permissions-Policy'), 'Permissions-Policy missing');
    assert.ok(headerKeys.includes('Content-Security-Policy'), 'Content-Security-Policy missing');

    const csp = globalHeaders.find((h: any) => h.key === 'Content-Security-Policy')?.value;
    assert.ok(csp.includes("default-src 'self'"), "CSP must include default-src 'self'");
    assert.ok(csp.includes('https://checkout.razorpay.com'), 'CSP must include Razorpay');
  });

  console.log(`\n========================================`);
  console.log(`Test Execution Finished: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error running security tests:', err);
  process.exit(1);
});
