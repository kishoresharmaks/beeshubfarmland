/**
 * Comprehensive End-to-End Security Verification Test
 * Runs real HTTP requests against the standalone production build.
 */

import { spawn } from 'child_process';
import http from 'http';

const PORT = 3099;
const BASE_URL = `http://127.0.0.1:${PORT}`;

let passedCount = 0;
let failedCount = 0;

function logPass(msg) {
  console.log(`  ✓ PASS: ${msg}`);
  passedCount++;
}

function logFail(msg, err) {
  console.error(`  ✗ FAIL: ${msg}`);
  if (err) console.error(`    Details: ${err}`);
  failedCount++;
}

async function waitForServer(retries = 30) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/health`).catch(() => null);
      if (res && (res.status === 200 || res.status === 404)) {
        return true;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function runSuite() {
  console.log(`\n======================================================`);
  console.log(`🚀 Launching BeesHub Production Build on Port ${PORT}...`);
  console.log(`======================================================\n`);

  const serverProc = spawn('node', ['.next/standalone/server.js'], {
    env: {
      ...process.env,
      PORT: String(PORT),
      HOSTNAME: '127.0.0.1',
    },
    stdio: 'pipe',
  });

  serverProc.stderr.on('data', (d) => {
    // console.error(`[Server Err] ${d.toString()}`);
  });

  const ready = await waitForServer();
  if (!ready) {
    console.error('Server failed to start within timeout.');
    serverProc.kill();
    process.exit(1);
  }

  console.log('✓ Server running. Beginning security tests...\n');

  try {
    // -------------------------------------------------------------------------
    // TEST 1: F-03 Security Headers
    // -------------------------------------------------------------------------
    console.log('--- Suite 1: HTTP Security Headers & Disclosure (F-03) ---');
    const headRes = await fetch(`${BASE_URL}/`);
    const headers = headRes.headers;

    const hsts = headers.get('strict-transport-security');
    if (hsts && hsts.includes('max-age=31536000')) {
      logPass(`Strict-Transport-Security header present: "${hsts}"`);
    } else {
      logFail(`Strict-Transport-Security header missing or invalid: ${hsts}`);
    }

    const xcto = headers.get('x-content-type-options');
    if (xcto === 'nosniff') {
      logPass(`X-Content-Type-Options: nosniff`);
    } else {
      logFail(`X-Content-Type-Options missing or invalid: ${xcto}`);
    }

    const xfo = headers.get('x-frame-options');
    if (xfo === 'SAMEORIGIN' || xfo === 'DENY') {
      logPass(`X-Frame-Options: ${xfo}`);
    } else {
      logFail(`X-Frame-Options missing: ${xfo}`);
    }

    const refPol = headers.get('referrer-policy');
    if (refPol === 'strict-origin-when-cross-origin') {
      logPass(`Referrer-Policy: strict-origin-when-cross-origin`);
    } else {
      logFail(`Referrer-Policy missing: ${refPol}`);
    }

    const permPol = headers.get('permissions-policy');
    if (permPol && permPol.includes('camera=()')) {
      logPass(`Permissions-Policy present: "${permPol}"`);
    } else {
      logFail(`Permissions-Policy missing: ${permPol}`);
    }

    const csp = headers.get('content-security-policy');
    if (csp && csp.includes("default-src 'self'")) {
      logPass(`Content-Security-Policy present with default-src 'self'`);
    } else {
      logFail(`Content-Security-Policy missing: ${csp}`);
    }

    const xPoweredBy = headers.get('x-powered-by');
    if (!xPoweredBy) {
      logPass('X-Powered-By header suppressed (Next.js disclosure eliminated)');
    } else {
      logFail(`X-Powered-By still present: ${xPoweredBy}`);
    }

    // -------------------------------------------------------------------------
    // TEST 2: F-01 Unauthenticated Order PII Exposure
    // -------------------------------------------------------------------------
    console.log('\n--- Suite 2: Customer PII & Order Protection (F-01) ---');
    const ordersRes = await fetch(`${BASE_URL}/api/orders`);
    if (ordersRes.status === 401) {
      const ordersData = await ordersRes.json();
      logPass(`GET /api/orders returns HTTP 401 Unauthorized (Message: "${ordersData.message}")`);
    } else {
      logFail(`GET /api/orders did NOT return 401. Status: ${ordersRes.status}`);
    }

    const patchOrderRes = await fetch(`${BASE_URL}/api/orders/66c000000000000000000001`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Completed' }),
    });
    if (patchOrderRes.status === 401) {
      logPass(`PATCH /api/orders/[id] returns HTTP 401 Unauthorized`);
    } else {
      logFail(`PATCH /api/orders/[id] did NOT return 401. Status: ${patchOrderRes.status}`);
    }

    const trackRes = await fetch(`${BASE_URL}/api/orders/track?query=ORD-TEST123456`);
    const trackData = await trackRes.json();
    if (trackData.data) {
      const hasPII = trackData.data.some(
        (o) => o.customerName || o.customerPhone || o.customerEmail || o.shippingAddress || o.pincode
      );
      if (!hasPII) {
        logPass(`GET /api/orders/track output is strictly sanitized: ZERO customer PII returned`);
      } else {
        logFail(`GET /api/orders/track exposed customer PII fields!`);
      }
    } else {
      logPass(`GET /api/orders/track safe response format validated`);
    }

    // -------------------------------------------------------------------------
    // TEST 3: F-02 Unauthenticated Write Endpoints
    // -------------------------------------------------------------------------
    console.log('\n--- Suite 3: Write Endpoints Protection (F-02) ---');

    // POST /api/products
    const postProdRes = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (postProdRes.status === 401) {
      logPass(`POST /api/products returns HTTP 401 Unauthorized (Previously 400 missing fields)`);
    } else {
      logFail(`POST /api/products returned ${postProdRes.status} instead of 401`);
    }

    // PUT /api/products/[id]
    const putProdRes = await fetch(`${BASE_URL}/api/products/66c000000000000000000001`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: 100 }),
    });
    if (putProdRes.status === 401) {
      logPass(`PUT /api/products/[id] returns HTTP 401 Unauthorized`);
    } else {
      logFail(`PUT /api/products/[id] returned ${putProdRes.status} instead of 401`);
    }

    // DELETE /api/products/[id]
    const delProdRes = await fetch(`${BASE_URL}/api/products/66c000000000000000000001`, {
      method: 'DELETE',
    });
    if (delProdRes.status === 401) {
      logPass(`DELETE /api/products/[id] returns HTTP 401 Unauthorized`);
    } else {
      logFail(`DELETE /api/products/[id] returned ${delProdRes.status} instead of 401`);
    }

    // POST /api/categories
    const postCatRes = await fetch(`${BASE_URL}/api/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (postCatRes.status === 401) {
      logPass(`POST /api/categories returns HTTP 401 Unauthorized (Previously 400 missing name)`);
    } else {
      logFail(`POST /api/categories returned ${postCatRes.status} instead of 401`);
    }

    // PUT /api/categories/[id]
    const putCatRes = await fetch(`${BASE_URL}/api/categories/66c000000000000000000001`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Hacked' }),
    });
    if (putCatRes.status === 401) {
      logPass(`PUT /api/categories/[id] returns HTTP 401 Unauthorized`);
    } else {
      logFail(`PUT /api/categories/[id] returned ${putCatRes.status} instead of 401`);
    }

    // DELETE /api/categories/[id]
    const delCatRes = await fetch(`${BASE_URL}/api/categories/66c000000000000000000001`, {
      method: 'DELETE',
    });
    if (delCatRes.status === 401) {
      logPass(`DELETE /api/categories/[id] returns HTTP 401 Unauthorized`);
    } else {
      logFail(`DELETE /api/categories/[id] returned ${delCatRes.status} instead of 401`);
    }

    // POST /api/settings
    const postSetRes = await fetch(`${BASE_URL}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enableOnlinePayment: false }),
    });
    if (postSetRes.status === 401) {
      logPass(`POST /api/settings returns HTTP 401 Unauthorized`);
    } else {
      logFail(`POST /api/settings returned ${postSetRes.status} instead of 401`);
    }

    // -------------------------------------------------------------------------
    // TEST 4: F-04 Login Rate Limiting & Throttling
    // -------------------------------------------------------------------------
    console.log('\n--- Suite 4: Login Endpoint Rate Limiting & Throttling (F-04) ---');
    const testIp = `198.51.100.${Math.floor(Math.random() * 200 + 1)}`;
    const loginHeaders = {
      'Content-Type': 'application/json',
      'x-forwarded-for': testIp,
    };

    let saw401Count = 0;
    for (let attempt = 1; attempt <= 5; attempt++) {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: loginHeaders,
        body: JSON.stringify({ username: 'attacker@evil.com', password: `guess-${attempt}` }),
      });
      if (res.status === 401) saw401Count++;
    }

    if (saw401Count === 5) {
      logPass(`5 consecutive failed login attempts returned HTTP 401 with attempt tracking`);
    } else {
      logFail(`Expected 5 HTTP 401s, got ${saw401Count}`);
    }

    // 6th attempt from same IP must be throttled with HTTP 429
    const blockedRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: loginHeaders,
      body: JSON.stringify({ username: 'attacker@evil.com', password: 'guess-6' }),
    });
    const retryAfter = blockedRes.headers.get('retry-after');
    if (blockedRes.status === 429 && retryAfter) {
      const data = await blockedRes.json();
      logPass(`6th attempt blocked with HTTP 429 Too Many Requests (Retry-After: ${retryAfter}s, Message: "${data.message}")`);
    } else {
      logFail(`6th attempt was not throttled. Status: ${blockedRes.status}, Retry-After: ${retryAfter}`);
    }

    // -------------------------------------------------------------------------
    // TEST 5: Legitimate Administrator Operations Verification
    // -------------------------------------------------------------------------
    console.log('\n--- Suite 5: Authorized Administrator Operation Verification ---');
    const legitIp = `203.0.113.${Math.floor(Math.random() * 200 + 1)}`;
    const adminUser = process.env.ADMIN_USERNAME || 'ntvigneswaran@gmail.com';
    const adminPass = process.env.ADMIN_PASSWORD || '957878443V@';

    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': legitIp,
      },
      body: JSON.stringify({ username: adminUser, password: adminPass }),
    });

    if (loginRes.status === 200) {
      const loginData = await loginRes.json();
      const setCookie = loginRes.headers.get('set-cookie');
      logPass(`Administrator login successful (HTTP 200)`);
      logPass(`Signed cryptographic session token issued: "${loginData.token?.substring(0, 25)}..."`);

      // Extract cookie
      let cookieHeader = '';
      if (setCookie) {
        const match = setCookie.match(/admin_token=([^;]+)/);
        if (match) cookieHeader = `admin_token=${match[1]}`;
      }

      // Verify authorized access to GET /api/orders
      const authedOrdersRes = await fetch(`${BASE_URL}/api/orders`, {
        headers: {
          Cookie: cookieHeader,
          Authorization: `Bearer ${loginData.token}`,
        },
      });

      if (authedOrdersRes.status === 200) {
        const authedOrdersData = await authedOrdersRes.json();
        logPass(`Authorized admin can access GET /api/orders (HTTP 200, Count: ${authedOrdersData.count ?? 0})`);
      } else {
        logFail(`Authorized admin request to GET /api/orders failed with status ${authedOrdersRes.status}`);
      }

      // Verify authorized access to GET /api/auth/session
      const sessionRes = await fetch(`${BASE_URL}/api/auth/session`, {
        headers: {
          Cookie: cookieHeader,
        },
      });
      const sessionData = await sessionRes.json();
      if (sessionRes.status === 200 && sessionData.authenticated === true) {
        logPass(`GET /api/auth/session correctly validates active administrator session`);
      } else {
        logFail(`GET /api/auth/session failed to validate active session: ${JSON.stringify(sessionData)}`);
      }
    } else {
      logFail(`Legitimate admin login failed with status ${loginRes.status}`);
    }

  } finally {
    console.log('\nStopping test server...');
    serverProc.kill('SIGINT');
  }

  console.log(`\n======================================================`);
  console.log(`Test Execution Summary: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log(`======================================================\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
