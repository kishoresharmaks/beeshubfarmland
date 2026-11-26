'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { STORE_CATEGORIES, normalizeStoreCategory } from '@/lib/productFormatting';

/**
 * Section 5: Shop by Category
 * Displays only actual non-empty categories derived from live inventory.
 */
export default function CategoryShowcase() {
  const { products, setSelectedCategory } = useStore();

  const categoriesWithCounts = STORE_CATEGORIES.map((cat) => {
    const count = products.filter((p) => normalizeStoreCategory(p) === cat.id).length;
    return { ...cat, count };
  }).filter((cat) => products.length === 0 || cat.count > 0);

  return (
    <section className="w-full py-14 sm:py-20 bg-white border-b border-[#E4E7E1]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#A97843]">
              Product Range
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-[#202820] tracking-tight">
              Shop by Category
            </h2>
            <p className="text-sm text-[#6B756B] leading-relaxed">
              Explore natural honey, solar-dehydrated superfood powders, and wood cold-pressed oils directly from our Tamil Nadu operations.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#173F2B] hover:text-[#102E20] shrink-0 group"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {categoriesWithCounts.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${encodeURIComponent(cat.id)}`}
              onClick={() => setSelectedCategory(cat.id)}
              className="group bg-[#F7F4EB]/60 hover:bg-white rounded-2xl border border-[#E4E7E1] hover:border-[#173F2B]/40 p-3.5 transition-all duration-200 hover:shadow-hover flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white border border-[#E4E7E1]">
                  <Image
                    src={cat.image}
                    alt={cat.label}
                    fill
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 180px"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="space-y-1">
                  <h3 className="font-semibold text-sm text-[#202820] group-hover:text-[#173F2B] leading-snug">
                    {cat.label}
                  </h3>
                  <p className="text-[11px] text-[#6B756B] line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-[#E4E7E1] flex items-center justify-between text-[11px] font-semibold text-[#173F2B]">
                <span>{cat.count > 0 ? `${cat.count} products` : 'Explore'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
