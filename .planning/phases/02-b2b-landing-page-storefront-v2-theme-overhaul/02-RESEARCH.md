# Phase 02: B2B Landing Page & Storefront V2 Theme Overhaul — Technical Research

## 1. Technical Context & Constraints
- **Stack**: Next.js 14 App Router, React 18, Tailwind CSS 3.4, Lucide React, Mongoose 8.5.
- **Current State**: Monolithic `app/page.tsx` (2,425 lines) intermixes client state, payment gateways, modals, and markup.
- **Goal**: Cleanly modularize the frontend into isolated, accessible components adhering to `UI.md` while binding seamlessly to the endpoints and data models specified in `backend.md`.

## 2. Component Decomposition Strategy

```
components/theme-v2/
├── navigation/
│   ├── TopUtilityBar.tsx          # Section A: Tagline + email + phone
│   ├── HeaderNav.tsx              # Section B: Logo, links, dropdown, CTA, mobile drawer
│   └── DropdownMenu.tsx           # Single-column ~10 items
├── hero/
│   ├── HeroSlider.tsx             # Section C: 3 auto-rotating slides, responsive crops
│   ├── TrustBadgeStrip.tsx        # Section C: 6 certification badges
│   └── HeroCopyStats.tsx          # Section D: Eyebrow H1, large H2, 4 count-up stats, CTA
├── showcase/
│   ├── ShowcaseMosaic.tsx         # Section E: 10 rounded tiles bento grid
│   ├── LogoWall.tsx               # Section F: 10 logos continuous marquee
│   ├── ProblemCards.tsx           # Section G: 3 persona cards with concern bullets
│   └── BenefitsGrid.tsx           # Section H: 7 icon cards (4+3 centered)
├── narrative/
│   ├── ServicesZigZag.tsx         # Section I: 4 alternating checkerboard blocks + CTA strip
│   ├── AboutBlock.tsx             # Section J: 5-bullet capabilities, 5-image collage
│   ├── WhyChooseUs.tsx            # Section K: 6 icon cards (3x2 / 2x3 / 1 col)
│   ├── ProcessStepper.tsx         # Section L: 5 steps with connector line / vertical timeline
│   ├── NotAFitCallout.tsx         # Section M: 3 disqualifier bullets in calm tinted box
│   └── FeatureBlock.tsx           # Section N: Large image + H3 + 2x2 sub-items
├── trust-conversion/
│   ├── FaqAccordion.tsx           # Section O: 8 accessible collapsible items
│   ├── Footer.tsx                 # Section P: 4-5 columns, social links, legal badges, addresses
│   ├── FloatingActions.tsx        # Section Q: Call & WhatsApp buttons, mobile sticky paired bar
│   └── QuoteModal.tsx             # Section R: Accessible Wholesale Quote Modal
└── store-bridge/
    ├── CartDrawer.tsx             # Slide-over cart tray with live subtotal/GST
    ├── CheckoutModal.tsx          # 2-step checkout (Address -> Payment method)
    ├── ProductQuickViewModal.tsx  # Product variant picker & instant add-to-cart
    └── OrderTrackingModal.tsx     # Order ID / Phone status tracker
```

## 3. Headless State Engine (`context/StoreContext.tsx`)
A unified React Context provider that wraps the storefront:
1. **Cart State**:
   - Items array with product ID, variant name, unit price, quantity, and GST.
   - Persistence in `localStorage` under key `beeshub_cart`.
   - Authoritative calculation: Subtotal = $\sum (\text{price} \times \text{qty})$, GST = $\sum (\text{price} \times \text{qty} \times \frac{\text{gst}}{100})$, Grand Total = $\text{round}(\text{subtotal} + \text{gst})$.
2. **Checkout State**:
   - Customer details: Name, Phone (10 digits), Email, Address, Pincode (6 digits).
   - Dual-branch submission: Cash on Delivery (`POST /api/orders`) or Razorpay (`POST /api/orders/razorpay/create` $\rightarrow$ Razorpay SDK $\rightarrow$ `POST /api/orders/razorpay/verify`).
3. **Catalog & Search State**:
   - Products from `GET /api/products`, categories from `GET /api/categories`, banners from `GET /api/banners`.
   - Search term query filtering and category tab selection.
4. **Modal Triggers**:
   - `isQuoteModalOpen`, `isCartOpen`, `isCheckoutOpen`, `isTrackingModalOpen`, `quickViewProduct`.

## 4. Animation & Interaction Specifications
- **Reduced Motion**: All animations wrapped with `@media (prefers-reduced-motion: reduce)`.
- **Marquee**: Pure CSS `@keyframes marquee` with `animation-play-state: paused` on hover.
- **Count-Up Stats**: Lightweight IntersectionObserver triggering a requestAnimationFrame counter when the stats section enters the viewport.
- **Accordion**: `grid-template-rows: 0fr -> 1fr` transition or CSS max-height transition with `aria-expanded` and keyboard navigation.
- **Modal Focus Trap**: `keydown` listener trapping Tab within modal and Esc closing the modal.

## 5. Verification Patterns
- **Build verification**: `npm run build` must compile with 0 TypeScript and 0 linting errors.
- **Functional verification**:
  - Quote submission invokes `POST /api/wholesale` and logs PostHog event.
  - Adding products to cart updates subtotal, GST, and badges in real-time.
  - Razorpay order initiation and verification works with keyId.
  - Responsive layout verified at mobile (<640px), tablet (640-1023px), and desktop ($\ge$1024px).
