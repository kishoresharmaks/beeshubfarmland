'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Award, CheckCircle2, Globe2, FlaskConical, ExternalLink } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

/**
 * Section 4: Trust and Certification Strip
 * Displays only verified credentials configured for BEES HUB FARMLAND PRIVATE LIMITED.
 * Links to /about#certifications for full company registration details.
 */
export default function TrustCertificationStrip() {
  const { companyConfig } = useStore();

  const credentials = [
    {
      title: 'FSSAI Central Licensed',
      detail: `License #${companyConfig.fssai}`,
      icon: ShieldCheck,
    },
    {
      title: 'GMP & Organic Certified',
      detail: 'Cleanroom & Farmgate Operations',
      icon: Award,
    },
    {
      title: 'ISO 9001:2015 & 22000:2018',
      detail: 'Quality & Food Safety Systems',
      icon: CheckCircle2,
    },
    {
      title: 'Import Export Code (IEC)',
      detail: `IEC ${companyConfig.iec}`,
      icon: Globe2,
    },
    {
      title: 'Batch Lab Tested (COA)',
      detail: 'C4 & NMR Sugar Purity Screen',
      icon: FlaskConical,
    },
  ];

  return (
    <section
      aria-label="Verified Company Credentials"
      className="w-full bg-[#F7F4EB] border-b border-[#E4E7E1] py-5 px-4 sm:px-6"
    >
      <div className="max-w-[1240px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {credentials.map((cred) => {
            const Icon = cred.icon;
            return (
              <Link
                key={cred.title}
                href="/about#certifications"
                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-[#E4E7E1] hover:border-[#173F2B]/40 hover:shadow-card transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-[#E8EFE6] text-[#173F2B] flex items-center justify-center shrink-0 group-hover:bg-[#173F2B] group-hover:text-white transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-[#202820] truncate">
                      {cred.title}
                    </span>
                    <ExternalLink className="w-3 h-3 text-[#6B756B] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                  <p className="text-[11px] text-[#6B756B] truncate">{cred.detail}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
