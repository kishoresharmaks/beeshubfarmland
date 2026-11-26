'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, MapPin } from 'lucide-react';

/**
 * Section 8: Our Farm and Sourcing Story
 * Editorial two-column section highlighting Kanyakumari, Tamil Nadu roots and processing practices.
 */
export default function OurFarmSection() {
  const highlights = [
    'Western Ghats apiary networks for raw, unheated forest honey',
    'Controlled solar dehydration facilities in Kanyakumari for fruit & leaf powders',
    'Traditional wood cold-press (Marachekku) milling for virgin coconut, sesame & groundnut oils',
    'FSSAI Central, ISO 9001:2015, ISO 22000:2018 & GMP certified processing',
  ];

  return (
    <section id="our-farm" className="w-full py-14 sm:py-24 bg-[#F7F4EB] border-b border-[#E4E7E1]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left: Authentic Imagery */}
          <div className="lg:col-span-6 grid grid-cols-12 gap-4 items-center">
            <div className="col-span-7 relative aspect-[4/5] rounded-2xl overflow-hidden border border-[#E4E7E1] shadow-card bg-white">
              <Image
                src="/images/spotlight-honey-composition.webp"
                alt="Raw forest honey harvest and botanical products from Bees Hub Farmland"
                fill
                sizes="(max-width: 1024px) 60vw, 340px"
                className="object-cover"
              />
            </div>
            <div className="col-span-5 space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden border border-[#E4E7E1] shadow-card bg-white">
                <Image
                  src="/images/products/coconut-oil.png"
                  alt="Wood cold-pressed virgin coconut oil milled in Kanyakumari"
                  fill
                  sizes="(max-width: 1024px) 35vw, 220px"
                  className="object-cover"
                />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#E4E7E1] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#173F2B]">
                  <MapPin className="w-3.5 h-3.5 text-[#A97843]" />
                  <span>Kanyakumari, Tamil Nadu</span>
                </div>
                <p className="text-[11px] text-[#6B756B] leading-snug">
                  Muhilanvilai, Monikettipottal-Post, Nagercoil – 629501
                </p>
              </div>
            </div>
          </div>

          {/* Right: Editorial Story */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#A97843]">
                Our Farm &amp; Sourcing Story
              </span>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-[#202820] leading-tight tracking-tight">
                Rooted in Nature. Focused on Quality.
              </h2>
            </div>

            <div className="space-y-3 text-sm text-[#6B756B] leading-relaxed">
              <p>
                Headquartered in Nagercoil, Kanyakumari District, Tamil Nadu, Bees Hub Farmland Private Limited connects regional agricultural harvests and Western Ghats apiculture directly with households and food brands across India.
              </p>
              <p>
                Our processing facility brings together raw honey extraction, low-temperature solar tray dehydration, traditional wood cold-press oil milling, and cleanroom packaging—preserving native aroma, colour, and nutritional integrity without artificial fillers or preservatives.
              </p>
            </div>

            <ul className="space-y-2.5 pt-1">
              {highlights.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#202820] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#173F2B] shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#173F2B] hover:bg-[#102E20] text-white font-semibold text-xs sm:text-sm transition-colors"
              >
                <span>About Our Farm</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
