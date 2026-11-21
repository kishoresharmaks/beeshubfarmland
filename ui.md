# B2B Landing Page — UI & Layout Spec (content-free)

Layout, components and theme pattern only. All copy, products, links, names and contact details are placeholders.

Tags: **[PATTERN]** = taken from the reference page's structure. **[PROPOSED]** = suggested design value (fonts, type sizes, spacing, radius, breakpoints; replace with your own). Colours are **your site's own** (beeshubfarmland.com), see Section 3.1.

---

## 1. Page type

Long-scroll, section-stacked B2B lead-generation landing page. One goal: get the visitor to send an enquiry.
Conversion points: header CTA, hero CTA, floating call/chat buttons, sticky enquiry bar, quote modal.

---

## 2. Page skeleton (top → bottom) [PATTERN]

```
A  Top utility bar        tagline + email + phone
B  Header / nav           logo · links · dropdown · CTA button
C  Hero slider            full-width image slides
   Trust badge strip      6 certification badges
D  Hero copy + stats      eyebrow H1 · big H2 · 2 paragraphs · 4 stats · CTA
E  Showcase mosaic        10 image tiles (bento grid)
F  Logo wall              10 client logos
G  Problem cards          3 persona cards, 3 bullets each
H  Benefits grid          7 icon cards
I  Services zig-zag       4 image/text blocks + CTA strip
J  About block            bullets + 5-image collage + 2 paragraphs
K  Why choose us          6 icon cards
L  Process stepper        5 numbered steps
M  "Not a fit" callout    3 disqualifier bullets
N  Feature block          image + 4 sub-items
O  FAQ accordion          8 items
P  Footer                 brand + 4 columns + 2 addresses + bottom bar
Q  Floating actions       call + chat buttons, sticky 2-button bar
R  Modal                  quote request form + loading state
```

---

## 3. Design tokens

### 3.1 Colour palette — measured from beeshubfarmland.com

| Token | Hex | Source (rgb) | Role |
|---|---|---|---|
| `--color-primary` | `#163B5C` | rgb(22, 59, 92) | Brand navy: headings, header/footer background, dark sections |
| `--color-cta` | `#ED3500` | rgb(237, 53, 0) | Orange-red: primary buttons, highlights, key accents |
| `--color-accent` | `#10B981` | rgb(16, 185, 129) | Green: icons, check marks, secondary accents, badges |
| `--color-accent-dark` | `#059669` | rgb(5, 150, 105) | Green hover / pressed / text on light tint |
| `--color-accent-soft` | `#ECFDF5` | rgb(236, 253, 245) | Light green section/card tint |
| `--color-accent-line` | `#A7F3D0` | rgb(167, 243, 208) | Light green borders, chips |
| `--color-cta-soft` | `#FFF8F5` | rgb(255, 248, 245) | Warm tint behind orange highlights |
| `--color-ink-muted` | `#64748B` | rgb(100, 116, 139) | Body/secondary text |
| `--color-surface` | `#FFFFFF` | rgb(255, 255, 255) | Page and card background |
| `--color-surface-alt` | `#E8EDF2` | rgb(232, 237, 242) | Alternating section background |
| `--color-line` | `#E5E7EB` | rgb(229, 231, 235) | Borders and dividers |
| `--color-overlay-text` | `rgba(255,255,255,.9)` | rgba(255, 255, 255, 0.9) | Text on dark/navy areas |
| `--color-ink` | `#000000` | rgb(0, 0, 0) | Pure black text (used sparingly) |
| `--color-link` | `#2563EB` | rgb(37, 99, 235) | Minor use: links |
| `--color-tag-purple` | `#9333EA` | rgb(147, 51, 234) | Minor use: tags/badges only |

Notes on reading the data:
- `#E5E7EB` appears 594 times because Tailwind sets it as the default border colour on every element. It is a neutral line colour, not a design accent.
- The values for green, slate and blue match Tailwind's default palette (emerald, slate, blue), so the site is probably built with Tailwind CSS.
- Roles above are assigned from how often each colour appears. Orange `#ED3500` is the primary CTA/button color and green `#10B981` is accent.
- Purple and blue appear only 11–14 times, so keep them out of the main layout.

