'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CreditCard,
  Truck,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Phone,
  Mail,
  MapPin,
  User,
  ShoppingBag,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

/**
 * Modern 2-Step Checkout Modal
 * Step 1: Shipping & Customer Information
 * Step 2: Payment Gateway Selection (Razorpay vs COD)
 * Success confirmation with formatted WhatsApp support deep-link.
 */
export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    checkoutForm,
    setCheckoutForm,
    submittingOrder,
    formError,
    setFormError,
    orderSuccess,
    setOrderSuccess,
    handlePlaceOrder,
    cart,
    cartGrandTotal,
    cartSubtotal,
    cartGstTotal,
    settings,
    companyConfig,
  } = useStore();

  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCheckoutOpen && !submittingOrder) {
        setIsCheckoutOpen(false);
      }
    };
    if (isCheckoutOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCheckoutOpen, submittingOrder, setIsCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (
      !checkoutForm.customerName.trim() ||
      !checkoutForm.customerPhone.trim() ||
      !checkoutForm.customerEmail.trim() ||
      !checkoutForm.shippingAddress.trim() ||
      !checkoutForm.pincode.trim()
    ) {
      setFormError('Please enter all required contact and shipping details.');
      return;
    }

    const cleanPhone = checkoutForm.customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (checkoutForm.pincode.trim().length !== 6) {
      setFormError('Please enter a valid 6-digit delivery pincode.');
      return;
    }

    setCheckoutStep(2);
  };

  const isOnlineAvailable = settings.enableOnlinePayment ?? settings.enableUPI ?? true;
  const isCodAvailable = settings.enableCOD ?? true;

  const cleanStorePhone = companyConfig.phone.replace(/\D/g, '') || '9578784431';
  const getWhatsAppSupportUrl = (order: any) => {
    if (!order) return `https://wa.me/91${cleanStorePhone}`;
    const itemsList = order.items
      ? order.items.map((it: any) => `• ${it.name} x ${it.quantity} (₹${(it.price * it.quantity).toLocaleString('en-IN')})`).join('\n')
      : '';

    const text = `Hello BeesHub Farmland Team,

I need support regarding my order:

*Order ID:* ${order.orderId || ''}
*Name:* ${order.customerName || ''}
*Phone:* ${order.customerPhone || ''}
*Address:* ${order.shippingAddress || ''} - ${order.pincode || ''}

*Items Ordered:*
${itemsList}

*Total Amount:* ₹${order.totalAmount ? order.totalAmount.toLocaleString('en-IN') : 0}
*Payment:* ${order.paymentMethod} (${order.paymentStatus})
*Status:* ${order.status}`;

    return `https://wa.me/91${cleanStorePhone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#E8EDF2] max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Loading Spinner */}
        {submittingOrder && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-xs z-50 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#ED3500] animate-spin" />
            <p className="font-heading font-semibold text-sm text-[#163B5C]">
              Processing order and payment verification…
            </p>
          </div>
        )}

        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#E8EDF2] bg-[#163B5C] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-amber-300 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base sm:text-lg">
                Secure Storefront Checkout
              </h3>
              <p className="text-xs text-slate-300">
                Total Payable: <strong className="text-amber-300">₹{cartGrandTotal.toLocaleString('en-IN')}</strong> (Free Shipping)
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Close checkout"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        {!orderSuccess && (
          <div className="px-6 py-3 bg-[#FFFCFB] border-b border-[#E8EDF2] flex items-center justify-between text-xs font-bold text-[#64748B]">
            <button
              onClick={() => setCheckoutStep(1)}
              className={`flex items-center gap-2 ${checkoutStep === 1 ? 'text-[#ED3500]' : 'hover:text-[#163B5C]'}`}
            >
              <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center text-white ${checkoutStep === 1 ? 'bg-[#ED3500]' : 'bg-slate-400'}`}>
                1
              </span>
              <span>Delivery Address</span>
            </button>
            <div className="w-12 h-0.5 bg-slate-200" />
            <div className={`flex items-center gap-2 ${checkoutStep === 2 ? 'text-[#ED3500]' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center text-white ${checkoutStep === 2 ? 'bg-[#ED3500]' : 'bg-slate-300'}`}>
                2
              </span>
              <span>Payment Option</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {orderSuccess ? (
            /* Order Placed Success Confirmation */
            <div className="py-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center mx-auto border border-[#A7F3D0] shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-heading font-black text-xl sm:text-2xl text-[#163B5C]">
                  Order Successfully Confirmed!
                </h4>
                <p className="text-xs sm:text-sm text-[#64748B]">
                  Thank you, <strong className="text-[#163B5C]">{orderSuccess.customerName}</strong>. Your organic harvest package is being prepared at our farmlands.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFFCFB] border border-[#E8EDF2] text-left space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-[#E8EDF2]">
                  <span className="text-[#64748B] font-bold">Order ID:</span>
                  <span className="font-mono font-black text-[#ED3500] text-sm">{orderSuccess.orderId}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Payment Mode:</span>
                  <span className="font-bold text-[#163B5C]">{orderSuccess.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Total Amount Paid/Payable:</span>
                  <span className="font-bold text-[#163B5C]">₹{orderSuccess.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Shipping Destination:</span>
                  <span className="text-right text-[#163B5C] truncate max-w-[200px]">
                    {orderSuccess.shippingAddress} ({orderSuccess.pincode})
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={getWhatsAppSupportUrl(orderSuccess)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Receive WhatsApp Updates</span>
                </a>
                <button
                  onClick={() => {
                    setOrderSuccess(null);
                    setIsCheckoutOpen(false);
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#163B5C] hover:bg-[#0E273E] text-white font-semibold text-xs transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : checkoutStep === 1 ? (
            /* Step 1: Customer Contact & Shipping Details */
            <form onSubmit={handleNextStep} className="space-y-4">
              {formError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-extrabold text-[#163B5C] mb-1">
                  Full Customer Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suresh Kumar"
                    value={checkoutForm.customerName}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, customerName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-[#163B5C] mb-1">
                    Mobile Phone (10 Digits) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={checkoutForm.customerPhone}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, customerPhone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#163B5C] mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. suresh@example.com"
                      value={checkoutForm.customerEmail}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, customerEmail: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#163B5C] mb-1">
                  Complete Shipping Address (Door No, Street, Landmark) *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Door No. 42, 2nd Cross, Anna Nagar, Near Temple"
                    value={checkoutForm.shippingAddress}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, shippingAddress: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#163B5C] mb-1">
                  Delivery Pincode (6 Digits) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 600040"
                  value={checkoutForm.pincode}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, pincode: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-[#ED3500] hover:bg-[#D02E00] text-white font-semibold text-sm shadow-md shadow-[#ED3500]/25 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Continue to Payment Method</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            /* Step 2: Payment Method Selection & Submit */
            <form onSubmit={handlePlaceOrder} className="space-y-5">
              {formError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Order Mini-Recap */}
              <div className="p-4 rounded-2xl bg-[#FFFCFB] border border-[#E8EDF2] space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-[#163B5C]">
                  <span>Items Total ({cart.length} unique)</span>
                  <span>₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Applicable GST Taxes</span>
                  <span>+₹{cartGstTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Delivery Charges</span>
                  <span className="text-[#10B981] font-bold">FREE</span>
                </div>
                <div className="pt-2 border-t border-[#E8EDF2] flex justify-between font-black text-sm text-[#ED3500]">
                  <span>Grand Total</span>
                  <span>₹{cartGrandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#163B5C]">
                  Select Payment Option
                </label>

                {/* Razorpay Online */}
                {isOnlineAvailable && (
                  <div
                    onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: 'RAZORPAY' })}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      checkoutForm.paymentMethod === 'RAZORPAY'
                        ? 'border-[#ED3500] bg-orange-50/30 shadow-xs'
                        : 'border-[#E8EDF2] bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-[#163B5C]" />
                      <div>
                        <div className="font-heading font-semibold text-sm text-[#163B5C]">
                          Online Payment (UPI, Cards, NetBanking)
                        </div>
                        <p className="text-[11px] text-[#64748B]">
                          Instant verification powered by Razorpay secure gateway
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${checkoutForm.paymentMethod === 'RAZORPAY' ? 'border-[#ED3500] bg-[#ED3500]' : 'border-slate-300'}`}>
                      {checkoutForm.paymentMethod === 'RAZORPAY' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                )}

                {/* Cash on Delivery */}
                {isCodAvailable && (
                  <div
                    onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: 'COD' })}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      checkoutForm.paymentMethod === 'COD'
                        ? 'border-[#ED3500] bg-orange-50/30 shadow-xs'
                        : 'border-[#E8EDF2] bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-[#163B5C]" />
                      <div>
                        <div className="font-heading font-semibold text-sm text-[#163B5C]">
                          Cash on Delivery (COD)
                        </div>
                        <p className="text-[11px] text-[#64748B]">
                          Pay in cash upon doorstep delivery by courier
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${checkoutForm.paymentMethod === 'COD' ? 'border-[#ED3500] bg-[#ED3500]' : 'border-slate-300'}`}>
                      {checkoutForm.paymentMethod === 'COD' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCheckoutStep(1)}
                  className="py-3.5 px-5 rounded-full border border-[#E8EDF2] text-xs font-bold text-[#64748B] hover:text-[#163B5C] transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="flex-1 py-4 rounded-full bg-[#ED3500] hover:bg-[#D02E00] text-white font-semibold text-sm shadow-md shadow-[#ED3500]/25 transition-colors flex items-center justify-center gap-2"
                >
                  <span>
                    {checkoutForm.paymentMethod === 'COD' ? 'Place Order (Cash on Delivery)' : 'Proceed to Razorpay Payment'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
