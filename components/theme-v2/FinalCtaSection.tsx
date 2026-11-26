'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Briefcase, ShoppingBag } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

/**
 * Section 16: Final CTA
 * Editorial closing section inviting retail purchases and B2B bulk enquiries.
 */
export default function FinalCtaSection() {
  const { openQuoteModal } = useStore();

  return (
    <section className="w-full py-14 sm:py-20 bg-[#F7F4EB]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-[#173F2B] text-white px-6 py-12 sm:px-12 sm:py-16 text-center space-y-6 shadow-card">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#E8EFE6]/90">
              Bees Hub Farmland · Kanyakumari
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
              Let&apos;s Build Something Naturally Better.
            </h2>
            <p className="text-sm sm:text-base text-[#E8EFE6] leading-relaxed">
              Order farm-sourced honey, superfood powders, and cold-pressed oils for your home—or partner with our trade desk for bulk supply and private-label packaging.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#F7F4EB] hover:bg-white text-[#102E20] font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-[#173F2B]" />
              <span>Shop Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={() => openQuoteModal(undefined, 'WHOLESALE')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#A97843] hover:bg-[#936535] text-white font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              <span>Discuss Bulk Supply</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
