'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ShieldCheck,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

/**
 * Section C: Hero Slider + Trust Badge Strip
 * 3 slides, full width (ratio ~ 1920x750), auto-rotate, pause control.
 * Badge strip: 6 equal-height certification badges.
 */
export default function HeroSlider() {
  const { banners, setIsQuoteModalOpen } = useStore();

  const defaultSlides = [
    {
      title: 'Direct Farm Harvest Raw Forest Honey',
      subtitle: 'Western Ghats bio-reserve apiaries with lab-certified NMR & C4 purity.',
      ctaText: 'Enquire bulk honey',
      image: '/images/beeshub-pure-forest-honey-spotlight.webp',
    },
    {
      title: 'Dehydrated Banana, Moringa & Superfood Powders',
      subtitle: 'Nendran banana, red banana, sweet potato, and moringa leaf powders for food processors.',
      ctaText: 'Explore wholesale powders',
      image: '/images/spotlight-honey-composition.webp',
    },
    {
      title: 'Wood Cold-Pressed Virgin Oils & White Label',
      subtitle: 'Cold-pressed virgin coconut, sesame, and groundnut oils with turnkey retail packaging.',
      ctaText: 'Request catalog & samples',
      image: '/images/beeshub-pure-forest-honey-spotlight.webp',
    },
  ];

  // Merge default slides with dynamic banners if provided
  const slides = banners && banners.length > 0
    ? banners.map((b, idx) => ({
        title: b.title || defaultSlides[idx % defaultSlides.length].title,
        subtitle: defaultSlides[idx % defaultSlides.length].subtitle,
        ctaText: defaultSlides[idx % defaultSlides.length].ctaText,
        image: b.image || defaultSlides[idx % defaultSlides.length].image,
      }))
    : defaultSlides;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, slides.length]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const trustBadges = [
    { title: 'FSSAI Central Certified', subtitle: 'License #12425009000671', icon: ShieldCheck },
    { title: '100% Organic Certified', subtitle: 'Pesticide & Chemical Free', icon: Award },
    { title: 'ISO 22000 & 9001:2015', subtitle: 'Food Safety Management', icon: CheckCircle2 },
    { title: 'GMP Certified Facility', subtitle: 'Good Manufacturing Practices', icon: Award },
    { title: 'Import Export Code (IEC)', subtitle: 'AAOCB0453D Global Clearance', icon: ShieldCheck },
    { title: 'C4 & NMR Sugar Lab Tested', subtitle: 'Zero Adulteration Guarantee', icon: CheckCircle2 },
  ];

  return (
    <section className="relative w-full bg-[#0E273E] text-white overflow-hidden">
      {/* Hero Carousel Slides */}
      <div className="relative w-full h-[480px] sm:h-[560px] lg:h-[650px] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
            }`}
          >
            {/* Background Image & Overlay */}
            <div className="absolute inset-0 z-0">
              {slide.image && (
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="object-cover object-center"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0E273E]/95 via-[#0E273E]/80 to-[#0E273E]/45" />
            </div>

            {/* Content Container */}
            <div className="relative z-20 max-w-[1200px] h-full mx-auto px-4 sm:px-6 flex flex-col justify-center">
              <div className="max-w-2xl space-y-4 sm:space-y-5">
                <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.15] text-white">
                  {slide.title}
                </h2>

                <p className="text-sm sm:text-base lg:text-lg text-slate-200 font-normal leading-relaxed">
                  {slide.subtitle}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setIsQuoteModalOpen(true)}
                    className="px-7 py-3.5 rounded-full bg-[#ED3500] hover:bg-[#D02E00] text-white font-semibold text-xs transition-colors"
                  >
                    {slide.ctaText}
                  </button>
                  <a
                    href="#catalog-section"
                    className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors"
                  >
                    Explore Products
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Navigation Arrows */}
        <div className="absolute z-20 bottom-8 right-6 sm:right-12 flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/20 flex items-center justify-center transition-colors"
            aria-label={isPlaying ? 'Pause slider' : 'Play slider'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handlePrev}
            className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/20 flex items-center justify-center transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/20 flex items-center justify-center transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="absolute z-20 bottom-9 left-6 sm:left-12 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentSlide ? 'w-8 bg-[#ED3500]' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Trust Badge Strip (6 Equal-Height Badges) */}
      <div className="w-full bg-[#163B5C] border-t border-b border-white/10 py-5 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {trustBadges.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#10B981]/20 text-[#10B981] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-white truncate">{badge.title}</h4>
                    <p className="text-[10px] text-slate-300 truncate">{badge.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
