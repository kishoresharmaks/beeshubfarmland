import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, ShieldCheck, Award, CheckCircle2, Globe2, MapPin } from 'lucide-react';
import { StoreProvider } from '@/context/StoreContext';
import { getServerStoreData } from '@/lib/serverCatalog';
import { getCompanyConfig } from '@/lib/companyConfig';
import AnnouncementBar from '@/components/theme-v2/AnnouncementBar';
import HeaderNav from '@/components/theme-v2/HeaderNav';
import OurFarmSection from '@/components/theme-v2/OurFarmSection';
import WhyChooseBeesHub from '@/components/theme-v2/WhyChooseBeesHub';
import NotAFitCallout from '@/components/theme-v2/NotAFitCallout';
import Footer from '@/components/theme-v2/Footer';
import CartDrawer from '@/components/theme-v2/store-bridge/CartDrawer';
import CheckoutModal from '@/components/theme-v2/store-bridge/CheckoutModal';
import OrderTrackingModal from '@/components/theme-v2/store-bridge/OrderTrackingModal';
import QuoteModal from '@/components/theme-v2/QuoteModal';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About Us — Kanyakumari Farm & Certifications',
  description:
    'About BEES HUB FARMLAND PRIVATE LIMITED in Kanyakumari, Tamil Nadu. FSSAI Central (#12425009000671), ISO 9001:2015, ISO 22000:2018, GMP & IEC certified.',
  alternates: {
    canonical: 'https://beeshubfarmland.com/about',
  },
};

export default async function AboutPage() {
  const initialData = await getServerStoreData();
  const company = getCompanyConfig();

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beeshubfarmland.com' },
      { '@type': 'ListItem', position: 2, name: 'About Us', item: 'https://beeshubfarmland.com/about' },
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
                <span className="text-white font-semibold">About Us</span>
              </nav>
              <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight">
                About Bees Hub Farmland
              </h1>
              <p className="text-sm sm:text-base text-[#E8EFE6] max-w-2xl leading-relaxed">
                Regional farmgate sourcing, Western Ghats apiculture, solar dehydration, and wood cold-press oil milling in Kanyakumari District, Tamil Nadu.
              </p>
            </div>
          </section>

          <OurFarmSection />

          {/* Verified Credentials & Registrations */}
          <section id="certifications" className="w-full py-14 sm:py-20 bg-white border-b border-[#E4E7E1]">
            <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-8">
              <div className="max-w-2xl space-y-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#A97843]">
                  Verified Compliance
                </span>
                <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#202820]">
                  Company Registrations &amp; Food Safety Credentials
                </h2>
                <p className="text-sm text-[#6B756B]">
                  Registered details for {company.name}.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-5 rounded-2xl bg-[#F7F4EB]/60 border border-[#E4E7E1] space-y-2">
                  <ShieldCheck className="w-5 h-5 text-[#173F2B]" />
                  <h3 className="font-semibold text-sm text-[#202820]">FSSAI Central License</h3>
                  <p className="font-mono text-xs font-bold text-[#173F2B]">{company.fssai}</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#F7F4EB]/60 border border-[#E4E7E1] space-y-2">
                  <CheckCircle2 className="w-5 h-5 text-[#173F2B]" />
                  <h3 className="font-semibold text-sm text-[#202820]">GSTIN &amp; State Code</h3>
                  <p className="font-mono text-xs font-bold text-[#173F2B]">{company.gstin}</p>
                  <p className="text-[11px] text-[#6B756B]">{company.state}</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#F7F4EB]/60 border border-[#E4E7E1] space-y-2">
                  <Globe2 className="w-5 h-5 text-[#173F2B]" />
                  <h3 className="font-semibold text-sm text-[#202820]">Import Export Code (IEC)</h3>
                  <p className="font-mono text-xs font-bold text-[#173F2B]">{company.iec}</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#F7F4EB]/60 border border-[#E4E7E1] space-y-2">
                  <Award className="w-5 h-5 text-[#173F2B]" />
                  <h3 className="font-semibold text-sm text-[#202820]">Quality &amp; Safety Standards</h3>
                  <p className="text-xs text-[#6B756B] leading-relaxed">{company.certifications}</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#E8EFE6]/60 border border-[#E4E7E1] flex items-start gap-3 text-xs sm:text-sm text-[#202820]">
                <MapPin className="w-4 h-4 text-[#173F2B] shrink-0 mt-0.5" />
                <span>
                  <strong>Registered Facility:</strong> {company.address}
                </span>
              </div>
            </div>
          </section>

          <WhyChooseBeesHub />
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
