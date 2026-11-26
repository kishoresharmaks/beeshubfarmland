'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sprout,
  Factory,
  FlaskConical,
  PackageCheck,
  Truck,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

/**
 * Section 11: Manufacturing and Quality Process
 * 5-step operational workflow with facility/packaging photography and compliance summary.
 */
export default function ManufacturingQualitySection() {
  const stages = [
    {
      step: '01',
      title: 'Raw Material Sourcing',
      desc: 'Harvesting raw honey from Western Ghats apiaries alongside farm-fresh bananas, dates, coconuts, and oilseeds in Tamil Nadu.',
      icon: Sprout,
    },
    {
      step: '02',
      title: 'Processing & Production',
      desc: 'Cold honey extraction, solar dehydration below 50°C, and wood cold-press milling below 45°C.',
      icon: Factory,
    },
    {
      step: '03',
      title: 'Quality Testing',
      desc: 'Lot-level checks and third-party NABL laboratory COA verification including C4/NMR sugar purity screens for honey.',
      icon: FlaskConical,
    },
    {
      step: '04',
      title: 'Packaging',
      desc: 'Hygienic packing into food-grade glass jars, barrier pouches, 25kg liner cartons, or 30kg–300kg sealed drums.',
      icon: PackageCheck,
    },
    {
      step: '05',
      title: 'Dispatch & Delivery',
      desc: 'Pan-India retail courier shipping and insured commercial freight with batch tracking and GST documentation.',
      icon: Truck,
    },
  ];

  return (
    <section className="w-full py-14 sm:py-20 bg-white border-b border-[#E4E7E1]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#A97843]">
              Quality &amp; Manufacturing
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-[#202820] tracking-tight">
              From Harvest to Dispatch: Controlled at Every Stage
            </h2>
            <p className="text-sm text-[#6B756B] leading-relaxed">
              Every production run follows documented food-safety protocols under FSSAI Central (#12425009000671), ISO 22000:2018, ISO 9001:2015, and GMP standards, with batch-level Certificate of Analysis (COA) records available for commercial buyers.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#173F2B] hover:bg-[#102E20] text-white text-xs font-semibold transition-colors"
              >
                <span>View Processing Specifications</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/about#certifications"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#173F2B] hover:underline"
              >
                <ShieldCheck className="w-4 h-4 text-[#A97843]" />
                <span>View Quality Credentials</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#E4E7E1] bg-[#F7F4EB]">
              <Image
                src="/images/packaging/square-honey-series.webp"
                alt="Cleanroom glass jar honey packaging series at Bees Hub Farmland"
                fill
                sizes="(max-width: 1024px) 48vw, 300px"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#E4E7E1] bg-[#F7F4EB]">
              <Image
                src="/images/products/moringa-powder.jpg"
                alt="Fine milled dehydrated superfood leaf powder"
                fill
                sizes="(max-width: 1024px) 48vw, 300px"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* 5-Stage Process Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {stages.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.step}
                className="rounded-2xl p-5 bg-[#F7F4EB]/55 border border-[#E4E7E1] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#E4E7E1] text-[#173F2B] flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-[#A97843]">{st.step}</span>
                </div>
                <h3 className="font-serif font-semibold text-base text-[#202820]">
                  {st.title}
                </h3>
                <p className="text-xs text-[#6B756B] leading-relaxed">
                  {st.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
