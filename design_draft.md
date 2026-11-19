# Dual-Track B2C/B2B Hero & Wholesale Lead System

*   **Author:** kishoresharmaks
*   **Status:** In Review
*   **Date:** 2026-11-19

--------------------------------------------------------------------------------

## Overview

This technical design specifies the architecture and implementation for transforming the BeesHub Farmland storefront hero section into a dual-audience gateway. The system simultaneously serves direct-to-consumer (D2C) retail shoppers purchasing packaged artisan goods and commercial (B2B) wholesale procurement buyers seeking bulk quantities (single-origin raw honey, spices, and organic harvest).

The solution introduces verified statutory badges (FSSAI License and GSTIN) managed dynamically via the Admin Settings, distinct consumer and commercial call-to-action buttons, an interactive wholesale inquiry modal capturing procurement volume and target price, MongoDB persistence via a dedicated collection (`WholesaleLead`), and a triage dashboard tab in the administrative console.

## The Problem

BeesHub Farmland's current web storefront is strictly framed around consumer retail transactions. The hero section solely features direct-delivery consumer copy and two retail-focused buttons (`Shop Fresh Products` and `Track My Order`).

This causes two major operational and commercial bottlenecks:
1. **Lost Commercial Revenue:** High-margin B2B buyers (hotels, restaurants, bakeries, FMCG brands, and retail re-distributors) visiting the site see only individual jar pricing and consumer checkout, falsely assuming the company cannot handle commercial quantities (50 kg to multi-ton lots).
2. **Missing Wholesale Lead Pipeline:** There is no mechanism to capture, validate, and track commercial quotation requests. Inquiries sent via informal contact channels are easily lost, and there is no admin tracking of wholesale conversion rates.

## Goals

*   **Unified Dual-Track Hero:** Re-architect the storefront hero section in `app/page.tsx` with a dual-audience visual hierarchy that keeps retail shopping seamless while exposing a dedicated wholesale procurement channel.
*   **Statutory Compliance Badging:** Display verified FSSAI License and GSTIN registration badges in the hero, rendered dynamically from the platform settings.
*   **Structured B2B Lead Capture:** Provide an interactive modal (`WholesaleEnquiryModal`) capturing buyer business details, contact information, selected products, quantity, unit, and target price per unit.
*   **Zero Impact on Retail Checkout:** Keep wholesale inquiries strictly as non-binding quotation requests that do not interact with retail inventory counts, cart states, or Razorpay payment gateways.
*   **Administrative Lead Pipeline:** Provide a dedicated "Wholesale Leads" tab in `app/admin/dashboard/page.tsx` backed by secure REST APIs (`/api/admin/wholesale`) supporting status progression (`NEW`, `CONTACTED`, `QUOTED`, `CONVERTED`, `REJECTED`) and direct WhatsApp quotation follow-up.
*   **Anti-Spam & Validation:** Secure the public quotation intake endpoint with a silent honeypot field, phone number validation (`/^[6-9]\d{9}$/`), and input sanitization.

## Non-Goals

*   **Automated Wholesale Checkout:** No self-serve online payment processing or credit card checkout for bulk orders. Wholesale contracts are invoiced and fulfilled off-platform.
*   **Inventory Locking:** Wholesale inquiries will not decrement or hold consumer e-commerce stock.
*   **Automated Freight Calculation:** No real-time integration with palletized logistics or freight carrier APIs in this release.
*   **Separate Wholesale User Authentication:** No customer accounts, passwords, or login portals for wholesale buyers.

## Open Questions

*   None currently identified; all primary architectural boundaries (inventory decoupling, dynamic settings storage, and modal form intake) were resolved during ideation.

## Critical User Journeys (CUJs)

### CUJ 1: Retail Shopper Browsing & Ordering
*   **Given**: A retail household consumer lands on the homepage on mobile or desktop.
*   **When**: The user reads the hero copy and clicks the primary button **"Shop Retail Products"**.
*   **Then**: The page smoothly scrolls down past the hero to the dynamic category filter and product catalog grid, preserving the standard e-commerce purchase flow.

### CUJ 2: Commercial Buyer Requesting Bulk Quotation
*   **Given**: A procurement manager from a hotel chain or food brand visits the homepage seeking 100 kg of raw honey.
*   **When**: The user observes the verified FSSAI and GSTIN badges and clicks the high-contrast button **"Wholesale & B2B Supply"**.
*   **Then**: The `WholesaleEnquiryModal` opens. The user inputs company name, contact details, selects "Raw Forest Honey", specifies "100 KG", enters a target unit price, and submits. A confirmation dialog appears with a direct WhatsApp follow-up link, and the lead is persisted in MongoDB.

