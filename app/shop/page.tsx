import type { Metadata } from 'next';
import { StoreProvider } from '@/context/StoreContext';
import { getServerStoreData } from '@/lib/serverCatalog';
import TopUtilityBar from '@/components/theme-v2/TopUtilityBar';
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
  title: 'Shop Pure Honey, Cold-Pressed Oils & Superfood Powders',
  description:
    'Browse all 30+ farmgate products from BeesHub Farmland: raw forest honey, dates powder, dates coffee, Nendran banana powder, cold-pressed coconut/sesame/groundnut oils, and jumbo makhana.',
  alternates: {
    canonical: 'https://beeshubfarmland.com/shop',
  },
};

export default async function ShopPage() {
  const initialData = await getServerStoreData();

  return (
    <StoreProvider initialData={initialData}>
      <div className="min-h-screen bg-[#FFFCFB] text-[#163B5C] flex flex-col justify-between">
        <TopUtilityBar />
        <HeaderNav />
        <main className="flex-1">
          <section className="bg-[#163B5C] text-white py-12 sm:py-16 px-4 sm:px-6">
            <div className="max-w-[1200px] mx-auto space-y-2">
              <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight">
                BeesHub Farmland Store
              </h1>
              <p className="text-sm sm:text-base text-slate-200 max-w-2xl">
                100% pure farmgate honey, solar-dehydrated superfood powders, and wood cold-pressed oils dispatched directly from Kanyakumari.
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
