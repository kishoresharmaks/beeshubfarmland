'use client';

import React from 'react';
import Image from 'next/image';
import {
  ShoppingBag,
  Eye,
  Plus,
  CheckCircle2,
  Sparkles,
  Leaf,
  Filter,
} from 'lucide-react';
import { useStore, Product } from '@/context/StoreContext';
import { sortProductsWithFeaturedFirst } from '@/lib/featuredProducts';

/**
 * Embedded Product Catalog Grid
 * Category filter pills, search input, responsive product cards with instant Add-to-Cart.
 */
export default function ProductCatalogSection() {
  const {
    filteredProducts,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    addToCart,
    setQuickViewProduct,
    loadingProducts,
  } = useStore();

  const allCategoryTabs = ['All', ...categories.map((c) => c.name)];
  const orderedProducts = sortProductsWithFeaturedFirst(filteredProducts);

  return (
    <section id="catalog-section" className="w-full py-16 sm:py-24 bg-white border-b border-[#E8EDF2]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-[#163B5C] tracking-tight">
              Retail and sample products
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Natural harvest dispatched directly from Kanyakumari.
            </p>
          </div>

          {/* Category Filter Pills (Horizontal Scroll) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {allCategoryTabs.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#163B5C] text-white shadow-xs'
                    : 'bg-[#FFFCFB] text-[#64748B] border border-[#E8EDF2] hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {loadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 rounded-3xl bg-slate-100 animate-pulse border border-[#E8EDF2]" />
            ))}
          </div>
        ) : orderedProducts.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-[#FFFCFB] rounded-3xl border border-[#E8EDF2]">
            <Leaf className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="font-heading font-bold text-base text-[#163B5C]">
              No products found
            </h4>
            <p className="text-xs text-[#64748B]">
              Try selecting a different category or clearing your search term.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-[#ED3500] hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {orderedProducts.map((product) => {
              const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : undefined;
              const displayPrice = defaultVariant ? defaultVariant.price : product.price;
              const displayMrp = defaultVariant ? defaultVariant.mrp : product.mrp;
              const discount = product.discount || (displayMrp && displayMrp > displayPrice ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100) : 0);

              return (
                <div
                  key={product._id}
                  className="bg-[#FFFCFB] rounded-3xl p-5 border border-[#E8EDF2] shadow-card hover:shadow-hover transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Image Area */}
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-[#E8EDF2] p-3 flex items-center justify-center">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Leaf className="w-12 h-12 text-slate-300" />
                      )}

                      {/* Discount Badge */}
                      {discount > 0 && (
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[#ED3500] text-white text-[10px] font-black">
                          {discount}% OFF
                        </span>
                      )}

                      {/* Quick View Button */}
                      <button
                        onClick={() => setQuickViewProduct(product)}
                        className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#163B5C] hover:text-[#ED3500] shadow-md flex items-center justify-center transition-colors opacity-90 sm:opacity-0 group-hover:opacity-100"
                        title="Quick View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-medium text-[#64748B]">
                        {product.category || 'Organic'}
                      </span>
                      <h4 className="font-heading font-bold text-sm text-[#163B5C] leading-snug line-clamp-1 group-hover:text-[#ED3500] transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-[#64748B] line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  {/* Price & Add to Cart */}
                  <div className="pt-4 mt-4 border-t border-[#E8EDF2] flex items-center justify-between gap-2">
                    <div>
                      <div className="font-heading font-bold text-base text-[#163B5C]">
                        ₹{displayPrice.toLocaleString('en-IN')}
                      </div>
                      {displayMrp && displayMrp > displayPrice && (
                        <div className="text-[10px] text-slate-400 line-through">
                          ₹{displayMrp.toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => addToCart(product, 1, defaultVariant)}
                      className="px-4 py-2 rounded-full bg-[#163B5C] hover:bg-[#ED3500] text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
