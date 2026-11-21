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
  ShieldCheck,
  Award,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

/**
 * Section P: Footer
 * Brand column (logo, description, 4 social icons) · Top Links (5) · Product list (10) · Contact (2 phones, 2 emails) · 2 addresses.
 * Bottom bar: copyright + FSSAI / GST credit line.
 */
export default function Footer() {
  const { companyConfig, setIsQuoteModalOpen, setIsTrackingModalOpen, setSelectedCategory } = useStore();

  const topLinks = [
    { label: 'About Farmlands', href: '/#about' },
    { label: 'Wholesale Solutions', href: '/#services' },
    { label: 'Private Label & Bottling', href: '/private-label' },
    { label: 'Wedding & Event Hampers', href: '/gift' },
    { label: 'Farm Stories & Blog', href: '/blog' },
    { label: 'Track Order Status', action: () => setIsTrackingModalOpen(true) },
  ];

  const productsList = [
    { label: 'Pure Wild Forest Honey', cat: 'Healthy Foods' },
    { label: 'Nendran Banana Powder (Raw & Fine)', cat: 'Powder' },
    { label: 'Red Banana Powder (Chevvazhai)', cat: 'Powder' },
    { label: 'Sweet Potato Powder', cat: 'Powder' },
    { label: 'Cold-Pressed Virgin Coconut Oil', cat: 'Oil' },
    { label: 'Cold-Pressed Sesame Oil', cat: 'Oil' },
    { label: 'Cold-Pressed Groundnuts Oil', cat: 'Oil' },
    { label: 'Jumbo Fox Nut Makhana (Grade 6)', cat: 'Product' },
    { label: 'Moringai Leaf Powder & Capsules', cat: 'Product (White Label)' },
    { label: 'Natural Dates Coffee Powder', cat: 'Powder' },
    { label: 'Handcrafted Botanical Herbal Soaps', cat: 'Product (White Label)' },
  ];

  const handleProductClick = (cat: string) => {
    setSelectedCategory(cat);
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.location.href = `/?category=${encodeURIComponent(cat)}#catalog-section`;
      return;
    }
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full bg-[#0E273E] text-white pt-16 pb-8 border-t border-white/10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-12">
        {/* Main 4-5 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Col 1: Brand Info & Socials */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-11 sm:h-12 w-20 sm:w-24 rounded-2xl overflow-hidden border border-white/20 bg-white p-1.5 shadow-md flex items-center justify-center shrink-0">
                <Image
                  src="/images/beeshub-logo.png"
                  alt="BeesHub Farmland Logo"
                  width={160}
                  height={70}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="font-heading font-bold text-white text-base leading-tight">
                  BEES HUB FARMLAND
                </h4>
                <p className="text-[11px] text-amber-300 font-medium">
                  Private Limited, Apiculture and Organic Spices
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              Direct apiary and farmgate harvest producer based in Kanyakumari, Tamil Nadu. Dedicated to 100% adulteration-free botanical purity for enterprise food brands, exporters, and conscious households.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.facebook.com/Beeshubfarmland/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#ED3500] flex items-center justify-center text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/beeshubfarmland"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#ED3500] flex items-center justify-center text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com/@BeesHubFarmlandPvtLtd"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#ED3500] flex items-center justify-center text-white transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 space-y-1">
              <div>
                <span className="font-bold text-white">FSSAI Central:</span> {companyConfig.fssai}
              </div>
              <div>
                <span className="font-bold text-white">GSTIN:</span> {companyConfig.gstin}
              </div>
              <div>
                <span className="font-bold text-white">IEC Code:</span> {companyConfig.iec}
              </div>
            </div>
          </div>

          {/* Col 2: Top Links (5) */}
          <div className="space-y-3">
            <h5 className="font-heading font-semibold text-sm text-amber-400">
              Quick Links
            </h5>
            <ul className="space-y-2 text-xs text-slate-300">
              {topLinks.map((link, idx) => (
                <li key={idx}>
                  {link.action ? (
                    <button
                      onClick={link.action}
                      className="hover:text-white transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <a href={link.href} className="hover:text-white transition-colors">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
              <li>
                <button
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="text-amber-400 hover:text-white font-semibold transition-colors"
                >
                  Request Bulk Quotation
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Bulk Products (10) */}
          <div className="space-y-3">
            <h5 className="font-heading font-semibold text-sm text-amber-400">
              Bulk Products
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {productsList.map((prod, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleProductClick(prod.cat)}
                    className="hover:text-white transition-colors text-left truncate max-w-full"
                  >
                    {prod.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact & 2 Addresses */}
          <div className="space-y-3">
            <h5 className="font-heading font-semibold text-sm text-amber-400">
              Commercial Desk & Offices
            </h5>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Factory & Processing Facility:</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug pl-5">
                  {companyConfig.address}
                </p>
              </div>

              <div className="space-y-1 pt-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Administrative Office:</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug pl-5">
                  BEES HUB FARMLAND PVT LTD, Nagercoil, Kanyakumari District, Tamil Nadu - 629501.
                </p>
              </div>

              <div className="pt-2 space-y-1">
                <a
                  href={`tel:${companyConfig.phone}`}
                  className="flex items-center gap-2 hover:text-white text-xs font-semibold"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>+91 {companyConfig.phone}</span>
                </a>
                <a
                  href={`mailto:${companyConfig.email}`}
                  className="flex items-center gap-2 hover:text-white text-xs font-semibold"
                >
                  <Mail className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>{companyConfig.email}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} BEES HUB FARMLAND PRIVATE LIMITED. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-[11px] divide-x divide-white/20">
            <span>GMP Certified</span>
            <span className="pl-3">ISO 22000:2018</span>
            <span className="pl-3">FSSAI Central License</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
