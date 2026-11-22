'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, Leaf, Factory } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

/**
 * Section I: Services Zig-Zag (2 Core B2B Services)
 * Checkerboard: [image | text] [text | image].
 * Closing CTA strip: one sentence + text link.
 */
export default function ServicesZigZag() {
  const { setIsQuoteModalOpen } = useStore();

  const services = [
    {
      title: 'Bulk Raw Honey Extraction & Drum Distribution',
      desc: 'Supplying industrial food processors, confectioners, and ayurvedic medicine manufacturers with raw, unadulterated forest and monofloral honey. Packaged in sanitized 30kg, 50kg, and 300kg food-grade steel or HDPE drums with tamper-proof seal serials.',
      bullets: [
        'Unheated cold extraction preserving natural live pollen enzymes',
        'Moisture content controlled strictly under 18% - 19%',
        'Complete COA certificate for each individual batch barrel',
      ],
      icon: Leaf,
      badge: 'Certified Apiculture',
      image: 'https://images.unsplash.com/photo-1758522965167-42e34a12bf13?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Dehydrated Fruit & Superfood Powder Processing',
      desc: 'Commercial cleanroom solar and tray dehydration of farm-fresh harvest: natural dates powder, Nendran banana, red banana (Chevvazhai), moringa leaf, sweet potato, beetroot, and caffeine-free roasted dates coffee. Ground to fine 80-100 mesh for baby food, health mixes, bakeries, and nutraceutical brands.',
      bullets: [
        'Gentle low-temperature dehydration preserving native color, vitamins, and minerals',
        'Natural unrefined dates powder sugar substitute and roasted caffeine-free dates coffee formulation',
        'Zero maltodextrin, zero added starch, zero chemical preservatives or anticaking agents',
        'Available in 1kg/5kg nitrogen-flushed barrier pouches and 25kg bulk moisture-proof liner cartons',
      ],
      icon: Factory,
      badge: 'Solar Dehydration Facility',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Wood Cold-Pressed Virgin Oils Extraction & Milling',
      desc: 'Traditional slow wood expeller (Marachekku) extraction of fresh Kanyakumari coastal coconuts, premium sesame seeds, and handpicked groundnuts. Extracted below 45°C to preserve natural antioxidants, healthy fatty acids, and authentic farm aromas.',
      bullets: [
        'Centrifuged zero-heat virgin coconut oil with rich natural lauric acid content',
        'Single-press unrefined sesame and groundnut oils with high smoke points and zero mineral oil',
        'Supplied in 1L/5L food-grade consumer tins, 20L carboys, and 200L commercial food barrels',
      ],
      icon: Leaf,
      badge: 'Wood Cold-Press Mill',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Turnkey Private Labeling & Retail Packaging',
      desc: 'Launch your branded retail food line with our certified automated packaging cleanroom. From custom honey glass jars and cold-pressed oil bottles to powder standup zipper pouches, blister capsules, and artisanal gift sets.',
      bullets: [
        'Flexible packaging formats: Standup barrier pouches, glass jars, tin containers, and capsule bottles',
        'Complete FSSAI regulatory compliance, barcode registration, nutritional lab testing, and batch printing',
        'Low minimum order quantities (MOQ) tailored for emerging D2C brands, boutique retailers, and exporters',
      ],
      icon: Factory,
      badge: 'Cleanroom Packaging & Co-Packing',
      image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  return (
    <section id="services" className="w-full py-16 sm:py-24 bg-[#FFFCFB] border-b border-[#E8EDF2]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-16 sm:space-y-24">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h3 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-[#163B5C] tracking-tight">
            B2B supply and packaging services
          </h3>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Commercial scale processing, stainless extractor drum distribution, and turnkey private-label bottling.
          </p>
        </div>

        {/* Checkerboard Zig-Zag Blocks */}
        <div className="space-y-16 sm:space-y-20">
          {services.map((item, idx) => {
            const isReversed = idx % 2 === 1;
            const Icon = item.icon;

            return (
              <div
                key={idx}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${
                  isReversed ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Visual / Graphic Block with Real Photography */}
                <div
                  className={`lg:col-span-5 h-[280px] sm:h-[340px] rounded-3xl p-6 sm:p-8 flex flex-col justify-between text-white shadow-card relative overflow-hidden group border border-[#E8EDF2] ${
                    isReversed ? 'lg:order-2' : 'lg:order-1'
                  }`}
                >
                  {/* Photography Image */}
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                    sizes="(max-width: 1024px) 100vw, 480px"
                  />

                  {/* Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25 pointer-events-none" />

                  {/* Top Badge & Icon */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold tracking-wide text-white border border-white/25">
                      {item.badge}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/25">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Bottom Text */}
                  <div className="relative z-10 space-y-1">
                    <h4 className="font-heading font-bold text-lg sm:text-xl text-white leading-tight drop-shadow-xs">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-200 line-clamp-2">
                      Hygienic processing adhering to Codex Alimentarius & FSSAI standards.
                    </p>
                  </div>
                </div>

                {/* Text Content Block */}
                <div
                  className={`lg:col-span-7 space-y-4 ${
                    isReversed ? 'lg:order-1' : 'lg:order-2'
                  }`}
                >
                  <h4 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-[#163B5C] leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                    {item.desc}
                  </p>

                  <ul className="space-y-2.5 pt-1">
                    {item.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2.5 text-xs text-[#163B5C] font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2">
                    <button
                      onClick={() => setIsQuoteModalOpen(true)}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[#ED3500] hover:text-[#D02E00] transition-colors group"
                    >
                      <span>Inquire about this service</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Closing CTA Strip (UI.md pattern) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#163B5C] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-card">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-heading font-bold text-base sm:text-lg">
              Have customized bulk parameters, packaging specs, or export volumes?
            </h4>
            <p className="text-xs text-slate-300">
              Our food technologists and commercial team review technical specifications daily.
            </p>
          </div>
          <button
            onClick={() => setIsQuoteModalOpen(true)}
            className="px-6 py-3 rounded-full bg-[#ED3500] hover:bg-[#D02E00] text-white text-xs font-semibold whitespace-nowrap shadow-sm shadow-[#ED3500]/25 transition-colors shrink-0"
          >
            Request Technical Quote
          </button>
        </div>
      </div>
    </section>
  );
}
