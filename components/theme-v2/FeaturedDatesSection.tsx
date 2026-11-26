'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Briefcase,
  ShoppingBag,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  Leaf,
  Plus,
  Coffee,
  Heart,
  Layers,
} from 'lucide-react';
import { useStore, Product, ProductVariant } from '@/context/StoreContext';
import { getTargetedHomepageProducts, getFeaturedPriority } from '@/lib/featuredProducts';

export default function FeaturedDatesSection() {
  const { products, loadingProducts, addToCart, openQuoteModal, companyConfig } = useStore();
  const targetedProducts = getTargetedHomepageProducts(products);

  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  // Keep active index within bounds
  useEffect(() => {
    if (targetedProducts.length > 0 && activeIndex >= targetedProducts.length) {
      setActiveIndex(0);
    }
  }, [targetedProducts.length, activeIndex]);

  // Reset variant selection when active product changes
  useEffect(() => {
    setSelectedVariantIdx(0);
  }, [activeIndex]);

  if (!loadingProducts && targetedProducts.length === 0) {
    return null;
  }

  const activeProduct: Product | undefined = targetedProducts[activeIndex] || targetedProducts[0];
  const variants: ProductVariant[] =
    activeProduct?.variants && activeProduct.variants.length > 0 ? activeProduct.variants : [];
  const activeVariant: ProductVariant | undefined = variants[selectedVariantIdx];

  const displayPrice = activeProduct
    ? activeVariant
      ? activeVariant.price
      : activeProduct.price
    : 0;
  const displayMrp = activeProduct
    ? activeVariant
      ? activeVariant.mrp
      : activeProduct.mrp
    : 0;
  const availableStock = activeProduct
    ? activeVariant
      ? activeVariant.quantity
      : activeProduct.quantity
    : 0;
  const discount = activeProduct
    ? activeVariant?.discount ??
      (displayMrp && displayMrp > displayPrice
        ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100)
        : activeProduct.discount || 0)
    : 0;

  // Custom metadata based on product profile
  const getProductHighlights = (p?: Product) => {
    if (!p) return { badge: 'Superfood', desc: '', specs: [] };
    const name = p.name.toLowerCase();

    if (name.includes('coffee')) {
      return {
        badge: 'Caffeine-Free Hot Brew',
        tagline: 'Slow-roasted date seeds & pulp with warm, earthy cocoa notes.',
        specs: [
          { label: 'Origin', val: '100% Pitted Date Seed & Pulp' },
          { label: 'Caffeine Content', val: '0% Caffeine (Heart-Safe)' },
          { label: 'Applications', val: 'Hot Brew, Latte & Bakery Mix' },
          { label: 'Bulk Supply', val: 'Jars & 25kg Food Drums' },
        ],
      };
    }
    if (name.includes('beetroot')) {
      return {
        badge: 'Vitalizing Nitric-Oxide & Iron',
        tagline: 'Solar dehydrated dark red beets milled to fine vibrant nutrient powder.',
        specs: [
          { label: 'Nutrient Core', val: 'Native Dietary Nitrates & Iron' },
          { label: 'Mesh Texture', val: '80–100 Mesh Fine Dissolving' },
          { label: 'Usage', val: 'Natural Food Color & Health Mix' },
          { label: 'Preservatives', val: 'Zero Artificial Additives' },
        ],
      };
    }
    if (name.includes('banana')) {
      return {
        badge: 'Pure Nendran & Red Banana',
        tagline: 'Raw baby-weaning nutrient powder packed with resistant starch and potassium.',
        specs: [
          { label: 'Variety', val: 'Western Ghats Nendran & Red Banana' },
          { label: 'Dehydration', val: 'Controlled Solar Dry < 50°C' },
          { label: 'Primary Use', val: 'Infant Porridge & Energy Mixes' },
          { label: 'Shelf Life', val: '12 Months Vacuum Sealed' },
        ],
      };
    }
    // Default: Dates Powder
    return {
      badge: 'Unrefined Natural Sweetener',
      tagline: '100% whole sun-ripened dates dehydrated below 50°C to replace refined white cane sugar.',
      specs: [
        { label: 'Sugar Content', val: '0% Added Cane Sugar' },
        { label: 'Mesh Texture', val: '80–100 Mesh Ultra-Fine' },
        { label: 'Safe For', val: 'Baby Porridge, Bakery & Milk' },
        { label: 'Bulk Options', val: '250g Glass Jar to 25kg Lots' },
      ],
    };
  };

  const currentMeta = getProductHighlights(activeProduct);
  const cleanPhone = companyConfig?.phone?.replace(/\D/g, '') || '9578784431';

  const handleBulkQuoteClick = (productToQuote?: Product) => {
    const target = productToQuote || activeProduct;
    if (!target) return;
    openQuoteModal(target.name, 'WHOLESALE', target._id);
  };

  const handleAddToCartClick = (productToAdd?: Product) => {
    const target = productToAdd || activeProduct;
    if (!target) return;
    const v = target === activeProduct ? activeVariant : undefined;
    addToCart(target, 1, v);
  };

  const handleWhatsAppEnquiry = (target?: Product) => {
    const p = target || activeProduct;
    if (!p) return;
    const msg = `Hello BeesHub Farmland Team,\n\nI am interested in bulk quotation for *${p.name}* (ID: ${p._id}).\nPlease share bulk price tiers, MOQ, and batch test Certificate of Analysis (COA).`;
    window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <section
      id="featured-dates-section"
      className="w-full py-14 sm:py-20 bg-gradient-to-b from-[#FFFDFC] via-[#FFF9F6] to-[#FFFDFC] border-b border-[#E8EDF2]"
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-10">
        {/* Section Heading & Context */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#F1E5DF] pb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0EB] border border-[#ED3500]/25 text-[#ED3500] text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FARMGATE SUPERFOOD SPOTLIGHT</span>
            </div>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-[#163B5C] tracking-tight">
              Dates Powder, Dates Coffee &amp; Beetroot Banana Range
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Direct from solar dehydration facilities in Kanyakumari — unrefined fruit sweeteners and functional superfood powders with zero added cane sugar.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleBulkQuoteClick()}
              className="px-5 py-2.5 rounded-full bg-[#ED3500] hover:bg-[#D02E00] text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-xs"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Commercial Bulk Desk</span>
            </button>
            <a
              href="#catalog-section"
              className="px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-[#163B5C] font-semibold text-xs border border-[#E8EDF2] transition-colors flex items-center gap-1.5"
            >
              <span>Retail Store</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {loadingProducts ? (
          <div className="h-96 rounded-3xl bg-slate-100 animate-pulse border border-[#E8EDF2]" />
        ) : !activeProduct ? null : (
          <div className="space-y-8">
            {/* Interactive Tab Switcher Strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {targetedProducts.map((p, idx) => {
                const isActive = idx === activeIndex;
                const priority = getFeaturedPriority(p);
                return (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                      isActive
                        ? 'bg-[#163B5C] text-white shadow-md'
                        : 'bg-white text-[#475569] border border-[#E8EDF2] hover:border-slate-300 hover:bg-[#FFFCFB]'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isActive ? 'bg-[#ED3500]' : 'bg-slate-300'
                      }`}
                    />
                    <span className="truncate max-w-[200px] sm:max-w-none">{p.name}</span>
                    {priority === 1 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#ED3500]/20 text-[#ED3500]">
                        Top Pick
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* MASTER SPLIT SHOWCASE STAGE */}
            <div className="bg-white rounded-3xl border border-[#F1E5DF] shadow-lg shadow-[#163B5C]/5 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
              {/* Left Column: Visual Stage with Floating Certifications & Dock */}
              <div className="lg:col-span-5 bg-gradient-to-br from-[#FFFDFC] via-[#FFF8F5] to-[#FDF1EB] p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#F1E5DF] relative">
                {/* Top Floating Badge Bar */}
                <div className="flex items-center justify-between gap-2 z-10">
                  <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[#ED3500] text-[11px] font-bold border border-[#ED3500]/20 shadow-2xs">
                    {currentMeta.badge}
                  </span>
                  {discount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#10B981] text-white text-[10px] font-black tracking-wide shadow-2xs">
                      {discount}% OFF
                    </span>
                  )}
                </div>

                {/* Main Product Hero Image */}
                <div className="relative aspect-square max-h-[340px] my-6 flex items-center justify-center">
                  {activeProduct.image ? (
                    <Image
                      src={activeProduct.image}
                      alt={activeProduct.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      priority
                      className="object-contain p-4 drop-shadow-md hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <Leaf className="w-20 h-20 text-slate-300" />
                  )}
                </div>

                {/* Bottom Thumbnail Selector Dock */}
                <div className="pt-4 border-t border-[#F1E5DF]/70">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-[#64748B]">
                      Explore Targeted Range:
                    </span>
                    <span className="text-[10px] text-[#ED3500] font-bold">
                      {activeIndex + 1} of {targetedProducts.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {targetedProducts.slice(0, 4).map((p, idx) => (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => setActiveIndex(idx)}
                        className={`relative aspect-square rounded-xl bg-white border p-1 transition-all overflow-hidden ${
                          idx === activeIndex
                            ? 'border-[#ED3500] ring-2 ring-[#ED3500]/30 shadow-xs'
                            : 'border-[#E8EDF2] hover:border-slate-300 opacity-70 hover:opacity-100'
                        }`}
                        title={p.name}
                      >
                        {p.image ? (
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            className="object-contain p-1"
                          />
                        ) : (
                          <Leaf className="w-4 h-4 text-slate-300 m-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Commercial & Sensory Formulation Console */}
              <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  {/* Category & Status */}
                  <div className="flex items-center gap-3 text-xs text-[#64748B]">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#163B5C]/10 text-[#163B5C] font-bold text-[11px]">
                      {activeProduct.category || 'Direct Farm Harvest'}
                    </span>
                    <span className="flex items-center gap-1 text-[#10B981] font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Lab Tested Purity</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-heading font-bold text-2xl sm:text-3xl text-[#163B5C] tracking-tight leading-tight">
                    {activeProduct.name}
                  </h3>

                  {/* Tagline / Description */}
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    {activeProduct.description || currentMeta.tagline}
                  </p>

                  {/* 4-Block Technical Specifications Matrix */}
                  <div className="grid grid-cols-2 gap-2.5 pt-2">
                    {currentMeta.specs.map((spec, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-3 rounded-2xl bg-[#FFFCFB] border border-[#E8EDF2] space-y-0.5"
                      >
                        <div className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">
                          {spec.label}
                        </div>
                        <div className="text-xs font-bold text-[#163B5C] truncate">
                          {spec.val}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Variant / Size Chips */}
                  {variants.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#163B5C]">Available Pack Sizes:</span>
                        <span className="text-[#64748B] text-[11px]">
                          Select to update wholesale &amp; sample price
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {variants.map((v, vIdx) => (
                          <button
                            key={v._id || v.name || vIdx}
                            type="button"
                            onClick={() => setSelectedVariantIdx(vIdx)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              vIdx === selectedVariantIdx
                                ? 'bg-[#ED3500] text-white shadow-xs'
                                : 'bg-[#FFFCFB] text-[#163B5C] border border-[#E8EDF2] hover:border-slate-300'
                            }`}
                          >
                            <span>{v.name}</span>
                            <span className="ml-1.5 opacity-80 font-normal">
                              ₹{v.price.toLocaleString('en-IN')}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Live Price Display */}
                  <div className="pt-2 flex items-baseline gap-3">
                    <span className="font-heading font-black text-2xl sm:text-3xl text-[#163B5C]">
                      ₹{displayPrice.toLocaleString('en-IN')}
                    </span>
                    {displayMrp && displayMrp > displayPrice && (
                      <span className="text-xs sm:text-sm text-slate-400 line-through">
                        ₹{displayMrp.toLocaleString('en-IN')}
                      </span>
                    )}
                    <span className="text-xs text-[#64748B]">
                      {activeVariant ? `per ${activeVariant.name}` : 'retail pack'} (Excl. bulk trade volume discounts)
                    </span>
                  </div>
                </div>

                {/* DEDICATED HIGH-IMPACT ACTION CONSOLE */}
                <div className="space-y-3 pt-4 border-t border-[#F1E5DF]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Primary Button: REQUEST BULK QUOTE (Preloads exact item!) */}
                    <button
                      type="button"
                      onClick={() => handleBulkQuoteClick(activeProduct)}
                      className="w-full py-3.5 px-6 rounded-2xl bg-[#ED3500] hover:bg-[#D02E00] text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-[#ED3500]/25"
                    >
                      <Briefcase className="w-4 h-4 shrink-0" />
                      <span>Request Bulk Quote</span>
                    </button>

                    {/* Secondary Button: Add Sample to Cart */}
                    <button
                      type="button"
                      disabled={availableStock <= 0}
                      onClick={() => handleAddToCartClick(activeProduct)}
                      className="w-full py-3.5 px-6 rounded-2xl bg-[#163B5C] hover:bg-[#0E273E] disabled:bg-slate-200 disabled:text-slate-500 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-2xs"
                    >
                      <Plus className="w-4 h-4 shrink-0" />
                      <span>{availableStock > 0 ? 'Add Sample to Cart' : 'Out of Stock'}</span>
                    </button>
                  </div>

                  {/* WhatsApp Direct Trade Link */}
                  <button
                    type="button"
                    onClick={() => handleWhatsAppEnquiry(activeProduct)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    <span>Inquire this product via WhatsApp Farm Desk</span>
                  </button>
                </div>
              </div>
            </div>

            {/* HORIZONTAL COMPACT PRODUCT STRIP (Different from vertical cards) */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#163B5C] uppercase tracking-wider">
                  Targeted Superfood Inventory
                </span>
                <span className="text-[11px] text-[#64748B]">
                  Click to inspect in showcase or request instant quote
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {targetedProducts.map((p, idx) => {
                  const isSelected = idx === activeIndex;
                  return (
                    <div
                      key={p._id}
                      onClick={() => setActiveIndex(idx)}
                      className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-white border-2 border-[#ED3500] shadow-sm'
                          : 'bg-white/80 hover:bg-white border border-[#E8EDF2] hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 rounded-xl bg-[#FFFCFB] border border-[#E8EDF2] p-1 shrink-0 overflow-hidden">
                          {p.image ? (
                            <Image
                              src={p.image}
                              alt={p.name}
                              fill
                              className="object-contain p-1"
                            />
                          ) : (
                            <Leaf className="w-5 h-5 text-slate-300 m-auto" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-heading font-bold text-xs text-[#163B5C] truncate">
                            {p.name}
                          </h4>
                          <div className="text-[11px] font-semibold text-[#ED3500]">
                            ₹{p.price.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBulkQuoteClick(p);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-[#FFFCFB] hover:bg-[#FFF0EB] border border-[#E8EDF2] hover:border-[#ED3500]/40 text-[#ED3500] text-[10px] font-bold shrink-0 transition-colors"
                        title={`Request bulk quote for ${p.name}`}
                      >
                        Quote
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
