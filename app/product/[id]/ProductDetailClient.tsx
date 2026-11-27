'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  Leaf,
  MessageCircle,
  Plus,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { Product, ProductVariant, useStore } from '@/context/StoreContext';
import { formatProductDisplayName, getProductSlugUrl } from '@/lib/productFormatting';
import SocialShareBar from '@/components/theme-v2/SocialShareBar';
import TopUtilityBar from '@/components/theme-v2/TopUtilityBar';
import HeaderNav from '@/components/theme-v2/HeaderNav';
import Footer from '@/components/theme-v2/Footer';
import CartDrawer from '@/components/theme-v2/store-bridge/CartDrawer';
import CheckoutModal from '@/components/theme-v2/store-bridge/CheckoutModal';
import QuoteModal from '@/components/theme-v2/QuoteModal';
import OrderTrackingModal from '@/components/theme-v2/store-bridge/OrderTrackingModal';

export default function ProductDetailClient({
  product,
  relatedProducts = [],
}: {
  product: Product;
  relatedProducts?: Product[];
}) {
  const { addToCart, openQuoteModal, companyConfig } = useStore();
  const variants = product.variants && product.variants.length > 0 ? product.variants : [];
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [qty, setQty] = useState(1);

  const activeVariant: ProductVariant | undefined = variants[selectedVariantIdx];
  const displayPrice = activeVariant ? activeVariant.price : product.price;
  const displayMrp = activeVariant ? activeVariant.mrp : product.mrp;
  const availableStock = activeVariant ? activeVariant.quantity : product.quantity;
  const discount =
    activeVariant?.discount ??
    (displayMrp && displayMrp > displayPrice
      ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100)
      : product.discount || 0);

  const displayName = product.displayName || formatProductDisplayName(product.name);
  const cleanPhone = companyConfig?.phone?.replace(/\D/g, '') || '9578784431';
  const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
    `Hello BeesHub Farmland Team,\n\nI would like to enquire about *${displayName}*${
      activeVariant ? ` (${activeVariant.name})` : ''
    }. Please share bulk/retail availability and pricing.`
  )}`;

  return (
    <div className="min-h-screen bg-[#FFFCFB] text-[#202820] flex flex-col justify-between">
      <TopUtilityBar />
      <HeaderNav />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#64748B] flex-wrap">
          <Link href="/" className="hover:text-[#173F2B] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/shop" className="hover:text-[#173F2B] transition-colors">
            Shop
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202820] font-semibold truncate">{displayName}</span>
        </nav>

        {/* Product Main Split */}
        <div className="bg-white rounded-3xl border border-[#E8EDF2] shadow-card p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Product Image */}
          <div className="lg:col-span-5 relative aspect-square rounded-2xl bg-[#FFFCFB] border border-[#E8EDF2] p-6 flex items-center justify-center overflow-hidden">
            {product.image ? (
              <Image
                src={product.image}
                alt={displayName}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 480px"
                className="object-contain p-4"
              />
            ) : (
              <Leaf className="w-20 h-20 text-slate-300" />
            )}
            {discount > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#173F2B] text-white text-xs font-black">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Right: Details & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-[#FFF8F5] border border-[#173F2B]/20 text-[#173F2B] text-xs font-bold">
                {product.category || 'Farm Produce'}
              </span>
              <h1 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-[#202820] leading-tight">
                {displayName}
              </h1>
              <p className="text-sm text-[#64748B] leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 pt-2 border-t border-[#E8EDF2]">
              <span className="font-heading font-black text-3xl text-[#202820]">
                ₹{displayPrice.toLocaleString('en-IN')}
              </span>
              {displayMrp && displayMrp > displayPrice && (
                <span className="text-base text-slate-400 line-through">
                  ₹{displayMrp.toLocaleString('en-IN')}
                </span>
              )}
              <span className="text-xs text-[#10B981] font-bold">
                {availableStock > 0 ? 'In Stock · Ready to Dispatch' : 'Currently Out of Stock'}
              </span>
            </div>

            {/* Variants */}
            {variants.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#202820] block">Select Pack Size:</span>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v, idx) => (
                    <button
                      key={v._id || v.name || idx}
                      type="button"
                      onClick={() => setSelectedVariantIdx(idx)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        idx === selectedVariantIdx
                          ? 'bg-[#202820] text-white shadow-xs'
                          : 'bg-[#FFFCFB] text-[#202820] border border-[#E8EDF2] hover:border-slate-300'
                      }`}
                    >
                      {v.name} — ₹{v.price.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & CTA Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center border border-[#E8EDF2] rounded-2xl bg-[#FFFCFB]">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-3 text-sm font-bold text-[#202820] hover:text-[#173F2B]"
                  >
                    -
                  </button>
                  <span className="px-3 text-sm font-bold text-[#202820]">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => q + 1)}
                    className="px-3.5 py-3 text-sm font-bold text-[#202820] hover:text-[#173F2B]"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  disabled={availableStock <= 0}
                  onClick={() => addToCart(product, qty, activeVariant)}
                  className="flex-1 min-w-[180px] py-3.5 px-6 rounded-2xl bg-[#173F2B] hover:bg-[#D02E00] disabled:bg-slate-200 disabled:text-slate-500 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#173F2B]/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>{availableStock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => openQuoteModal(product.name, 'WHOLESALE', product._id)}
                  className="py-3.5 px-6 rounded-2xl bg-[#202820] hover:bg-[#0E273E] text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Bulk Quote</span>
                </button>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Order or Request COA on WhatsApp (+91 95787 84431)</span>
              </a>

              {product.coaUrl && (
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <a
                    href={product.coaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#E8EFE6] hover:bg-[#173F2B] text-[#173F2B] hover:text-white text-xs font-semibold transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Certificate of Analysis (COA)</span>
                  </a>
                  <a
                    href={`${product.coaUrl}${product.coaUrl.includes('?') ? '&' : '?'}download=1`}
                    download
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#F7F4EB] hover:bg-[#E8EFE6] text-[#202820] border border-[#E4E7E1] text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[#A97843]" />
                    <span>Download COA</span>
                  </a>
                </div>
              )}

              <div className="pt-2">
                <SocialShareBar
                  title={displayName}
                  description={product.description}
                  path={getProductSlugUrl(product)}
                  label="Share Product"
                />
              </div>
            </div>

            {/* Trust Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#E8EDF2] text-xs text-[#64748B]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>FSSAI #12425009000671</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>100% Farmgate Purity</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>Pan-India Express Dispatch</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-xl sm:text-2xl text-[#202820]">
                More Farmgate Products
              </h2>
              <Link href="/shop" className="text-xs font-bold text-[#173F2B] hover:underline">
                View All Products →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map((rp) => {
                const rpName = rp.displayName || formatProductDisplayName(rp.name);
                return (
                  <Link
                    key={rp._id}
                    href={getProductSlugUrl(rp)}
                    className="bg-white rounded-2xl p-4 border border-[#E8EDF2] hover:shadow-card transition-all flex flex-col justify-between group"
                  >
                    <div className="relative aspect-square rounded-xl bg-[#FFFCFB] border border-[#E8EDF2] mb-3 overflow-hidden">
                      {rp.image ? (
                        <Image
                          src={rp.image}
                          alt={rpName}
                          fill
                          className="object-contain p-3 group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <Leaf className="w-10 h-10 text-slate-300 m-auto" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-[#64748B]">{rp.category}</span>
                      <h3 className="font-heading font-bold text-sm text-[#202820] line-clamp-1 group-hover:text-[#173F2B]">
                        {rpName}
                      </h3>
                      <div className="font-heading font-bold text-sm text-[#202820]">
                        ₹{rp.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <Footer />
      <CartDrawer />
      <CheckoutModal />
      <QuoteModal />
      <OrderTrackingModal />
    </div>
  );
}