### CUJ 3: Store Administrator Triaging Wholesale Inquiries
*   **Given**: The store owner logs into `app/admin/dashboard/page.tsx`.
*   **When**: The owner navigates to the new **"Wholesale Leads"** tab.
*   **Then**: All submitted inquiries are visible in a table sorted by most recent. The owner can inspect line items, click a single button to initiate a pre-filled WhatsApp quote message to the buyer's phone number, add internal notes, and advance the status from `NEW` to `CONTACTED` or `QUOTED`.

--------------------------------------------------------------------------------

## Technical Plan (Architecture)

### 1. System Architecture Diagram

```
+------------------------------------------------------------------------------------+
|                                STOREFRONT (Client)                                 |
|                                                                                    |
|   +----------------------------------------------------------------------------+   |
|   |                    Dual-Track Hero Section (`app/page.tsx`)                |   |
|   |  - Headline: Farm-Pure for Home • Bulk Supply for Business                 |   |
|   |  - Badges: Verified FSSAI License & GSTIN Compliance                       |   |
|   |  - Dual CTAs: [Shop Retail (Scroll)]  |  [Wholesale & B2B Supply (Modal)]  |   |
|   +----------------------------------------------------------------------------+   |
|                                          |                                         |
|                                          v (opens)                                 |
|   +----------------------------------------------------------------------------+   |
|   |           Wholesale Enquiry Modal (`WholesaleEnquiryModal.tsx`)            |   |
|   |  - Company Name, Contact Person, 10-Digit Mobile, Email, City, Pincode     |   |
|   |  - Line Items: Product Picker, Quantity, Unit (KG/L/Cases), Target Price   |   |
|   |  - Silent Honeypot (`website_url`) Anti-Bot Check                          |   |
|   |  - Instant Confirmation & WhatsApp Direct Quote Fallback Link              |   |
|   +----------------------------------------------------------------------------+   |
+------------------------------------------|-----------------------------------------+
                                           | HTTP POST
                                           v
+------------------------------------------------------------------------------------+
|                             BACKEND API LAYER (Next.js)                            |
|                                                                                    |
|  +-------------------------------+         +------------------------------------+  |
|  |  Public: /api/wholesale       |         |  Admin: /api/admin/wholesale       |  |
|  |  - Validates phone regex      |         |  - Requires `admin_token` cookie   |  |
|  |  - Discards bot honeypots     |         |  - GET: Paginated list & filters   |  |
|  |  - Persists new WholesaleLead |         |  - PATCH: Status & quote update    |  |
|  +-------------------------------+         +------------------------------------+  |
+------------------------------------------|-----------------------------------------+
                                           |
                                           v
+------------------------------------------------------------------------------------+
|                               DATABASE (MongoDB Atlas)                             |
|                                                                                    |
|  +--------------------------------+       +-------------------------------------+  |
|  | `wholesalesleads` Collection   |       | `settings` Collection               |  |
|  | - Company, Contact, Items      |       | - `fssaiNumber` (String)            |  |
|  | - Status: NEW/CONTACTED/QUOTED |       | - `gstin` (String)                  |  |
|  +--------------------------------+       +-------------------------------------+  |
+------------------------------------------|-----------------------------------------+
                                           |
                                           v
+------------------------------------------------------------------------------------+
|                         ADMIN CONSOLE (`app/admin/dashboard`)                      |
|                                                                                    |
|  +------------------------------------------------------------------------------+  |
|  |  Tab: "Wholesale Leads" (`WholesaleLeadsTab.tsx`)                            |  |
|  |  - Lead Counter Badge for `NEW` inquiries                                    |  |
|  |  - Search by Company, Phone, Contact Person                                  |  |
|  |  - 1-Click WhatsApp Quick Quote Trigger (`https://wa.me/...`)                |  |
|  |  - Status Dropdown (`NEW`, `CONTACTED`, `QUOTED`, `CONVERTED`, `REJECTED`)   |  |
|  |  - Admin Notes & Quoted Value Recording Drawer                               |  |
|  +------------------------------------------------------------------------------+  |
+------------------------------------------------------------------------------------+
```

### 2. Data Models & Schemas

#### A. `models/WholesaleLead.ts`
```typescript
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWholesaleItem {
  productId?: string;
  productName: string;
  quantity: number;
  unit: 'KG' | 'LITRE' | 'CASES' | 'PIECES';
  targetPrice?: number;
}

