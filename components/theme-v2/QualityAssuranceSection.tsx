'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, FileCheck2, MessageCircle, Phone, PackageCheck } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import SocialShareBar from './SocialShareBar';

/**
 * Section 13: Quality Assurance, Sourcing Transparency & Customer Support
 * Used in place of unverified customer testimonials.
 */
export default function QualityAssuranceSection() {
  const { companyConfig, setIsTrackingModalOpen, openQuoteModal } = useStore();
  const cleanPhone = companyConfig.phone.replace(/\D/g, '') || '9578784431';

  return (
    <section className="w-full py-14 sm:py-20 bg-white border-b border-[#E4E7E1]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#A97843]">
            Transparency &amp; Support
          </span>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-[#202820] tracking-tight">
            Quality Assurance &amp; Direct Support
          </h2>
          <p className="text-sm text-[#6B756B]">
            Every order—retail or wholesale—is backed by verifiable business credentials, batch documentation, and direct farm desk assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl p-6 bg-[#F7F4EB]/55 border border-[#E4E7E1] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8EFE6] text-[#173F2B] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-semibold text-lg text-[#202820]">
              Sourcing Transparency
            </h3>
            <p className="text-xs sm:text-sm text-[#6B756B] leading-relaxed">
              Produced and packed by {companyConfig.name} in Kanyakumari District, Tamil Nadu. Our retail and wholesale packs come directly from our processing operations without third-party repackers.
            </p>
            <Link
              href="/about"
              className="inline-block text-xs font-semibold text-[#173F2B] hover:underline"
            >
              View facility &amp; registration details &rarr;
            </Link>
          </div>

          <div className="rounded-2xl p-6 bg-[#F7F4EB]/55 border border-[#E4E7E1] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8EFE6] text-[#173F2B] flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-semibold text-lg text-[#202820]">
              Documented Quality Standards
            </h3>
            <p className="text-xs sm:text-sm text-[#6B756B] leading-relaxed">
              Compliant with FSSAI Central License #{companyConfig.fssai}, ISO 9001:2015, ISO 22000:2018, and GMP standards. Commercial buyers receive batch COA and GST-compliant invoicing.
            </p>
            <button
              type="button"
              onClick={() => openQuoteModal(undefined, 'WHOLESALE')}
              className="text-xs font-semibold text-[#173F2B] hover:underline"
            >
              Request sample &amp; COA documentation &rarr;
            </button>
          </div>

          <div className="rounded-2xl p-6 bg-[#F7F4EB]/55 border border-[#E4E7E1] space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#E8EFE6] text-[#173F2B] flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-semibold text-lg text-[#202820]">
              Responsive Customer &amp; Trade Desk
            </h3>
            <p className="text-xs sm:text-sm text-[#6B756B] leading-relaxed">
              Need help tracking a retail order or specifying bulk packaging? Reach our Kanyakumari team directly via phone, WhatsApp, or order lookup.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href={`https://wa.me/91${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#173F2B] hover:bg-[#102E20] text-white text-xs font-semibold transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Support</span>
              </a>
              <button
                type="button"
                onClick={() => setIsTrackingModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-[#E4E7E1] hover:border-[#173F2B] text-[#202820] text-xs font-semibold transition-colors"
              >
                <PackageCheck className="w-3.5 h-3.5 text-[#A97843]" />
                <span>Track Order</span>
              </button>
              <a
                href={`tel:+91${cleanPhone}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#6B756B] hover:text-[#173F2B]"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>+91 {companyConfig.phone}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Website Social Share Strip */}
        <div className="rounded-2xl px-6 py-4 bg-[#F7F4EB] border border-[#E4E7E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs sm:text-sm font-medium text-[#202820]">
            Know someone looking for pure forest honey, superfood powders, or bulk agricultural supply?
          </p>
          <SocialShareBar
            title="Bees Hub Farmland | Pure Honey, Superfood Powders & Cold-Pressed Oils"
            description="Farm-sourced honey, superfood powders and cold-pressed oils from Kanyakumari, Tamil Nadu."
            path="/"
            label="Share Website"
          />
        </div>
      </div>
    </section>
  );
}
