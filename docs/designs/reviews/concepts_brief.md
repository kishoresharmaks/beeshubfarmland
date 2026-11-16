# Customer Razorpay Payment Gateway Integration

* **Author:** kishoresharmaks
* **Date:** 2026-11-15

## Overview

Replacement of the manual UPI QR code and UTR entry mechanism with automated Razorpay Standard Checkout (`checkout.js`) on the customer storefront. This architecture introduces a two-step order lifecycle, dual-path reconciliation (client callback plus authenticated server webhooks), atomic inventory deduction upon verified payment, and concurrency guards for simultaneous stock exhaustion. Cash on Delivery (COD) remains supported as an independent payment option.

## Analysis

Synthesis of findings across the specialized review lenses:

### 1. Codebase Preconditions & Premature Deduction
The existing implementation in `app/api/orders/route.ts` decrements stock unconditionally upon form submission before any payment occurs. For online payments, inventory must only decrement after cryptographic signature verification. Furthermore, `app/api/orders/route.ts` only updates top-level `Product.quantity` and fails to decrement variant-level stock (`variants.$.quantity` in `models/Product.ts`). Both must be addressed so that variant stock is tracked accurately.

### 2. Dual-Path Verification Race Condition
Payment confirmation occurs through two parallel channels: the frontend client callback (`POST /api/orders/razorpay/verify`) and the asynchronous Razorpay webhook (`POST /api/webhooks/razorpay`). If both requests hit the server simultaneously, an unguarded implementation will execute inventory deduction twice.
* **Resolution**: State updates must be guarded by an atomic filter (`Order.findOneAndUpdate({ _id, paymentStatus: { $ne: 'Paid' }, inventoryDeducted: false }, { $set: { paymentStatus: 'Paid', inventoryDeducted: true } })`). Only the request that modifies the record executes inventory deduction.

### 3. Simultaneous Checkout Oversell Dilemma
If a product has 1 unit remaining, two customers can initiate checkout and open the Razorpay payment window at the same time. Both payments will succeed at the bank. The second verification request will encounter zero remaining inventory.
* **Resolution**: The system marks the second order as `paymentStatus: 'Paid'`, flags it with `inventoryConflict: true`, and alerts the store administrator in the dashboard to either fulfill from incoming stock or issue a manual refund via the Razorpay API.

### 4. Sequential Order ID Collisions Under Concurrency
`app/api/orders/route.ts` currently calculates sequential IDs using `1001 + await Order.countDocuments()`. Concurrent checkout requests or abandoned pending orders will generate colliding `orderId` strings, triggering unique index violations. A monotonic sequencer or collision-free format (`ORD-YYYYMMDD-XXXX`) is required.

### 5. Next.js 14 Webhook Signature Verification Requirements
Webhook authentication computes an HMAC SHA-256 signature over the raw HTTP request body. In Next.js 14 Route Handlers, calling `await request.json()` normalizes whitespace and breaks HMAC signature calculation. The webhook route handler must consume `await request.text()` directly.

### 6. Abandoned Order Retention & Database Growth
Creating a `Payment_Pending` order record before the customer completes payment means that abandoned sessions will accumulate in MongoDB. A MongoDB TTL index on a `paymentExpiresAt` field (e.g. 24 hours) will purge abandoned records automatically without distorting sales analytics.

## Goals vs. Non-Goals

* **In-Scope Goals:**
  * Remove manual UPI VPA display, static QR code generator, and 12-digit UTR input form from `app/page.tsx`.
  * Integrate Razorpay Standard Checkout (`checkout.js`) with non-blocking script loading in `app/page.tsx`.
  * Implement `POST /api/orders/razorpay/create` to validate stock, create a Razorpay order, and persist an initial `Payment_Pending` order in MongoDB.
  * Implement `POST /api/orders/razorpay/verify` to validate HMAC SHA-256 signatures, atomically mark orders as `Paid`, and decrement product and variant inventory.
  * Implement `POST /api/webhooks/razorpay` to listen for `payment.captured` / `order.paid` using `RAZORPAY_WEBHOOK_SECRET` on raw request text for session recovery.
  * Update `models/Order.ts` schema with Razorpay identifiers, `inventoryDeducted`, and `inventoryConflict` flags.
  * Retain Cash on Delivery (COD) as an independent payment mode controlled via `models/Settings.ts`.
* **Out-of-Scope Non-Goals:**
  * Automated programmatic refunds on stock-out (merchant handles refunds or backorders manually via admin dashboard).
  * In-store POS integration (POS continues using counter cash and in-store UPI).
  * Recurring subscriptions or automated debit schedules.
  * Razorpay Custom / White-label UI (Standard modal satisfies requirements).

## Alternatives Weighed

* **Manual Direct UPI + UTR Entry**: Rejected by author. Manual entry causes high customer drop-off rates and creates fraudulent order risks with unverified reference numbers.
* **Pre-Payment Inventory Locking with Timeouts**: Rejected by author. Holding inventory on checkout initiation locks up merchandise during abandoned sessions. Stock is deducted only upon verified payment.
* **Storing Order Payloads Exclusively in Razorpay Notes**: Rejected by author. Razorpay notes are constrained to 15 key-value pairs and 256 characters per value, which truncates multi-item shopping carts and extended delivery addresses.
* **Automated Instant Programmatic Refunds on Stock Exhaustion**: Rejected during ideation. Automated refunds introduce 5-7 business day bank settlement delays for customers; flagging the order for administrative review gives the merchant the option to fulfill from reserve stock or coordinate directly with the buyer.

## Key Decisions & Staging for Next Steps

1. **Credentials Management**: Stored in environment variables (`RAZORPAY_KEY_ID`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`).
2. **Settings Compatibility**: Repurpose `enableUPI` in `models/Settings.ts` to toggle Razorpay online payments on and off from the admin panel without breaking existing configuration schemas.
3. **Execution Staging**:
   - Stage 1: Update `models/Order.ts` schema and sequential ID generation.
   - Stage 2: Create server endpoints (`/api/orders/razorpay/create`, `/api/orders/razorpay/verify`, and `/api/webhooks/razorpay`).
   - Stage 3: Update `app/page.tsx` checkout modal to load Razorpay SDK and replace manual UPI inputs.
   - Stage 4: Admin dashboard alerts for `inventoryConflict` orders.