export interface IWholesaleLead extends Document {
  companyName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  gstin?: string;
  city: string;
  pincode: string;
  items: IWholesaleItem[];
  orderType: 'ONE_TIME' | 'MONTHLY_RECURRING' | 'CONTRACT_FARMING';
  notes?: string;
  status: 'NEW' | 'CONTACTED' | 'QUOTED' | 'CONVERTED' | 'REJECTED';
  adminNotes?: string;
  quotedAmount?: number;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WholesaleItemSchema = new Schema({
  productId: { type: String },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, enum: ['KG', 'LITRE', 'CASES', 'PIECES'], default: 'KG' },
  targetPrice: { type: Number },
});

const WholesaleLeadSchema = new Schema(
  {
    companyName: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    gstin: { type: String, trim: true, uppercase: true },
    city: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    items: { type: [WholesaleItemSchema], required: true },
    orderType: {
      type: String,
      enum: ['ONE_TIME', 'MONTHLY_RECURRING', 'CONTRACT_FARMING'],
      default: 'ONE_TIME',
    },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ['NEW', 'CONTACTED', 'QUOTED', 'CONVERTED', 'REJECTED'],
      default: 'NEW',
      index: true,
    },
    adminNotes: { type: String, default: '' },
    quotedAmount: { type: Number },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

WholesaleLeadSchema.index({ createdAt: -1 });
WholesaleLeadSchema.index({ phone: 1 });
```

#### B. `models/Settings.ts` (Modifications)
Add the following fields to the existing Mongoose schema:
* `fssaiNumber`: `{ type: String, default: '22424000000000' }`
* `gstin`: `{ type: String, default: '33AAAAA0000A1Z5' }`
* `enableWholesale`: `{ type: Boolean, default: true }`

### 3. API Route Contracts

*   **`POST /api/wholesale` (Public)**
    *   *Payload:* `{ companyName, contactPerson, phone, email, gstin, city, pincode, items, orderType, notes, website_url }`
    *   *Validation:* Phone regex `/^[6-9]\d{9}$/`. If `website_url` is non-empty, silently respond with success (bot honeypot discard).
    *   *Response:* `{ success: true, message: "Enquiry submitted successfully", id: "<mongo_id>" }`
*   **`GET /api/admin/wholesale` (Authenticated)**
    *   *Query:* `?status=NEW&page=1&limit=20&search=keyword`
    *   *Response:* `{ success: true, data: WholesaleLead[], total: number, page: number }`
*   **`PATCH /api/admin/wholesale/[id]` (Authenticated)**
    *   *Payload:* `{ status?: string, adminNotes?: string, quotedAmount?: number }`
    *   *Response:* `{ success: true, data: WholesaleLead }`
*   **`DELETE /api/admin/wholesale/[id]` (Authenticated)**
    *   *Response:* `{ success: true, message: "Lead removed" }`

--------------------------------------------------------------------------------

## Alternatives Considered

### Alternative A: Segmented Tab-Switched Hero
*   **Pros**: Complete visual separation between retail and wholesale imagery and headlines.
*   **Cons**: Conceals retail products when wholesale mode is active; adds unnecessary interaction friction for casual consumers who represent the bulk of day-to-day web traffic.
*   **Reason for Rejection**: *Rejected by author: dual-track layout delivers simultaneous discovery for both audiences without hiding retail items.*

### Alternative B: Direct WhatsApp-Only Floating Link without Database Storage
*   **Pros**: Zero backend development, zero database schema additions.
*   **Cons**: Leads are completely unrecorded; no central tracking, no audit trail for wholesale conversion rates, and no shared visibility across sales personnel.
*   **Reason for Rejection**: *Rejected by author: centralized lead persistence in MongoDB and administrative visibility are non-negotiable requirements.*

### Alternative C: Integrated B2B Pricing & Checkout within Retail Cart
*   **Pros**: Allows wholesale buyers to pay immediately via credit card or bank transfer on-site.
*   **Cons**: Bulk orders require custom freight estimates, formal tax invoices, and batch availability checks. Standard e-commerce payment gateways charge high transaction fees on multi-lakh rupee B2B invoices.
*   **Reason for Rejection**: *Rejected by author: bulk wholesale transactions must remain quotation-based.*

--------------------------------------------------------------------------------

## Non-Functional Requirements

### Security & Privacy
*   Admin endpoints (`/api/admin/wholesale/*`) require verified session cookies (`admin_token`).
*   Client phone numbers and commercial target prices are shielded from unauthorized public access.
*   Spam protection via a silent honeypot field prevents automated form submission.

### Performance & Latency
*   `WholesaleEnquiryModal` will be dynamically loaded via `next/dynamic` or rendered lazily on button click to prevent impacting initial Core Web Vitals (LCP, FID).
*   Indexed queries on `status` and `createdAt` in `WholesaleLead` guarantee fast dashboard pagination even with thousands of records.

### Telemetry & Analytics
*   PostHog events:
    *   `wholesale_modal_opened`: Triggered on clicking "Wholesale & B2B Supply".
    *   `wholesale_lead_submitted`: Triggered on successful inquiry submission with product count and volume attributes.
    *   `wholesale_whatsapp_click`: Triggered on clicking the WhatsApp fallback button.

--------------------------------------------------------------------------------

## Detailed Implementation Plan

### Target Files to Create/Modify

#### 1. `models/WholesaleLead.ts` (Create)
*   **Type / Scope**: Mongoose Database Schema
*   **Rationale**: Defines the document schema and TypeScript interfaces for persisted wholesale quotation requests.

#### 2. `models/Settings.ts` (Modify)
*   **Type / Scope**: Mongoose Database Schema
*   **Rationale**: Extends the application settings model to store configurable `fssaiNumber`, `gstin`, and `enableWholesale` fields.

#### 3. `app/api/wholesale/route.ts` (Create)
*   **Type / Scope**: Public Next.js API Route (App Router)
*   **Rationale**: Ingests wholesale lead submissions, validates phone and data fields, executes honeypot spam protection, and saves to MongoDB.

#### 4. `app/api/admin/wholesale/route.ts` (Create)
*   **Type / Scope**: Authenticated Next.js API Route
*   **Rationale**: Provides paginated list retrieval, search, and status filtering for admin users.

#### 5. `app/api/admin/wholesale/[id]/route.ts` (Create)
*   **Type / Scope**: Authenticated Next.js API Route
*   **Rationale**: Handles status updates (`NEW` -> `CONTACTED` -> `QUOTED`), internal notes, and quotation amounts.

#### 6. `components/wholesale/WholesaleEnquiryModal.tsx` (Create)
*   **Type / Scope**: Client React Component
*   **Rationale**: Renders the responsive modal dialog for commercial buyers, providing product selection, quantity steppers, unit pickers, target price inputs, and direct WhatsApp quotation fallback.

#### 7. `app/admin/dashboard/components/WholesaleLeadsTab.tsx` (Create)
*   **Type / Scope**: Client React Component
*   **Rationale**: Renders the admin triage dashboard for wholesale inquiries with search, status filtering, click-to-WhatsApp link generation, and notes management.

#### 8. `app/admin/dashboard/page.tsx` (Modify)
*   **Type / Scope**: Client React Page
*   **Rationale**: Registers `'wholesale'` in `activeTab` state, displays the navigation tab with a dynamic badge counter for `NEW` leads, and embeds `WholesaleLeadsTab`. Also adds FSSAI and GST fields to the Settings tab.

#### 9. `app/page.tsx` (Modify)
*   **Type / Scope**: Client React Page
*   **Rationale**: Re-architects the hero section: incorporates dual-audience copy, verified statutory compliance chips (FSSAI License & GSTIN), primary retail CTA (scroll), secondary wholesale CTA (modal trigger), and mounts `WholesaleEnquiryModal`.

--------------------------------------------------------------------------------

## Unified Implementation Sequence

1.  **Backend Foundation**:
    *   Create `models/WholesaleLead.ts`.
    *   Update `models/Settings.ts` with `fssaiNumber` and `gstin`.
    *   Create `app/api/wholesale/route.ts` and test with mock payload.
    *   Create `app/api/admin/wholesale/route.ts` and `app/api/admin/wholesale/[id]/route.ts`.
2.  **Storefront Components**:
    *   Create `components/wholesale/WholesaleEnquiryModal.tsx`.
    *   Update `app/page.tsx` hero section with dual-track CTAs, compliance badges, and modal wiring.
3.  **Admin Dashboard Integration**:
    *   Create `app/admin/dashboard/components/WholesaleLeadsTab.tsx`.
    *   Integrate tab and badge counter into `app/admin/dashboard/page.tsx`.
    *   Add FSSAI and GST input fields into the admin Settings view.
4.  **Verification**:
    *   Verify submission of a wholesale inquiry from the storefront.
    *   Confirm presence and detail display in the admin "Wholesale Leads" tab.
    *   Verify status updates and WhatsApp deep-link generation.
    *   Verify smooth scroll on retail button click.
    *   Run build check (`npm run build`).
