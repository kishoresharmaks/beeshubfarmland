# Goldfish Review Report - Initial Zoom Out

**Target:** `e:\PROJECT WORKS\Clients\beeshub\docs\designs\customer_razorpay_integration.md` (Lines 1-376)  
**Standard:** `zoom-out-standard.md`  
**Deliverable:** `zoom_out_report.md`

## Reviewer Status

| Reviewer | Status |
| --- | --- |
| `egm-zoom-out` | completed |

---

## Prioritized Findings (Blockers -> Major -> Nits)

### 1. MongoDB TTL Index on Orders Collection Risks Permanent Deletion of Paid Orders - Severity: Blocker
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** Lines 145, 253, 259, 287
* **Discrepancy Description**: The design specifies adding a 24-hour TTL index to `models/Order.ts` (`paymentExpiresAt: { type: Date, index: { expires: '24h' } }`) and setting `paymentExpiresAt = now + 24h` at order creation. However, neither the client verification route (`/api/orders/razorpay/verify`) nor the webhook reconciliation handler (`/api/webhooks/razorpay`) removes or unsets `paymentExpiresAt` (`$unset`) upon successful payment. Consequently, MongoDB's background TTL thread will permanently delete legitimate, paid customer orders and invoices 24 hours after creation. More fundamentally, using database-level TTL eviction on a core financial/audit collection (`Order`) is an operational hazard; ecommerce orders must be retained permanently for accounting, GST compliance, and dispute resolution.
* **Rationale & Recommendation**: Remove the TTL index completely from `models/Order.ts`. Orders are legal, financial, and tax records that should never be automatically purged by the database engine. Track checkout abandonment using `paymentStatus: 'Pending'` or an explicit state transition (e.g., status updated to `'Abandoned'` after an expiration window), and query accordingly. If purging abandoned pending checkouts is ever needed, do it via an explicit administrative cleanup script with safety checks, never via a native TTL index on the primary `Order` collection.

---

### 2. Repurposing `enableUPI` in `models/Settings.ts` is an Unclean Semantic Workaround - Severity: Major
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** Lines 228-230 (`Rollout & Backward Compatibility`)
* **Discrepancy Description**: The design specifies: *"The `models/Settings.ts` configuration toggle `enableUPI` will be preserved and repurposed to control Razorpay online payments, ensuring existing admin dashboard toggles function without database migration."* Razorpay supports UPI, Debit/Credit Cards, Net Banking, and Wallets. Naming the gateway master toggle `enableUPI` is a misleading misnomer that introduces confusing semantic debt across the codebase and admin UI. Since `Settings` is a single singleton document in MongoDB (`key: 'global'`), no large-scale database migration is needed.
* **Rationale & Recommendation**: In accordance with Zoom Out Standard Section 3 ("Workarounds vs. Structural Fixes"), apply a clean structural fix: add `enableOnlinePayment` or `enableRazorpay` to `models/Settings.ts` with a fallback getter (`enableOnlinePayment ?? enableUPI ?? true`).

---

### 3. Missing Administrative Scope for Promised `inventoryConflict` Resolution - Severity: Major
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** Lines 29, 58, 249-340 (`Detailed Implementation Plan`)
* **Discrepancy Description**: CUJ 3 and Goals establish that simultaneous checkout stock depletion will flag `inventoryConflict: true` and trigger an alert in the admin dashboard for merchant review. However, Section 6 (`Detailed Implementation Plan`) specifies zero modifications to the admin dashboard, admin API endpoints, or order listing views. Without admin surfacing, conflict orders will remain silently stranded in MongoDB with paid status but no stock deducted and no notification to staff.
* **Rationale & Recommendation**: Define clear system boundaries. Either include the admin dashboard views/routes in Target Files to show the `inventoryConflict` flag/filter, or clarify how store managers are notified when a conflict occurs.

---

### 4. Non-Atomic Cross-Collection State Transitions Without MongoDB Transactions - Severity: Major
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** Lines 104-106, 113-118, 168-181, 271-278
* **Discrepancy Description**: Fulfillment acquires an atomic lock by setting `inventoryDeducted: true` on the `Order` document, then independently decrements `Product` stock and syncs `Party`. If the server crashes or an exception is thrown after the `Order` lock is updated but before product decrements finish, subsequent webhook runs will see `inventoryDeducted: true` and no-op. The database remains permanently desynchronized with paid orders missing inventory deductions.
* **Rationale & Recommendation**: Use a multi-document MongoDB transaction (`session.withTransaction`) in `fulfillOrderAtomically` encompassing the Order status transition, Product stock updates, and Party synchronization, ensuring all-or-nothing execution.

---

### 5. Bespoke Razorpay HTTP Client Instead of Standard Official SDK - Severity: Nit
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** Lines 261-267 (`lib/razorpay.ts`)
* **Discrepancy Description**: The design specifies writing custom `fetch` wrappers with Basic Auth and manual crypto HMAC calculations in `lib/razorpay.ts`. The official, maintained `razorpay` npm package already handles authenticated order creation and official signature verification helpers (`validatePaymentVerification`, `validateWebhookSignature`).
* **Rationale & Recommendation**: Follow Zoom Out Standard Section 4 ("Platform Standards"). Leverage the official `razorpay` SDK unless there is an explicit runtime constraint (e.g. Edge runtime), which should be documented.

---

### 6. Fragmented Inventory Decrement Logic Across COD and Razorpay - Severity: Nit
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** Lines 269-278 (`lib/inventory.ts`) and Lines 311-318 (`app/api/orders/route.ts`)
* **Discrepancy Description**: `lib/inventory.ts` is introduced as a shared inventory service, but `app/api/orders/route.ts` retains separate, duplicate stock decrement logic for Cash on Delivery orders.
* **Rationale & Recommendation**: Reuse `lib/inventory.ts` in `app/api/orders/route.ts` for COD orders to maintain a single authoritative inventory mutation pathway across the application.

---

### 7. Premature Implementation Snippets in Architecture Overview (Altitude Control) - Severity: Nit
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** Lines 150-162, 168-181
* **Discrepancy Description**: Low-level Mongoose query code snippets (`Product.updateOne`, `Order.findOneAndUpdate`) are placed in the high-level architecture section rather than keeping the overview focused on component boundaries and data flows.
* **Rationale & Recommendation**: Adhere to Altitude Control (Zoom Out Standard Section 3). Keep Section 2 focused on interfaces and sequence diagrams, deferring specific query syntax to Section 6.
