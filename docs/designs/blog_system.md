# Editorial Blog & Organic Content Marketing Engine

*   **Author:** kishoresharmaks
*   **Status:** Proposed
*   **Date:** 2026-11-19

--------------------------------------------------------------------------------

## Overview

This technical design specifies the architecture and implementation of an editorial publishing engine ("The Farmland Journal") for BeesHub Farmland. The blog system establishes domain authority, drives organic SEO traffic, and educates customers on raw honey, apiculture, organic spices, and farm-to-table practices. Crucially, articles directly showcase and link related store products, bridging content consumption with e-commerce and wholesale purchasing.

## The Problem

Currently, BeesHub Farmland relies exclusively on its product catalog and hero section for customer acquisition. While the catalog lists items, it lacks an educational story-driven layer to answer search queries (e.g., *"What is raw forest honey?"*, *"Health benefits of Cheruthen / Stingless Bee Honey"*, *"Organic turmeric vs regular turmeric"*, or *"Bulk honey wholesale procurement in India"*). Without a blog:
1. The site misses out on high-intent organic search engine traffic and AI search answer citations (Google AI Overviews, Perplexity).
2. Customers lack context on why pristine Western Ghats honey commands a premium over commercial blended supermarket syrups.
3. There is no natural inbound channel to attract commercial B2B buyers looking for farm-direct bulk produce suppliers.

## Goals

*   **Editorial Content Hub (`/blog`):** A modern magazine-style blog index featuring a spotlight story, category filter pills, instant search, and responsive article cards.
*   **Article Reader (`/blog/[slug]`):** A clean typography reading experience with breadcrumbs, author bio, social sharing (WhatsApp 1-click share), and estimated reading time.
*   **E-Commerce Product Integration:** Ability to embed "Featured Farm Products in this Story" directly within and beneath articles, allowing readers to add featured items to cart or request B2B quotes immediately.
*   **Admin Dashboard Content Manager (`/admin/dashboard`):** An administrative tab for writing, editing, uploading compressed cover images, linking related products, setting SEO metadata, and toggling draft/published states.
*   **SEO & GEO Citability:** Full metadata integration including OpenGraph, Twitter Cards, Article JSON-LD structured schema, and dynamic inclusion in `app/sitemap.ts`.

## Technical Architecture

```
+------------------------------------------------------------------------------------+
|                                STOREFRONT (Client)                                 |
|                                                                                    |
|   +---------------------------------------+  +---------------------------------+   |
|   |          Blog Hub (/blog)             |  |      Article Reader (/blog/slug)|   |
|   |  - Category filters & Search          |  |  - Typography article body      |   |
|   |  - Magazine featured card             |  |  - Social share (WhatsApp/FB)   |   |
|   |  - 3-Column responsive article grid   |  |  - Featured Product Cards       |   |
|   +---------------------------------------+  +---------------------------------+   |
+------------------------------------------|-----------------------------------------+
                                           | HTTP GET
                                           v
+------------------------------------------------------------------------------------+
|                             BACKEND API LAYER (Next.js)                            |
|                                                                                    |
|  +---------------------------------+        +-----------------------------------+  |
|  |  Public: /api/blog              |        |  Admin: /api/admin/blog           |  |
|  |  - GET /api/blog                |        |  - Auth: admin_token cookie check |  |
|  |  - GET /api/blog/[slug]         |        |  - GET, POST, PATCH, DELETE       |  |
|  +---------------------------------+        +-----------------------------------+  |
+------------------------------------------|-----------------------------------------+
                                           |
                                           v
+------------------------------------------------------------------------------------+
|                               DATABASE (MongoDB Atlas)                             |
|                                                                                    |
|  +------------------------------------+  +--------------------------------------+  |
|  | `blogposts` Collection             |  | `products` Collection                |  |
|  | - title, slug, excerpt, content    |  | - Referenced by relatedProductIds    |  |
|  | - category, tags, coverImage       |  | - Embedded inside article views      |  |
|  | - isPublished, views, publishedAt  |  |                                      |  |
|  +------------------------------------+  +--------------------------------------+  |
+------------------------------------------------------------------------------------+
```

## Detailed Implementation Waves

*   **Wave 1 (Backend & Admin):**
    *   `models/BlogPost.ts`: Schema with title, slug, excerpt, content, coverImage, category, tags, relatedProductIds, isPublished, and timestamps.
    *   `app/api/blog/route.ts` & `app/api/blog/[slug]/route.ts`: Public endpoints.
    *   `app/api/admin/blog/route.ts` & `app/api/admin/blog/[id]/route.ts`: Protected admin endpoints.
    *   `app/admin/dashboard/components/BlogTab.tsx`: Interactive blog management tab in admin dashboard.
    *   `app/admin/dashboard/page.tsx`: Navigation tab and component wiring.
*   **Wave 2 (Storefront & SEO):**
    *   `app/blog/page.tsx`: Public blog hub with search and category filters.
    *   `app/blog/[slug]/page.tsx`: Reader view with social share and embedded product cards.
    *   `app/page.tsx`: Storefront navigation link and teaser carousel.
    *   `app/sitemap.ts`: Dynamic sitemap generator with blog post URLs.
