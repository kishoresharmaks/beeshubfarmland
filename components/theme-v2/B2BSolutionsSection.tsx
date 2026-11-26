'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

/**
 * Section 9: B2B Business Solutions
 * 4 dedicated service cards for institutional, wholesale, and private-label buyers.
 */
export default function B2BSolutionsSection({
  isServicesPage = false,
}: {
  isServicesPage?: boolean;
}) {
  const { openQuoteModal } = useStore();
  const pathname = usePathname();
  const onServices = isServicesPage || pathname === '/services';

  const solutions = [
    {
      anchorId: 'bulk-honey',
      title: 'Bulk Honey Supply',
      desc: 'Unheated raw forest honey supplied in food-grade 30kg, 50kg, and 300kg drums with batch-level COA and C4/NMR purity screening.',
      capabilities: 'Cold-extracted · Moisture < 19% · Tamper-evident seals',
      image: '/images/beeshub-pure-forest-honey-spotlight.webp',
      href: '/services#bulk-honey',
      quoteCategory: 'WHOLESALE' as const,
      quoteItem: 'Pure Forest Honey',
    },
    {
      anchorId: 'superfood-powders',
      title: 'Superfood Powder Processing',
      desc: 'Solar-dehydrated Nendran banana, red banana, natural dates, moringa leaf, beetroot, and sweet potato powders milled to 80–100 mesh.',
      capabilities: 'Solar dried < 50°C · Zero maltodextrin · 25kg bulk lots',
      image: '/images/products/dates-powder-natural.jpg',
      href: '/services#superfood-powders',
      quoteCategory: 'WHOLESALE' as const,
      quoteItem: 'Dates Powder Natural',
    },
    {
      anchorId: 'cold-pressed-oils',
      title: 'Cold-Pressed Oil Production',
      desc: 'Traditional wood-pressed (Marachekku) virgin coconut, sesame, and groundnut oils extracted below 45°C for food brands and commercial kitchens.',
      capabilities: 'Wood expeller < 45°C · Unrefined · Tins & barrels',
      image: '/images/products/coconut-oil.png',
      href: '/services#cold-pressed-oils',
      quoteCategory: 'WHOLESALE' as const,
      quoteItem: 'Cold Pressed Coconut Oil',
    },
    {
      anchorId: 'private-label-packaging',
      title: 'Private Label & Custom Packaging',
      desc: 'Turnkey cleanroom bottling and co-packing in Square, Hexa, Octa, and ITC glass jars, standup pouches, and curated gift hampers.',
      capabilities: 'Pilot MOQ from 100 units · FSSAI compliance · Custom labels',
      image: '/images/packaging/hexa-jar-series.webp',
      href: onServices ? '/services#private-label-packaging' : '/private-label',
      quoteCategory: 'PRIVATE_LABEL' as const,
      quoteItem: 'Private Label & Custom Bottling',
    },
  ];

  const handleExploreClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    anchorId: string,
    href: string
  ) => {
    if (onServices && href.startsWith('/services#')) {
      const targetEl = document.getElementById(anchorId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', `#${anchorId}`);
        }
      }
    }
  };

  return (
    <section id="wholesale-solutions" className="w-full py-14 sm:py-20 bg-white border-b border-[#E4E7E1]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#A97843]">
              B2B &amp; Wholesale Solutions
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-[#202820] tracking-tight">
              Your Trusted Partner for Agricultural Ingredients and Bulk Supply
            </h2>
            <p className="text-sm text-[#6B756B]">
              Scalable farmgate procurement, cleanroom processing, and OEM packaging tailored for food brands and institutional buyers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => openQuoteModal(undefined, 'WHOLESALE')}
            className="px-6 py-3 rounded-full bg-[#A97843] hover:bg-[#936535] text-white font-semibold text-xs sm:text-sm transition-colors shrink-0 self-start md:self-auto"
          >
            Request Bulk Quote
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {solutions.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-[#E4E7E1] bg-white shadow-card hover:shadow-hover transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-[4/3] w-full bg-[#F7F4EB] overflow-hidden border-b border-[#E4E7E1]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 95vw, (max-width: 1024px) 48vw, 300px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-5 space-y-2.5">
                  <h3 className="font-serif font-semibold text-lg text-[#202820] leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#6B756B] leading-relaxed">
                    {item.desc}
                  </p>
                  <p className="text-[11px] font-medium text-[#173F2B] bg-[#E8EFE6]/70 px-3 py-1.5 rounded-lg">
                    {item.capabilities}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2 flex items-center justify-between gap-2">
                <Link
                  href={item.href}
                  onClick={(e) => handleExploreClick(e, item.anchorId, item.href)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#173F2B] hover:text-[#102E20] group/link"
                >
                  <span>Explore Service</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                </Link>

                <button
                  type="button"
                  onClick={() => openQuoteModal(item.quoteItem, item.quoteCategory)}
                  className="px-3 py-1.5 rounded-full bg-[#F7F4EB] hover:bg-[#173F2B] text-[#A97843] hover:text-white border border-[#E4E7E1] text-xs font-semibold transition-colors"
                >
                  Enquire
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
