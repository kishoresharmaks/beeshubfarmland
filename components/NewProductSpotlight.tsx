'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  Leaf,
  FlaskConical,
  Sprout,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ShoppingBag,
  Sun,
  Truck,
} from 'lucide-react';

export interface SpotlightBenefit {
  icon: string;
  text: string;
}

export interface SpotlightData {
  productId?: string;
  productName: string;
  badgeText?: string;
  headingPrefix?: string;
  productTitle?: string;
  shortDescription?: string;
  productImage?: string;
  benefits?: SpotlightBenefit[];
  ctaLabel?: string;
  ctaLink?: string;
  price?: number;
  mrp?: number;
  discount?: number;
  gst?: number;
  quantity?: number;
  inStock?: boolean;
  variants?: any[];
}

interface NewProductSpotlightProps {
  data?: SpotlightData | null;
  onSelectProduct?: (productId: string) => void;
}

/**
 * Premium New Product Spotlight Banner for BeesHub Farmland.
 * Sits immediately below the navigation header and above the hero section.
 * Production-ready, mobile-first, accessible, and optimized for Core Web Vitals (LCP/CLS) and SEO.
 */
export default function NewProductSpotlight({
  data,
  onSelectProduct,
}: NewProductSpotlightProps) {
  if (!data) return null;

  const {
    productId = '',
    badgeText = 'NEW ARRIVAL ✨',
    headingPrefix = 'Introducing Our',
    productTitle = 'Pure Forest Honey',
    shortDescription = 'Raw, unprocessed and 100% natural honey directly from trusted farm beekeepers in Western Ghats, Kanyakumari.',
    productImage = '/images/beeshub-pure-forest-honey-spotlight.webp',
    benefits = [
      { icon: 'natural', text: '100% Natural' },
      { icon: 'additives', text: 'No Additives' },
      { icon: 'farm', text: 'Farm Sourced' },
    ],
    ctaLabel = 'Shop New Product',
    ctaLink = productId ? `/product/${productId}` : '/',
    price = 399,
    mrp = 499,
    discount = 20,
    inStock = true,
  } = data;

  // Track spotlight impression in PostHog
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('product_spotlight_view', {
          product_id: productId,
          product_name: productTitle,
          price,
          in_stock: inStock,
        });
      }
    } catch (err) {
      // Ignore analytics errors
    }
  }, [productId, productTitle, price, inStock]);

  const handleCtaClick = (e: React.MouseEvent) => {
    try {
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('product_spotlight_click', {
          product_id: productId,
          product_name: productTitle,
          cta_label: ctaLabel,
          target_url: ctaLink,
        });
      }
    } catch (err) {
      // Ignore analytics errors
    }

    if (onSelectProduct && productId) {
      e.preventDefault();
      onSelectProduct(productId);
    }
  };

  const renderBenefitIcon = (iconType: string) => {
    const norm = iconType?.toLowerCase() || '';
    if (norm.includes('add') || norm.includes('shield') || norm.includes('safe')) {
      return <FlaskConical className="w-4 h-4 text-amber-600" aria-hidden="true" />;
    }
    if (norm.includes('farm') || norm.includes('bee') || norm.includes('source') || norm.includes('sun')) {
      return <Sprout className="w-4 h-4 text-[#ED3500]" aria-hidden="true" />;
    }
    return <Leaf className="w-4 h-4 text-[#194D33]" aria-hidden="true" />;
  };

  const getIconContainerBg = (iconType: string) => {
    const norm = iconType?.toLowerCase() || '';
    if (norm.includes('add') || norm.includes('shield') || norm.includes('safe')) {
      return 'bg-amber-100/80 border-amber-200/80';
    }
    if (norm.includes('farm') || norm.includes('bee') || norm.includes('source') || norm.includes('sun')) {
      return 'bg-orange-100/80 border-orange-200/80';
    }
    return 'bg-[#EAF5EE] border-[#D1EADC]';
  };

  return (
    <aside
      aria-label="New Product Spotlight Announcement"
      className="w-full bg-[#FFFCFB] border-b border-[#F0E6DD]/90 py-4 sm:py-6 px-4 sm:px-6 lg:px-8 relative z-20"
    >
      {/* Schema.org Microdata for High Search Engine & AI Discoverability */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            '@id': `https://beeshubfarmland.com/product/${productId}#spotlight-product`,
            name: productTitle,
            description: shortDescription,
            image: `https://beeshubfarmland.com${productImage}`,
            brand: {
              '@type': 'Brand',
              name: 'BeesHub Farmland',
            },
            offers: {
              '@type': 'Offer',
              price: price,
              priceCurrency: 'INR',
              availability: inStock
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
              url: `https://beeshubfarmland.com/product/${productId}`,
              seller: {
                '@type': 'Organization',
                name: 'BEES HUB FARMLAND PRIVATE LIMITED',
                telephone: '+919578784431',
              },
            },
          }),
        }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-[#F2E5D5] bg-gradient-to-br from-[#FFF9F4] via-[#FFFAF5] to-[#FDF4E7] shadow-lg shadow-[#163B5C]/[0.03] transition-all hover:shadow-xl hover:shadow-[#163B5C]/[0.06] hover:border-[#ED3500]/30 group">
          
          {/* Subtle Ambient Organic Background Accents */}
          <div
            className="absolute top-0 right-0 w-96 h-96 bg-radial from-[#F59E0B]/10 via-[#ED3500]/5 to-transparent pointer-events-none rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-0 w-80 h-80 bg-radial from-[#10B981]/10 via-transparent to-transparent pointer-events-none rounded-full blur-2xl transform -translate-x-1/3 translate-y-1/3"
            aria-hidden="true"
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-6 sm:gap-8 p-5 sm:p-7 lg:p-9">
            
            {/* ========================================================
                ZONE A: Product Introduction (Heading, Copy, Price, CTA)
                ======================================================== */}
            <div className="lg:col-span-5 space-y-3.5 sm:space-y-4 text-center sm:text-left">
              
              {/* Badge */}
              <div className="flex items-center justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#194D33] text-white text-[11px] sm:text-xs font-black tracking-wider uppercase shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" aria-hidden="true" />
                  <span>{badgeText}</span>
                </span>
              </div>

              {/* Title Header */}
              <div className="space-y-1">
                <span className="block text-lg sm:text-xl font-extrabold text-[#163B5C] tracking-tight">
                  {headingPrefix}
                </span>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#ED3500] tracking-tight leading-tight">
                  {productTitle}
                </p>
              </div>

              {/* Short Description */}
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-lg mx-auto sm:mx-0">
                {shortDescription}
              </p>

              {/* Verified Real Price & Savings */}
              {price > 0 && (
                <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
                  <span className="text-xl sm:text-2xl font-black text-[#163B5C]">
                    ₹{price.toLocaleString('en-IN')}
                  </span>
                  {mrp > price && (
                    <span className="text-xs sm:text-sm text-[#94A3B8] line-through font-semibold">
                      MRP ₹{mrp.toLocaleString('en-IN')}
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/25 text-[#10B981] text-[11px] font-black uppercase tracking-wider">
                      {discount}% OFF
                    </span>
                  )}
                </div>
              )}

              {/* Shop Now CTA Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3">
                <Link
                  href={ctaLink}
                  onClick={handleCtaClick}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#ED3500] hover:bg-[#D02E00] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-md shadow-[#ED3500]/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-3 focus:ring-[#ED3500]/40 group/btn"
                  title={`Shop ${productTitle} from BeesHub Farmland`}
                >
                  <ShoppingBag className="w-4 h-4 transition-transform group-hover/btn:scale-110" aria-hidden="true" />
                  <span>{ctaLabel}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" aria-hidden="true" />
                </Link>

                {inStock ? (
                  <span className="text-[11px] font-bold text-[#10B981] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" aria-hidden="true" />
                    <span>In Stock & Ready to Dispatch</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-rose-600">
                    Currently Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* ========================================================
                ZONE B: Product Benefits (3 Compact Distinct Features)
                ======================================================== */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-3 lg:grid-cols-1 gap-2.5 sm:gap-3">
                {benefits.map((b, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col lg:flex-row items-center gap-2 lg:gap-3 p-2.5 sm:p-3 rounded-2xl bg-white/80 backdrop-blur-xs border border-[#F2E5D5] shadow-2xs hover:border-[#ED3500]/40 transition-colors"
                  >
                    <div
                      className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 ${getIconContainerBg(
                        b.icon
                      )}`}
                    >
                      {renderBenefitIcon(b.icon)}
                    </div>
                    <span className="font-extrabold text-[11px] sm:text-xs text-[#163B5C] text-center lg:text-left leading-tight">
                      {b.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ========================================================
                ZONE C: Product Photography (Commercial Jar & Honeycomb)
                ======================================================== */}
            <div className="lg:col-span-4 flex items-center justify-center relative">
              <Link
                href={ctaLink}
                onClick={handleCtaClick}
                className="relative block w-full max-w-sm sm:max-w-md aspect-[16/10] sm:aspect-[16/11] rounded-2xl overflow-hidden group/img focus:outline-none focus:ring-3 focus:ring-[#ED3500]/40 transition-transform duration-500 hover:scale-[1.02]"
                title={`View ${productTitle} packaging details`}
              >
                {/* Real Commercial Product Photography */}
                <Image
                  src={productImage}
                  alt={`BeesHub Farmland ${productTitle} 500g glass jar with natural golden honeycomb and wooden honey dipper`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                  className="object-cover object-center rounded-2xl shadow-md transition-transform duration-700 group-hover/img:scale-105"
                  priority={true}
                  fetchPriority="high"
                />

                {/* Subtle shine overlay */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity rounded-2xl pointer-events-none"
                  aria-hidden="true"
                />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </aside>
  );
}
