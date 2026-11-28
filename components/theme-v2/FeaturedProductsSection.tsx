'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus,
  Eye,
  ArrowRight,
  Leaf,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react';
import { useStore, Product } from '@/context/StoreContext';
import {
  formatProductDisplayName,
  getProductSlugUrl,
  extractPackSize,
  normalizeStoreCategory,
  isEnquiryOnlyProduct,
} from '@/lib/productFormatting';
import SocialShareBar from './SocialShareBar';

/**
 * Selects up to 8 diverse, best-selling products without duplicates.
 */
function pickFeaturedShowcase(products: Product[], activeTab: string): Product[] {
  const pool =
    activeTab === 'All'
      ? products
      : products.filter((p) => normalizeStoreCategory(p) === activeTab);

  if (activeTab !== 'All') {
    return pool.slice(0, 8);
  }

  // Prioritize enquiry-only products and distinct flagship lines across honey, powders, oils, and wellness
  const priorityMatchers: Array<(p: Product) => boolean> = [
    (p) => isEnquiryOnlyProduct(p, p.variants?.[0]),
    (p) => p.name.toLowerCase().includes('forest honey'),
    (p) => p.name.toLowerCase().includes('dates powder natural'),
    (p) => p.name.toLowerCase().includes('dates coffee'),
    (p) => p.name.toLowerCase().includes('nendran') && p.name.toLowerCase().includes('200'),
    (p) => p.name.toLowerCase().includes('red banana') && p.name.toLowerCase().includes('200'),
    (p) => p.name.toLowerCase().includes('coconut oil'),
    (p) => p.name.toLowerCase().includes('sesame oil'),
    (p) => p.name.toLowerCase().includes('makhana') && p.name.includes('6'),
    (p) => p.name.toLowerCase().includes('moring') && p.name.toLowerCase().includes('200'),
    (p) => p.name.toLowerCase().includes('sweet potato') && !p.name.toLowerCase().includes('1068'),
    (p) => p.name.toLowerCase().includes('groundnut'),
  ];

  const picked: Product[] = [];
  const usedIds = new Set<string>();

  for (const matchFn of priorityMatchers) {
    if (picked.length >= 8) break;
    const found = pool.find((p) => !usedIds.has(p._id) && matchFn(p));
    if (found) {
      picked.push(found);
      usedIds.add(found._id);
    }
  }

  for (const p of pool) {
    if (picked.length >= 8) break;
    if (!usedIds.has(p._id)) {
      picked.push(p);
      usedIds.add(p._id);
    }
  }

  return picked;
}

