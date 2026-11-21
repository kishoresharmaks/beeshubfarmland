'use client';

import React from 'react';
import { CheckCircle2, ArrowRight, ShieldCheck, HeartHandshake, Trees, Award } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

/**
 * Section J: About Block
 * Eyebrow + H2, 5 capability bullets, 5-block collage, 2 paragraphs, text link.
 * Desktop: text column beside image collage.
 */
export default function AboutBlock() {
  const { companyConfig, setIsQuoteModalOpen } = useStore();

  const capabilities = [
    'Proprietary apiaries situated inside pristine Western Ghats forest biosphere reserves',
    'Certified ISO 22000:2018 & ISO 9001:2015 hygienic processing and packaging lines',
    'Zero-heat extraction keeping delicate diastase, invertase, and pollen enzymes alive',
    'Pan-India road and container logistics with tamper-evident batch tracking seals',
    'Full regulatory documentation: FSSAI Central License, IEC Export Code, and NABL COA',
  ];

  const collageCards = [
    { label: 'Virgin Apiaries', sub: 'Pure Forest Honey', color: 'from-amber-800 to-amber-950', icon: Trees },
    { label: 'Solar Dehydration', sub: 'Banana & Moringa Powders', color: 'from-emerald-800 to-emerald-950', icon: ShieldCheck },
    { label: 'Wood Cold-Press Mill', sub: 'Virgin Coconut & Sesame', color: 'from-blue-800 to-blue-950', icon: Award },
    { label: 'Cleanroom Packaging', sub: 'Pouches, Jars & Capsules', color: 'from-orange-800 to-orange-950', icon: HeartHandshake },
    { label: 'Analytical Testing Lab', sub: 'Purity & Microbial COA', color: 'from-purple-800 to-purple-950', icon: ShieldCheck },
  ];

  return (
    <section id="about" className="w-full py-16 sm:py-24 bg-white border-b border-[#E8EDF2]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: H2 + Bullets + Paragraphs + Link */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-[#163B5C] leading-tight tracking-tight">
              Farm harvesting, solar dehydration, and cold-press milling in Kanyakumari.
            </h2>

            <div className="space-y-3 text-xs sm:text-sm text-[#64748B] leading-relaxed">
              <p>
                Headquartered in Kanyakumari, Tamil Nadu, Bees Hub Farmland operates Western Ghats forest apiaries, modern solar dehydration facilities, and traditional wood cold-press oil mills. We supply commercial buyers, baby food processors, and retail brands with verified farm products.
              </p>
              <p>
                From pure raw honey to dehydrated banana, moringa, sweet potato, and cold-pressed virgin oils, our vertically integrated farmgate processing maintains natural bioactive enzymes and native flavors under strict ISO 22000 and FSSAI standards.
              </p>
            </div>

            {/* 5 Capability Bullets */}
            <ul className="space-y-3 pt-2">
              {capabilities.map((cap, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#163B5C] font-medium leading-snug">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span>{cap}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <button
                onClick={() => setIsQuoteModalOpen(true)}
                className="inline-flex items-center gap-2 font-semibold text-xs text-[#ED3500] hover:text-[#D02E00] group"
              >
                <span>Request company profile and certifications</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Column: 5-Card Collage Mosaic */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4 auto-rows-[130px] sm:auto-rows-[150px]">
            {collageCards.map((card, idx) => {
              const Icon = card.icon;
              const isLarge = idx === 0 || idx === 4;

              return (
                <div
                  key={idx}
                  className={`relative rounded-3xl p-5 bg-gradient-to-br ${card.color} text-white shadow-xs flex flex-col justify-between overflow-hidden ${
                    isLarge ? 'col-span-2' : 'col-span-1'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-heading font-bold text-sm sm:text-base leading-snug text-white">
                      {card.label}
                    </h4>
                    <p className="text-[10px] text-white/80">{card.sub}</p>
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
