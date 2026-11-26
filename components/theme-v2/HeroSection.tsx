'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Briefcase, ShoppingBag } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

/**
 * Section 3: High-Impact Static Hero Section
 * Replaces the multi-slide carousel with one focused editorial hero serving both B2C and B2B audiences.
 * Contains the single primary H1 on the homepage.
 */
export default function HeroSection() {
  const { openQuoteModal } = useStore();

  return (
    <section className="relative w-full bg-[#102E20] text-white overflow-hidden">
      {/* Background Agricultural Photography with Dark Readability Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/beeshub-pure-forest-honey-spotlight.webp"
          alt="Pure raw forest honey and natural farm produce from Bees Hub Farmland in Kanyakumari"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center sm:object-[68%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#102E20]/95 via-[#102E20]/82 to-[#102E20]/45" />
      </div>

      <div className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-28">
        <div className="max-w-2xl space-y-6">
          <p className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F7F4EB]/12 border border-[#F7F4EB]/25 text-[#F7F4EB] text-xs font-medium tracking-wide backdrop-blur-xs">
            Naturally Sourced. Carefully Processed. Trusted for Quality.
          </p>

          <h1 className="font-serif font-bold text-3xl sm:text-5xl lg:text-[52px] leading-[1.12] tracking-tight text-white">
            Farm-Sourced Honey, Superfood Powders &amp; Natural Products
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-[#E8EFE6] leading-relaxed max-w-xl">
            Discover farm-sourced honey, superfood powders and cold-pressed oils from Bees Hub Farmland in Kanyakumari, Tamil Nadu. Quality-focused products for everyday customers and growing businesses.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <Link
              href="#featured-products"
              className="px-7 py-3.5 rounded-full bg-[#F7F4EB] hover:bg-white text-[#102E20] font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2 shadow-sm"
            >
              <ShoppingBag className="w-4 h-4 text-[#173F2B]" />
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={() => openQuoteModal(undefined, 'WHOLESALE')}
              className="px-7 py-3.5 rounded-full bg-[#A97843] hover:bg-[#936535] text-white font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2 shadow-sm"
            >
              <Briefcase className="w-4 h-4" />
              <span>Wholesale Enquiry</span>
            </button>
          </div>

          <div className="pt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#E8EFE6]/90 border-t border-white/15">
            <span>Direct Retail Packs · Online &amp; COD</span>
            <span className="hidden sm:inline text-white/30" aria-hidden="true">•</span>
            <span>Bulk Drums &amp; 25kg Lots · Private Label Bottling</span>
          </div>
        </div>
      </div>
    </section>
  );
}