export function StorefrontProductCard({
  product,
  hidePrice = false,
}: {
  product: Product;
  hidePrice?: boolean;
}) {
  const { addToCart, setQuickViewProduct, openQuoteModal } = useStore();
  const variants = product.variants && product.variants.length > 0 ? product.variants : [];
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [imgSrc, setImgSrc] = useState(product.image || '/images/beeshub-logo.png');

  const activeVariant = variants[selectedVariantIdx];
  const displayPrice = activeVariant ? activeVariant.price : product.price;
  const displayMrp = activeVariant ? activeVariant.mrp : product.mrp;
  const availableStock = activeVariant ? activeVariant.quantity : product.quantity;
  const enquiryOnly = isEnquiryOnlyProduct(product, activeVariant);
  const discount =
    enquiryOnly
      ? 0
      : activeVariant?.discount && activeVariant.discount > 0
      ? activeVariant.discount
      : displayMrp && displayMrp > displayPrice
      ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100)
      : product.discount || 0;

  const displayName = formatProductDisplayName(product.name);
  const packSize = activeVariant ? extractPackSize(undefined, [activeVariant]) : extractPackSize(product.name);
  const categoryLabel = normalizeStoreCategory(product);
  const productUrl = getProductSlugUrl(product);

  return (
    <article className="bg-white rounded-2xl border border-[#E4E7E1] shadow-card hover:shadow-hover hover:border-[#173F2B]/35 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Product Image */}
        <div className="relative aspect-square bg-[#F7F4EB]/55 border-b border-[#E4E7E1] p-4 flex items-center justify-center rounded-t-2xl">
          <Link href={productUrl} className="relative w-full h-full block overflow-hidden rounded-xl">
            {imgSrc ? (
              <Image
                src={imgSrc}
                alt={displayName}
                fill
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 280px"
                className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                onError={() => setImgSrc('/images/beeshub-logo.png')}
              />
            ) : (
              <Leaf className="w-12 h-12 text-[#6B756B]/40 m-auto" />
            )}
          </Link>

          {!hidePrice && discount > 0 && (
            <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#173F2B] text-white text-[10px] font-bold tracking-wide">
              {discount}% OFF
            </span>
          )}

          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <SocialShareBar
              title={displayName}
              description={product.description}
              path={productUrl}
              compact
            />
            <button
              type="button"
              onClick={() => setQuickViewProduct(product)}
              className="w-8 h-8 rounded-full bg-white/95 hover:bg-[#173F2B] text-[#202820] hover:text-white border border-[#E4E7E1] shadow-xs flex items-center justify-center transition-colors"
              title={`Quick view ${displayName}`}
              aria-label={`Quick view ${displayName}`}
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="p-4 sm:p-5 space-y-2.5">
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="font-medium text-[#A97843] truncate">{categoryLabel}</span>
            <span
              className={`font-semibold shrink-0 flex items-center gap-1 ${
                enquiryOnly
                  ? 'text-[#A97843]'
                  : availableStock > 0
                  ? 'text-[#173F2B]'
                  : 'text-rose-700'
              }`}
            >
              {enquiryOnly ? (
                <>
                  <MessageCircle className="w-3 h-3" />
                  <span>Enquiry Only</span>
                </>
              ) : availableStock > 0 ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>In Stock</span>
                </>
              ) : (
                <span>Out of Stock</span>
              )}
            </span>
          </div>

          <h3 className="font-serif font-semibold text-base text-[#202820] leading-snug line-clamp-2 min-h-[2.75rem]">
            <Link href={productUrl} className="hover:text-[#173F2B] transition-colors">
              {displayName}
            </Link>
          </h3>

          <p className="text-xs text-[#6B756B] line-clamp-2 leading-relaxed min-h-[2.25rem]">
            {product.description?.replace(/\s+/g, ' ').trim() ||
              '100% pure farm-sourced agricultural product from Bees Hub Farmland.'}
          </p>

          {/* Variant selector or Pack Size Pill */}
          {variants.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {variants.map((v, idx) => (
                <button
                  key={v._id || v.name || idx}
                  type="button"
                  onClick={() => setSelectedVariantIdx(idx)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                    idx === selectedVariantIdx
                      ? 'bg-[#173F2B] text-white border-[#173F2B]'
                      : 'bg-[#F7F4EB] text-[#202820] border-[#E4E7E1] hover:border-[#173F2B]/50'
                  }`}
                >
                  {/^\d+$/.test(v.name.trim()) ? `${v.name.trim()}g` : v.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="pt-1">
              <span className="inline-block px-2.5 py-0.5 rounded-lg bg-[#F7F4EB] border border-[#E4E7E1] text-[11px] font-medium text-[#202820]">
                Pack: {packSize}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Pricing & Actions */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 border-t border-[#E4E7E1] space-y-3">
        {!hidePrice && (
          <div className="flex items-baseline gap-2">
            {enquiryOnly ? (
              <span className="font-semibold text-sm text-[#173F2B]">
                Price on Enquiry
              </span>
            ) : (
              <>
                <span className="font-bold text-lg text-[#202820]">
                  ₹{displayPrice.toLocaleString('en-IN')}
                </span>
                {displayMrp && displayMrp > displayPrice && (
                  <span className="text-xs text-[#6B756B] line-through">
                    ₹{displayMrp.toLocaleString('en-IN')}
                  </span>
                )}
              </>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Link
            href={productUrl}
            className="py-2.5 px-3 rounded-full border border-[#E4E7E1] hover:border-[#173F2B] text-[#202820] hover:text-[#173F2B] font-semibold text-xs text-center transition-colors"
          >
            View Product
          </Link>

          {enquiryOnly ? (
            <button
              type="button"
              onClick={() => openQuoteModal(product.name, 'GENERAL', product._id, activeVariant?.name)}
              className="py-2.5 px-3 rounded-full bg-[#A97843] hover:bg-[#173F2B] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Click to Enquire</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={availableStock <= 0}
              onClick={() => addToCart(product, 1, activeVariant)}
              className="py-2.5 px-3 rounded-full bg-[#173F2B] hover:bg-[#102E20] disabled:bg-slate-200 disabled:text-slate-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{availableStock > 0 ? 'Add to Cart' : 'Sold Out'}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * Section 6: Featured and Best-Selling Products
 * Displays 8 curated products fetched live from MongoDB with variant support, loading skeletons,
 * empty/error states, and View All Products CTA.
 */
export default function FeaturedProductsSection() {
  const { products, loadingProducts, catalogError, refetchCatalog } = useStore();
  const [activeTab, setActiveTab] = useState('All');

  const filterTabs = [
    'All',
    'Natural Honey',
    'Superfood Powders',
    'Cold-Pressed Oils',
    'Dehydrated Products',
    'Other Farm Products',
  ];

  const visibleProducts = useMemo(
    () => pickFeaturedShowcase(products, activeTab),
    [products, activeTab]
  );

  return (
    <section id="featured-products" className="w-full py-14 sm:py-20 bg-[#F7F4EB]/45 border-b border-[#E4E7E1]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-10">
        {/* Header & Filter Pills */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#A97843]">
              Direct Storefront
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-[#202820] tracking-tight">
              Featured &amp; Best-Selling Products
            </h2>
            <p className="text-sm text-[#6B756B]">
              Authentic farm-sourced honey, superfood powders, and cold-pressed oils ready for retail order or sample evaluation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 min-w-0">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'bg-[#173F2B] text-white'
                    : 'bg-white text-[#6B756B] border border-[#E4E7E1] hover:border-[#173F2B]/50 hover:text-[#202820]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid / States */}
        {loadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-[420px] rounded-2xl bg-white border border-[#E4E7E1] p-4 space-y-4 animate-pulse"
              >
                <div className="aspect-square rounded-xl bg-[#E8EFE6]/60" />
                <div className="h-4 w-2/3 bg-[#E8EFE6] rounded" />
                <div className="h-3 w-full bg-[#F7F4EB] rounded" />
                <div className="h-9 w-full bg-[#E8EFE6]/70 rounded-full mt-4" />
              </div>
            ))}
          </div>
        ) : catalogError ? (
          <div className="py-14 px-6 text-center bg-white rounded-2xl border border-[#E4E7E1] space-y-3">
            <AlertCircle className="w-8 h-8 text-[#A97843] mx-auto" />
            <h3 className="font-serif font-bold text-lg text-[#202820]">
              Unable to load products
            </h3>
            <p className="text-xs sm:text-sm text-[#6B756B] max-w-md mx-auto">
              {catalogError}
            </p>
            <button
              type="button"
              onClick={refetchCatalog}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#173F2B] text-white text-xs font-semibold hover:bg-[#102E20] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="py-14 px-6 text-center bg-white rounded-2xl border border-[#E4E7E1] space-y-3">
            <Leaf className="w-8 h-8 text-[#6B756B] mx-auto" />
            <h3 className="font-serif font-bold text-lg text-[#202820]">
              No products available in this category
            </h3>
            <p className="text-xs sm:text-sm text-[#6B756B]">
              Try selecting another category or view our complete catalog.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('All')}
              className="px-5 py-2 rounded-full bg-[#173F2B] text-white text-xs font-semibold"
            >
              Show All Featured
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {visibleProducts.map((product) => (
              <StorefrontProductCard key={product._id} product={product} hidePrice />
            ))}
          </div>
        )}

        {/* View All Products CTA */}
        <div className="pt-2 flex justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#173F2B] hover:bg-[#102E20] text-white font-semibold text-sm transition-colors shadow-sm"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
