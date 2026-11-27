'use client';

import React from 'react';
import Script from 'next/script';
import AnnouncementBar from './AnnouncementBar';
import HeaderNav from './HeaderNav';
import HeroSection from './HeroSection';
import HomepageSpotlightProducts from './HomepageSpotlightProducts';
import TrustCertificationStrip from './TrustCertificationStrip';
import CategoryShowcase from './CategoryShowcase';
import FeaturedProductsSection from './FeaturedProductsSection';
import WhyChooseBeesHub from './WhyChooseBeesHub';
import OurFarmSection from './OurFarmSection';
import B2BSolutionsSection from './B2BSolutionsSection';
import WhoWeServeSection from './WhoWeServeSection';
import ManufacturingQualitySection from './ManufacturingQualitySection';
import WholesaleProcessSection from './WholesaleProcessSection';
import QualityAssuranceSection from './QualityAssuranceSection';
import BlogStoriesSection from './BlogStoriesSection';
import FaqSection from './FaqSection';
import FinalCtaSection from './FinalCtaSection';
import Footer from './Footer';
import FloatingActions from './FloatingActions';
import QuoteModal from './QuoteModal';
import CartDrawer from './store-bridge/CartDrawer';
import CheckoutModal from './store-bridge/CheckoutModal';
import ProductQuickViewModal from './store-bridge/ProductQuickViewModal';
import OrderTrackingModal from './store-bridge/OrderTrackingModal';

/**
 * Bees Hub Farmland Redesigned Storefront (17-Section Editorial B2C + B2B Homepage)
 */
export default function StoreThemeV2() {
  return (
    <div className="min-h-screen bg-white text-[#202820] flex flex-col justify-between selection:bg-[#E8EFE6] selection:text-[#102E20]">
      {/* Razorpay Checkout SDK Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* 1. Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Main Navigation */}
      <HeaderNav />

      <main className="flex-1">
        {/* 3. Static High-Impact Hero */}
        <HeroSection />

        {/* 3b. Dynamic Admin-Toggled Homepage Products + COA */}
        <HomepageSpotlightProducts />

        {/* 4. Trust & Certification Strip */}
        <TrustCertificationStrip />

        {/* 5. Shop by Category */}
        <CategoryShowcase />

        {/* 6. Featured & Best-Selling Products */}
        <FeaturedProductsSection />

        {/* 7. Why Choose Bees Hub? */}
        <WhyChooseBeesHub />

        {/* 8. Our Farm & Sourcing Story */}
        <OurFarmSection />

        {/* 9. B2B Business Solutions */}
        <B2BSolutionsSection />

        {/* 10. Who We Serve */}
        <WhoWeServeSection />

        {/* 11. Manufacturing & Quality Process */}
        <ManufacturingQualitySection />

        {/* 12. How Wholesale Ordering Works */}
        <WholesaleProcessSection />

        {/* 13. Quality Assurance, Transparency & Support */}
        <QualityAssuranceSection />

        {/* 14. Blog & Farm Stories */}
        <BlogStoriesSection />

        {/* 15. FAQ (Retail & Wholesale) */}
        <FaqSection />

        {/* 16. Final CTA */}
        <FinalCtaSection />
      </main>

      {/* 17. Four-Column Footer */}
      <Footer />

      {/* Floating WhatsApp Support & Mobile Action Bar */}
      <FloatingActions />

      {/* Modals & Drawers */}
      <QuoteModal />
      <CartDrawer />
      <CheckoutModal />
      <ProductQuickViewModal />
      <OrderTrackingModal />
    </div>
  );
}
