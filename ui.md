# 1HandIndia - Product Listing & Detail UI Design System & AI Prompts

## 1. Visual UI Design Mockups

```carousel
![Product Listing Page UI](C:\Users\krish\.gemini\antigravity-ide\brain\02178c6e-d362-40f9-a511-8db9860fa6fd\product_listing_page_ui_1787405129047.png)
<!-- slide -->
![Product Detail Page UI](C:\Users\krish\.gemini\antigravity-ide\brain\02178c6e-d362-40f9-a511-8db9860fa6fd\product_detail_page_ui_1787405147940.png)
````

---

## 2. Brand Color & Design Tokens

| Token | Hex Value | Application / Role |
| :--- | :--- | :--- |
| **Primary Accent** | `#ED3500` | Primary buttons, active badges, price highlights, active color swatch border |
| **Primary Hover** | `#D02E00` | Hover states for primary buttons and CTA links |
| **Secondary Background** | `#FFFCFB` | Main page background, section soft fills |
| **Card Surface** | `#FFFFFF` | Product cards, filter panels, review cards |
| **Card Border** | `#E8EDF2` | Subtle layout borders and card framing |
| **Primary Text** | `#163B5C` | Headings, titles, price tags, navigation items |
| **Muted Text** | `#64748B` | Secondary details, stock counts, subheaders, breadcrumbs |
| **Success / Stock** | `#10B981` | In Stock badges, verified seller checkmark |

---

## 3. Ready-to-Use Master AI Prompts

### Prompt 1: Product Listing Page (PLP) (v0.dev / Code / UI Generators)

```text
Create a sleek, high-conversion E-commerce Product Listing Page (PLP) layout in Next.js, React, and Tailwind CSS following a modern marketplace theme.

Brand Colors:
- Primary Accent: #ED3500 (Vibrant Warm Red)
- Page Background: #FFFCFB (Soft Off-White Cream)
- Surface/Cards: #FFFFFF
- Card Borders: #E8EDF2
- Text Primary: #163B5C

Layout Architecture:
1. Top Header & Breadcrumb: Clean top bar with category title ("Handcrafted Textiles"), item counter ("Showing 128 products"), and active filters chips.
2. Filter Sidebar (Left, 280px fixed width on desktop):
   - Search within category input box with search icon.
   - Expandable accordion sections for Categories, Price Range (dual handle slider), Rating (star filters), Availability (in-stock toggle).
   - Color Swatch Filter: Circular interactive swatches for colors (Terracotta #C85A32, Mustard #DAA520, Indigo #2B3A67, Emerald #054A29, Ivory #F5F5DC) with tooltips and count badges.
3. Main Content Area (Grid View):
   - Sorting bar (Relevance, Price: Low to High, Price: High to Low, Newest) + Grid/List view toggle.
   - Product Cards (4-column responsive grid):
     * Square product image with subtle warm background fill (#FFF8F5), hover zoom effect.
     * Top badges: Discount badge (-20%) in #ED3500, Wishlist heart icon overlay on hover.
     * Verified Seller tag ("Store Name" with green check mark icon).
     * Product Title (2 lines max, #163B5C, font-semibold).
     * Price area: Current price in bold #ED3500, original MRP strikethrough, discount percentage tag.
     * Color preview swatches on product card showing available color options.
     * Action button: Full-width "Add to Cart" button with shopping bag icon.
4. Pagination Bar: Clean numerical pagination with active page in #ED3500 pill.
```

---

### Prompt 2: Product Detail Page (PDP) with Color & Variant Picker

