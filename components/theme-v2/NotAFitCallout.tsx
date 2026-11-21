'use client';

import React from 'react';
import { X } from 'lucide-react';

/**
 * Section M: "Not a Fit" Callout
 * H3 + one-sentence intro + 3 disqualifier bullets with ✕ markers.
 * Calm tinted/bordered box (not an alert banner).
 */
export default function NotAFitCallout() {
  const disqualifiers = [
    'Buyers seeking synthetic industrial honey substitute syrups, inverted corn blends, or high-fructose artificial sweeteners.',
    'Procurement requests requiring compromised batch specifications or uncertified informal transactions without proper GST and FSSAI invoicing.',
    'Traders looking for ultra-low grade, heat-damaged molasses residue that strips natural floral enzyme activity.',
  ];

  return (
    <section className="w-full py-12 sm:py-16 bg-[#FFFCFB] border-b border-[#E8EDF2]">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
        <div className="rounded-3xl p-6 sm:p-10 border border-[#E8EDF2] bg-white shadow-xs space-y-6">
          <div className="space-y-1.5">
            <h3 className="font-heading font-bold text-xl sm:text-2xl text-[#163B5C]">
              Orders we do not fulfill
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B]">
              To protect the biological purity of our harvest and brand partnerships, we do not fulfill the following request types:
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {disqualifiers.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#163B5C] font-medium leading-relaxed">
                <div className="w-5 h-5 rounded-full bg-slate-100 text-[#64748B] border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-3 h-3 stroke-[2.5]" />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 text-xs text-[#64748B] border-t border-[#E8EDF2]">
            <span>
              All batches are unheated, tested for foreign sugars, and accompanied by accredited lab COA documentation.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
