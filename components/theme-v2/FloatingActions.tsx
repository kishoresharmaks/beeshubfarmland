'use client';

import React from 'react';
import { Phone, MessageCircle, Briefcase, ShoppingBag } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

/**
 * Section Q: Floating Actions
 * Two circular icon buttons (call, WhatsApp chat in green), bottom-right, 48-56px.
 * Paired CTA bar ("Enquire" + "View Products") sticky at bottom on mobile.
 */
export default function FloatingActions() {
  const { companyConfig, setIsQuoteModalOpen, setIsCartOpen, cartItemCount } = useStore();

  const cleanPhone = companyConfig.phone.replace(/\D/g, '') || '9578784431';
  const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
    'Hello BeesHub Farmland Team, I would like to inquire about wholesale bulk supply and pricing for raw honey & organic spices.'
  )}`;

  const handleScrollToProducts = () => {
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Floating Circular Buttons (Bottom Right, Desktop & Mobile) */}
      <div className="fixed bottom-20 sm:bottom-6 right-5 z-40 flex flex-col gap-3 items-end">
        {/* Call Button */}
        <a
          href={`tel:${companyConfig.phone}`}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#163B5C] text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all border-2 border-white"
          title="Call BeesHub Farmland"
          aria-label="Call Trade Desk"
        >
          <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
        </a>

        {/* WhatsApp Chat Button (#25D366) */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all border-2 border-white"
          title="Chat on WhatsApp"
          aria-label="WhatsApp Chat"
        >
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-white" />
        </a>
      </div>

      {/* Paired Sticky 2-Button CTA Bar on Mobile (UI.md pattern) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8EDF2] p-2.5 flex items-center gap-2.5 shadow-2xl">
        <button
          onClick={() => setIsQuoteModalOpen(true)}
          className="flex-1 py-3 rounded-full bg-[#ED3500] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
        >
          <Briefcase className="w-4 h-4" />
          <span>Enquire Bulk</span>
        </button>

        <button
          onClick={handleScrollToProducts}
          className="flex-1 py-3 rounded-full bg-[#163B5C] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>View Products</span>
        </button>
      </div>
    </>
  );
}
