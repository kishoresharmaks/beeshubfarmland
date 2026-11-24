# BeesHub Farmland

> Direct-to-Consumer (D2C) & B2B agri-commerce web platform for farm-fresh natural honey, organic produce, and superfoods.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay-0C2340?style=flat-square)](https://razorpay.com/)

---

## Overview

**BeesHub Farmland** is a full-stack e-commerce web application engineered to handle dual-track commercial operations: direct consumer retail (D2C) and high-volume commercial wholesale inquiries (B2B). 

Built with Next.js 14 App Router and MongoDB, the platform delivers high-speed server-rendered catalog pages, atomic checkout workflows with cryptographic payment verification, integrated in-store POS billing, and an automated zero-downtime deployment pipeline.

---

## Key Features

- **Dual-Track Commerce Architecture**: Unified platform supporting retail e-commerce cart/checkout and structured B2B bulk inquiry workflows.
- **Cryptographic Payment Gateway**: Integrated with Razorpay using HMAC-SHA256 signature verification and idempotent webhook reconciliation to guarantee transaction consistency.
- **Atomic Inventory Control**: Concurrency-guarded stock decrements preventing overselling during traffic spikes.
- **POS & Billing Suite**: Administrative counter system for walk-in retail billing, invoice printing, party ledgers, and profit-and-loss calculations.
- **Editorial Publishing Engine**: Integrated markdown blog system with dynamic JSON-LD schema markup, category filters, and product embeds to maximize organic search visibility.
- **Zero-Downtime Deployment**: Automated Blue-Green deployment pipeline with isolated release directories, pre-flight health verification, and cumulative static chunk retention.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router, Server Components & Route Handlers) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Database** | MongoDB with Mongoose ODM |
| **Payments** | Razorpay REST API & Webhooks |
| **Process Supervisor** | PM2 |
| **Reverse Proxy** | Nginx (SSL via Let's Encrypt) |

---

## Architecture

```text
                                Public Traffic (HTTPS)
                                          │
                                          ▼
                               [ Nginx Reverse Proxy ]
                     ┌────────────────────┴────────────────────┐
                     ▼                                         ▼
           Static Asset Handling                     Application Traffic
        (/_next/static/*, /uploads/*)                 (SSR, APIs, Pages)
                     │                                         │
                     ▼                                         ▼
         [ Cumulative Static Cache ]                 [ Dynamic Upstream ]
         shared/static_cache/_next/                (deployment/nginx/upstream.conf)
      (Guarantees zero chunk 404s)                             │
                                              ┌────────────────┴────────────────┐
                                              ▼                                 ▼
                                      [ beeshub-blue ]                  [ beeshub-green ]
                                      (Port 3001)                       (Port 3003)
```

---

## Directory Structure

```text
beeshub/
├── app/                  # Next.js App Router (pages, layouts, and API routes)
│   ├── admin/            # Administrative dashboard, billing & POS counter
│   ├── api/              # REST endpoints (orders, payments, products, blog)
│   ├── blog/             # Editorial publishing engine
│   └── (storefront)      # Customer-facing shopping routes
├── components/           # Reusable UI component library
├── context/              # Global React state management (Cart, StoreContext)
├── deployment/           # Production deployment suite (Blue-Green orchestrator, Nginx, PM2)
├── docs/                 # Production deployment & operations guide
├── lib/                  # Shared utilities (DB connection, Razorpay, inventory engine)
├── models/               # Mongoose data models & schemas
├── public/               # Static assets, branding, and optimized media
└── scripts/              # Database migration and testing utilities
```

---

## Getting Started

### Prerequisites

- Node.js 18.17+ or 20+
- MongoDB instance (local or MongoDB Atlas)
- Razorpay API credentials (for payment processing)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kishoresharmaks/beeshubfarmland.git
   cd beeshubfarmland
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your MongoDB connection string, Razorpay API keys, and administrative secrets in `.env.local`.

4. **Run development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Create a production build:**
   ```bash
   npm run build
   ```

---

## Production Deployment

This project includes an automated **Blue-Green Zero-Downtime Deployment Pipeline** located in `deployment/`:

```bash
# Execute isolated release build, health check, and atomic traffic switch
./deploy.sh
```

- Builds are compiled into standalone, timestamped release directories (`releases/release-<timestamp>`).
- Live traffic switches via Nginx upstream reload only after automated pre-flight health checks pass (`/api/health` returns HTTP 200).
- Instant rollback (< 2 seconds) is available via `./deployment/rollback.sh`.

See [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for full deployment documentation.

---

## License

This project is proprietary software developed for BeesHub Farmland Pvt Ltd. All rights reserved.
