import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Package, ShieldCheck, Truck, Layers } from 'lucide-react';
import { StoreProvider } from '@/context/StoreContext';
import { getServerStoreData } from '@/lib/serverCatalog';
import AnnouncementBar from '@/components/theme-v2/AnnouncementBar';
import HeaderNav from '@/components/theme-v2/HeaderNav';
import B2BSolutionsSection from '@/components/theme-v2/B2BSolutionsSection';
import ServicesZigZag from '@/components/theme-v2/ServicesZigZag';
import FeatureBlock from '@/components/theme-v2/FeatureBlock';
import NotAFitCallout from '@/components/theme-v2/NotAFitCallout';
import WholesaleProcessSection from '@/components/theme-v2/WholesaleProcessSection';
import Footer from '@/components/theme-v2/Footer';
import FloatingActions from '@/components/theme-v2/FloatingActions';
import CartDrawer from '@/components/theme-v2/store-bridge/CartDrawer';
import CheckoutModal from '@/components/theme-v2/store-bridge/CheckoutModal';
import OrderTrackingModal from '@/components/theme-v2/store-bridge/OrderTrackingModal';
import QuoteModal from '@/components/theme-v2/QuoteModal';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Wholesale Supply & Processing Services',
  description:
    'Bulk raw forest honey drums, solar-dehydrated superfood powders (80–100 mesh), wood cold-pressed virgin oils, and turnkey private label packaging from Kanyakumari.',
  alternates: {
    canonical: 'https://beeshubfarmland.com/services',
  },
};

export default async function ServicesPage() {
  const initialData = await getServerStoreData();

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beeshubfarmland.com' },
      { '@type': 'ListItem', position: 2, name: 'Wholesale & Processing Services', item: 'https://beeshubfarmland.com/services' },
    ],
  };

  const packagingFormats = [
    {
      title: 'Raw Honey Bulk Drums',
      spec: '30kg, 50kg & 300kg Drums',
      detail: 'Food-grade HDPE or epoxy-lined steel drums with tamper-evident seal serials.',
      icon: Package,
    },
    {
      title: 'Dehydrated Powder Lots',
      spec: '1kg, 5kg Pouches & 25kg Cartons',
      detail: '80–100 mesh solar-dehydrated fruit, root & leaf powders in moisture-barrier liners.',
      icon: Layers,
    },
    {
      title: 'Cold-Pressed Virgin Oils',
      spec: '1L, 5L Tins, 20L Carboys & 200L Barrels',
      detail: 'Slow Marachekku wood-pressed coconut, sesame & groundnut oils extracted below 45°C.',
      icon: Truck,
    },
    {
      title: 'Private Label Retail Jars',
      spec: 'MOQ from 100 Pilot Units',
      detail: 'Square, Hexa, Octa & ITC glass jar series with induction sealing and custom labels.',
      icon: ShieldCheck,
    },
  ];

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
          {/* Hero Banner with Direct Service Anchor Navigation */}
          <section className="bg-[#173F2B] text-white py-12 sm:py-16 px-4 sm:px-6">
            <div className="max-w-[1240px] mx-auto space-y-5">
              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#E8EFE6]/80">
                <Link href="/" className="hover:text-white">Home</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-white font-semibold">Wholesale &amp; Services</span>
              </nav>

              <div className="space-y-3 max-w-3xl">
                <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight">
                  B2B Wholesale &amp; Processing Services
                </h1>
                <p className="text-sm sm:text-base text-[#E8EFE6] leading-relaxed">
                  Bulk agricultural ingredients, controlled solar dehydration, wood cold-pressing, and private-label packaging directly from Bees Hub Farmland in Kanyakumari, Tamil Nadu.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <a
                  href="#bulk-honey"
                  className="px-4 py-2 rounded-full bg-white/15 hover:bg-white hover:text-[#102E20] text-xs font-semibold transition-colors border border-white/20"
                >
                  Bulk Honey Supply
                </a>
                <a
                  href="#superfood-powders"
                  className="px-4 py-2 rounded-full bg-white/15 hover:bg-white hover:text-[#102E20] text-xs font-semibold transition-colors border border-white/20"
                >
                  Superfood Powder Processing
                </a>
                <a
                  href="#cold-pressed-oils"
                  className="px-4 py-2 rounded-full bg-white/15 hover:bg-white hover:text-[#102E20] text-xs font-semibold transition-colors border border-white/20"
                >
                  Cold-Pressed Oils
                </a>
                <a
                  href="#private-label-packaging"
                  className="px-4 py-2 rounded-full bg-white/15 hover:bg-white hover:text-[#102E20] text-xs font-semibold transition-colors border border-white/20"
                >
                  Private Label &amp; Packaging
                </a>
              </div>
            </div>
          </section>

          {/* 4-Card Service Overview (Explore Service smooth-scrolls, Enquire preloads clicked item) */}
          <B2BSolutionsSection isServicesPage />

          {/* Detailed Anchored Service Breakdowns */}
          <ServicesZigZag />

          {/* Bulk Packaging & Supply Formats */}
          <section className="w-full py-14 sm:py-18 bg-white border-b border-[#E4E7E1]">
            <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-8">
              <div className="max-w-2xl space-y-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#A97843]">
                  Dispatch Formats
                </span>
                <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#202820]">
                  Commercial Packaging &amp; Supply Options
                </h2>
                <p className="text-sm text-[#6B756B]">
                  Standardized wholesale containers and retail co-packing lines with GST billing and batch COA support.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {packagingFormats.map((fmt) => {
                  const Icon = fmt.icon;
                  return (
                    <div
                      key={fmt.title}
                      className="rounded-2xl p-6 bg-[#F7F4EB]/55 border border-[#E4E7E1] space-y-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#E8EFE6] text-[#173F2B] flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-serif font-semibold text-base text-[#202820]">
                          {fmt.title}
                        </h3>
                        <p className="text-xs font-semibold text-[#A97843] mt-0.5">{fmt.spec}</p>
                      </div>
                      <p className="text-xs text-[#6B756B] leading-relaxed">{fmt.detail}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Technical Quality Parameters */}
          <FeatureBlock />

          {/* Procurement Standards */}
          <NotAFitCallout />

          {/* 5-Step Ordering Timeline */}
          <WholesaleProcessSection />
        </main>

        <Footer />
        <FloatingActions />
        <CartDrawer />
        <CheckoutModal />
        <OrderTrackingModal />
        <QuoteModal />
      </div>
    </StoreProvider>
  );
}
