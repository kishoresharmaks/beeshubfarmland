# BeesHub Farmland - Product Roadmap

## Milestone 1: Organic Growth, Content Marketing & SEO Engine

### Phase 01: Blog Content & Organic Storytelling System

**Goal:** Empower BeesHub Farmland with an editorial publishing engine to publish farm stories, beekeeping guides, raw honey health benefits, and organic spice recipes. Drives organic search traffic, establishes authority, and directly links articles to retail and wholesale products for high-converting sales.

#### Requirements

- [x] **REQ-BLOG-01:** Mongoose schema `BlogPost` supporting titles, slugs, categories, tags, excerpts, rich markdown content, cover images, published status, SEO metadata, and related product IDs.
- [x] **REQ-BLOG-02:** Public REST endpoints (`GET /api/blog` and `GET /api/blog/[slug]`) with pagination, category filtering, and search.
- [x] **REQ-BLOG-03:** Authenticated Admin REST endpoints (`GET /api/admin/blog`, `POST /api/admin/blog`, `PATCH /api/admin/blog/[id]`, `DELETE /api/admin/blog/[id]`) with cookie security verification.
- [x] **REQ-BLOG-04:** Admin Dashboard Blog Manager tab (`app/admin/dashboard/components/BlogTab.tsx`) with draft/published controls, image compressor, product linking selector, and live preview.
- [x] **REQ-BLOG-05:** Public Blog Hub page (`app/blog/page.tsx`) with featured article hero, category filter pills, search bar, and responsive article card grid.
- [x] **REQ-BLOG-06:** Public Article Reader page (`app/blog/[slug]/page.tsx`) with typography prose layout, social sharing, embedded "Featured Farm Products" carousel/grid, and related articles.
- [x] **REQ-BLOG-07:** Dynamic OpenGraph metadata, Twitter Cards, and Article JSON-LD structured data schema for search engine indexability and AI search citability (GEO).
- [x] **REQ-BLOG-08:** Storefront navigation links (Header and Footer) directing visitors to `/blog`.

#### Execution Plans

- **01-01-PLAN.md:** Data Model, Backend API Endpoints & Admin Blog Management Tab (Wave 1 - Completed)
- **01-02-PLAN.md:** Public Blog Hub (`/blog`), Article Reader (`/blog/[slug]`), Product Integration & SEO Metadata (Wave 2 - Completed)

### Phase 02: B2B Landing Page & Storefront V2 Theme Overhaul

**Goal:** Transform the monolithic BeesHub Farmland storefront into a high-performance, modular B2B lead-generation landing page and modern retail e-commerce client UI based on the `UI.md` specification and decoupled `backend.md` client operations contract.

#### Requirements

- [x] **REQ-THEME-01:** Design token architecture in `tailwind.config.ts` and `app/globals.css` with exact measured palette from `UI.md` (`--color-primary`, `--color-cta`, `--color-accent`, etc.) and typography.
- [x] **REQ-THEME-02:** Headless client state engine (`context/StoreContext.tsx`) decoupling Cart, Checkout (COD & Razorpay), Catalog/Filtering, Order Tracking, and Wholesale Lead submissions from UI presentation.
- [x] **REQ-THEME-03:** Navigation & Top Utility Bar (Sections A & B) with logo, navigation links, single-column dropdown (~10 items), pill CTA, sticky header, and responsive mobile drawer.
- [x] **REQ-THEME-04:** Hero Section & Badge Strip (Sections C & D) with 3 auto-rotating slides (pause control, responsive crops), 6 certification badges, eyebrow H1, large H2 with emphasized accent phrase, 4 animated stats, and primary CTA.
- [x] **REQ-THEME-05:** Showcase Mosaic, Logo Wall & Problem Persona Cards (Sections E, F, G) featuring a 10-tile bento grid with hover zoom, 10-client logo marquee, and 3 persona cards with question bullets and concern markers.
- [x] **REQ-THEME-06:** Benefits, Services Zig-Zag & About Collage (Sections H, I, J) featuring 7 icon cards (4+3 centered), 4 checkerboard alternating image/text blocks with CTA strip, and 5-image collage with capability bullets.
- [x] **REQ-THEME-07:** Why Choose Us, Process Stepper, Not-A-Fit & Feature Block (Sections K, L, M, N) featuring 6 icon cards, 5-step numbered process stepper (connecting line on desktop, vertical timeline on mobile), 3 disqualifier bullets in a calm tinted box, and 2x2 sub-items feature block.
- [x] **REQ-THEME-08:** FAQ Accordion & Comprehensive Footer (Sections O & P) featuring 8 accessible animated accordion rows, 4-5 column footer with social links, legal FSSAI/GST badges, 2 factory/office addresses, and copyright bar.
- [x] **REQ-THEME-09:** Conversion & Engagement Actions (Sections Q & R) featuring floating Call and WhatsApp buttons, mobile sticky paired 2-button CTA bar, and accessible Quote Request Modal with honeypot spam protection, focus trap, and loading state integrated with `/api/wholesale`.
- [x] **REQ-THEME-10:** E-Commerce Storefront Bridge integrating live catalog (`/api/products`), product quickview modal, cart drawer (with live GST/subtotal math), dual-branch checkout (COD & Razorpay), and Admin Panel Theme Switching (`v1` / `v2`) into `app/page.tsx`.

#### Execution Plans

- [x] **02-01-PLAN.md:** Design System Foundation, Token Configuration & Headless Client State Engine (Wave 1 - Completed)
- [x] **02-02-PLAN.md:** B2B Landing Page Sections A-R Component Suite (Wave 2 - Completed)
- [x] **02-03-PLAN.md:** Storefront Integration, Cart/Checkout Bridge & Verification (Wave 3 - Completed)
