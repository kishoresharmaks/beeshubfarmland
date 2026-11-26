'use client';

import React from 'react';
import {
  Factory,
  ShoppingBag,
  Store,
  Truck,
  HeartPulse,
  Globe2,
} from 'lucide-react';

/**
 * Section 10: Who We Serve
 * Six clean audience segment cards without fabricated partner logos.
 */
export default function WhoWeServeSection() {
  const segments = [
    {
      title: 'Food Manufacturers',
      desc: 'Bulk raw honey, fruit powders, and cold-pressed oils for bakeries, infant nutrition, and beverage formulators.',
      icon: Factory,
    },
    {
      title: 'FMCG Brands',
      desc: 'Turnkey private-label bottling and standup pouch co-packing with FSSAI-compliant labeling.',
      icon: ShoppingBag,
    },
    {
      title: 'Organic Retailers',
      desc: 'Shelf-ready retail packs with consistent quality and clean farm-origin storytelling.',
      icon: Store,
    },
    {
      title: 'Wholesale Distributors',
      desc: 'Reliable regional and pan-India trade supply backed by GST invoicing and insured freight.',
      icon: Truck,
    },
    {
      title: 'Nutraceutical Businesses',
      desc: 'Moringa leaf powder, capsules, raw honey, and natural sweeteners with batch COA reports.',
      icon: HeartPulse,
    },
    {
      title: 'Exporters & Institutional Buyers',
      desc: 'IEC-registered commercial supply with standardized specifications for hospitality and export channels.',
      icon: Globe2,
    },
  ];

  return (
    <section className="w-full py-14 sm:py-20 bg-[#F7F4EB]/55 border-b border-[#E4E7E1]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#A97843]">
            Who We Serve
          </span>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-[#202820] tracking-tight">
            Serving Everyday Households &amp; Commercial Buyers
          </h2>
          <p className="text-sm text-[#6B756B]">
            Structured to support retail consumers as well as six core B2B buyer segments across India.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {segments.map((seg) => {
            const Icon = seg.icon;
            return (
              <div
                key={seg.title}
                className="bg-white rounded-2xl p-6 border border-[#E4E7E1] shadow-card space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E8EFE6] text-[#173F2B] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-semibold text-lg text-[#202820]">
                  {seg.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#6B756B] leading-relaxed">
                  {seg.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
