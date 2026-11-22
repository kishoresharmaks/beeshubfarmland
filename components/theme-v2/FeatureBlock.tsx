'use client';

import React from 'react';
import { Microscope, ShieldCheck, Factory, Truck } from 'lucide-react';

/**
 * Section N: Feature Block
 * Large graphic/card on one side; H3 + paragraph; 2x2 grid of sub-items (H4 + one line).
 */
export default function FeatureBlock() {
  const subItems = [
    {
      title: 'Moisture Controlled Processing',
      desc: 'Raw honey moisture < 19%; dehydrated fruit and vegetable powders kept under 5% to prevent clumping and microbial spoilage.',
      icon: Microscope,
    },
    {
      title: 'Zero Chemical Residues',
      desc: 'Free from synthetic pesticides, heavy metals, artificial preservatives, maltodextrin, and synthetic emulsifiers.',
      icon: ShieldCheck,
    },
    {
      title: 'Hygienic SS316 Processing',
      desc: 'Pharma-grade stainless steel extraction, solar dehydration tunnels, and cold expeller milling lines.',
      icon: Factory,
    },
    {
      title: 'Batch Traceability Seals',
      desc: 'Direct QR-linked farm harvest coordinates and tamper-evident seal serials on every commercial drum and carton.',
      icon: Truck,
    },
  ];

  return (
    <section className="w-full py-16 sm:py-24 bg-white border-b border-[#E8EDF2]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Visual Highlight Box */}
          <div className="lg:col-span-5 h-[340px] sm:h-[400px] rounded-3xl bg-[#163B5C] p-8 sm:p-10 text-white flex flex-col justify-between shadow-xs relative overflow-hidden">
            <div className="relative z-10 space-y-1">
              <h4 className="font-heading font-bold text-2xl text-white leading-tight">
                Quality parameters
              </h4>
              <p className="text-xs text-slate-300">Standardized values across commercial farm product batches</p>
            </div>

            <div className="relative z-10 space-y-3 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Dehydrated Powders (Dates, Banana, Moringa)</span>
                <span className="font-semibold text-amber-300">Moisture &lt; 5% · 80-100 Mesh</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Pure Raw Forest Honey</span>
                <span className="font-semibold text-emerald-300">Zero C4 Sugars · Diastase &gt; 8</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Wood Cold-Pressed Virgin Oils</span>
                <span className="font-semibold text-white">Cold Expeller &lt; 45°C · Unrefined</span>
              </div>
            </div>
          </div>

          {/* Right Column: H3 + Paragraph + 2x2 Grid */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <h3 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-[#163B5C] tracking-tight">
                Quality specifications for bulk honey
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Whether formulating nutraceutical syrups or packaging shelf-stable honey jars, our quality control ensures every drum delivers consistent viscosity, color, and biological purity.
              </p>
            </div>

            {/* 2x2 Sub-Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
              {subItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-[#FFFCFB] border border-[#E8EDF2] space-y-1.5">
                    <Icon className="w-5 h-5 text-[#163B5C]" />
                    <h4 className="font-heading font-bold text-sm text-[#163B5C] pt-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[#64748B] leading-snug">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
