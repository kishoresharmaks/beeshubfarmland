'use client';

import React from 'react';
import { Mail, Phone } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

/**
 * Section 1: Announcement Bar
 * Compact single static announcement above main navigation.
 */
export default function AnnouncementBar() {
  const { companyConfig } = useStore();

  return (
    <div className="w-full bg-[#102E20] text-[#F7F4EB] text-[11px] sm:text-xs py-2 px-4 sm:px-6 border-b border-white/10">
      <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-4">
        <p className="font-medium tracking-wide truncate">
          Farm-sourced products from Tamil Nadu · Wholesale &amp; private-label enquiries welcome · Free shipping on retail orders
        </p>

        <div className="hidden md:flex items-center gap-4 text-[#E8EFE6] font-medium shrink-0 whitespace-nowrap">
          <a
            href={`mailto:${companyConfig.email}`}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-[#A97843]" />
            <span>{companyConfig.email}</span>
          </a>
          <span className="text-white/25" aria-hidden="true">|</span>
          <a
            href={`tel:+91${companyConfig.phone.replace(/\D/g, '')}`}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#A97843]" />
            <span>+91 {companyConfig.phone}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
