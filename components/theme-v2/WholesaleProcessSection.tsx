'use client';

import React from 'react';
import {
  FileText,
  MessageSquare,
  FlaskConical,
  CheckCircle2,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

/**
 * Section 12: How Wholesale Ordering Works
 * 5-step process: horizontal timeline on desktop, vertical timeline on mobile.
 */
export default function WholesaleProcessSection() {
  const { openQuoteModal } = useStore();

  const steps = [
    {
      num: '1',
      title: 'Submit Enquiry',
      desc: 'Share your required products, target volumes, and packaging format through our trade enquiry form.',
      icon: FileText,
    },
    {
      num: '2',
      title: 'Discuss & Quote',
      desc: 'Review product specifications, MOQs, and receive a tailored commercial quotation from our trade desk.',
      icon: MessageSquare,
    },
    {
      num: '3',
      title: 'Evaluate Samples & COA',
      desc: 'Assess available bench samples and batch Certificate of Analysis documentation with your QA team.',
      icon: FlaskConical,
    },
    {
      num: '4',
      title: 'Confirm Order',
      desc: 'Finalize quantities, labeling/packaging specifications, payment terms, and dispatch schedule.',
      icon: CheckCircle2,
    },
    {
      num: '5',
      title: 'Production & Dispatch',
      desc: 'Scheduled processing, cleanroom packing, and pan-India insured freight or export dispatch.',
      icon: Truck,
    },
  ];

  return (
    <section className="w-full py-14 sm:py-20 bg-[#F7F4EB]/45 border-b border-[#E4E7E1]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#A97843]">
            B2B Procurement Workflow
          </span>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-[#202820] tracking-tight">
            How Wholesale Ordering Works
          </h2>
          <p className="text-sm text-[#6B756B]">
            A straightforward five-step process from initial requirement to verified delivery.
          </p>
        </div>

        {/* Desktop Horizontal / Mobile Vertical Timeline */}
        <div className="relative">
          <div className="hidden lg:block absolute top-7 left-14 right-14 h-px bg-[#D9E2D7] z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-5 relative z-10">
            {steps.map((st) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.num}
                  className="flex lg:flex-col items-start lg:items-center text-left lg:text-center gap-4 lg:gap-3"
                >
                  <div className="relative w-14 h-14 rounded-2xl bg-white border border-[#173F2B]/30 text-[#173F2B] flex items-center justify-center shadow-card shrink-0">
                    <Icon className="w-5 h-5" />
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#A97843] text-white text-[10px] font-bold flex items-center justify-center">
                      {st.num}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <h3 className="font-serif font-semibold text-base text-[#202820] leading-snug">
                      {st.title}
                    </h3>
                    <p className="text-xs text-[#6B756B] leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => openQuoteModal(undefined, 'WHOLESALE')}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#173F2B] hover:bg-[#102E20] text-white font-semibold text-sm transition-colors shadow-sm"
          >
            <span>Start a Wholesale Enquiry</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
