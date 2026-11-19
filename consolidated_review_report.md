# Goldfish Review Protocol: Synthesized Review Report

**Target Document:** `docs/designs/dual_track_b2b_b2c_hero.md` (Lines 1–321)  
**Feature Range:** Lines 1–259  
**Detailed Range:** Lines 260–321  
**Execution Stages Completed:** Stages 5, 6, 7, 8, 9  

---

## Reviewer Status

| Reviewer / Lens | Assigned Stages | Status | Findings Contributed |
| :--- | :--- | :--- | :--- |
| `egm-zoom-out` | Stage 5 (Initial) & Stage 8 (Intermediate) | **completed** | 4 |
| `egm-comprehension` | Stage 6 (Comprehension Test) | **completed** | 3 |
| `egm-design` | Stage 7 (Critic Review) | **completed** | 4 |
| `egm-structural` | Stage 7 (Critic Review) | **completed** | 3 |
| `egm-style` | Stage 7 & Stage 9 (Style Review) | **completed** | 3 |
| `egm-codebase-details` | Stage 9 (Implementation Readiness) | **completed** | 6 |
| `egm-implementation-readiness` | Stage 9 (Implementation Readiness) | **completed** | 5 |

*Overall Severity Breakdown:* **3 Blockers (🔴)** | **6 Majors (🟡)** | **5 Nits (🟢)**  
*Total Deduplicated Findings:* **14**

---

## Prioritized Findings (Blockers ➔ Majors ➔ Nits)

### 1. Missing `app/api/settings/route.ts` in Target Files & API Handler Omission - Severity: 🔴 Blocker
* **Reviewer Lens:** `egm-codebase-details`, `egm-implementation-readiness`, `egm-zoom-out`
* **Affected Scope:** Lines 199–204, Lines 268–271, Lines 304–308
* **Discrepancy Description:** The technical design modifies `models/Settings.ts` to add `fssaiNumber`, `gstin`, and `enableWholesale`, and plans to expose inputs in the admin dashboard. However, `app/api/settings/route.ts` is omitted from the "Target Files to Create/Modify" list (lines 262–299) and the "Unified Implementation Sequence" (lines 302–321). In the existing codebase, `app/api/settings/route.ts` explicitly destructures only `{ enableOnlinePayment, enableUPI, enableCOD, spotlight, spotlights }`. Any updates to FSSAI, GSTIN, or wholesale toggles submitted via the admin dashboard will be silently dropped by the API, preventing dynamic statutory badges and wholesale toggles from persisting in MongoDB.
* **Remediation:** Add `app/api/settings/route.ts` as a target file to modify. Update its `POST` handler to parse and persist `fssaiNumber`, `gstin`, and `enableWholesale`, and ensure the `GET` handler returns these fields with fallback defaults.

---

### 2. Unexported Mongoose Model in `models/WholesaleLead.ts` Code Snippet - Severity: 🔴 Blocker
* **Reviewer Lens:** `egm-codebase-details`, `egm-implementation-readiness`
* **Affected Scope:** Lines 128–197, Line 264
* **Discrepancy Description:** Section 2.A defines `WholesaleItemSchema` and `WholesaleLeadSchema`, but completely omits model instantiation and export (`const WholesaleLead: Model<IWholesaleLead> = mongoose.models.WholesaleLead || mongoose.model<IWholesaleLead>('WholesaleLead', WholesaleLeadSchema); export default WholesaleLead;`). Implementing the schema snippet verbatim results in a module with no default export, causing compile-time and runtime failures across all importing API routes (`app/api/wholesale/route.ts` and `app/api/admin/wholesale/route.ts`).
* **Remediation:** Complete the TypeScript code block in Section 2.A with the standard Next.js cached model export pattern used in `models/Order.ts` and `models/Settings.ts`.

---

### 3. Missing Authentication Enforcement on Admin Wholesale API Endpoints (`middleware.ts` Bypass) - Severity: 🔴 Blocker
* **Reviewer Lens:** `egm-structural`, `egm-codebase-details`, `egm-zoom-out`
* **Affected Scope:** Lines 89–96, Lines 211–219, Line 244, Lines 276–282
* **Discrepancy Description:** Section 244 mandates that `/api/admin/wholesale/*` require verified session cookies (`admin_token`). However, `middleware.ts` in the codebase only matches `matcher: ['/admin/:path*']` and does **not** protect `/api/admin/:path*`. Without explicit cookie checks inside `app/api/admin/wholesale/route.ts` and `app/api/admin/wholesale/[id]/route.ts`, wholesale commercial inquiries (including buyer mobile numbers, target prices, and company names) will be completely exposed to unauthenticated public requests.
* **Remediation:** Explicitly document the authentication verification within the route handlers: read `request.cookies.get('admin_token')?.value` and return HTTP 401 Unauthorized if the value does not match `'logged_in_admin_session_key'`, or update `middleware.ts` to include `/api/admin/:path*`.

---

### 4. Fragile Indian Phone Validation Regex Without Pre-Sanitization - Severity: 🟡 Major
* **Reviewer Lens:** `egm-comprehension`, `egm-design`, `egm-implementation-readiness`
* **Affected Scope:** Line 30, Line 209, Line 274
* **Discrepancy Description:** The design specifies strict regex validation `/^[6-9]\d{9}$/`. Indian procurement managers frequently paste or autofill phone numbers containing country codes (`+91`), trunk prefixes (`0`), or whitespace/hyphens (`+91 98765 43210`, `09876543210`). Directly testing raw strings against `/^[6-9]\d{9}$/` will cause legitimate submissions to fail with validation errors.
* **Remediation:** Specify phone number pre-sanitization before validation: strip all non-digit characters (`replace(/\D/g, '')`), remove leading `91` or `0` if length exceeds 10 digits, and then validate against `/^[6-9]\d{9}$/`.

