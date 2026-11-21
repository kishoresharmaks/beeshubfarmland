'use client';

import React from 'react';
import {
  ShieldAlert,
  Award,
  Layers,
  ShieldCheck,
  Zap,
  Globe2,
} from 'lucide-react';

/**
 * Section K: Why Choose Us (6)
 * Icon-card pattern: 3x2 desktop, 2x3 tablet, 1 col mobile.
 */
export default function WhyChooseUs() {
  const points = [
    {
      title: 'Zero Additive & Filler Guarantee',
      desc: 'We never add maltodextrin, starch, synthetic colors, or sugar syrup to our products. Every harvest reflects 100% natural farm produce.',
      icon: ShieldAlert,
    },
    {
      title: 'State-Level Analytical COA',
      desc: 'Standardized testing for moisture, active nutrients, microbial safety, and zero chemical pesticide or heavy metal residues.',
      icon: Award,
    },
    {
      title: 'Flexible Order Volumes & Scalability',
      desc: 'Whether sourcing a starter 25kg powder trial or requiring scheduled 10-tonne monthly shipments of oils and honey, our supply scales with you.',
      icon: Layers,
    },
    {
      title: 'Integrated Farm-to-Pack Facility',
      desc: 'Operating proprietary apiaries, solar dehydration tunnels, and wood-press oil expellers within one certified processing ecosystem.',
      icon: ShieldCheck,
    },
    {
      title: 'Express 48h Sample Dispatch',
      desc: 'Receive pre-shipment lab samples with sealed COA documentation sent directly to your corporate R&D and QA testing desk.',
      icon: Zap,
    },
    {
      title: 'Global Export & FSSAI Ready',
      desc: 'Compliant with APEDA, FSSAI Central, ISO 22000, and phytosanitary export documentation for overseas and domestic trade.',
      icon: Globe2,
    },
  ];

  return (
    <section id="why-us" className="w-full py-16 sm:py-24 bg-[#FFFCFB] border-b border-[#E8EDF2]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <h3 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-[#163B5C] tracking-tight">
            Why buyers choose our supply
          </h3>
        </div>

        {/* 3x2 Desktop Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {points.map((pt, idx) => {
            const Icon = pt.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8EDF2] shadow-xs hover:border-slate-300 transition-colors space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <Icon className="w-5 h-5 text-[#163B5C]" />

                  <div>
                    <h4 className="font-heading font-bold text-base text-[#163B5C] mb-1.5 leading-snug">
                      {pt.title}
                    </h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      {pt.desc}
                    </p>
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
