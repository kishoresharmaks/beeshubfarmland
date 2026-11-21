# Phase 02: B2B Landing Page & Storefront V2 Theme Overhaul — Context & Requirements

## 1. Overview & Objective
Transform the BeesHub Farmland client storefront from the legacy monolithic page (`app/page.tsx`) into a high-performance, modular B2B landing page & e-commerce client UI based on the `UI.md` specification and the decoupled `backend.md` client operations contract.

## 2. Source Documents
- **`UI.md`**: Complete structural and visual design spec (Sections A through R, design tokens, typography, component specs, responsive breakpoints, accessibility).
- **`backend.md`**: Complete client-facing API contracts, data models (`Product`, `Category`, `Banner`, `Order`, `WholesaleLead`), cart/GST math, and dual-branch checkout (COD + Razorpay).

## 3. Requirements Breakdown

### Phase Requirements
- **REQ-THEME-01**: Design token architecture in `tailwind.config.ts` and `app/globals.css` with exact palette from `UI.md` (`--color-primary: #163B5C`, `--color-cta: #ED3500`, `--color-accent: #10B981`, etc.) and typography (Outfit/Poppins headings, Inter body).
- **REQ-THEME-02**: Headless client state engine (`context/StoreContext.tsx`) decoupling Cart, Checkout (COD & Razorpay), Catalog/Filtering, Order Tracking, and Wholesale Lead submissions from UI presentation.
- **REQ-THEME-03**: Navigation & Top Utility Bar (Sections A & B) with logo, navigation links, single-column dropdown (~10 items), pill CTA, sticky header, and responsive mobile drawer.
- **REQ-THEME-04**: Hero Section & Badge Strip (Sections C & D) with 3 auto-rotating slides (pause control, responsive crops), 6 certification badges, eyebrow H1, large H2 with emphasized accent phrase, 4 animated stats, and primary CTA.
- **REQ-THEME-05**: Showcase Mosaic, Logo Wall & Problem Persona Cards (Sections E, F, G) featuring a 10-tile bento grid with hover zoom, 10-client logo marquee, and 3 persona cards with question bullets and concern markers.
- **REQ-THEME-06**: Benefits, Services Zig-Zag & About Collage (Sections H, I, J) featuring 7 icon cards (4+3 centered), 4 checkerboard alternating image/text blocks with CTA strip, and 5-image collage with capability bullets.
- **REQ-THEME-07**: Why Choose Us, Process Stepper, Not-A-Fit & Feature Block (Sections K, L, M, N) featuring 6 icon cards, 5-step numbered process stepper (connecting line on desktop, vertical timeline on mobile), 3 disqualifier bullets in a calm tinted box, and 2x2 sub-items feature block.
- **REQ-THEME-08**: FAQ Accordion & Comprehensive Footer (Sections O & P) featuring 8 accessible animated accordion rows, 4-5 column footer with social links, legal FSSAI/GST badges, 2 factory/office addresses, and copyright bar.
- **REQ-THEME-09**: Conversion & Engagement Actions (Sections Q & R) featuring floating Call and WhatsApp buttons, mobile sticky paired 2-button CTA bar, and accessible Quote Request Modal with honeypot spam protection, focus trap, and loading state integrated with `/api/wholesale`.
- **REQ-THEME-10**: E-Commerce Storefront Bridge integrating live catalog (`/api/products`), product quickview modal, cart drawer (with live GST/subtotal math), and dual-branch checkout (COD & Razorpay) into `app/page.tsx`.

## 4. Architectural Decisions
1. **Decoupled Headless State**: Pure UI components in `components/theme-v2/` consume `StoreContext` without mixing direct `fetch` logic or raw state into component JSX.
2. **Zero Admin Impact**: All changes are strictly client-side (`app/page.tsx`, `components/theme-v2/`, `context/`). Admin dashboard (`/admin/*`) and ERP billing routes are 100% untouched.
3. **Responsive & Accessible**: Strict adherence to WCAG 2.1 AA contrast ($\ge 4.5:1$), visible focus rings, keyboard navigability (Esc to close modals, Tab focus trapping), and `prefers-reduced-motion` compliance.
