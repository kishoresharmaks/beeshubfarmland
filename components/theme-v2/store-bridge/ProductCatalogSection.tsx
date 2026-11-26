'use client';

import React from 'react';
import { Leaf, Search, X, AlertCircle, RefreshCw } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { sortProductsWithFeaturedFirst } from '@/lib/featuredProducts';
import { STORE_CATEGORIES } from '@/lib/productFormatting';
import { StorefrontProductCard } from '@/components/theme-v2/FeaturedProductsSection';

/**
 * Full Product Catalog Grid (/shop)
 * Clean category filter pills, search input, responsive product cards with variant support & Add-to-Cart.
 */
export default function ProductCatalogSection() {
  const {
    filteredProducts,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    loadingProducts,
    catalogError,
    refetchCatalog,
  } = useStore();

  const categoryTabs = ['All', ...STORE_CATEGORIES.map((c) => c.id)];
  const orderedProducts = sortProductsWithFeaturedFirst(filteredProducts);

  return (
    <section id="catalog-section" className="w-full py-12 sm:py-16 bg-white border-b border-[#E4E7E1]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-8">
        <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#202820]">
          All Farm-Sourced Products
        </h2>
        {/* Filter & Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#E4E7E1]">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            {categoryTabs.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#173F2B] text-white'
                    : 'bg-[#F7F4EB] text-[#6B756B] border border-[#E4E7E1] hover:border-[#173F2B]/40 hover:text-[#202820]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="w-4 h-4 text-[#6B756B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Filter products by name or description"
              className="w-full pl-9 pr-8 py-2 rounded-full bg-[#F7F4EB]/70 border border-[#E4E7E1] focus:border-[#173F2B] text-xs text-[#202820] placeholder:text-[#6B756B] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B756B] hover:text-[#202820]"
                aria-label="Clear filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {loadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, n) => (
              <div key={n} className="h-[400px] rounded-2xl bg-[#F7F4EB]/60 animate-pulse border border-[#E4E7E1]" />
            ))}
          </div>
        ) : catalogError ? (
          <div className="py-16 text-center space-y-3 bg-[#F7F4EB]/50 rounded-2xl border border-[#E4E7E1]">
            <AlertCircle className="w-8 h-8 text-[#A97843] mx-auto" />
            <h3 className="font-serif font-bold text-lg text-[#202820]">
              Unable to load products
            </h3>
            <p className="text-xs text-[#6B756B]">{catalogError}</p>
            <button
              type="button"
              onClick={refetchCatalog}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#173F2B] text-white text-xs font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : orderedProducts.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-[#F7F4EB]/50 rounded-2xl border border-[#E4E7E1]">
            <Leaf className="w-8 h-8 text-[#6B756B] mx-auto" />
            <h3 className="font-serif font-bold text-lg text-[#202820]">
              No products found
            </h3>
            <p className="text-xs text-[#6B756B]">
              Try selecting another category or clearing your search filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-5 py-2 rounded-full bg-[#173F2B] text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {orderedProducts.map((product) => (
              <StorefrontProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