```css
:root {
  --color-primary:      #163B5C;
  --color-cta:          #ED3500;
  --color-cta-soft:     #FFF8F5;
  --color-accent:       #10B981;
  --color-accent-dark:  #059669;
  --color-accent-soft:  #ECFDF5;
  --color-accent-line:  #A7F3D0;
  --color-ink:          #163B5C;   /* headings use navy */
  --color-ink-muted:    #64748B;
  --color-line:         #E5E7EB;
  --color-surface:      #FFFFFF;
  --color-surface-alt:  #E8EDF2;
  --color-link:         #2563EB;
  --color-chat:         #25D366;

  --font-heading: "Poppins", system-ui, sans-serif;
  --font-body:    "Inter", system-ui, sans-serif;

  --radius-sm: 8px; --radius-md: 16px; --radius-lg: 24px; --radius-pill: 999px;
  --shadow-card:  0 6px 20px rgba(31,41,51,.08);
  --shadow-hover: 0 12px 28px rgba(31,41,51,.14);

  --container: 1200px;
  --gutter: 24px;
  --section-y: 80px;   /* 48px on mobile */
}
```

Type scale

| Use | Desktop | Mobile |
|-----|---------|--------|
| H1 (eyebrow style, uppercase, letter-spaced) | 14–16px | 13px |
| H2 hero headline | 44–52px | 28–32px |
| H3 section title | 32–40px | 24–28px |
| H4 card title | 20–22px | 18px |
| Body | 16–17px / 1.65 | 15–16px |
| Stat number | 40–56px / 700 | 32–36px |

**Headline pattern [PATTERN]:** bold statement + emphasised second half, e.g. `Headline text. <em>Accent phrase.</em>` — style `em` as accent colour (and optionally italic).
**H1 pattern [PATTERN]:** small keyword H1 above a large visual H2.

Breakpoints: mobile <640 · tablet 640–1023 · desktop ≥1024 · container capped ≥1280.

---

## 4. Section specs

### A. Top utility bar
- Slim bar (36–44px), dark or brand colour, light text.
- Left: short tagline. Right: email + phone.
- Mobile: tagline only.

### B. Header
- Logo left · nav links · **primary pill CTA** far right.
- One nav item has a **dropdown** (single column, ~10 links; some can be plain non-link labels).
- Sticky on scroll with light shadow.
- Mobile: hamburger → full-width drawer; dropdown becomes accordion.

### C. Hero slider + badge strip
- 3 slides, full width, ratio ≈ 1920×750, `object-fit: cover`.
- Each slide has two image variants (desktop/mobile crops or layered pair).
- Auto-rotate, dots/arrows, pause control.
- **Badge strip:** 6 equal-height badges in one row, evenly spaced. Mobile: 3×2 grid or horizontal scroll.

### D. Hero copy + stats
- Eyebrow H1 → large H2 with emphasised phrase → 2 short paragraphs.
- **Stats row:** 4 blocks, big number over small label. 4 across desktop, 2×2 mobile. Optional count-up on scroll.
- One uppercase primary CTA button.

### E. Showcase mosaic
- Centered H3 + 1-line intro.
- 10 rounded image tiles in a bento grid (mixed large/small).
- Some tiles are links with the label baked into the image; others show a small H4 label below.
- Hover: lift / slight zoom. Non-linked tiles get no hover affordance.
- Responsive: 4–5 cols → 3 → 2.

### F. Logo wall
- Centered heading + 10 logos at equal height.
- Continuous marquee (pause on hover) or 5×2 grid; optional grayscale → colour on hover.

### G. Problem cards (3)
- Centered H3.
- 3 equal cards: icon, H4, 3 bullets written as questions.
- Use a "concern" bullet marker (not a check mark).
- 3 cols → stacked on mobile.

### H. Benefits grid (7)
- H3 with emphasised word + intro paragraph.
- Icon card: SVG icon, H4, 2-line description.
- 7 is odd: use 4+3 and centre the last row.

### I. Services zig-zag (4)
- Eyebrow label + H3.
- Checkerboard: `[image | text] [text | image] [image | text] [text | image]`.
- Text = H4 + short paragraph.
- Mobile: image above text, every block.
- Closing **CTA strip:** one sentence + text link.

### J. About block
- Eyebrow + H2, 5 capability bullets, 5-image collage (mosaic), 2 paragraphs, text link.
- Desktop: text column beside image mosaic.

### K. Why choose us (6)
- Same icon-card pattern as H; 3×2 desktop, 2×3 tablet, 1 col mobile.

### L. Process stepper (5)
- H3 + subtitle.
- Each step: large numeral, icon, H4, short paragraph.
- Desktop: horizontal with connecting line/arrows. Mobile: vertical timeline.

### M. "Not a fit" callout
- H3 + one-sentence intro + 3 bullets with ✕/minus markers.
- Calm tinted/bordered box, not an alert banner.

### N. Feature block
- Large image one side; H3 + paragraph; 2×2 grid of sub-items (H4 + one line).

