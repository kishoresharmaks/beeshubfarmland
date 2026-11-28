'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  ShieldCheck,
  Leaf,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { useStore, ProductVariant } from '@/context/StoreContext';
import {
  formatProductDisplayName,
  getProductSlugUrl,
  formatVariantLabel,
  isEnquiryOnlyProduct,
} from '@/lib/productFormatting';
import SocialShareBar from '../SocialShareBar';

/**
 * Product QuickView Modal
 * Shows detailed product specifications, variant selector, live stock indicators, and instant add-to-cart or enquiry.
 */
export default function ProductQuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart, openQuoteModal } = useStore();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (quickViewProduct?.variants && quickViewProduct.variants.length > 0) {
      setSelectedVariant(quickViewProduct.variants[0]);
    } else {
      setSelectedVariant(undefined);
    }
    setQuantity(1);
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const activePrice = selectedVariant ? selectedVariant.price : quickViewProduct.price;
  const activeMrp = selectedVariant ? selectedVariant.mrp : quickViewProduct.mrp;
  const activeStock = selectedVariant ? selectedVariant.quantity : quickViewProduct.quantity;
  const enquiryOnly = isEnquiryOnlyProduct(quickViewProduct, selectedVariant);

  const handleAddToCart = () => {
    addToCart(quickViewProduct, quantity, selectedVariant);
    setQuickViewProduct(null);
  };

  const handleEnquireClick = () => {
    const prod = quickViewProduct;
    const varName = selectedVariant?.name;
    setQuickViewProduct(null);
    openQuoteModal(prod.name, 'GENERAL', prod._id, varName);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E8EDF2] max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8EDF2] flex items-center justify-between bg-[#FFFCFB]">
          <span className="text-xs font-semibold text-[#202820]">
            Product details
          </span>
          <button
            onClick={() => setQuickViewProduct(null)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            {/* Image Box */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#FFFCFB] border border-[#E8EDF2] p-2 flex items-center justify-center">
              {quickViewProduct.image ? (
                <Image
                  src={quickViewProduct.image}
                  alt={quickViewProduct.name}
                  fill
                  className="object-contain p-4"
                />
              ) : (
                <Leaf className="w-16 h-16 text-slate-300" />
              )}
            </div>

            {/* Content Details */}
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-medium text-[#64748B]">
                  {quickViewProduct.category || 'Farm Produce'}
                </span>
                <h3 className="font-heading font-bold text-xl sm:text-2xl text-[#202820] mt-1 leading-tight">
                  {quickViewProduct.name}
                </h3>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-3">
                {enquiryOnly ? (
                  <span className="font-heading font-bold text-xl text-[#173F2B]">
                    Price on Enquiry
                  </span>
                ) : (
                  <>
                    <span className="font-heading font-bold text-2xl text-[#202820]">
                      ₹{activePrice.toLocaleString('en-IN')}
                    </span>
                    {activeMrp && activeMrp > activePrice && (
                      <span className="text-sm text-[#64748B] line-through">
                        ₹{activeMrp.toLocaleString('en-IN')}
                      </span>
                    )}
                    {quickViewProduct.gst > 0 && (
                      <span className="text-xs text-[#64748B]">
                        (+{quickViewProduct.gst}% GST)
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-[#64748B] leading-relaxed">
                {quickViewProduct.description}
              </p>

              {/* Variants */}
              {quickViewProduct.variants && quickViewProduct.variants.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold text-[#202820]">
                    Select Packaging Size / Variant:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {quickViewProduct.variants.map((v, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          selectedVariant?.name === v.name
                            ? 'bg-[#202820] text-white border-[#202820] shadow-xs'
                            : 'bg-[#FFFCFB] text-[#64748B] border-[#E8EDF2] hover:border-slate-300'
                        }`}
                      >
                        {formatVariantLabel(v.name)}{' '}
                        {v.price > 0 ? `(₹${v.price.toLocaleString('en-IN')})` : '(Enquire)'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Indicator */}
              <div className="text-xs">
                {enquiryOnly ? (
                  <span className="text-[#A97843] font-bold flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4" /> Available via Direct Product Enquiry
                  </span>
                ) : activeStock > 0 ? (
                  <span className="text-[#10B981] font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> In Stock & Freshly Packaged
                  </span>
                ) : (
                  <span className="text-rose-600 font-bold">
                    Currently Out of Stock
                  </span>
                )}
              </div>

              {/* Add to Cart / Click to Enquire Controls */}
              <div className="pt-2 flex items-center gap-3">
                {enquiryOnly ? (
                  <button
                    type="button"
                    onClick={handleEnquireClick}
                    className="flex-1 py-3.5 px-6 rounded-full bg-[#A97843] hover:bg-[#173F2B] text-white font-semibold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Click to Enquire</span>
                  </button>
                ) : (
                  <>
                    <div className="flex items-center border border-[#E8EDF2] rounded-xl bg-white overflow-hidden shadow-2xs">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-xs font-black text-[#202820]">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(activeStock || 99, quantity + 1))}
                        className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      disabled={activeStock <= 0}
                      className="flex-1 py-3.5 px-6 rounded-full bg-[#173F2B] hover:bg-[#102E20] text-white font-semibold text-xs shadow-md shadow-[#173F2B]/25 transition-colors flex items-center justify-center gap-2 disabled:bg-slate-300"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>
                  </>
                )}
              </div>

              <div className="pt-3 border-t border-[#E4E7E1]">
                <SocialShareBar
                  title={formatProductDisplayName(quickViewProduct.name)}
                  description={quickViewProduct.description}
                  path={getProductSlugUrl(quickViewProduct)}
                  label="Share Product"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
