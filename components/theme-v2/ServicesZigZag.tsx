'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Leaf, Factory, MessageCircle, Briefcase } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

/**
 * Detailed B2B Processing & Supply Services Section (/services)
 * Provides anchored sections (#bulk-honey, #superfood-powders, #cold-pressed-oils, #private-label-packaging)
 * with clickable SKU chips and pre-loaded quotation triggers.
 */
export default function ServicesZigZag() {
  const { openQuoteModal, companyConfig } = useStore();
  const cleanPhone = companyConfig.phone.replace(/\D/g, '') || '9578784431';

  const services = [
    {
      id: 'bulk-honey',
      title: 'Bulk Raw Honey Extraction & Drum Distribution',
      desc: 'Supplying industrial food processors, confectioners, and ayurvedic manufacturers with raw, unadulterated forest honey. Packaged in sanitized 30kg, 50kg, and 300kg food-grade steel or HDPE drums with tamper-evident seal serials.',
      bullets: [
        'Unheated cold extraction preserving natural live pollen enzymes',
        'Moisture content controlled strictly under 18% - 19%',
        'Complete COA certificate for each individual batch barrel (C4 & NMR sugar screen)',
      ],
      skus: ['Pure Forest Honey'],
      icon: Leaf,
      badge: 'Certified Apiculture',
      tagline: 'Cold-extracted Western Ghats forest honey in tamper-proof 30kg–300kg drums.',
      image: '/images/beeshub-pure-forest-honey-spotlight.webp',
      quoteProduct: 'Pure Forest Honey',
      quoteCategory: 'WHOLESALE' as const,
      extraLink: { label: 'Browse Honey in Shop', href: '/shop?category=Natural%20Honey' },
    },
    {
      id: 'superfood-powders',
      title: 'Dehydrated Fruit & Superfood Powder Processing',
      desc: 'Commercial cleanroom solar and tray dehydration of farm-fresh harvest: natural dates powder, Nendran banana, red banana, moringa leaf, sweet potato, beetroot, and caffeine-free roasted dates coffee. Ground to fine 80–100 mesh for baby food, health mixes, bakeries, and nutraceutical brands.',
      bullets: [
        'Gentle low-temperature dehydration below 50°C preserving native colour, vitamins, and minerals',
        'Natural unrefined dates powder sugar substitute and roasted caffeine-free dates coffee formulation',
        'Zero maltodextrin, zero added starch, zero chemical preservatives or anticaking agents',
        'Available in 1kg/5kg barrier pouches and 25kg bulk moisture-proof liner cartons',
      ],
      skus: [
        'Dates Powder Natural',
        'Dates Coffee Powder',
        'Nendran Banana Powder',
        'Red Banana Powder',
        'Moringa Leaf Powder',
        'Sweet Potato Powder',
        'Beetroot Powder',
      ],
      icon: Factory,
      badge: 'Solar Dehydration Facility',
      tagline: '80–100 mesh solar-dehydrated powders with zero maltodextrin or fillers.',
      image: '/images/products/dates-powder-natural.jpg',
      quoteProduct: 'Dates Powder Natural',
      quoteCategory: 'WHOLESALE' as const,
      extraLink: { label: 'Browse Powders in Shop', href: '/shop?category=Superfood%20Powders' },
    },
    {
      id: 'cold-pressed-oils',
      title: 'Wood Cold-Pressed Virgin Oils Extraction & Milling',
      desc: 'Traditional slow wood expeller (Marachekku) extraction of Kanyakumari coastal coconuts, sesame seeds, and groundnuts. Extracted below 45°C to preserve natural antioxidants, healthy fatty acids, and authentic farm aromas.',
      bullets: [
        'Centrifuged zero-heat virgin coconut oil with rich natural lauric acid content',
        'Single-press unrefined sesame and groundnut oils with zero mineral oil blending',
        'Supplied in 1L/5L food-grade tins, 20L carboys, and 200L commercial food barrels',
      ],
      skus: [
        'Cold Pressed Coconut Oil',
        'Cold Pressed Sesame Oil',
        'Cold Pressed Groundnut Oil',
      ],
      icon: Leaf,
      badge: 'Wood Cold-Press Mill',
      tagline: 'Slow Marachekku wood-pressed below 45°C for intact antioxidants.',
      image: '/images/products/coconut-oil.png',
      quoteProduct: 'Cold Pressed Coconut Oil',
      quoteCategory: 'WHOLESALE' as const,
      extraLink: { label: 'Browse Oils in Shop', href: '/shop?category=Cold-Pressed%20Oils' },
    },
    {
      id: 'private-label-packaging',
      title: 'Turnkey Private Labeling & Retail Packaging',
      desc: 'Launch your branded retail food line with our certified packaging cleanroom. From custom honey glass jars (Square, Hexa, Octa, and ITC series) and cold-pressed oil bottles to powder standup zipper pouches, capsules, and artisanal gift sets.',
      bullets: [
        'Flexible packaging formats: Square, Hexa, Octa & ITC glass jars, pouches, tins, and capsule bottles',
        'Complete FSSAI regulatory compliance, nutritional lab testing, and batch date printing',
        'Low pilot minimum order quantities starting from 100 units for D2C brands and exporters',
      ],
      skus: [
        'Private Label & Custom Bottling',
        'Square Honey Series Glass Jars',
        'Hexa Jar Series Glass Jars',
        'Wedding & Event Gift Hampers',
      ],
      icon: Factory,
      badge: 'Cleanroom Packaging & Co-Packing',
      tagline: 'Turnkey glass jar bottling, induction sealing & FSSAI compliance from 100 units.',
      image: '/images/packaging/hexa-jar-series.webp',
      quoteProduct: 'Private Label & Custom Bottling',
      quoteCategory: 'PRIVATE_LABEL' as const,
      extraLink: { label: 'Open Private Label Studio', href: '/private-label' },
    },
  ];

  return (
    <section id="services" className="w-full py-14 sm:py-20 bg-[#F7F4EB]/45 border-b border-[#E4E7E1]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-16 sm:space-y-20">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#A97843]">
            Detailed Capabilities
          </span>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-[#202820] tracking-tight">
            Commercial Processing &amp; Packaging Lines
          </h2>
          <p className="text-xs sm:text-sm text-[#6B756B]">
            Click any product or service below to pre-load your wholesale quotation request.
          </p>
        </div>

        {/* Checkerboard Zig-Zag Blocks */}
        <div className="space-y-14 sm:space-y-20">
          {services.map((item, idx) => {
            const isReversed = idx % 2 === 1;
            const Icon = item.icon;
            const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
              `Hello Bees Hub Farmland Team,\n\nI would like bulk supply details and pricing for *${item.title}* (${item.quoteProduct}).`
            )}`;

            return (
              <div
                id={item.id}
                key={item.id}
                className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-white rounded-3xl p-5 sm:p-8 border border-[#E4E7E1] shadow-card"
              >
                {/* Visual Block */}
                <div
                  className={`lg:col-span-5 h-[280px] sm:h-[340px] rounded-2xl p-6 flex flex-col justify-between text-white relative overflow-hidden group border border-[#E4E7E1] ${
                    isReversed ? 'lg:order-2' : 'lg:order-1'
                  }`}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                    sizes="(max-width: 1024px) 100vw, 480px"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#102E20]/90 via-[#102E20]/45 to-[#102E20]/25 pointer-events-none" />

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold tracking-wide text-white border border-white/25">
                      {item.badge}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/25">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="relative z-10 space-y-1">
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-white leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-[#E8EFE6] line-clamp-2">
                      {item.tagline}
                    </p>
                  </div>
                </div>

                {/* Text Content Block */}
                <div
                  className={`lg:col-span-7 space-y-4 ${
                    isReversed ? 'lg:order-1' : 'lg:order-2'
                  }`}
                >
                  <h3 className="font-serif font-bold text-xl sm:text-2xl lg:text-3xl text-[#202820] leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B756B] leading-relaxed">
                    {item.desc}
                  </p>

                  <ul className="space-y-2 pt-1">
                    {item.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#202820] font-medium">
                        <CheckCircle2 className="w-4 h-4 text-[#173F2B] shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Clickable Product/Format Chips */}
                  <div className="pt-2 space-y-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B756B]">
                      Click a product to enquire directly:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.skus.map((sku) => (
                        <button
                          key={sku}
                          type="button"
                          onClick={() => openQuoteModal(sku, item.quoteCategory)}
                          className="px-3 py-1.5 rounded-full bg-[#F7F4EB] hover:bg-[#173F2B] text-[#202820] hover:text-white border border-[#E4E7E1] text-xs font-medium transition-colors"
                        >
                          {sku}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Row */}
                  <div className="pt-3 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openQuoteModal(item.quoteProduct, item.quoteCategory)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#173F2B] hover:bg-[#102E20] text-white text-xs font-semibold transition-colors"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Enquire for This Service</span>
                    </button>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] text-xs font-semibold transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                      <span>WhatsApp Trade Desk</span>
                    </a>

                    <Link
                      href={item.extraLink.href}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#A97843] hover:underline ml-auto"
                    >
                      <span>{item.extraLink.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Closing CTA Strip */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#173F2B] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-card">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif font-bold text-lg sm:text-xl text-white">
              Need customized bulk parameters, packaging specs, or export volumes?
            </h3>
            <p className="text-xs sm:text-sm text-[#E8EFE6]">
              Our Kanyakumari trade desk reviews technical specifications and sample requests daily.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openQuoteModal(undefined, 'WHOLESALE')}
            className="px-6 py-3 rounded-full bg-[#F7F4EB] hover:bg-white text-[#102E20] text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors shrink-0"
          >
            Request Technical Quote
          </button>
        </div>
      </div>
    </section>
  );
}
