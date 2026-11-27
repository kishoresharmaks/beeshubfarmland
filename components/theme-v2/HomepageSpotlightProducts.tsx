'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FileText,
  Download,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  Leaf,
} from 'lucide-react';
import { useStore, Product } from '@/context/StoreContext';
import {
  formatProductDisplayName,
  getProductSlugUrl,
  normalizeStoreCategory,
  extractPackSize,
} from '@/lib/productFormatting';

function HomepageSpotlightCard({ product }: { product: Product }) {
  const { openQuoteModal } = useStore();
  const [imgSrc, setImgSrc] = useState(product.image || '/images/beeshub-logo.png');

  const displayName = formatProductDisplayName(product.name);
  const categoryLabel = normalizeStoreCategory(product);
  const productUrl = getProductSlugUrl(product);
  const packSize = extractPackSize(product.name, product.variants);
  const hasCoa = Boolean(product.coaUrl && product.coaUrl.trim());
  const coaViewUrl = product.coaUrl || '';
  const coaDownloadUrl = hasCoa
    ? `${coaViewUrl}${coaViewUrl.includes('?') ? '&' : '?'}download=1`
    : '';

  return (
    <article className="group rounded-3xl bg-white border border-[#E4E7E1] shadow-card hover:shadow-hover hover:border-[#173F2B]/35 transition-all duration-300 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
        {/* Left Column: Product Details */}
        <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 space-y-5 order-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#E8EFE6] text-[#173F2B] text-xs font-semibold">
              {categoryLabel}
            </span>
            {hasCoa && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7F4EB] border border-[#A97843]/30 text-[#A97843] text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Lab Verified COA</span>
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full bg-[#F7F4EB] border border-[#E4E7E1] text-[11px] font-medium text-[#6B756B]">
              Pack: {packSize}
            </span>
          </div>

          <div className="space-y-2.5">
            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#202820] leading-tight tracking-tight">
              <Link href={productUrl} className="hover:text-[#173F2B] transition-colors">
                {displayName}
              </Link>
            </h3>
            <p className="text-sm sm:text-[15px] text-[#6B756B] leading-relaxed whitespace-pre-line">
              {product.description?.trim() ||
                'Farm-sourced and processed with documented quality controls from Bees Hub Farmland, Kanyakumari.'}
            </p>
          </div>

          {/* Actions & COA Access */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {hasCoa ? (
              <>
                <a
                  href={coaViewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#173F2B] hover:bg-[#102E20] text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
                >
                  <FileText className="w-4 h-4" />
                  <span>View COA</span>
                </a>
                <a
                  href={coaDownloadUrl}
                  download
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#F7F4EB] hover:bg-[#E8EFE6] text-[#173F2B] border border-[#E4E7E1] text-xs sm:text-sm font-semibold transition-colors"
                >
                  <Download className="w-4 h-4 text-[#A97843]" />
                  <span>Download COA</span>
                </a>
              </>
            ) : (
              <button
                type="button"
                onClick={() => openQuoteModal(product.name, 'WHOLESALE', product._id)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#173F2B] hover:bg-[#102E20] text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
              >
                <Briefcase className="w-4 h-4" />
                <span>Request Batch COA</span>
              </button>
            )}

            <Link
              href={productUrl}
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full border border-[#E4E7E1] hover:border-[#173F2B] text-[#202820] hover:text-[#173F2B] text-xs sm:text-sm font-semibold transition-colors group/link"
            >
              <span>View Product</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Right Column: Product Image */}
        <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-[#F7F4EB]/75 via-[#F7F4EB]/40 to-white border-t lg:border-t-0 lg:border-l border-[#E4E7E1] flex items-center justify-center order-2">
          <Link
            href={productUrl}
            className="relative w-full max-w-[400px] aspect-[4/3] sm:aspect-square rounded-2xl bg-white border border-[#E4E7E1] p-5 flex items-center justify-center overflow-hidden shadow-xs"
          >
            {imgSrc ? (
              <Image
                src={imgSrc}
                alt={displayName}
                fill
                sizes="(max-width: 1024px) 90vw, 420px"
                className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                onError={() => setImgSrc('/images/beeshub-logo.png')}
              />
            ) : (
              <Leaf className="w-16 h-16 text-[#6B756B]/40" />
            )}
          </Link>
        </div>
      </div>
    </article>
  );
}

/**
 * Dynamic Homepage Product Showcase Section (Immediately Below Hero)
 * Renders only products with `showOnHomepage === true` toggled in the Admin Panel.
 */
export default function HomepageSpotlightProducts() {
  const { products } = useStore();
  const homepageProducts = products.filter((p) => Boolean(p.showOnHomepage));

  if (homepageProducts.length === 0) {
    return null;
  }

  return (
    <section
      id="homepage-spotlight-products"
      aria-label="Quality Tested Featured Products"
      className="w-full py-12 sm:py-16 bg-[#F7F4EB]/55 border-b border-[#E4E7E1]"
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#A97843]">
              Quality-Verified Spotlight
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-[#202820] tracking-tight">
              Featured Farm Harvest &amp; Lab COA
            </h2>
            <p className="text-sm text-[#6B756B]">
              Inspect batch-tested products highlighted directly from our Kanyakumari processing lines along with their Certificate of Analysis documentation.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {homepageProducts.map((product) => (
            <HomepageSpotlightCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
