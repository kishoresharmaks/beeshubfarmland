/**
 * Product display formatting, category normalization, pack-size extraction & SEO slug helpers.
 * Strips internal admin suffixes (e.g. "_Shyn&Dev", "_Raw") and corrects common spelling variants
 * in customer-facing titles while preserving accurate product identity.
 */

export function formatProductDisplayName(rawName?: string | null): string {
  if (!rawName) return '';
  let clean = rawName
    // Remove internal brand/vendor tag "_Shyn&Dev" or "Shyn&Dev"
    .replace(/[_\s-]*Shyn\s*&\s*Dev/gi, '')
    // Normalize "_Raw" or "- Raw" to "(Raw)"
    .replace(/[_\s-]+Raw\b/gi, ' (Raw)')
    // Normalize weight/volume suffixes like "- 250 Gm", "-200 Gm", "- 1 Ltr", "- 1 Lt"
    .replace(/\s*-\s*(\d+)\s*(Gm|Gms|Kg|Ltr|Lt|Ml)\b/gi, (_, num, unit) => {
      const u = unit.toLowerCase();
      const normalizedUnit =
        u === 'gm' || u === 'gms' ? 'g' : u === 'ltr' || u === 'lt' ? 'L' : u === 'kg' ? 'kg' : 'ml';
      return ` (${num}${normalizedUnit})`;
    })
    // Normalize bare trailing numbers like "Jaggery Powder - 500" or "Beetroot Powder - 150"
    .replace(/\s*-\s*(150|200|250|450|500)\s*$/i, (_, num) => ` (${num}g)`)
    // Fix common catalog typos
    .replace(/\bMoringai\b/gi, 'Moringa')
    .replace(/\bGroundnuts\b/gi, 'Groundnut')
    .replace(/\bHimalaya\s+Pink\s+Salt\b/gi, 'Himalayan Pink Salt')
    .replace(/\bBlack\s+dry\s+Dates\b/gi, 'Black Dry Dates')
    .replace(/\bMakhana\s*_\s*Fox\s*Nut\s*-\s*(\d+)\b/gi, 'Jumbo Makhana Fox Nut (Grade $1)')
    .replace(/\bMakhana\s+Fox\s*Nut\s*-\s*(\d+)\b/gi, 'Jumbo Makhana Fox Nut (Grade $1)')
    .replace(/\bBanana\s+Powder\s+Nendran\b/gi, 'Nendran Banana Powder')
    .replace(/^Soaps$/i, 'Handcrafted Botanical Herbal Soap')
    // Replace remaining underscores with spaces
    .replace(/_/g, ' ')
    // Collapse multiple spaces
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Remove trailing lone hyphens
  clean = clean.replace(/\s*-\s*$/, '').trim();
  return clean || rawName;
}

/**
 * Extracts a clean pack size label from product variants or raw product name.
 */
export function extractPackSize(
  rawName?: string | null,
  variants?: Array<{ name?: string }>
): string {
  if (Array.isArray(variants) && variants.length > 0 && variants[0]?.name) {
    const raw = variants[0].name.trim();
    return /^\d+$/.test(raw) ? `${raw}g` : raw;
  }
  if (!rawName) return 'Standard Pack';
  const weightMatch = rawName.match(/(\d+)\s*(Gm|Gms|Kg|Ltr|Lt|Ml|g)\b/i);
  if (weightMatch) {
    const num = weightMatch[1];
    const u = weightMatch[2].toLowerCase();
    const unit = u === 'gm' || u === 'gms' || u === 'g' ? 'g' : u === 'ltr' || u === 'lt' ? 'L' : u === 'kg' ? 'kg' : 'ml';
    return `${num}${unit}`;
  }
  const bareMatch = rawName.match(/\b(150|200|250|450|500)\s*$/);
  if (bareMatch) return `${bareMatch[1]}g`;
  if (rawName.toLowerCase().includes('capsule')) return 'Per Capsule / Bulk';
  if (rawName.toLowerCase().includes('oil')) return '1L';
  return 'Standard Pack';
}

