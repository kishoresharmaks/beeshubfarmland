import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { StoreProvider } from '@/context/StoreContext';
import { getServerStoreData } from '@/lib/serverCatalog';
import AnnouncementBar from '@/components/theme-v2/AnnouncementBar';
import HeaderNav from '@/components/theme-v2/HeaderNav';
import ProductCatalogSection from '@/components/theme-v2/store-bridge/ProductCatalogSection';
import Footer from '@/components/theme-v2/Footer';
import CartDrawer from '@/components/theme-v2/store-bridge/CartDrawer';
import CheckoutModal from '@/components/theme-v2/store-bridge/CheckoutModal';
import ProductQuickViewModal from '@/components/theme-v2/store-bridge/ProductQuickViewModal';
import OrderTrackingModal from '@/components/theme-v2/store-bridge/OrderTrackingModal';
import QuoteModal from '@/components/theme-v2/QuoteModal';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Shop Pure Honey, Oils & Superfood Powders',
  description:
    'Shop farm-sourced forest honey, dates powder, dates coffee, Nendran banana powder, cold-pressed oils, and makhana directly from Bees Hub Farmland.',
  alternates: {
    canonical: 'https://beeshubfarmland.com/shop',
  },
};

export default async function ShopPage() {
  const initialData = await getServerStoreData();

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beeshubfarmland.com' },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: 'https://beeshubfarmland.com/shop' },
    ],
  };

  return (
    <StoreProvider initialData={initialData}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="min-h-screen bg-white text-[#202820] flex flex-col justify-between">
        <AnnouncementBar />
        <HeaderNav />

        <main className="flex-1">
          <section className="bg-[#173F2B] text-white py-12 sm:py-16 px-4 sm:px-6">
            <div className="max-w-[1240px] mx-auto space-y-3">
              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#E8EFE6]/80">
                <Link href="/" className="hover:text-white">Home</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-white font-semibold">Shop</span>
              </nav>
              <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight">
                Shop Farm-Sourced Products
              </h1>
              <p className="text-sm sm:text-base text-[#E8EFE6] max-w-2xl leading-relaxed">
                Pure forest honey, solar-dehydrated superfood powders, and wood cold-pressed oils dispatched from Kanyakumari, Tamil Nadu.
              </p>
            </div>
          </section>

          <ProductCatalogSection />
        </main>

        <Footer />
        <CartDrawer />
        <CheckoutModal />
        <ProductQuickViewModal />
        <OrderTrackingModal />
        <QuoteModal />
      </div>
    </StoreProvider>
  );
}