---

### 5. Undefined Storefront State & Component Props Contract for `WholesaleEnquiryModal` - Severity: 🟡 Major
* **Reviewer Lens:** `egm-comprehension`, `egm-implementation-readiness`, `egm-codebase-details`
* **Affected Scope:** Lines 78–84, Lines 284–287, Lines 296–299
* **Discrepancy Description:** The design describes the modal inputs and WhatsApp fallback link, but omits the TypeScript interface and props contract. It is unspecified whether the modal receives `products` from `app/page.tsx` (which already fetches them) or re-fetches `/api/products` independently. In addition, the target WhatsApp number for the buyer's direct quote link (line 83) is unspecified.
* **Remediation:** Define explicit component props: `interface WholesaleEnquiryModalProps { isOpen: boolean; onClose: () => void; products: Product[]; storePhone?: string; }`. Pass existing `products` from `app/page.tsx` to prevent redundant network fetches.

---

### 6. Missing `activeTab` Union Extension & Lead Counter Integration in Admin Dashboard - Severity: 🟡 Major
* **Reviewer Lens:** `egm-codebase-details`, `egm-implementation-readiness`
* **Affected Scope:** Line 116, Lines 292–295, Line 314
* **Discrepancy Description:** In `app/admin/dashboard/page.tsx`, `activeTab` is typed as a strict string union: `'products' | 'categories' | 'orders' | 'banners' | 'settings' | 'pos' | 'subscription'`. Registering `'wholesale'` without extending the union type will cause TypeScript compilation failures during `npm run build`. Furthermore, no data-fetching logic is specified to retrieve the `NEW` lead count for the tab badge counter.
* **Remediation:** Document updating the `activeTab` type union to include `'wholesale'`. Add a state variable `newLeadsCount` and fetch pending inquiries on dashboard mount.

---

### 7. Hero CTA Dynamic Visibility Logic When Wholesale is Disabled - Severity: 🟡 Major
* **Reviewer Lens:** `egm-design`, `egm-zoom-out`
* **Affected Scope:** Line 203, Lines 296–299
* **Discrepancy Description:** The schema introduces `enableWholesale: { type: Boolean, default: true }`, but the storefront hero specification does not define UI behavior when `enableWholesale` is toggled `false`.
* **Remediation:** Specify that `app/page.tsx` checks `settings?.enableWholesale !== false`. When `false`, hide the "Wholesale & B2B Supply" button and render a single centered retail CTA.

---

### 8. Admin Notification Void (No Alerting Mechanism for New Leads) - Severity: 🟡 Major
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** Lines 55–59, Lines 207–210
* **Discrepancy Description:** High-value wholesale leads are stored in MongoDB, but no notification mechanism is triggered. Store managers must manually log into the dashboard to notice new inquiries.
* **Remediation:** Explicitly document the real-time alerting boundary: the buyer is provided an immediate 1-click WhatsApp trigger to notify the owner directly, and automated server-side webhooks/SMS are documented under Future Improvements.

---

### 9. Fragile Hardcoded Pixel Scroll in Retail CTA - Severity: 🟡 Major
* **Reviewer Lens:** `egm-design`, `egm-codebase-details`
* **Affected Scope:** Line 48, Lines 874–878, Line 320
* **Discrepancy Description:** In `app/page.tsx`, the retail button currently calls `window.scrollTo({ top: 550, behavior: 'smooth' })`. Adding statutory compliance badges, dual-track headlines, and dual CTAs will alter the hero section's vertical height across viewports.
* **Remediation:** Replace `window.scrollTo({ top: 550 })` with element anchor scrolling: `document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' })`.

---

### 10. Collection Name Pluralization Typo in Architecture Diagram - Severity: 🟢 Nit
* **Reviewer Lens:** `egm-structural`, `egm-style`
* **Affected Scope:** Line 104 vs Line 128
* **Remediation:** Standardize the collection label to `wholesaleleads` in the architecture diagram.

---

### 11. Multi-Item vs Single-Item Form UX Ambiguity in Modal - Severity: 🟢 Nit
* **Reviewer Lens:** `egm-comprehension`, `egm-design`
* **Affected Scope:** Line 53, Line 81, Line 147
* **Remediation:** Clarify that v1 modal starts with a single product row with an optional "+ Add Another Product" button.

---

### 12. Missing Rate Limiting on Public Submission Endpoint - Severity: 🟢 Nit
* **Reviewer Lens:** `egm-zoom-out`, `egm-implementation-readiness`
* **Affected Scope:** Line 30, Lines 207–210, Line 246
* **Remediation:** Add basic in-memory IP rate limiting (5 submissions per 15 minutes per IP) in `POST /api/wholesale`.

---

### 13. Statutory Badges Fallback Rendering & Formatting - Severity: 🟢 Nit
* **Reviewer Lens:** `egm-design`, `egm-style`
* **Affected Scope:** Line 26, Line 73, Lines 201–202
* **Remediation:** Specify that badges only render if the respective string is non-empty.

---

### 14. Telemetry Property Inconsistency in NFRs - Severity: 🟢 Nit
* **Reviewer Lens:** `egm-style`, `egm-codebase-details`
* **Affected Scope:** Line 255
* **Remediation:** Include `orderType` and `city` in `wholesale_lead_submitted` event properties.
