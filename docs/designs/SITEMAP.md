# Design Documents Sitemap

| Document | Date | Author | Components | Status | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [Customer Razorpay Payment Gateway Integration](./customer_razorpay_integration.md) | 2026-11-15 | kishoresharmaks | `app/page.tsx`, `models/Order.ts`, `models/Settings.ts`, `lib/razorpay.ts`, `lib/inventory.ts`, `app/api/orders/*`, `app/api/webhooks/*` | Approved | Automated Razorpay Standard Checkout migration with webhook reconciliation, multi-document atomic transactions, and stock conflict badges. |
| [Dual-Track B2C/B2B Hero & Wholesale Lead System](./dual_track_b2b_b2c_hero.md) | 2026-11-19 | kishoresharmaks | `app/page.tsx`, `components/wholesale/WholesaleEnquiryModal.tsx`, `models/WholesaleLead.ts`, `models/Settings.ts`, `app/api/wholesale/*`, `app/api/admin/wholesale/*`, `app/admin/dashboard/*` | In Review | Re-architect storefront hero for dual consumer retail and B2B wholesale acquisition with dynamic FSSAI/GST credentials, interactive quotation modal, and admin CRM lead triage tab. |
