import type { Metadata } from 'next';
import { StoreProvider } from '@/context/StoreContext';
import { getServerStoreData } from '@/lib/serverCatalog';
import TopUtilityBar from '@/components/theme-v2/TopUtilityBar';
import HeaderNav from '@/components/theme-v2/HeaderNav';
import AboutBlock from '@/components/theme-v2/AboutBlock';
import WhyChooseUs from '@/components/theme-v2/WhyChooseUs';
import NotAFitCallout from '@/components/theme-v2/NotAFitCallout';
import Footer from '@/components/theme-v2/Footer';
import CartDrawer from '@/components/theme-v2/store-bridge/CartDrawer';
import CheckoutModal from '@/components/theme-v2/store-bridge/CheckoutModal';
import OrderTrackingModal from '@/components/theme-v2/store-bridge/OrderTrackingModal';
import QuoteModal from '@/components/theme-v2/QuoteModal';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About BeesHub Farmland — Kanyakumari Farmgate & Certifications',
  description:
    'Learn about BEES HUB FARMLAND PRIVATE LIMITED in Kanyakumari, Western Ghats. FSSAI Central (#12425009000671), ISO 22000, GMP, and IEC certified apiculture and dehydration facility.',
  alternates: {
    canonical: 'https://beeshubfarmland.com/about',
  },
};

export default async function AboutPage() {
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
                About BeesHub Farmland
              </h1>
              <p className="text-sm sm:text-base text-slate-200 max-w-2xl">
                Western Ghats bio-reserve apiaries, solar dehydration cleanrooms, and wood cold-press oil mills in Kanyakumari, Tamil Nadu.
              </p>
            </div>
          </section>
          <AboutBlock />
          <WhyChooseUs />
          <NotAFitCallout />
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
