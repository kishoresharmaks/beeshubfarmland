'use client';

import React from 'react';
import { Building2, ShieldCheck } from 'lucide-react';

/**
 * Section F: Logo Wall
 * Centered heading + 10 client / institutional certification logos at equal height.
 * Continuous marquee animation (pauses on hover).
 */
export default function LogoWall() {
  const logos = [
    { name: 'Western Ghats Agro Exports', type: 'Exporters Hub' },
    { name: 'Tamil Nadu Organic Guild', type: 'Institutional Partner' },
    { name: 'Kanyakumari Beekeepers Fed', type: 'Primary Producer Society' },
    { name: 'AyurVeda Formulations Ltd', type: 'Nutraceutical Manufacturer' },
    { name: 'Aroma Spice Processors', type: 'Oleoresin Extraction' },
    { name: 'Heritage Organic Stores', type: 'Pan-India Supermarket' },
    { name: 'Nilgiris Wellness Group', type: 'Hospitality & Luxury Resorts' },
    { name: 'Greenleaf FMCG Brand', type: 'Private Label Partner' },
    { name: 'Apex Spice Blenders', type: 'Institutional Catering' },
    { name: 'PureHarvest Organics', type: 'Direct Retail Network' },
  ];

  return (
    <section className="w-full py-12 sm:py-16 bg-white border-b border-[#E8EDF2] overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center space-y-1 mb-8">
        <h3 className="font-heading font-bold text-base sm:text-lg text-[#163B5C]">
          Supply partner to food processors and retailers
        </h3>
        <p className="text-xs text-[#64748B]">
          Delivering bulk certified raw honey, extracts, and spices across India.
        </p>
      </div>

      {/* Marquee Track (Double duplicate array for seamless infinite scroll) */}
      <div className="relative w-full flex items-center overflow-hidden">
        {/* Soft edge blur overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee flex items-center gap-6 sm:gap-8 px-4">
          {[...logos, ...logos].map((logo, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-[#FFFCFB] border border-[#E8EDF2] shadow-2xs hover:border-[#10B981] transition-colors shrink-0 cursor-default group"
            >
              <div className="w-8 h-8 rounded-xl bg-[#163B5C]/10 text-[#163B5C] group-hover:bg-[#10B981]/20 group-hover:text-[#059669] flex items-center justify-center transition-colors">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-semibold text-[#163B5C] group-hover:text-[#ED3500] transition-colors block leading-tight whitespace-nowrap">
                  {logo.name}
                </span>
                <span className="text-[10px] text-[#64748B] font-medium block leading-tight whitespace-nowrap">
                  {logo.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
