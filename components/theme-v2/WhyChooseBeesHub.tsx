'use client';

import React from 'react';
import {
  Sprout,
  ShieldCheck,
  QrCode,
  Layers,
  Package,
  Headphones,
} from 'lucide-react';

/**
 * Section 7: Why Choose Bees Hub?
 * Consolidates operational strengths into 6 concise, verified benefit cards.
 */
export default function WhyChooseBeesHub() {
  const benefits = [
    {
      title: 'Farm-Focused Sourcing',
      desc: 'Directly sourced from Western Ghats apiaries and partner farms across Kanyakumari District, Tamil Nadu.',
      icon: Sprout,
    },
    {
      title: 'Quality-Conscious Processing',
      desc: 'Low-temperature solar dehydration below 50°C and traditional wood cold-pressing below 45°C preserve natural nutrition.',
      icon: ShieldCheck,
    },
    {
      title: 'Batch Traceability',
      desc: 'Every retail pack and commercial drum carries batch-coded packaging with documented origin and quality records.',
      icon: QrCode,
    },
    {
      title: 'Consistent Retail & Bulk Supply',
      desc: 'Structured fulfillment from single consumer jars to 25kg powder lots and 30kg–300kg honey drums.',
      icon: Layers,
    },
    {
      title: 'Custom Packaging Capabilities',
      desc: 'Cleanroom co-packing in Square, Hexa, Octa, and ITC glass jars, standup pouches, and gift hampers.',
      icon: Package,
    },
    {
      title: 'Customer & Business Support',
      desc: 'Direct phone, email, and WhatsApp trade desk support for both household shoppers and B2B procurement teams.',
      icon: Headphones,
    },
  ];

  return (
    <section className="w-full py-14 sm:py-20 bg-white border-b border-[#E4E7E1]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#A97843]">
            Our Commitment
          </span>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-[#202820] tracking-tight">
            Why Choose Bees Hub Farmland
          </h2>
          <p className="text-sm text-[#6B756B]">
            Built on transparent sourcing, clean processing standards, and dependable service for households and businesses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {benefits.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl p-6 bg-[#F7F4EB]/45 border border-[#E4E7E1] hover:border-[#173F2B]/35 transition-colors space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E8EFE6] text-[#173F2B] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-semibold text-lg text-[#202820]">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#6B756B] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
