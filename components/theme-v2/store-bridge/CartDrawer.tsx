'use client';

import React from 'react';
import Image from 'next/image';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Leaf,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

/**
 * Slide-over Cart Drawer
 * Live quantity adjustments, variant details, authoritative Subtotal & GST calculation, checkout trigger.
 */
export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQty,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartGstTotal,
    cartGrandTotal,
    cartItemCount,
    setIsCheckoutOpen,
  } = useStore();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#E8EDF2] flex items-center justify-between bg-[#173F2B] text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-base leading-tight">
                  Your Harvest Cart
                </h3>
                <span className="text-[11px] text-slate-300 font-semibold">
                  {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} selected
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Close cart"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-heading font-black text-lg text-[#202820]">
                    Your Cart is Empty
                  </h4>
                  <p className="text-xs text-[#64748B] max-w-xs leading-relaxed">
                    Explore our certified raw honey, cold-pressed oils, and organic spices directly from Kanyakumari farmlands.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 rounded-full bg-[#173F2B] text-white font-semibold text-xs shadow-xs hover:bg-[#0E273E] transition-colors"
                >
                  Browse products
                </button>
              </div>
            ) : (
              cart.map((item, idx) => {
                const variantName = item.selectedVariant?.name;
                const unitPrice = item.selectedVariant ? item.selectedVariant.price : item.product.price;
                const maxStock = item.selectedVariant ? item.selectedVariant.quantity : item.product.quantity;

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#FFFCFB] border border-[#E8EDF2] flex gap-3.5 items-center justify-between shadow-2xs"
                  >
                    {/* Product Image */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white border border-[#E8EDF2] shrink-0">
                      {item.product.image ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                          <Leaf className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading font-bold text-xs sm:text-sm text-[#202820] truncate">
                        {item.product.name}
                      </h4>
                      {variantName && (
                        <span className="text-[10px] font-extrabold text-[#173F2B] bg-orange-50 px-2 py-0.5 rounded-md inline-block mt-0.5 border border-orange-200">
                          {variantName}
                        </span>
                      )}
                      <div className="text-xs font-black text-[#202820] mt-1">
                        ₹{unitPrice.toLocaleString('en-IN')}{' '}
                        <span className="text-[10px] text-[#64748B] font-normal">
                          (+{item.product.gst || 0}% GST)
                        </span>
                      </div>
                    </div>

                    {/* Stepper & Remove */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center border border-[#E8EDF2] rounded-lg bg-white overflow-hidden shadow-2xs">
                        <button
                          onClick={() => updateCartQty(item.product._id, variantName, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-black text-[#202820]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.product._id, variantName, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product._id, variantName)}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Totals */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-[#E8EDF2] bg-[#FFFCFB] space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#64748B]">
                  <span>Subtotal (Base Value)</span>
                  <span className="font-bold text-[#202820]">
                    ₹{cartSubtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Itemized GST Taxes</span>
                  <span className="font-bold text-[#202820]">
                    +₹{cartGstTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Nationwide Express Delivery</span>
                  <span className="font-bold text-[#10B981]">FREE SHIPPING</span>
                </div>
                <div className="pt-2 border-t border-[#E8EDF2] flex justify-between items-baseline">
                  <span className="font-heading font-extrabold text-sm text-[#202820]">
                    Total Payable Amount
                  </span>
                  <span className="font-heading font-black text-xl text-[#173F2B]">
                    ₹{cartGrandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full py-4 rounded-full bg-[#173F2B] hover:bg-[#102E20] text-white font-semibold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span>Proceed to checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-4 text-[10px] text-[#64748B] pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#10B981]" /> 100% Secure Checkout
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3 text-amber-500" /> GST Billing Included
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