```text
Design a high-fidelity Product Detail Page (PDP) interface in React and Tailwind CSS for an multi-vendor ecommerce portal.

Color Palette:
- Primary Action & Accent: #ED3500
- Background: #FFFCFB
- Surface: #FFFFFF
- Text: #163B5C
- Borders: #E8EDF2

Layout Architecture (Two-Column Desktop Split):
1. Left Column - Product Image Gallery:
   - Large hero main product image container with smooth zoom lens on hover.
   - Vertical thumbnail strip on the left with 4-5 thumbnails. Active thumbnail highlighted with #ED3500 border ring.
   - Wishlist floating button on top-right of image.

2. Right Column - Purchase & Details Panel:
   - Store / Seller Badge: Verified seller link with badge ("Handicrafts Hub ✓").
   - Title: H1 clear typography ("Handwoven Pure Silk Saree - Crimson Red Edition").
   - Ratings Summary: Star rating (4.8 ★★★★★, 142 reviews).
   - Pricing Section: Large price display ₹4,999, crossed MRP ₹6,999, savings tag (Save ₹2,000 - 28% off) in #ED3500 badge.
   - Color Variant Selection System:
     * Label: "Color: Crimson Red" (Updates dynamically on hover/select).
     * Interactive Circular Color Swatches (36px diameter circles):
       - Red (#C82333), Midnight Black (#1A1A1A), Royal Blue (#104E8B), Olive Green (#556B2F).
       - Selected swatch gets a 2px outer ring in #ED3500 with a subtle checkmark.
   - Size / Option Selector: Chip buttons (S, M, L, XL, XXL) with out-of-stock disabled state.
   - Quantity Stepper: [-] [ 1 ] [+] counter box.
   - Action Buttons:
     * Primary "Add to Cart" button in solid #ED3500 with hover effect.
     * Secondary "Buy Now" button in outline style with #163B5C text.
     * "Request B2B Quote" button for bulk orders.
   - Pincode Delivery Estimator: Input field with "Check Pincode" button showing estimated delivery date & COD availability.
   - Trust Highlights Grid: Icons for 100% Authentic, 7 Days Easy Return, Free Delivery, Secure Payment.

3. Bottom Tabs Section:
   - Detailed Description & Craft Story.
   - Product Specifications Table (Material, Weave, Care instructions, Dimensions).
   - Customer Reviews & Ratings breakdown with photo upload reviews.
```

---

### Prompt 3: AI Image Generation Prompt (Midjourney v6 / DALL-E 3)

```text
A modern, high-resolution UI design mockup of an e-commerce Product Detail Page (PDP) featuring color variant selectors. Crisp, professional web dashboard design on a soft off-white canvas background (#FFFCFB) with vibrant warm red primary accents (#ED3500). Left panel shows high-quality product photo gallery with vertical thumbnail selector. Right panel shows bold product title, star ratings, price tags, interactive circular color swatch picker pills, size selector buttons, and primary 'Add to Cart' button in warm red. Minimalist typography, soft drop shadows, clean borders, 8k resolution, UI design showcase --ar 16:9 --v 6.0
```

---

## 4. Code Snippet: Color Swatch Variant Component (React + Tailwind)

```tsx
import React, { useState } from "react";

type ColorVariant = {
  id: string;
  name: string;
  hex: string;
  inStock: boolean;
};

const COLOR_VARIANTS: ColorVariant[] = [
  { id: "red", name: "Crimson Red", hex: "#ED3500", inStock: true },
  { id: "navy", name: "Midnight Navy", hex: "#163B5C", inStock: true },
  { id: "olive", name: "Olive Green", hex: "#556B2F", inStock: true },
  { id: "gold", name: "Mustard Gold", hex: "#D4AF37", inStock: false },
];

export function ColorVariantSelector() {
  const [selectedColor, setSelectedColor] = useState(COLOR_VARIANTS[0]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#163B5C]">
          Color: <span className="font-normal text-slate-600">{selectedColor.name}</span>
        </span>
        {!selectedColor.inStock && (
          <span className="text-xs font-medium text-rose-600">Out of Stock</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {COLOR_VARIANTS.map((color) => {
          const isSelected = selectedColor.id === color.id;
          return (
            <button
              key={color.id}
              type="button"
              onClick={() => setSelectedColor(color)}
              title={color.name}
              className={`relative h-9 w-9 rounded-full transition-all focus:outline-none ${
                isSelected
                  ? "ring-2 ring-[#ED3500] ring-offset-2 scale-110"
                  : "hover:scale-105 opacity-90 hover:opacity-100"
              } ${!color.inStock ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
              style={{ backgroundColor: color.hex }}
            >
              {isSelected && (
                <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```
