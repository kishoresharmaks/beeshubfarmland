'use client';

import React from 'react';
import { Mail, Phone, Sparkles, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

/**
 * Section A: Top Utility Bar
 * Slim, professional single-line utility bar.
 * No multi-line text wrapping across all viewports.
 */
export default function TopUtilityBar() {
  const { companyConfig } = useStore();

  return (
    <div className="w-full bg-[#163B5C] text-white/90 text-[11px] py-1.5 px-4 sm:px-6 border-b border-white/10 select-none">
      <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Tagline - Clean and Responsive Single Line */}
        <div className="flex items-center gap-2 font-medium tracking-wide whitespace-nowrap overflow-hidden">
          <span className="hidden sm:inline truncate">
            Direct Farm Harvest Raw Honey and Organic Spices, Western Ghats Biosphere Apiaries
          </span>
          <span className="sm:hidden text-[10px] text-slate-300 truncate">
            Direct Farm Harvest Raw Honey & Organic Spices · Western Ghats
          </span>
        </div>

        {/* Right: Direct Contact Links - Single Line Only */}
        <div className="hidden md:flex items-center gap-4 text-slate-300 font-semibold shrink-0 whitespace-nowrap">
          <a
            href={`mailto:${companyConfig.email}`}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-[#10B981]" />
            <span>{companyConfig.email}</span>
          </a>
          <span className="text-white/20">•</span>
          <a
            href={`tel:${companyConfig.phone}`}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span>+91 {companyConfig.phone}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
