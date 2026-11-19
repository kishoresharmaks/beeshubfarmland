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
- **01-01-PLAN.md:** Data Model, Backend API Endpoints & Admin Blog Management Tab (Wave 1)
- **01-02-PLAN.md:** Public Blog Hub (`/blog`), Article Reader (`/blog/[slug]`), Product Integration & SEO Metadata (Wave 2)
