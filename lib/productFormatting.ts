/**
 * Product display formatting & SEO slug helpers.
 * Strips internal admin suffixes (e.g. "_Shyn&Dev", "_Raw") from customer-facing titles
 * and generates clean, keyword-rich URL slugs.
 */

export function formatProductDisplayName(rawName?: string | null): string {
  if (!rawName) return '';
  let clean = rawName
    // Remove internal brand/vendor tag "_Shyn&Dev" or "Shyn&Dev"
    .replace(/[_\s-]*Shyn\s*&\s*Dev/gi, '')
    // Normalize "_Raw" or "- Raw" to "(Raw)"
    .replace(/[_\s-]+Raw\b/gi, ' (Raw)')
    // Normalize weight/volume suffixes like "- 250 Gm", "-200 Gm", "- 1 Ltr"
    .replace(/\s*-\s*(\d+)\s*(Gm|Gms|Kg|Ltr|Lt|Ml)\b/gi, (_, num, unit) => {
      const u = unit.toLowerCase();
      const normalizedUnit =
        u === 'gm' || u === 'gms' ? 'g' : u === 'ltr' || u === 'lt' ? 'L' : u === 'kg' ? 'kg' : 'ml';
      return ` (${num}${normalizedUnit})`;
    })
    // Normalize spelling "Moringai" -> "Moringa"
    .replace(/\bMoringai\b/gi, 'Moringa')
    // Replace remaining underscores with spaces
    .replace(/_/g, ' ')
    // Collapse multiple spaces
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Remove trailing lone hyphens
  clean = clean.replace(/\s*-\s*$/, '').trim();
  return clean || rawName;
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