/**
 * Maps raw database categories into clean, customer-friendly storefront categories.
 */
export const STORE_CATEGORIES = [
  {
    id: 'Natural Honey',
    label: 'Natural Honey',
    description: 'Raw, unprocessed forest honey harvested from Western Ghats apiaries.',
    image: '/images/beeshub-pure-forest-honey-spotlight.webp',
  },
  {
    id: 'Superfood Powders',
    label: 'Superfood Powders',
    description: 'Solar-dehydrated Nendran banana, red banana, dates, moringa, and beetroot powders.',
    image: '/images/products/dates-powder-natural.jpg',
  },
  {
    id: 'Cold-Pressed Oils',
    label: 'Cold-Pressed Oils',
    description: 'Traditional wood-pressed virgin coconut, sesame, and groundnut oils.',
    image: '/images/products/coconut-oil.png',
  },
  {
    id: 'Dehydrated Products',
    label: 'Dehydrated Products',
    description: 'Nutrient-dense dehydrated fruit and root powders milled for culinary & infant use.',
    image: '/images/products/banana-powder.png',
  },
  {
    id: 'Natural Food Ingredients',
    label: 'Natural Food Ingredients',
    description: 'Unrefined dates coffee, organic jaggery powder, dry dates, and mineral salts.',
    image: '/images/products/dates-coffee.jpg',
  },
  {
    id: 'Other Farm Products',
    label: 'Other Farm Products',
    description: 'Jumbo fox nut makhana, moringa leaf capsules, and botanical herbal soaps.',
    image: '/images/products/makhana.jpg',
  },
] as const;

export function normalizeStoreCategory(product: { name?: string; category?: string }): string {
  const name = (product.name || '').toLowerCase();
  const cat = (product.category || '').toLowerCase();

  if (name.includes('honey')) return 'Natural Honey';
  if (cat === 'oil' || name.includes('oil')) return 'Cold-Pressed Oils';
  if (
    name.includes('makhana') ||
    name.includes('capsule') ||
    name.includes('soap') ||
    cat === 'soap'
  ) {
    return 'Other Farm Products';
  }
  if (
    name.includes('salt') ||
    name.includes('jaggery') ||
    name.includes('dry dates') ||
    name.includes('coffee')
  ) {
    return 'Natural Food Ingredients';
  }
  if (
    name.includes('banana') ||
    name.includes('sweet potato') ||
    name.includes('pineapple')
  ) {
    return 'Dehydrated Products';
  }
  if (
    cat.includes('powder') ||
    name.includes('powder') ||
    name.includes('moringa') ||
    name.includes('beetroot') ||
    name.includes('carrot') ||
    name.includes('dates')
  ) {
    return 'Superfood Powders';
  }
  return 'Other Farm Products';
}

export function slugifyProduct(rawName: string): string {
  const display = formatProductDisplayName(rawName);
  return display
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getProductSlugUrl(product: { _id?: string; name: string }): string {
  const slug = slugifyProduct(product.name);
  if (slug) {
    return `/product/${slug}`;
  }
  return product._id ? `/product/${product._id}` : '/shop';
}

/**
 * Formats a variant label (e.g., bare numeric grams like "250" -> "250g").
 */
export function formatVariantLabel(rawVariant?: string | null): string {
  if (!rawVariant) return '';
  const trimmed = rawVariant.trim();
  return /^\d+$/.test(trimmed) ? `${trimmed}g` : trimmed;
}

/**
 * Returns true when a product (or its active variant) has price <= 0
 * and must be purchased through direct enquiry rather than online checkout.
 */
export function isEnquiryOnlyProduct(
  product?: { price?: number | null } | null,
  variant?: { price?: number | null } | null
): boolean {
  const resolvedPrice =
    variant && variant.price !== undefined && variant.price !== null
      ? Number(variant.price)
      : Number(product?.price ?? 0);
  return !Number.isFinite(resolvedPrice) || resolvedPrice <= 0;
}
