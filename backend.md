# BeesHub Client-Side Backend Operations & Integration Contract

> **Scope**: This document covers **all client-facing backend operations**, API endpoints, data models, state management logic, checkout flows, and payment integrations for BeesHub Farmland.
> **Exclusions**: Admin panel management (`/admin/*`, `/api/admin/*`), ERP/billing engines (`/api/billing/*`), license servers (`/api/license/*`), and point-of-sale systems (`/api/pos/*`) are strictly excluded.

---

## Table of Contents
1. [Architectural Overview](#1-architectural-overview)
2. [TypeScript Data Models & Contracts](#2-typescript-data-models--contracts)
3. [Client-Facing API Endpoints](#3-client-facing-api-endpoints)
   - [3.1 Product Catalog (`/api/products`)](#31-product-catalog-apiproducts)
   - [3.2 Single Product Details (`/api/products/[id]`)](#32-single-product-details-apiproductsid)
   - [3.3 Categories (`/api/categories`)](#33-categories-apicategories)
   - [3.4 Promotional Banners (`/api/banners`)](#34-promotional-banners-apibanners)
   - [3.5 Store Settings & Payment Flags (`/api/settings`)](#35-store-settings--payment-flags-apisettings)
   - [3.6 Product Spotlight / Campaign Popup (`/api/spotlight`)](#36-product-spotlight--campaign-popup-apispotlight)
   - [3.7 Cash on Delivery Order Creation (`/api/orders`)](#37-cash-on-delivery-order-creation-apiorders)
   - [3.8 Razorpay Online Payment Initiation (`/api/orders/razorpay/create`)](#38-razorpay-online-payment-initiation-apiordersrazorpaycreate)
   - [3.9 Razorpay Payment Verification & Fulfillment (`/api/orders/razorpay/verify`)](#39-razorpay-payment-verification--fulfillment-apiordersrazorpayverify)
   - [3.10 Order Tracking (`/api/orders/track`)](#310-order-tracking-apiorderstrack)
   - [3.11 B2B Wholesale Lead Submission (`/api/wholesale`)](#311-b2b-wholesale-lead-submission-apiwholesale)
   - [3.12 Blog Posts Feed (`/api/blog`)](#312-blog-posts-feed-apiblog)
   - [3.13 Blog Post Details (`/api/blog/[slug]`)](#313-blog-post-details-apiblogslug)
4. [Client State Machines & Business Logic](#4-client-state-machines--business-logic)
   - [4.1 Cart Engine & Inventory Limits](#41-cart-engine--inventory-limits)
   - [4.2 Authoritative Calculations (Subtotal, GST, Grand Total)](#42-authoritative-calculations-subtotal-gst-grand-total)
   - [4.3 Dual-Branch Checkout State Machine](#43-dual-branch-checkout-state-machine)
   - [4.4 Order Tracking Logic](#44-order-tracking-logic)
   - [4.5 Wholesale Quotation Builder Logic](#45-wholesale-quotation-builder-logic)
5. [Third-Party Integrations & External Protocols](#5-third-party-integrations--external-protocols)
   - [5.1 Razorpay Standard Checkout SDK](#51-razorpay-standard-checkout-sdk)
   - [5.2 WhatsApp Order Support Deep-linking](#52-whatsapp-order-support-deep-linking)
   - [5.3 UPI Intent & Static QR Generator](#53-upi-intent--static-qr-generator)
   - [5.4 PostHog Client Telemetry](#54-posthog-client-telemetry)

---

## 1. Architectural Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT STORE                              │
│         (Home Storefront, Product Modals, Blog, Track Order)           │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│  Catalog Read    │       │ Order & Checkout │       │   Wholesale &    │
│  Operations      │       │ State Machine    │       │   Tracking       │
│                  │       │                  │       │                  │
│ • GET /products  │       │ • POST /orders   │       │ • GET /track     │
│ • GET /categories│       │ • POST /rzp/creat│       │ • POST /wholesale│
│ • GET /banners   │       │ • POST /rzp/verif│       │ • GET /blog      │
│ • GET /settings  │       │ • Atomic Stock   │       │ • GET /blog/[slug│
│ • GET /spotlight │       │   Deduction      │       │                  │
└──────────────────┘       └──────────────────┘       └──────────────────┘
```

- **Framework**: Next.js 14 App Router.
- **Client Cache Strategy**: Store settings and catalog responses utilize dynamic revalidation (`no-store` or short `s-maxage` headers) to prevent stale inventory from causing checkout conflicts.
- **State Storage**: Cart contents and pre-fill form data persist in browser `localStorage` (`beeshub_cart`, `beeshub_checkout_form`).
- **Security & Integrity**: 
  - Cart item prices submitted by clients are **never** trusted by the backend. The backend resolves real prices and inventory from MongoDB directly.
  - Public order tracking uses strict rate limiting and sanitizes all customer PII (phone, address, email are completely stripped from tracking output).

---

## 2. TypeScript Data Models & Contracts

### 2.1 Product & Variants
```typescript
export interface ProductVariant {
  _id?: string;
  name: string;      // e.g., "500g Glass Jar", "1kg Value Pack"
  mrp: number;       // Maximum Retail Price (INR)
  price: number;     // Selling Price (INR)
  quantity: number;  // Available stock for this specific variant
  discount?: number; // Calculated or fixed percentage
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  image: string;     // URL or base64 path
  mrp: number;
  price: number;
  discount: number;  // % off
  quantity: number;  // Base stock
  gst: number;       // GST percentage (e.g., 0, 5, 12, 18)
  category: string;  // Category name or ID
  variants?: ProductVariant[];
  createdAt?: string;
  updatedAt?: string;
}
```

### 2.2 Category & Banner
```typescript
export interface CategoryItem {
  _id: string;
  name: string;
}

export interface BannerItem {
  _id: string;
  title: string;
  image: string;
  link?: string;
  createdAt?: string;
}
```

### 2.3 Store Settings (Payment & Feature Toggles)
```typescript
export interface StoreSettings {
  key: string;
  enableOnlinePayment?: boolean; // Controls Razorpay & Online checkout
  enableUPI: boolean;            // Fallback flag for online payment
  enableCOD: boolean;            // Controls Cash on Delivery option
  fssaiNumber: string;           // Legal registration number
  gstin: string;                 // GSTIN identifier
  enableWholesale: boolean;      // Toggles B2B wholesale UI visibility
  spotlight?: SpotlightConfig;
  spotlights?: SpotlightConfig[];
}
```

### 2.4 Spotlight / Promotional Campaigns
```typescript
export interface SpotlightBenefit {
  icon: string; // e.g. "natural", "additives", "farm"
  text: string;
}

export interface SpotlightItem {
  productId: string;
  productName: string;
  badgeText: string;
  headingPrefix: string;
  productTitle: string;
  shortDescription: string;
  productImage: string;
  benefits: SpotlightBenefit[];
  ctaLabel: string;
  ctaLink: string;
  price: number;
  mrp: number;
  discount: number;
  quantity: number;
  gst: number;
  variants: ProductVariant[];
  inStock: boolean;
}
```

### 2.5 Cart Item
```typescript
export interface CartItem {
  product: Product;
  selectedVariant?: ProductVariant; // Present if variant was chosen
  quantity: number;
}
```

### 2.6 Order & Tracking
```typescript
export interface OrderItemPayload {
  productId: string;
  name: string;
  variantName?: string;
  price: number;
  quantity: number;
  gst: number;
  image?: string;
}

export interface CheckoutFormState {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  pincode: string;
  paymentMethod: 'COD' | 'RAZORPAY' | 'UPI';
}

export interface TrackedOrder {
  _id: string;
  orderId: string;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Completed' | 'Failed';
  items: Array<{
    name: string;
    variantName?: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
}
```

### 2.7 B2B Wholesale Lead
```typescript
export interface WholesaleItemRequest {
  productId?: string;
  productName: string;
  quantity: number;
  unit: 'KG' | 'LITRE' | 'CASES' | 'PIECES';
  targetPrice?: number;
}

export interface WholesaleLeadPayload {
  companyName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  gstin?: string;
  city: string;
  pincode: string;
  items: WholesaleItemRequest[];
  orderType: 'ONE_TIME' | 'MONTHLY_RECURRING' | 'CONTRACT_FARMING';
  notes?: string;
  website_url?: string; // Honeypot trap: must remain empty for real humans
}
```

---

## 3. Client-Facing API Endpoints

### 3.1 Product Catalog (`/api/products`)
Retrieves the active store catalog. Supports search query filtering and category tabs.

- **Method**: `GET`
- **URL**: `/api/products`
- **Query Parameters**:
  | Param | Type | Description |
  |---|---|---|
  | `search` | `string` (optional) | Case-insensitive search on product name and description |
  | `category` | `string` (optional) | Filter by category name (omitted or `"All"` returns all) |
- **Headers**: None required.
- **Response `200 OK`**:
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Pure Forest Honey",
      "description": "100% raw unprocessed natural honey direct from Western Ghats.",
      "image": "/images/honey.webp",
      "mrp": 499,
      "price": 399,
      "discount": 20,
      "quantity": 45,
      "gst": 5,
      "category": "Honey",
      "variants": [
        {
          "name": "500g Jar",
          "mrp": 299,
          "price": 249,
          "quantity": 25
        },
        {
          "name": "1kg Jar",
          "mrp": 549,
          "price": 469,
          "quantity": 20
        }
      ],
      "createdAt": "2026-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### 3.2 Single Product Details (`/api/products/[id]`)
Direct lookup of a single product by MongoDB ObjectID.

- **Method**: `GET`
- **URL**: `/api/products/:id`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Pure Forest Honey",
    "description": "...",
    "price": 399,
    "quantity": 45,
    "variants": [...]
  }
}
```
- **Response `404 Not Found`**:
```json
{
  "success": false,
  "message": "Product not found"
}
```

---

### 3.3 Categories (`/api/categories`)
Fetches all category classifications for product filtering navigation.

- **Method**: `GET`
- **URL**: `/api/categories`
- **Response `200 OK`**:
```json
{
  "success": true,
  "count": 4,
  "data": [
    { "_id": "cat_1", "name": "Honey & Apiculture" },
    { "_id": "cat_2", "name": "Organic Spices" },
    { "_id": "cat_3", "name": "Cold Pressed Oils" },
    { "_id": "cat_4", "name": "Herbal Extracts" }
  ]
}
```

---

### 3.4 Promotional Banners (`/api/banners`)
Fetches hero promotional sliders and marketing banners.

- **Method**: `GET`
- **URL**: `/api/banners`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "ban_1",
      "title": "Fresh Harvest Honey",
      "image": "/banners/harvest-season.webp",
      "link": "/?search=Honey"
    }
  ]
}
```

---

### 3.5 Store Settings & Payment Flags (`/api/settings`)
Provides operational switches (e.g. if online payment or COD is enabled), legal FSSAI/GST numbers, and wholesale switches.

- **Method**: `GET`
- **URL**: `/api/settings`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "key": "global",
    "enableOnlinePayment": true,
    "enableUPI": true,
    "enableCOD": true,
    "fssaiNumber": "12425009000671",
    "gstin": "33AAOCB0453D1Z3",
    "enableWholesale": true
  }
}
```

---

### 3.6 Product Spotlight / Campaign Popup (`/api/spotlight`)
Returns scheduled or featured new arrival products for the hero spotlight or popup card.

- **Method**: `GET`
- **URL**: `/api/spotlight`
- **Response `200 OK`**:
```json
{
  "success": true,
  "active": true,
  "data": [
    {
      "productId": "64f1a2b3c4d5e6f7a8b9c0d1",
      "productName": "Pure Forest Honey",
      "badgeText": "NEW ARRIVAL ✨",
      "headingPrefix": "Introducing Our",
      "productTitle": "Pure Forest Honey",
      "shortDescription": "Raw, unprocessed and 100% natural honey directly from trusted farm beekeepers in Western Ghats, Kanyakumari.",
      "productImage": "/images/beeshub-pure-forest-honey-spotlight.webp",
      "benefits": [
        { "icon": "natural", "text": "100% Natural" },
        { "icon": "additives", "text": "No Additives" },
        { "icon": "farm", "text": "Farm Sourced" }
      ],
      "ctaLabel": "Shop New Product",
      "ctaLink": "/product/64f1a2b3c4d5e6f7a8b9c0d1",
      "price": 399,
      "mrp": 499,
      "discount": 20,
      "quantity": 50,
      "gst": 5,
      "variants": [],
      "inStock": true
    }
  ]
}
```

---

### 3.7 Cash on Delivery Order Creation (`/api/orders`)
Places a Cash on Delivery (COD) order. The server calculates authoritative prices, decrements stock atomically, and creates the order record.

- **Method**: `POST`
- **URL**: `/api/orders`
- **Headers**: `Content-Type: application/json`
- **Payload**:
```json
{
  "customerName": "Suresh Kumar",
  "customerPhone": "9876543210",
  "customerEmail": "suresh@example.com",
  "shippingAddress": "No. 42, Anna Nagar 2nd Street",
  "pincode": "600040",
  "paymentMethod": "COD",
  "items": [
    {
      "productId": "64f1a2b3c4d5e6f7a8b9c0d1",
      "variantName": "500g Jar",
      "quantity": 2
    }
  ]
}
```
- **Validation**:
  - `customerName`, `customerPhone`, `shippingAddress`, and `pincode` are mandatory.
  - `items` array cannot be empty.
  - Server confirms stock availability. If stock is zero or insufficient, order fulfillment flags conflict.
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Order placed successfully via Cash on Delivery.",
  "data": {
    "_id": "674000112233445566778899",
    "orderId": "ORD-456789-2143",
    "customerName": "Suresh Kumar",
    "customerPhone": "9876543210",
    "shippingAddress": "No. 42, Anna Nagar 2nd Street",
    "pincode": "600040",
    "items": [
      {
        "productId": "64f1a2b3c4d5e6f7a8b9c0d1",
        "name": "Pure Forest Honey",
        "variantName": "500g Jar",
        "price": 249,
        "quantity": 2,
        "gst": 5,
        "image": "/images/honey.webp"
      }
    ],
    "subtotal": 498,
    "totalGst": 25,
    "totalAmount": 523,
    "paymentMethod": "COD",
    "paymentStatus": "Pending",
    "status": "Pending"
  }
}
```

---

### 3.8 Razorpay Online Payment Initiation (`/api/orders/razorpay/create`)
Validates stock, validates store policy, generates a collision-free `orderId`, and registers the order with Razorpay REST API.

- **Method**: `POST`
- **URL**: `/api/orders/razorpay/create`
- **Headers**: `Content-Type: application/json`
- **Payload**: Same item and customer structure as `/api/orders`:
```json
{
  "customerName": "Suresh Kumar",
  "customerPhone": "9876543210",
  "customerEmail": "suresh@example.com",
  "shippingAddress": "No. 42, Anna Nagar 2nd Street",
  "pincode": "600040",
  "items": [
    {
      "productId": "64f1a2b3c4d5e6f7a8b9c0d1",
      "variantName": "500g Jar",
      "quantity": 2
    }
  ]
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "orderId": "ORD-456789-2143",
  "razorpayOrderId": "order_OG918732aBcDeF",
  "amount": 523,
  "amountInPaise": 52300,
  "currency": "INR",
  "keyId": "rzp_live_xxxxxxxxxxxxxx"
}
```
- **Error Responses**:
  - `403 Forbidden`: When online payment is turned off in settings.
  - `400 Bad Request`: If stock is insufficient (message explains which item is short).
  - `503 Service Unavailable`: If Razorpay gateway credentials are misconfigured.

---

### 3.9 Razorpay Payment Verification & Fulfillment (`/api/orders/razorpay/verify`)
Called by client immediately after Razorpay modal succeeds. Verifies cryptographic HMAC SHA-256 signature and atomically decrements inventory.

- **Method**: `POST`
- **URL**: `/api/orders/razorpay/verify`
- **Headers**: `Content-Type: application/json`
- **Payload**:
```json
{
  "orderId": "ORD-456789-2143",
  "razorpayOrderId": "order_OG918732aBcDeF",
  "razorpayPaymentId": "pay_OG928374aBcDeF",
  "razorpaySignature": "3fa91c8e234b6e8a..."
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Payment verified and order confirmed successfully.",
  "data": {
    "orderId": "ORD-456789-2143",
    "status": "Confirmed",
    "paymentStatus": "Completed",
    "paymentMethod": "RAZORPAY",
    "totalAmount": 523,
    "items": [...]
  },
  "alreadyFulfilled": false,
  "conflict": false
}
```
- **Response `400 Bad Request`**: If HMAC signature fails verification.

---

### 3.10 Order Tracking (`/api/orders/track`)
Rate-limited public order status lookup. Accepts Phone Number, Order ID, or Email.

- **Method**: `GET`
- **URL**: `/api/orders/track?query=:searchTerm`
- **Rate Limit**: Max 20 attempts per 15-minute window per IP.
- **Privacy Enforcement**: Returns sanitized orders only (strips address, phone, email, and customer names).
- **Response `200 OK`**:
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "674000112233445566778899",
      "orderId": "ORD-456789-2143",
      "status": "Shipped",
      "createdAt": "2026-02-01T12:00:00.000Z",
      "totalAmount": 523,
      "paymentMethod": "RAZORPAY",
      "paymentStatus": "Completed",
      "items": [
        {
          "name": "Pure Forest Honey",
          "variantName": "500g Jar",
          "price": 249,
          "quantity": 2,
          "image": "/images/honey.webp"
        }
      ]
    }
  ]
}
```

---

### 3.11 B2B Wholesale Lead Submission (`/api/wholesale`)
Allows institutional and commercial buyers to request bulk quotes. Includes bot honeypot protection and rate limiting.

- **Method**: `POST`
- **URL**: `/api/wholesale`
- **Headers**: `Content-Type: application/json`
- **Rate Limit**: Max 5 submissions per 15 minutes per IP.
- **Payload**:
```json
{
  "companyName": "Organic Supermarket Ltd",
  "contactPerson": "Ramesh Patel",
  "phone": "9876543210",
  "email": "purchasing@organics.com",
  "gstin": "33AAAAA0000A1Z5",
  "city": "Chennai",
  "pincode": "600001",
  "orderType": "MONTHLY_RECURRING",
  "notes": "Need 50 cases initial dispatch with lab test COA",
  "items": [
    {
      "productId": "64f1a2b3c4d5e6f7a8b9c0d1",
      "productName": "Pure Forest Honey",
      "quantity": 50,
      "unit": "CASES",
      "targetPrice": 220
    }
  ],
  "website_url": "" 
}
```
> **Security Note**: `website_url` is a honeypot field. If a bot populates this hidden input, the server silently responds `200 OK` without inserting a lead.

- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Wholesale quotation request received. Our trade desk will contact you within 24 hours.",
  "id": "67400192837465ab12cd34ef"
}
```

---

### 3.12 Blog Posts Feed (`/api/blog`)
Lists articles and educational content regarding apiculture and organic living.

- **Method**: `GET`
- **URL**: `/api/blog`
- **Query Parameters**:
  | Param | Type | Default | Description |
  |---|---|---|---|
  | `category` | `string` | `"ALL"` | Filter by article category |
  | `search` | `string` | `""` | Search in title, excerpt, and tags |
  | `page` | `number` | `1` | Page number |
  | `limit` | `number` | `9` | Articles per page |
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "blog_1",
      "title": "Raw vs Processed Honey: How to Spot the Difference",
      "slug": "raw-vs-processed-honey-difference",
      "excerpt": "Learn how natural filtration preserves pollen and enzymes...",
      "coverImage": "/blog/raw-honey.webp",
      "category": "Honey & Apiculture",
      "tags": ["honey", "health"],
      "author": "Dr. Arumugam",
      "readTime": "4 min read",
      "publishedAt": "2026-01-20T08:00:00.000Z",
      "views": 412
    }
  ],
  "total": 15,
  "page": 1,
  "totalPages": 2,
  "categories": [
    "Honey & Apiculture",
    "Organic Spices",
    "Health & Wellness",
    "Farm Stories",
    "Wholesale Guides"
  ]
}
```

---

### 3.13 Blog Post Details (`/api/blog/[slug]`)
Fetches full Markdown body of an article, increments the view counter, and returns related products.

- **Method**: `GET`
- **URL**: `/api/blog/:slug`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "_id": "blog_1",
    "title": "Raw vs Processed Honey...",
    "slug": "raw-vs-processed-honey-difference",
    "content": "## Why Raw Honey Matters\n\nRaw honey is collected straight from...",
    "category": "Honey & Apiculture",
    "views": 413
  },
  "relatedProducts": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Pure Forest Honey",
      "price": 399,
      "mrp": 499,
      "image": "/images/honey.webp"
    }
  ],
  "recentPosts": [...]
}
```

---

## 4. Client State Machines & Business Logic

### 4.1 Cart Engine & Inventory Limits
The cart supports both base products and specific variant choices.

1. **Storage Key**: `localStorage.getItem('beeshub_cart')`
2. **Identification Rule**: An item in the cart is uniquely identified by `(productId, variantName || '')`.
3. **Quantity Cap**:
   - `maxAvailable = variant ? variant.quantity : product.quantity`
   - When adding to cart: if `currentQty + toAdd > maxAvailable`, cap at `maxAvailable` and notify user.
4. **Operations**:
   - `addToCart(product, quantity, selectedVariant?)`
   - `updateCartQty(productId, variantName, newQty)`: if `newQty <= 0`, triggers removal.
   - `removeFromCart(productId, variantName)`
   - `clearCart()`: empties cart and purges `beeshub_cart` from storage.

---

### 4.2 Authoritative Calculations (Subtotal, GST, Grand Total)
All client screens must calculate preview totals using this standard formula:

```typescript
// 1. Subtotal (Base prices sum)
const cartSubtotal = cart.reduce((sum, item) => {
  const unitPrice = item.selectedVariant ? item.selectedVariant.price : item.product.price;
  return sum + unitPrice * item.quantity;
}, 0);

// 2. GST Total (Calculated per item based on each product's GST %)
const cartGstTotal = cart.reduce((sum, item) => {
  const unitPrice = item.selectedVariant ? item.selectedVariant.price : item.product.price;
  const gstRate = item.product.gst !== undefined ? item.product.gst : 0;
  return sum + ((unitPrice * item.quantity) * gstRate) / 100;
}, 0);

// 3. Grand Total (Rounded to nearest rupee)
const cartGrandTotal = Math.round(cartSubtotal + cartGstTotal);

// 4. Cart Item Count
const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
```

---

### 4.3 Dual-Branch Checkout State Machine

```
                   [ User clicks Checkout ]
                              │
               [ Validate Form Fields & Pincode ]
                              │
                    [ Select Payment Method ]
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
      [ RAZORPAY / UPI ]                    [ COD ]
              │                               │
   POST /api/orders/razorpay/create     POST /api/orders
              │                               │
   Opens Razorpay Checkout Modal              │
              │                               │
      Payment Verified?                       │
     ┌────────┴────────┐                      │
    Yes                No                     │
     │                 │                      │
POST /rzp/verify   Show Error                 │
     │                 │                      │
     └────────┬────────┘                      │
              │                               │
              ▼                               ▼
       [ Clear Cart ]                  [ Clear Cart ]
       [ Show Confirmation Screen ]    [ Show Confirmation Screen ]
       [ Trigger WhatsApp Support CTA ]
```

#### Step 1: Pre-Submission Validation
- `customerName`: non-empty string.
- `customerPhone`: 10-digit Indian phone (regex: `/^[6-9]\d{9}$/`).
- `customerEmail`: standard email validation.
- `shippingAddress`: street and house details.
- `pincode`: 6-digit Indian PIN (regex: `/^\d{6}$/`).
- Verify store settings: if `enableOnlinePayment` is `false`, disallow Razorpay; if `enableCOD` is `false`, disallow COD.

#### Step 2A: Razorpay Flow
1. Client POSTs to `/api/orders/razorpay/create`.
2. Receives `{ keyId, amountInPaise, razorpayOrderId, orderId }`.
3. Opens `window.Razorpay(options)`.
4. In modal `handler(response)`:
   - Client POSTs to `/api/orders/razorpay/verify` with `{ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }`.
   - On success: clears cart, opens Order Success modal, refetches catalog to sync inventory.

#### Step 2B: Cash on Delivery (COD) Flow
1. Client POSTs to `/api/orders`.
2. Receives `{ success: true, data: order }`.
3. Clears cart, opens Order Success modal, refetches catalog.

---

### 4.4 Order Tracking Logic
- Input query: Phone number, Order ID, or Email.
- Client calls: `GET /api/orders/track?query=${encodeURIComponent(query)}`.
- Results render order milestone pills:
  - `Pending`: Payment or Order processing.
  - `Confirmed`: Payment cleared, packed at farmland.
  - `Shipped`: Handed over to courier with AWB.
  - `Delivered`: Completed delivery.
  - `Cancelled`: Terminated order.

---

### 4.5 Wholesale Quotation Builder Logic
- Dynamic multi-row item selector allowing customer to specify unit:
  - Units: `KG`, `LITRE`, `CASES`, `PIECES`.
- Target price (optional customer bid).
- Auto-sanitizes 10-digit phone number (strips `+91` or leading `0`).
- Generates WhatsApp summary bridge if buyer prefers chatting directly with the commercial desk.

---

## 5. Third-Party Integrations & External Protocols

### 5.1 Razorpay Standard Checkout SDK
Loaded via `next/script` in Root Layout or Home View:
```html
<Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
```

### 5.2 WhatsApp Order Support Deep-linking
Formatted string builder for post-purchase order assistance:
```typescript
export function getWhatsAppSupportUrl(order: any, storePhone: string = '919578784431'): string {
  const itemsList = order.items
    ? order.items.map((it: any) => `• ${it.name} x ${it.quantity} (₹${(it.price * it.quantity).toLocaleString('en-IN')})`).join('\n')
    : '';

  const text = `Hello BeesHub Farmland Team 👋,

I need support regarding my order:

🆔 *Order ID:* ${order.orderId || ''}
👤 *Name:* ${order.customerName || ''}
📞 *Phone:* ${order.customerPhone || ''}
📍 *Address:* ${order.shippingAddress || ''} - ${order.pincode || ''}

🛒 *Items Ordered:*
${itemsList}

💰 *Total Amount:* ₹${order.totalAmount ? order.totalAmount.toLocaleString('en-IN') : 0}
💳 *Payment:* ${order.paymentMethod} (${order.paymentStatus})
📦 *Status:* ${order.status}`;

  return `https://wa.me/${storePhone}?text=${encodeURIComponent(text)}`;
}
```

### 5.3 UPI Intent & Static QR Generator
For direct UPI payments:
- **Merchant VPA**: loaded from `NEXT_PUBLIC_MERCHANT_UPI_ID` (default: `beeshubfarmland.com@upi`).
- **Intent URI**:
  ```
  upi://pay?pa={vpa}&pn=BEES%20HUB%20FARMLAND%20PRIVATE%20LIMITED&am={amount}&cu=INR&tn=BeesHub%20Order
  ```
- **QR Server URL**:
  ```
  https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={encodedIntentUri}
  ```

### 5.4 PostHog Client Telemetry
Event names captured on client:
- `wholesale_lead_submitted`: `{ product_count, order_type, city, has_gstin }`
- Client analytics wrapper `ImpactAnalytics` and `PostHogInit` auto-track page views and funnel conversions.
