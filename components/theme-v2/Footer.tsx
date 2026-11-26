'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { STORE_CATEGORIES } from '@/lib/productFormatting';
import SocialShareBar from './SocialShareBar';

/**
 * Section 17: Comprehensive Four-Column Footer
 * Col 1: About Bees Hub | Col 2: Shop | Col 3: Business | Col 4: Customer Support
 * Bottom: Registered entity details, GSTIN, FSSAI, IEC, contact details, payment options & social links.
 */
export default function Footer() {
  const { companyConfig, setIsTrackingModalOpen, setSelectedCategory } = useStore();
  const cleanPhone = companyConfig.phone.replace(/\D/g, '') || '9578784431';

  return (
    <footer className="w-full bg-[#102E20] text-[#F7F4EB] pt-14 pb-8 border-t border-white/10">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-12">
        {/* 4-Column Navigation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Column 1: About Bees Hub */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-20 rounded-lg overflow-hidden border border-white/20 bg-white px-1.5 py-0.5 flex items-center justify-center shrink-0">
                <Image
                  src="/images/beeshub-logo.png"
                  alt="Bees Hub Farmland Logo"
                  width={160}
                  height={70}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="font-serif font-bold text-white text-base leading-tight">
                  Bees Hub Farmland
                </div>
                <div className="text-[11px] text-[#E8EFE6]/80">
                  Private Limited
                </div>
              </div>
            </div>

            <p className="text-xs text-[#E8EFE6]/80 leading-relaxed">
              Farm-sourced honey, superfood powders, and wood cold-pressed oils from Kanyakumari District, Tamil Nadu for everyday households and commercial food partners.
            </p>

            <ul className="space-y-2 text-xs text-[#E8EFE6]">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/#our-farm" className="hover:text-white transition-colors">
                  Our Farm
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Farm Stories &amp; Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Shop */}
          <div className="space-y-3">
            <h3 className="font-serif font-semibold text-base text-white">
              Shop
            </h3>
            <ul className="space-y-2 text-xs text-[#E8EFE6]/85">
              {STORE_CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/shop?category=${encodeURIComponent(cat.id)}`}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="hover:text-white transition-colors"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/shop"
                  onClick={() => setSelectedCategory('All')}
                  className="font-semibold text-[#F7F4EB] hover:text-white transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/gift" className="hover:text-white transition-colors">
                  Gift Hampers
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Business */}
          <div className="space-y-3">
            <h3 className="font-serif font-semibold text-base text-white">
              Business
            </h3>
            <ul className="space-y-2 text-xs text-[#E8EFE6]/85">
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Wholesale Supply
                </Link>
              </li>
              <li>
                <Link href="/private-label" className="hover:text-white transition-colors">
                  Private Label &amp; Bottling
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Processing Services
                </Link>
              </li>
              <li>
                <Link href="/about#certifications" className="hover:text-white transition-colors">
                  Quality Assurance
                </Link>
              </li>
            </ul>

            <div className="pt-3 space-y-2 text-xs text-[#E8EFE6]/85">
              <div className="font-semibold text-white">Trade &amp; Support Desk</div>
              <a
                href={`tel:+91${cleanPhone}`}
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#A97843]" />
                <span>+91 {companyConfig.phone}</span>
              </a>
              <a
                href={`mailto:${companyConfig.email}`}
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#A97843]" />
                <span>{companyConfig.email}</span>
              </a>
            </div>
          </div>

          {/* Column 4: Customer Support */}
          <div className="space-y-3">
            <h3 className="font-serif font-semibold text-base text-white">
              Customer Support
            </h3>
            <ul className="space-y-2 text-xs text-[#E8EFE6]/85">
              <li>
                <button
                  type="button"
                  onClick={() => setIsTrackingModalOpen(true)}
                  className="hover:text-white transition-colors text-left"
                >
                  Track Order
                </button>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-white transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-white transition-colors">
                  Return &amp; Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Registered Details, Socials & Payment Options */}
        <div className="pt-8 border-t border-white/15 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-xs text-[#E8EFE6]/80">
          <div className="lg:col-span-8 space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#A97843] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-white">BEES HUB FARMLAND PRIVATE LIMITED</strong> · {companyConfig.address}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pl-6 text-[11px]">
              <span>
                <strong className="text-white">FSSAI:</strong> {companyConfig.fssai}
              </span>
              <span>
                <strong className="text-white">GSTIN:</strong> {companyConfig.gstin}
              </span>
              <span>
                <strong className="text-white">IEC:</strong> {companyConfig.iec}
              </span>
              <span>{companyConfig.certifications}</span>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <a
                href="https://www.facebook.com/Beeshubfarmland/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#A97843] flex items-center justify-center text-white transition-colors"
                aria-label="Bees Hub Farmland on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/beeshubfarmland"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#A97843] flex items-center justify-center text-white transition-colors"
                aria-label="Bees Hub Farmland on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com/@BeesHubFarmlandPvtLtd"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#A97843] flex items-center justify-center text-white transition-colors"
                aria-label="Bees Hub Farmland on YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
            <SocialShareBar
              title="Bees Hub Farmland | Pure Honey & Organic Products India"
              description="Farm-sourced honey, superfood powders and cold-pressed oils from Kanyakumari, Tamil Nadu."
              path="/"
              label="Share Site"
              dark
            />
            <p className="text-[11px] text-[#E8EFE6]/75">
              Payments: UPI, Cards, NetBanking (Razorpay) &amp; Cash on Delivery
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#E8EFE6]/70">
          <p>
            © {new Date().getFullYear()} BEES HUB FARMLAND PRIVATE LIMITED. All rights reserved.
          </p>
          <p>Nagercoil, Kanyakumari District, Tamil Nadu – 629501, India</p>
        </div>
      </div>
    </footer>
  );
}
