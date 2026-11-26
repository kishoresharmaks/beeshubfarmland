'use client';

import React from 'react';
import Script from 'next/script';
import TopUtilityBar from './TopUtilityBar';
import HeaderNav from './HeaderNav';
import HeroSlider from './HeroSlider';
import FeaturedDatesSection from './FeaturedDatesSection';
import HeroCopyStats from './HeroCopyStats';
import LogoWall from './LogoWall';
import ProblemCards from './ProblemCards';
import BenefitsGrid from './BenefitsGrid';
import ServicesZigZag from './ServicesZigZag';
import AboutBlock from './AboutBlock';
import WhyChooseUs from './WhyChooseUs';
import ProcessStepper from './ProcessStepper';
import NotAFitCallout from './NotAFitCallout';
import FeatureBlock from './FeatureBlock';
import FaqAccordion from './FaqAccordion';
import Footer from './Footer';
import FloatingActions from './FloatingActions';
import QuoteModal from './QuoteModal';
import CartDrawer from './store-bridge/CartDrawer';
import CheckoutModal from './store-bridge/CheckoutModal';
import ProductQuickViewModal from './store-bridge/ProductQuickViewModal';
import OrderTrackingModal from './store-bridge/OrderTrackingModal';
import ProductCatalogSection from './store-bridge/ProductCatalogSection';

/**
 * BeesHub Farmland Storefront Theme V2
 * Long-scroll B2B landing page & integrated retail storefront based on UI.md.
 */
export default function StoreThemeV2() {
  return (
    <div className="min-h-screen bg-[#FFFCFB] text-[#163B5C] flex flex-col justify-between selection:bg-amber-200 selection:text-[#163B5C]">
      {/* Razorpay Checkout SDK Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* A. Top Utility Bar */}
      <TopUtilityBar />

      {/* B. Header / Navigation */}
      <HeaderNav />

      {/* Main Long-Scroll Landing Content */}
      <main className="flex-1">
        {/* C. Hero Slider + Badge Strip */}
        <HeroSlider />

        {/* C2. Featured Dates & Superfood Powders (Live from Admin Catalog) */}
        <FeaturedDatesSection />

        {/* D. Hero Copy + Stats */}
        <HeroCopyStats />

        {/* F. Client & Institutional Logo Wall */}
        <LogoWall />

        {/* G. Problem Persona Cards */}
        <ProblemCards />

        {/* H. Benefits Grid (7 Cards: 4+3 centered) */}
        <BenefitsGrid />

        {/* Storefront Retail Catalog Grid */}
        <ProductCatalogSection />

        {/* I. Services Zig-Zag & Closing CTA Strip */}
        <ServicesZigZag />

        {/* J. About Block & 5-Card Collage */}
        <AboutBlock />

        {/* K. Why Choose Us (6 Icon Cards) */}
        <WhyChooseUs />

        {/* L. Process Stepper (5 Steps) */}
        <ProcessStepper />

        {/* M. "Not a Fit" Ethical Callout */}
        <NotAFitCallout />

        {/* N. Feature Block & Botanical Specs */}
        <FeatureBlock />

        {/* O. FAQ Accordion (8 Items) */}
        <FaqAccordion />
      </main>

      {/* P. Comprehensive Footer */}
      <Footer />

      {/* Q. Floating Action Buttons (Call, WhatsApp, Mobile Paired Bar) */}
      <FloatingActions />

      {/* R. Wholesale Quote Request Modal */}
      <QuoteModal />

      {/* Global E-Commerce Store Overlays */}
      <CartDrawer />
      <CheckoutModal />
      <ProductQuickViewModal />
      <OrderTrackingModal />
    </div>
  );
}
