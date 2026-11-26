import { Product } from '@/context/StoreContext';

/**
 * Priority rank for homepage featured products:
 * 1: Dates Powder (dates + powder, excluding coffee)
 * 2: Dates Coffee Powder (dates + coffee)
 * 3: Combined Beetroot Banana Powder (or individual Beetroot & Banana powders)
 * 4: Beetroot Powder (if no combined powder)
 * 5: Banana Powder (if no combined powder)
 * 6: Other Dates items (e.g., Black Dry Dates)
 * 99: All other products
 */
export function getFeaturedPriority(product: Product): number {
  const name = (product.name || '').toLowerCase();
  const desc = (product.description || '').toLowerCase();

  const hasDates = /\bdates?\b/.test(name) || name.includes('dates');
  const hasPowder = name.includes('powder');
  const hasCoffee = name.includes('coffee');
  const hasBeetroot = name.includes('beetroot') || name.includes('beet root');
  const hasBanana = name.includes('banana') || name.includes('bana');

  // 1. Dates Powder (Natural / Raw, not coffee)
  if (hasDates && hasPowder && !hasCoffee) return 1;

  // 2. Dates Coffee Powder
  if (hasDates && hasCoffee) return 2;

  // 3. Combined Beetroot + Banana Powder
  if (hasBeetroot && hasBanana) return 3;

  // 4. Standalone Beetroot Powder
  if (hasBeetroot && hasPowder) return 4;

  // 5. Standalone Banana Powder (Nendran / Red Banana)
  if (hasBanana && hasPowder) return 5;

  // 6. Other Dates products (e.g. Black dry Dates)
  if (hasDates || /\bdates?\b/.test(desc)) return 6;

  return 99;
}

/**
 * Selects and orders the targeted Dates & Beetroot-Banana products from the admin catalog.
 * Priority order:
 * Dates Powder -> Dates Coffee Powder -> Beetroot Banana Powder -> Other Dates items.
 */
export function getTargetedHomepageProducts(products: Product[]): Product[] {
  if (!Array.isArray(products) || products.length === 0) return [];

  const matched = products
    .filter((p) => getFeaturedPriority(p) < 99)
    .sort((a, b) => getFeaturedPriority(a) - getFeaturedPriority(b));

  return matched;
}

/**
 * Sorts a product list so targeted featured products appear first while preserving relative order.
 */
export function sortProductsWithFeaturedFirst(products: Product[]): Product[] {
  return [...products].sort((a, b) => getFeaturedPriority(a) - getFeaturedPriority(b));
}
