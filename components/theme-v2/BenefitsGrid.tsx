'use client';

import React from 'react';
import {
  ShieldCheck,
  Leaf,
  Scale,
  Truck,
  FileCheck2,
  PackageSearch,
  Award,
} from 'lucide-react';

/**
 * Section H: Benefits Grid (7)
 * Heading + intro paragraph.
 * Icon cards: 4 in top row, 3 centered in bottom row.
 */
export default function BenefitsGrid() {
  const benefits = [
    {
      title: '100% Raw & Zero Additive Processing',
      desc: 'Cold-extracted raw honey, low-temperature solar dehydrated powders, and wood expeller-pressed virgin oils.',
      icon: Leaf,
    },
    {
      title: 'Certified Analytical Purity',
      desc: 'Tested by accredited NABL laboratories for foreign sugars, heavy metals, moisture, and microbial safety parameters.',
      icon: ShieldCheck,
    },
    {
      title: 'Direct Farmgate Pricing',
      desc: 'Eliminates intermediary trader commissions, providing commercial brands and institutional buyers with predictable contract costs.',
      icon: Scale,
    },
    {
      title: 'Commercial Bulk Logistics',
      desc: 'Dispatched in 25kg vacuum-lined powder cartons, 30kg-300kg honey barrels, and food-grade oil tins with pan-India insured shipping.',
      icon: Truck,
    },
    {
      title: 'Complete Lab COA Per Batch',
      desc: 'Analytical testing documentation supplied alongside every commercial shipment invoice for QA and R&D verification.',
      icon: FileCheck2,
    },
    {
      title: 'Turnkey Private Labeling',
      desc: 'Cleanroom packaging lines for standup pouches, custom glass jars, blister capsules, and branded gift sets under your label.',
      icon: PackageSearch,
    },
    {
      title: 'Western Ghats Origin Guarantee',
      desc: 'Sourced directly from certified Western Ghats apiaries, orchards, and coastal groves in Kanyakumari, isolated from industrial pollution.',
      icon: Award,
    },
  ];

  return (
    <section className="w-full py-16 sm:py-20 bg-white border-b border-[#E8EDF2]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <h3 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-[#163B5C] tracking-tight">
            Wholesale supply standards
          </h3>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Tested for purity, packed to specification, and shipped with full documentation.
          </p>
        </div>

        {/* 7-Card Grid: 4 Top + 3 Centered Bottom */}
        <div className="space-y-6">
          {/* Top Row: 4 across desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.slice(0, 4).map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#FFFCFB] rounded-3xl p-6 border border-[#E8EDF2] shadow-xs hover:border-slate-300 transition-colors space-y-3"
                >
                  <Icon className="w-5 h-5 text-[#163B5C]" />
                  <div>
                    <h4 className="font-heading font-bold text-sm sm:text-base text-[#163B5C] mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Row: 3 Centered on Desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[900px] mx-auto">
            {benefits.slice(4, 7).map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#FFFCFB] rounded-3xl p-6 border border-[#E8EDF2] shadow-xs hover:border-slate-300 transition-colors space-y-3"
                >
                  <Icon className="w-5 h-5 text-[#163B5C]" />
                  <div>
                    <h4 className="font-heading font-bold text-sm sm:text-base text-[#163B5C] mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      {item.desc}
                    </p>
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
