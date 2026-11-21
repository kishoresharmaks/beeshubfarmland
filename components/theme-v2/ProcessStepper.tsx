'use client';

import React from 'react';
import { FileText, Beaker, CheckCircle2, Factory, Truck, Sparkles } from 'lucide-react';

/**
 * Section L: Process Stepper (5)
 * H3 + subtitle.
 * Each step: large numeral, icon, H4, short paragraph.
 * Desktop: horizontal with connecting lines. Mobile: vertical timeline.
 */
export default function ProcessStepper() {
  const steps = [
    {
      num: '1',
      title: 'Quotation & Requirement Scope',
      desc: 'Submit your bulk volume parameters, preferred packaging format, and floral or spice specifications.',
      icon: FileText,
    },
    {
      num: '2',
      title: 'Lab Sample & COA Evaluation',
      desc: 'Receive pre-shipment bench samples with complete analytical testing reports dispatched to your QA team in 48 hours.',
      icon: Beaker,
    },
    {
      num: '3',
      title: 'Commercial Agreement & Terms',
      desc: 'Confirm order quantities, delivery scheduling, batch sealing protocols, and structured payment terms.',
      icon: CheckCircle2,
    },
    {
      num: '4',
      title: 'Batch Processing & Cleanroom Bottling',
      desc: 'Your harvest is cold-extracted, filtered, and packaged in our ISO 22000 cleanroom with tamper-proof batch coding.',
      icon: Factory,
    },
    {
      num: '5',
      title: 'Insured Logistics & Delivery',
      desc: 'Consignments dispatched via insured freight with live tracking, e-way bills, and transit temperature monitoring.',
      icon: Truck,
    },
  ];

  return (
    <section className="w-full py-16 sm:py-24 bg-white border-b border-[#E8EDF2]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-16">
          <h3 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-[#163B5C] tracking-tight">
            Order and fulfillment process
          </h3>
        </div>

        {/* Stepper (Desktop Horizontal with line, Mobile Vertical) */}
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-7 left-12 right-12 h-0.5 bg-[#E8EDF2] z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 relative z-10">
            {steps.map((st, idx) => {
              const Icon = st.icon;
              return (
                <div key={idx} className="flex lg:flex-col items-start lg:items-center text-left lg:text-center gap-4 lg:gap-3 group">
                  {/* Numbered Circle with Icon */}
                  <div className="relative w-14 h-14 rounded-2xl bg-white border border-[#163B5C]/30 text-[#163B5C] flex items-center justify-center font-heading font-bold text-base shadow-xs transition-colors shrink-0">
                    <Icon className="w-6 h-6" />
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#ED3500] text-white text-[10px] font-bold flex items-center justify-center">
                      {st.num}
                    </span>
                  </div>

                  {/* Text details */}
                  <div className="space-y-1.5 pt-1">
                    <h4 className="font-heading font-bold text-sm text-[#163B5C] leading-snug">
                      {st.title}
                    </h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