### O. FAQ accordion (8)
- H3, then 8 rows; question as button with +/− or chevron, answer 1–2 sentences.
- `aria-expanded`, animated height, one open at a time.

### P. Footer
- Columns: brand (logo, one-line description, 4 social icons) · Top Links (5) · Product list (10) · Contact (2 phones, 2 emails) · 2 addresses.
- Bottom bar: copyright + credit line.
- Dark or deep brand background, light text. 4–5 cols → 2 → 1.

### Q. Floating actions
- Two circular icon buttons (call, chat), bottom-right, 48–56px, shadow, chat in green.
- Paired CTA bar ("Enquire" + "View products") sticky at bottom on mobile.

### R. Modal
- Title, helper sentence, close ×, fields, submit button.
- Loading overlay text: "Sending… please wait".
- Backdrop, centered card, focus trap, Esc to close, success/error message.

---

## 5. Components

| Component | Spec |
|---|---|
| Primary pill button | Solid `--color-cta` (#ED3500), white text, pill radius, hover darken |
| Secondary button | Solid `--color-primary` (#163B5C) or outline in navy; hover `--color-accent-dark` |
| Uppercase button | Same + letter-spacing |
| Text link | `--color-primary` or `--color-accent-dark` + arrow, underline on hover |
| Icon card | 64px SVG, H4, short text, radius 16, soft shadow, 24–32px padding |
| Persona card | Icon, H4, 3 bullets |
| Image tile | Rounded image, hover zoom |
| Stat block | Number + label, no border |
| Badge strip | Equal-height images, even gaps |
| Logo marquee | Single row, equal height |
| Stepper | Numbered circle + connector line |
| Accordion | Button header + collapsible panel |
| Dropdown | Panel under nav item |
| Modal | Backdrop + card + form + loader |
| Floating button | Circle, fixed, shadow |

States for every interactive item: default, hover, focus-visible (2px outline), active, disabled, loading.

---

## 6. Imagery & icons [PATTERN]

- Photos in WebP; hero 1920×750.
- Custom SVG line/flat icons, one per card, one consistent stroke weight.
- Client logos normalised to one height.
- Descriptive alt text on every image.

---

## 7. Motion

| Element | Behaviour |
|---|---|
| Hero | Auto slider / crossfade |
| Header | Sticky, shadow on scroll |
| Dropdown | Hover/tap open |
| Tiles | Hover lift/zoom |
| Stats | Count-up in view |
| Logo wall | Marquee |
| Cards | Fade/slide-up on scroll |
| FAQ | Expand/collapse |
| Modal | Fade in |

Honour `prefers-reduced-motion`.

---

## 8. Responsive summary

| Area | Desktop | Tablet | Mobile |
|---|---|---|---|
| Top bar | tagline + contacts | same | tagline only |
| Nav | inline + dropdown | inline/burger | burger drawer |
| Stats | 4 across | 4 / 2×2 | 2×2 |
| Mosaic | 4–5 cols | 3 | 2 |
| Cards | 3–4 cols | 2 | 1 |
| Zig-zag | side by side | same | stacked |
| Process | horizontal | 2–3 cols | vertical |
| Footer | 4–5 cols | 2 | 1 |

---

## 9. Accessibility

- Contrast ≥ 4.5:1 body, 3:1 large text/UI.
- Visible focus ring; keyboard-operable dropdown and accordion.
- Modal focus trap + Esc; return focus on close.
- Slider has pause control.
- `aria-label` on icon-only buttons; decorative SVGs `aria-hidden`.
- Keep pinch-zoom enabled.

---

## 10. Starter skeleton

```html
<body>
  <div class="topbar"></div>
  <header class="site-header">
    <a class="logo"></a>
    <nav><a></a><a></a><div class="dropdown"><a></a><ul></ul></div><a></a></nav>
    <a class="btn btn-primary"></a>
  </header>
  <main>
    <section class="hero"><div class="slides"></div><ul class="badge-strip"></ul></section>
    <section class="intro"><h1></h1><h2><em></em></h2><dl class="stats"></dl></section>
    <section class="mosaic"></section>
    <section class="logo-wall"></section>
    <section class="problems"></section>
    <section class="benefits"></section>
    <section class="services zigzag"></section>
    <section class="about"></section>
    <section class="why"></section>
    <section class="process"><ol></ol></section>
    <section class="not-a-fit"></section>
    <section class="feature"></section>
    <section class="faq"></section>
  </main>
  <footer></footer>
  <div class="float-actions"></div>
  <div class="cta-bar"></div>
  <div class="modal" role="dialog" aria-modal="true"></div>
</body>
```
