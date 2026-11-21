'use client';

import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

/**
 * Section E: Showcase Mosaic
 * Centered H3 + 1-line intro.
 * 10 rounded image tiles in a bento grid (mixed large/small).
 */
export default function ShowcaseMosaic() {
  const { setSelectedCategory } = useStore();

  const tiles = [
    {
      title: 'Western Ghats Forest Apiaries',
      desc: '1,200m elevation bio-reserve honey flora',
      category: 'Honey',
      span: 'md:col-span-2 md:row-span-2',
      bgGradient: 'from-amber-900/80 via-amber-800/40 to-transparent',
      accent: 'Raw Honey Harvest',
    },
    {
      title: 'Organic Cardamom Estates',
      desc: 'High-altitude green pod cultivation',
      category: 'Organic Spices',
      span: 'md:col-span-1 md:row-span-1',
      bgGradient: 'from-emerald-950/80 to-transparent',
      accent: '8mm Bold Pods',
    },
    {
      title: 'Lakadong High-Curcumin Turmeric',
      desc: 'Stone ground roots with >5.5% natural curcumin',
      category: 'Organic Spices',
      span: 'md:col-span-1 md:row-span-1',
      bgGradient: 'from-orange-950/80 to-transparent',
      accent: 'FMCG Grade',
    },
    {
      title: 'Stingless Bee Medicinal Apiaries',
      desc: 'Rare Melipona apiculture for ayurvedic formulations',
      category: 'Honey',
      span: 'md:col-span-2 md:row-span-1',
      bgGradient: 'from-amber-950/80 to-transparent',
      accent: 'Therapeutic Grade',
    },
    {
      title: 'Wood-Churned Virgin Coconut Oil',
      desc: 'Single-estate sulfur-free cold extraction',
      category: 'Cold Pressed Oils',
      span: 'md:col-span-1 md:row-span-1',
      bgGradient: 'from-slate-900/80 to-transparent',
      accent: 'Cold Pressed',
    },
    {
      title: 'Tellicherry Black Pepper Vines',
      desc: 'Hand-picked dried sun-ripened berries',
      category: 'Organic Spices',
      span: 'md:col-span-1 md:row-span-1',
      bgGradient: 'from-zinc-900/80 to-transparent',
      accent: 'Grade TGSEB',
    },
    {
      title: 'Raw Edible Honeycombs',
      desc: 'Untouched comb frames in food-grade barrels',
      category: 'Honey',
      span: 'md:col-span-1 md:row-span-1',
      bgGradient: 'from-yellow-950/80 to-transparent',
      accent: 'Whole Frame',
    },
    {
      title: 'Pure Granular Bee Pollen',
      desc: 'Nutrient clusters direct from comb traps',
      category: 'Honey',
      span: 'md:col-span-1 md:row-span-1',
      bgGradient: 'from-amber-950/80 to-transparent',
      accent: 'Bioactive Pollen',
    },
    {
      title: 'Modern GMP Food Packaging Facility',
      desc: 'Automated glass jar and drum packing line',
      category: 'All',
      span: 'md:col-span-2 md:row-span-1',
      bgGradient: 'from-blue-950/80 to-transparent',
      accent: 'ISO 22000 Cleanroom',
    },
    {
      title: 'Bulk 30kg & 300kg Drum Logistics',
      desc: 'Pan-India direct container and pallet dispatches',
      category: 'All',
      span: 'md:col-span-2 md:row-span-1',
      bgGradient: 'from-stone-900/80 to-transparent',
      accent: 'Nationwide Logistics',
    },
  ];

  const handleTileClick = (cat: string) => {
    setSelectedCategory(cat);
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full py-16 sm:py-20 bg-[#FFFCFB] border-b border-[#E8EDF2]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Centered H3 + 1-Line Intro */}
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <h3 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-[#163B5C] tracking-tight">
            Harvest and cultivation operations
          </h3>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Apiaries, spice estates, and processing facilities across the Western Ghats.
          </p>
        </div>

        {/* 10-Tile Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[160px] sm:auto-rows-[180px]">
          {tiles.map((tile, idx) => (
            <div
              key={idx}
              onClick={() => handleTileClick(tile.category)}
              className={`group relative overflow-hidden rounded-3xl border border-[#E8EDF2] cursor-pointer shadow-xs hover:border-[#10B981] transition-colors duration-200 bg-[#163B5C] ${tile.span}`}
            >
              {/* Background Layer with Subtle Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-t ${tile.bgGradient}`}
              />

              {/* Decorative Farm Graphic Layer */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/60 pointer-events-none" />

              {/* Content Overlay */}
              <div className="absolute inset-0 p-5 flex flex-col justify-between z-10 text-white">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-semibold tracking-wider text-amber-200 border border-white/20">
                    {tile.accent}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-[#ED3500] flex items-center justify-center transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-heading font-bold text-sm sm:text-base leading-snug text-white">
                    {tile.title}
                  </h4>
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {tile.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
