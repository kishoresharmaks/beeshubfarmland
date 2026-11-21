'use client';

import React, { useState } from 'react';
import { ChevronDown, Plus, Minus, HelpCircle } from 'lucide-react';

/**
 * Section O: FAQ Accordion (8)
 * H3, then 8 accessible rows with aria-expanded, animated height, one open at a time.
 */
export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is the Minimum Order Quantity (MOQ) for wholesale honey and spices?',
      a: 'For bulk raw honey in food-grade drums, our standard starting MOQ is 50 kg. For customized private label retail jars, our starting batch begins at 500 units per variant.',
    },
    {
      q: 'Do you provide batch-specific Certificate of Analysis (COA) test reports?',
      a: 'Yes. Every commercial shipment is dispatched with an authentic, lot-coded COA detailing moisture content, invert sugar percentages, C4/NMR sugar screen results, and heavy metal testing.',
    },
    {
      q: 'Can you provide private label bottling and custom branding?',
      a: 'Absolutely. We offer complete OEM co-packing in our ISO 22000 cleanroom, including custom glass bottle sourcing, induction sealing, front/back labeling, and outer master carton packing.',
    },
    {
      q: 'How do you ensure honey is not adulterated with inverted sugar or rice syrup?',
      a: 'We operate proprietary apiary colonies in Western Ghats reserves and never feed artificial sugar syrup. Furthermore, all harvest undergoes periodic third-party testing at NABL-accredited labs.',
    },
    {
      q: 'What is the shelf life and storage recommendation for bulk raw honey?',
      a: 'Raw honey naturally has an indefinite shelf life when stored sealed in food-grade drums at ambient room temperature (18°C - 28°C), away from direct sunlight and humidity.',
    },
    {
      q: 'How are commercial bulk orders shipped and insured across India?',
      a: 'We partner with leading national freight carriers (V-Trans, SafeExpress, TCI Freight) providing palletized or individual drum transit with full transit insurance and live tracking.',
    },
    {
      q: 'Can I request pre-shipment lab samples prior to placing a volume contract?',
      a: 'Yes. Our trade desk provides 100g - 250g sealed bench evaluation samples delivered to your QA laboratory within 48 to 72 hours across major Indian metro zones.',
    },
    {
      q: 'What are your accepted payment terms for corporate and institutional procurement?',
      a: 'We accept RTGS/NEFT institutional bank transfers, verified UPI, and structured letter of credit (LC) or milestone terms for recurring enterprise supply agreements.',
    },
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full py-16 sm:py-24 bg-[#FFFCFB] border-b border-[#E8EDF2]">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6">
        <div className="text-center space-y-2 mb-12">
          <h3 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-[#163B5C] tracking-tight">
            Frequently asked questions
          </h3>
        </div>

        {/* 8 Accordion Rows */}
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-[#ED3500]/40 bg-white shadow-md'
                    : 'border-[#E8EDF2] bg-white hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleToggle(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-heading font-bold text-sm sm:text-base text-[#163B5C]">
                    {faq.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'bg-[#ED3500] text-white rotate-180' : 'bg-slate-100 text-[#163B5C]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* Animated Collapsible Panel */}
                <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
                  <div className="accordion-inner px-5 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-sm text-[#64748B] leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
