'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

/**
 * Section D: Hero Copy + Stats + Superfood Spotlight (Dates Powder)
 * H1 heading · 3 paragraphs with comprehensive Dates Powder explanation · 4 stats · CTA button
 * Stats count up on scroll into view.
 */
export default function HeroCopyStats() {
  const { setIsQuoteModalOpen, setQuoteModalInitialProduct } = useStore();
  const statsRef = useRef<HTMLDivElement>(null);
  const [hasCounted, setHasCounted] = useState(false);

  const stats = [
    { target: 100, suffix: '%', label: 'Farmgate Pure Harvest', sub: 'Zero artificial chemicals or fillers' },
    { target: 30, suffix: '+', label: 'Commercial Farm Products', sub: 'Powders, oils, honey & superfoods' },
    { target: 50, suffix: '+', label: 'Farmland & Apiaries (Acres)', sub: 'Western Ghats bio-reserve belt' },
    { target: 24, suffix: 'h', label: 'Trade Desk Response', sub: 'Lab reports (COA) dispatched' },
  ];

  const [counts, setCounts] = useState([100, 30, 50, 24]);

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

  const handleOpenDatesQuote = () => {
    setQuoteModalInitialProduct('Dates Powder Natural _Shyn&Dev - 250 Gm');
    setIsQuoteModalOpen(true);
  };

  return (
    <section className="w-full py-16 sm:py-20 bg-white border-b border-[#E8EDF2]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Heading + Copy */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-[#163B5C] leading-[1.18] tracking-tight">
              Direct Farmgate Raw Honey, Superfood Powders &amp; Cold-Pressed Oils.{' '}
              <span className="text-[#ED3500]">
                Bulk supply with verified purity.
              </span>
            </h1>

            {/* Paragraphs with Detailed Dates Powder Explanation */}
            <div className="space-y-3.5 text-sm sm:text-base text-[#64748B] leading-relaxed">
              <p>
                Bees Hub Farmland operates Western Ghats forest apiaries, modern solar dehydration facilities, and wood cold-press oil mills across Kanyakumari. We supply commercial brands, baby food makers, bakeries, nutraceutical processors, and retail chains with certified farm produce.
              </p>
              
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFCFB] border border-[#E8EDF2] space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-sm sm:text-base text-[#163B5C]">
                    Natural Dehydrated Dates Powder &amp; Dates Coffee
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  Our <strong>Natural Dates Powder</strong> is made from 100% handpicked premium whole dates, pitted, washed, and solar-dehydrated below 50°C to lock in native iron, potassium, and dietary fiber. Milled to fine 80–100 mesh, it serves as an unrefined, nutrient-dense natural sweetener for weaning baby food, infant porridge, bakery goods, and health mixes, with <strong>zero added sugar, zero preservatives, and zero maltodextrin</strong>. We also craft caffeine-free <strong>Dates Coffee Powder</strong> from slow-roasted date seed and fruit pulp for health-conscious hot beverage formulations.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-xs text-[#163B5C]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#ED3500] shrink-0" />
                    <span>Pure Natural Sweetener (No Cane Sugar)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#ED3500] shrink-0" />
                    <span>Baby-Food Grade &amp; Moisture &lt; 5%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#ED3500] shrink-0" />
                    <span>80–100 Mesh Fine Dissolving Powder</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#ED3500] shrink-0" />
                    <span>Bulk Drums (25kg) &amp; Consumer Packs</span>
                  </div>
                </div>
              </div>

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
              <button
                type="button"
                onClick={handleOpenDatesQuote}
                className="text-xs sm:text-sm font-semibold text-[#163B5C] hover:text-[#ED3500] underline underline-offset-4"
              >
                Inquire for Dates Powder bulk supply
              </button>
            </div>
          </div>

          {/* Right: Stats Row Grid (4 blocks) + Dates Powder Spotlight Card */}
          <div ref={statsRef} className="lg:col-span-5 space-y-6">
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

            {/* Dates Powder Visual Spotlight Card */}
            <div className="p-4 sm:p-5 bg-white rounded-3xl border border-[#E8EDF2] shadow-2xs flex items-center gap-4 sm:gap-5">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shrink-0">
                <Image
                  src="/images/products/dates-powder-natural.jpg"
                  alt="Natural Dates Powder"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="font-heading font-bold text-sm sm:text-base text-[#163B5C] truncate">
                  Dates Powder Natural
                </div>
                <p className="text-xs text-[#64748B] line-clamp-2">
                  100% natural and organic fruit sweetener. High fiber, potassium &amp; iron. No preservatives, no added sugar.
                </p>
                <div className="pt-1 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleOpenDatesQuote}
                    className="text-xs font-semibold text-[#ED3500] hover:underline flex items-center gap-1"
                  >
                    <span>Get Wholesale Quote</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
