# BeesHub Farmland - Project Context & Architecture

## Overview
BeesHub Farmland is an e-commerce and wholesale platform built with Next.js 14 App Router, React, Tailwind CSS, Lucide Icons, and MongoDB Atlas (Mongoose). It provides both direct-to-consumer (D2C) retail shopping and commercial wholesale (B2B) quotation requests for single-origin raw honey, organic spices, and farm harvest directly from Kanyakumari farmlands.

## Core Capabilities
- **Storefront E-Commerce:** Dynamic product listing, category filters, product details, interactive variant selection, search, and spotlight carousels.
- **Customer Checkout:** Razorpay online payment integration, manual UPI QR verification, Cash on Delivery (COD), order tracking, and inventory concurrency guards.
- **Dual-Track Hero & B2B Wholesale:** Dual-track storefront hero with verified FSSAI License and GSTIN compliance badges, interactive wholesale quotation modal, and admin CRM lead triage tab.
- **Admin Management Console (`/admin/dashboard`):** Real-time product inventory, categories, order fulfillment, banner showcase manager, platform settings, wholesale lead management, and POS counter with software licensing.

## Tech Stack
- **Framework:** Next.js 14.2 (App Router, Server & Client Components)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, PostCSS
- **Database:** MongoDB Atlas via Mongoose 8.5 (`lib/db.ts`)
- **Icons:** Lucide React
- **Analytics & Telemetry:** PostHog (`posthog-js`)
