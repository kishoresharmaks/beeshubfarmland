import type { Metadata } from 'next';
import { StoreProvider } from '@/context/StoreContext';
import { getServerStoreData } from '@/lib/serverCatalog';
import TopUtilityBar from '@/components/theme-v2/TopUtilityBar';
import HeaderNav from '@/components/theme-v2/HeaderNav';
import ServicesZigZag from '@/components/theme-v2/ServicesZigZag';
import ProcessStepper from '@/components/theme-v2/ProcessStepper';
import Footer from '@/components/theme-v2/Footer';
import CartDrawer from '@/components/theme-v2/store-bridge/CartDrawer';
import CheckoutModal from '@/components/theme-v2/store-bridge/CheckoutModal';
import OrderTrackingModal from '@/components/theme-v2/store-bridge/OrderTrackingModal';
import QuoteModal from '@/components/theme-v2/QuoteModal';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'B2B Bulk Supply, Dehydration & Cold-Press Services',
  description:
    'Commercial bulk raw forest honey drums, solar-dehydrated superfood powders (80–100 mesh), wood cold-pressed virgin oils, and turnkey private label packaging.',
  alternates: {
    canonical: 'https://beeshubfarmland.com/services',
  },
};

export default async function ServicesPage() {
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
                B2B Supply &amp; Manufacturing Services
              </h1>
              <p className="text-sm sm:text-base text-slate-200 max-w-2xl">
                End-to-end farmgate procurement, lab-certified COA dispatch, and custom OEM packaging from Kanyakumari.
              </p>
            </div>
          </section>
          <ServicesZigZag />
          <ProcessStepper />
        </main>
        <Footer />
        <CartDrawer />
        <CheckoutModal />
        <OrderTrackingModal />
        <QuoteModal />
      </div>
    </StoreProvider>
  );
}
