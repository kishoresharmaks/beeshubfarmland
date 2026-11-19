# Dual-Track B2C/B2B Hero & Wholesale Lead System

* **Author:** kishoresharmaks
* **Date:** 2026-11-19

## Overview

Redesign the storefront hero section of BeesHub Farmland to support both direct retail shopping for household consumers and bulk supply for commercial B2B buyers. The hero incorporates official FSSAI and GST compliance badges (dynamically configurable via the Admin Settings), dual distinct call-to-actions, and an interactive wholesale enquiry modal. Submitted inquiries persist in a dedicated MongoDB collection (`WholesaleLead`) and surface directly in a new Administrative Dashboard tab for quotation and lead triage.

## Analysis & Critical Findings Across Review Lenses

### 1. Architectural Separation (Zoom-Out Lens)
* **Inventory Decoupling:** Wholesale inquiries function strictly as quote and sample requests. They do not interact with or decrement retail e-commerce inventory in `Product.ts`. Fulfillment is handled via separate procurement and billing.
* **Lead SLA & Fallback:** B2B lead value degrades quickly. In addition to MongoDB storage, a direct WhatsApp click-to-chat fallback allows procurement managers to start an immediate conversation.
* **Spam & Abuse Protection:** The public quote endpoint includes basic bot mitigations: a honeypot field (`website_url`), Indian mobile number validation (`/^[6-9]\d{9}$/`), and input sanitization.

### 2. Codebase Ergonomics & Modularity (Codebase Lens)
* **Component Extraction:** `app/page.tsx` and `app/admin/dashboard/page.tsx` remain lean. All new functionality resides in dedicated modular components:
  * `components/wholesale/WholesaleEnquiryModal.tsx` for the multi-field inquiry flow.
  * `app/admin/dashboard/components/WholesaleLeadsTab.tsx` for the admin review table.
* **Dynamic Credentials in Settings:** FSSAI License Number and GSTIN are added to `models/Settings.ts` so they can be edited directly in the Admin Dashboard Settings tab without requiring code redeployments.
* **Security & Auth:** The admin lead endpoint (`/api/admin/wholesale`) verifies the existing admin session token to protect commercial buyer lists and pricing discussions.

### 3. UX, Layout & Visual Ergonomics (Design Lens)
* **Dual-Track CTA Hierarchy:**
  * Primary Accent (`#ED3500`): *"Shop Retail Products"* (scrolls smoothly to the product grid).
  * High-Contrast Navy Outline (`#163B5C`): *"Wholesale & B2B Supply"* with badge *"Bulk Rates"* (opens the modal).
* **Statutory Compliance Row:**
  * FSSAI License badge with license number and food safety verification indicator.
  * GSTIN badge indicating registered corporate entity with B2B input tax credit availability.
* **Mobile Viewport Discipline:** On mobile screens, CTAs stack vertically without pushing the initial banner below the fold.

### 4. Data Contract & Admin Lifecycle (Comprehension & Readiness Lenses)
* **Lead Schema Fields:** Company name, contact person, phone (10-digit), optional email, optional GSTIN, city, pincode, line items array (`productName`, `quantity`, `unit`, `targetPrice`), order type, notes, and status.
* **Lead Lifecycle Statuses:** `NEW` -> `CONTACTED` -> `QUOTED` -> `CONVERTED` -> `REJECTED`.

## Goals vs. Non-Goals

* **In-Scope Goals:**
  * Refactor storefront hero section in `app/page.tsx` with dual retail/wholesale actions and verified FSSAI and GST badges.
  * Add configurable `fssaiNumber` and `gstin` fields to `models/Settings.ts` and the Admin Settings UI.
  * Create `components/wholesale/WholesaleEnquiryModal.tsx` with product selection, quantity, target price/budget, and contact details.
  * Implement Mongoose model `models/WholesaleLead.ts` and public submission endpoint `POST /api/wholesale`.
  * Implement secure admin endpoints `GET /api/admin/wholesale` and `PATCH /api/admin/wholesale/[id]`.
  * Add a dedicated "Wholesale Leads" tab in `app/admin/dashboard/page.tsx` with lead status updating and WhatsApp follow-up actions.

* **Out-of-Scope Non-Goals:**
  * Automated payment processing or self-serve checkout for bulk wholesale orders.
  * Real-time automated freight calculation or automated carrier API dispatch.
  * Complex multi-tier B2B pricing portals with separate wholesale user logins.

## Alternatives Weighed

* **Segmented Interactive Hero Switcher (Tabs inside Hero):**
  * *Reason for Rejection:* Hiding retail actions when wholesale is active introduces unnecessary friction for consumer buyers. A dual-action CTA bar serves both audiences without hidden states.
* **Direct WhatsApp-Only Link without Database Storage:**
  * *Reason for Rejection:* Fails the requirement to store inquiries centrally in the database and surface them in the admin dashboard.
* **Hardcoded Credentials in UI:**
  * *Reason for Rejection:* FSSAI numbers and GSTINs may renew or vary by operating entity; managing them in the admin settings avoids code changes.

## Key Decisions & Staging for Next Steps

* **Database Model:** `models/WholesaleLead.ts` with indexed timestamps and phone numbers.
* **Configurable Settings:** Extend `Settings.ts` to include `fssaiNumber` and `gstin`.
* **Modular Code Structure:** Self-contained modal in `components/wholesale/WholesaleEnquiryModal.tsx` and admin tab in `app/admin/dashboard/components/WholesaleLeadsTab.tsx`.
* **Telemetry:** PostHog tracking on modal open, lead submission, and WhatsApp fallback actions.
