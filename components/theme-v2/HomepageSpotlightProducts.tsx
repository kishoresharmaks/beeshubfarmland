'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Award,
  Building2,
  CheckCircle2,
  Download,
  FileText,
  FlaskConical,
  Leaf,
  Package,
  ShieldCheck,
  Tag,
  Truck,
  Users,
} from 'lucide-react';
import { useStore, Product } from '@/context/StoreContext';
import {
  formatProductDisplayName,
  getProductSlugUrl,
  normalizeStoreCategory,
} from '@/lib/productFormatting';

const BOTTOM_TRUST_ITEMS = [
  {
    icon: Users,
    title: 'Ideal for Distributors,',
    subtitle: 'Retail Chains & Food Businesses',
  },
  {
    icon: Leaf,
    title: 'Farm-to-Bulk Supply',
    subtitle: 'with Traceability',
  },
  {
    icon: Award,
    title: 'Quality & Food Safety',
    subtitle: 'Compliance',
  },
  {
    icon: Truck,
    title: 'Pan-India',
    subtitle: 'Bulk Logistics',
  },
];

function HomepageSpotlightCard({ product }: { product: Product }) {
  const { openQuoteModal } = useStore();
  const [imgSrc, setImgSrc] = useState(product.image || '/images/beeshub-logo.png');

  const displayName = formatProductDisplayName(product.name);
  const categoryLabel = normalizeStoreCategory(product);
  const productUrl = getProductSlugUrl(product);
  const hasCoa = Boolean(product.coaUrl && product.coaUrl.trim());
  const coaViewUrl = product.coaUrl || '';
  const coaDownloadUrl = hasCoa
    ? `${coaViewUrl}${coaViewUrl.includes('?') ? '&' : '?'}download=1`
    : '';

  const qualityChecklist = [
    { lead: 'Sourced from', bold: 'Kanyakumari farmlands' },
    { lead: '', bold: 'Consistent quality & bulk availability' },
    { lead: 'Hygienically processed &', bold: 'packed' },
    { lead: '', bold: 'Custom packing & private label support' },
    hasCoa
      ? { lead: 'Lab-tested with', bold: 'Certificate of Analysis (COA)' }
      : { lead: 'Batch', bold: 'Certificate of Analysis (COA) on request' },
  ];

  const supplyIndicators = [
    {
      icon: Leaf,
      title: 'Farm-Sourced',
      subtitle: 'Raw Material',
    },
    {
      icon: FlaskConical,
      title: 'Lab Tested',
      subtitle: hasCoa ? '(COA Available)' : '(COA on Request)',
    },
    {
      icon: Package,
      title: 'Bulk Supply',
      subtitle: 'for B2B',
    },
    {
      icon: Tag,
      title: 'Custom Packaging',
      subtitle: '& Private Label',
    },
    {
      icon: ShieldCheck,
      title: 'Consistent',
      subtitle: 'Quality',
    },
  ];

  return (
    <article className="group rounded-3xl bg-[#FBF9F4] border border-[#E4E7E1] shadow-card hover:shadow-hover hover:border-[#173F2B]/30 transition-all duration-300 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 p-6 sm:p-8 lg:p-10 items-center">
        {/* Left Column: B2B Product Info, Checklist & Primary Actions */}
        <div className="lg:col-span-6 space-y-5 order-1">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFE6] text-[#173F2B] text-xs font-semibold">
              <Leaf className="w-3.5 h-3.5" />
              <span>Featured Product</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4EAD8] text-[#8F6230] text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              <span>B2B Supply</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-white border border-[#E4E7E1] text-xs font-medium text-[#6B756B]">
              {categoryLabel}
            </span>
          </div>

          {/* Product Title & Description */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-2xl sm:text-3xl lg:text-[34px] text-[#202820] leading-tight tracking-tight">
              <Link href={productUrl} className="hover:text-[#173F2B] transition-colors">
                {displayName}
              </Link>
            </h3>
            <p className="text-sm sm:text-[15px] text-[#555F55] leading-relaxed whitespace-pre-line">
              {product.description?.trim() ||
                'Farm-sourced and hygienically processed at Bees Hub Farmland, Kanyakumari for reliable commercial and bulk supply.'}
            </p>
          </div>

          {/* Sourcing, Processing & Quality Checklist */}
          <ul className="space-y-2.5 pt-1">
            {qualityChecklist.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-[#202820]">
                <CheckCircle2 className="w-4 h-4 text-[#173F2B] shrink-0 mt-0.5" />
                <span>
                  {item.lead ? `${item.lead} ` : ''}
                  <strong className="font-semibold text-[#102E20]">{item.bold}</strong>
                </span>
              </li>
            ))}
          </ul>

          {/* Primary B2B Actions */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => openQuoteModal(product.name, 'WHOLESALE', product._id)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#173F2B] hover:bg-[#102E20] text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
            >
              <Truck className="w-4 h-4 shrink-0" />
              <span>Request Bulk Quote</span>
            </button>

            {hasCoa ? (
              <a
                href={coaDownloadUrl}
                download
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-[#F7F4EB] text-[#173F2B] border border-[#173F2B]/30 text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
              >
                <Download className="w-4 h-4 text-[#173F2B] shrink-0" />
                <span>Download COA</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => openQuoteModal(product.name, 'WHOLESALE', product._id)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-[#F7F4EB] text-[#173F2B] border border-[#173F2B]/30 text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
              >
                <FileText className="w-4 h-4 text-[#173F2B] shrink-0" />
                <span>Request COA</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Large Product Image + Supporting Quality & Supply Indicators */}
        <div className="lg:col-span-6 order-2">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-stretch">
            {/* Large Product Visual */}
            <Link
              href={productUrl}
              className="sm:col-span-7 relative min-h-[280px] sm:min-h-[360px] rounded-2xl bg-white border border-[#E4E7E1] p-5 flex items-center justify-center overflow-hidden shadow-xs"
            >
              {imgSrc ? (
                <Image
                  src={imgSrc}
                  alt={displayName}
                  fill
                  sizes="(max-width: 640px) 92vw, (max-width: 1024px) 50vw, 380px"
                  className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                  onError={() => setImgSrc('/images/beeshub-logo.png')}
                />
              ) : (
                <Leaf className="w-16 h-16 text-[#6B756B]/40" />
              )}
            </Link>

            {/* Supporting Quality & Supply Indicators */}
            <div className="sm:col-span-5 grid grid-cols-1 gap-2.5">
              {supplyIndicators.map((ind) => {
                const Icon = ind.icon;
                return (
                  <div
                    key={ind.title}
                    className="rounded-xl bg-[#F3EFE4]/85 border border-[#E6E0D0] px-3.5 py-2.5 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/80 border border-[#E4E7E1] flex items-center justify-center shrink-0 text-[#173F2B]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 leading-tight">
                      <div className="text-xs font-bold text-[#202820]">
                        {ind.title}
                      </div>
                      <div className="text-[11px] font-medium text-[#555F55]">
                        {ind.subtitle}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * Dynamic Homepage B2B Harvest & Lab COA Showcase (Immediately Below Hero)
 * Renders only real products with `showOnHomepage === true` toggled in Admin.
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
      aria-label="Featured Farm Harvest and Lab COA"
      className="w-full py-12 sm:py-16 bg-gradient-to-b from-[#F7F4EB]/70 via-[#FBF9F4] to-white border-b border-[#E4E7E1]"
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-8">
        {/* Section Header */}
        <div className="space-y-3 max-w-3xl">
          <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#E8EFE6] border border-[#173F2B]/15 text-[11px] font-bold uppercase tracking-wider text-[#173F2B]">
            B2B Supply &bull; Quality Assured
          </span>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-[#202820] tracking-tight leading-tight">
            Featured Farm Harvest &amp; Lab COA
          </h2>
          <p className="text-sm sm:text-[15px] text-[#555F55] leading-relaxed">
            A certified, traceable farm product sourced from our Kanyakumari farms, processed with care and backed by a Certificate of Analysis (COA) for business buyers.
          </p>
        </div>

        {/* Featured Product Cards */}
        <div className="space-y-6">
          {homepageProducts.map((product) => (
            <HomepageSpotlightCard key={product._id} product={product} />
          ))}
        </div>

        {/* Bottom B2B Trust Strip */}
        <div className="rounded-2xl bg-[#FBF9F4] border border-[#E4E7E1] px-5 py-4 sm:px-7 sm:py-5 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 lg:divide-x lg:divide-[#E4E7E1]">
            {BOTTOM_TRUST_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={`flex items-center gap-3 ${idx > 0 ? 'lg:pl-6' : ''}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#E8EFE6] text-[#173F2B] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="leading-snug">
                    <div className="text-xs font-bold text-[#202820]">{item.title}</div>
                    <div className="text-[11px] font-medium text-[#555F55]">{item.subtitle}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
