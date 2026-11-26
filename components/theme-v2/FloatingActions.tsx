'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, MessageCircle, Briefcase, ShoppingBag } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

/**
 * Floating WhatsApp Customer Support + Mobile Quick Action Bar
 */
export default function FloatingActions() {
  const { companyConfig, openQuoteModal } = useStore();

  const cleanPhone = companyConfig.phone.replace(/\D/g, '') || '9578784431';
  const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
    'Hello Bees Hub Farmland Team, I would like to enquire about your products and supply options.'
  )}`;

  return (
    <>
      {/* Floating Support Buttons (Bottom Right) */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col gap-2.5 items-end">
        <a
          href={`tel:+91${cleanPhone}`}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#173F2B] hover:bg-[#102E20] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 border-2 border-white"
          title="Call Bees Hub Farmland"
          aria-label="Call Bees Hub Farmland"
        >
          <Phone className="w-5 h-5" />
        </a>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 border-2 border-white"
          title="Chat on WhatsApp"
          aria-label="WhatsApp Support"
        >
          <MessageCircle className="w-6 h-6 fill-white" />
        </a>
      </div>

      {/* Mobile Bottom Paired Action Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E4E7E1] px-3 py-2 flex items-center gap-2.5 shadow-xl">
        <button
          type="button"
          onClick={() => openQuoteModal(undefined, 'WHOLESALE')}
          className="flex-1 py-2.5 rounded-full bg-[#A97843] text-white font-semibold text-xs flex items-center justify-center gap-1.5"
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Wholesale Quote</span>
        </button>

        <Link
          href="/shop"
          className="flex-1 py-2.5 rounded-full bg-[#173F2B] text-white font-semibold text-xs flex items-center justify-center gap-1.5"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Shop Products</span>
        </Link>
      </div>
    </>
  );
}
