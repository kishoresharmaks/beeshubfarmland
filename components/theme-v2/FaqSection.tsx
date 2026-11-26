'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { RETAIL_FAQS, WHOLESALE_FAQS } from '@/lib/faqData';

/**
 * Section 15: FAQ
 * Accessible accordion separated into Retail and Wholesale tabs.
 */
export default function FaqSection() {
  const { settings } = useStore();
  const [activeTab, setActiveTab] = useState<'retail' | 'wholesale'>('retail');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const retailItems = RETAIL_FAQS.map((item, idx) => {
    if (idx === 1) {
      const onlineOn = settings?.enableOnlinePayment ?? settings?.enableUPI ?? true;
      const codOn = settings?.enableCOD ?? true;
      const methods: string[] = [];
      if (onlineOn) methods.push('Razorpay online payments (UPI, credit/debit cards, and net banking)');
      if (codOn) methods.push('Cash on Delivery (COD)');
      return {
        ...item,
        a:
          methods.length > 0
            ? `Currently supported payment methods at checkout include ${methods.join(' and ')}.`
            : item.a,
      };
    }
    return item;
  });

  const activeItems = activeTab === 'retail' ? retailItems : WHOLESALE_FAQS;

  return (
    <section id="faq" className="w-full py-14 sm:py-20 bg-white border-b border-[#E4E7E1]">
      <div className="max-w-[920px] mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#A97843]">
            Answers &amp; Policies
          </span>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-[#202820] tracking-tight">
            Frequently Asked Questions
          </h2>

          {/* Accessible Category Tabs */}
          <div role="tablist" aria-label="FAQ Categories" className="inline-flex p-1 rounded-full bg-[#F7F4EB] border border-[#E4E7E1] mt-2">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'retail'}
              onClick={() => {
                setActiveTab('retail');
                setOpenIndex(0);
              }}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-colors ${
                activeTab === 'retail'
                  ? 'bg-[#173F2B] text-white shadow-xs'
                  : 'text-[#6B756B] hover:text-[#202820]'
              }`}
            >
              Retail Customers
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'wholesale'}
              onClick={() => {
                setActiveTab('wholesale');
                setOpenIndex(0);
              }}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-colors ${
                activeTab === 'wholesale'
                  ? 'bg-[#173F2B] text-white shadow-xs'
                  : 'text-[#6B756B] hover:text-[#202820]'
              }`}
            >
              Wholesale &amp; B2B
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {activeItems.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const panelId = `faq-panel-${activeTab}-${idx}`;
            const buttonId = `faq-button-${activeTab}-${idx}`;

            return (
              <div
                key={`${activeTab}-${idx}`}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isOpen
                    ? 'border-[#173F2B]/40 bg-[#F7F4EB]/45 shadow-card'
                    : 'border-[#E4E7E1] bg-white hover:border-[#173F2B]/30'
                }`}
              >
                <button
                  id={buttonId}
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#173F2B]"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                >
                  <span className="font-serif font-semibold text-sm sm:text-base text-[#202820]">
                    {faq.q}
                  </span>
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'bg-[#173F2B] text-white rotate-180' : 'bg-[#E8EFE6] text-[#173F2B]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`accordion-content ${isOpen ? 'open' : ''}`}
                >
                  <div className="accordion-inner">
                    <div className="px-5 pb-5 text-xs sm:text-sm text-[#6B756B] leading-relaxed border-t border-[#E4E7E1] pt-3">
                      {faq.a}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center text-xs text-[#6B756B]">
          Need policy details? View our{' '}
          <Link href="/shipping-policy" className="text-[#173F2B] font-semibold hover:underline">
            Shipping Policy
          </Link>{' '}
          or{' '}
          <Link href="/return-policy" className="text-[#173F2B] font-semibold hover:underline">
            Return &amp; Refund Policy
          </Link>
          .
        </div>
      </div>
    </section>
  );
}
