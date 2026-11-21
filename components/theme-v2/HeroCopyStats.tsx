'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

/**
 * Section D: Hero Copy + Stats
 * H1 heading · 2 paragraphs · 4 stats · CTA button
 * Stats count up on scroll into view.
 */
export default function HeroCopyStats() {
  const { setIsQuoteModalOpen } = useStore();
  const statsRef = useRef<HTMLDivElement>(null);
  const [hasCounted, setHasCounted] = useState(false);

  const stats = [
    { target: 100, suffix: '%', label: 'Farmgate Pure Harvest', sub: 'Zero artificial chemicals or fillers' },
    { target: 30, suffix: '+', label: 'Commercial Farm Products', sub: 'Powders, oils, honey & superfoods' },
    { target: 50, suffix: '+', label: 'Farmland & Apiaries (Acres)', sub: 'Western Ghats bio-reserve belt' },
    { target: 24, suffix: 'h', label: 'Trade Desk Response', sub: 'Lab reports (COA) dispatched' },
  ];

  const [counts, setCounts] = useState([0, 0, 0, 0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasCounted) {
          setHasCounted(true);
          const duration = 1800;
          const steps = 40;
          const stepTime = duration / steps;
          let currentStep = 0;

          const timer = setInterval(() => {
            currentStep++;
            setCounts(
              stats.map((s) => {
                const progress = currentStep / steps;
                return Math.floor(s.target * Math.min(1, progress));
              })
            );

            if (currentStep >= steps) {
              clearInterval(timer);
              setCounts(stats.map((s) => s.target));
            }
          }, stepTime);
        }
      },
      { threshold: 0.25 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [hasCounted]);

  return (
    <section className="w-full py-16 sm:py-20 bg-white border-b border-[#E8EDF2]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Heading + Copy */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-[#163B5C] leading-[1.18] tracking-tight">
              Direct Farmgate Raw Honey, Superfood Powders & Cold-Pressed Oils.{' '}
              <span className="text-[#ED3500]">
                Bulk supply with verified purity.
              </span>
            </h1>

            {/* 2 Short Paragraphs */}
            <div className="space-y-3 text-sm sm:text-base text-[#64748B] leading-relaxed">
              <p>
                Bees Hub Farmland operates Western Ghats forest apiaries, modern solar dehydration facilities, and wood cold-press oil mills across Kanyakumari. We supply commercial brands, baby food makers, bakeries, nutraceutical processors, and retail chains with certified farm produce.
              </p>
              <p>
                From raw forest honey and cold-pressed virgin oils to dehydrated banana, moringa leaf, sweet potato, and dates powders, every consignment is processed under ISO 22000 and FSSAI standards with complete batch Certificate of Analysis (COA) documentation.
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => setIsQuoteModalOpen(true)}
                className="px-8 py-4 rounded-full bg-[#ED3500] hover:bg-[#D02E00] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#ED3500]/25 transition-colors flex items-center gap-2"
              >
                <span>Request bulk quotation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#services"
                className="text-xs sm:text-sm font-semibold text-[#163B5C] hover:text-[#ED3500] underline underline-offset-4"
              >
                Explore private label and bulk supply
              </a>
            </div>
          </div>

          {/* Right: Stats Row Grid (4 blocks) */}
          <div ref={statsRef} className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-4 sm:gap-6 bg-[#FFFCFB] p-6 sm:p-8 rounded-3xl border border-[#E8EDF2] shadow-xs">
              {stats.map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-[#163B5C] tracking-tight">
                    {counts[idx].toLocaleString('en-IN')}
                    <span className="text-[#ED3500]">{stat.suffix}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-[#163B5C] leading-snug">
                    {stat.label}
                  </h3>
                  <p className="text-[11px] text-[#64748B] leading-tight">
                    {stat.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
