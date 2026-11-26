import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Phone, Mail, ShieldCheck, MessageCircle, ChevronRight } from 'lucide-react';
import { StoreProvider } from '@/context/StoreContext';
import { getServerStoreData } from '@/lib/serverCatalog';
import AnnouncementBar from '@/components/theme-v2/AnnouncementBar';
import HeaderNav from '@/components/theme-v2/HeaderNav';
import Footer from '@/components/theme-v2/Footer';
import CartDrawer from '@/components/theme-v2/store-bridge/CartDrawer';
import CheckoutModal from '@/components/theme-v2/store-bridge/CheckoutModal';
import OrderTrackingModal from '@/components/theme-v2/store-bridge/OrderTrackingModal';
import QuoteModal from '@/components/theme-v2/QuoteModal';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact & B2B Trade Desk',
  description:
    'Contact BEES HUB FARMLAND PRIVATE LIMITED in Nagercoil, Kanyakumari for retail orders, bulk wholesale supply, and private-label enquiries. Phone: +91 95787 84431.',
  alternates: {
    canonical: 'https://beeshubfarmland.com/contact',
  },
};

export default async function ContactPage() {
  const initialData = await getServerStoreData();

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beeshubfarmland.com' },
      { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://beeshubfarmland.com/contact' },
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
                <span className="text-white font-semibold">Contact</span>
              </nav>
              <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight">
                Contact Bees Hub Farmland
              </h1>
              <p className="text-sm sm:text-base text-[#E8EFE6] max-w-2xl leading-relaxed">
                Direct farmgate trade desk for retail order support, bulk wholesale quotations, and private-label manufacturing enquiries.
              </p>
            </div>
          </section>

          <section className="max-w-[1240px] mx-auto px-4 sm:px-6 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#F7F4EB]/55 rounded-2xl p-6 border border-[#E4E7E1] space-y-3">
              <MapPin className="w-6 h-6 text-[#173F2B]" />
              <h2 className="font-serif font-semibold text-lg text-[#202820]">Facility &amp; Farm Office</h2>
              <p className="text-xs sm:text-sm text-[#6B756B] leading-relaxed">
                BEES HUB FARMLAND PRIVATE LIMITED
                <br />
                Door No: 2/26-1, Muhilanvilai, Monikettipottal-Post,
                <br />
                Nagercoil, Kanyakumari District, Tamil Nadu - 629501, India
              </p>
            </div>

            <div className="bg-[#F7F4EB]/55 rounded-2xl p-6 border border-[#E4E7E1] space-y-3">
              <Phone className="w-6 h-6 text-[#173F2B]" />
              <h2 className="font-serif font-semibold text-lg text-[#202820]">Direct Trade &amp; Support</h2>
              <div className="space-y-2 text-xs sm:text-sm text-[#6B756B]">
                <p>
                  <strong>Phone:</strong>{' '}
                  <a href="tel:+919578784431" className="text-[#173F2B] font-semibold hover:underline">
                    +91 95787 84431
                  </a>
                </p>
                <p className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[#A97843]" />
                  <a href="mailto:admin@beeshubfarmland.com" className="text-[#173F2B] font-semibold hover:underline">
                    admin@beeshubfarmland.com
                  </a>
                </p>
                <a
                  href="https://wa.me/919578784431"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-full bg-[#25D366] text-white text-xs font-semibold"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="bg-[#F7F4EB]/55 rounded-2xl p-6 border border-[#E4E7E1] space-y-3">
              <ShieldCheck className="w-6 h-6 text-[#173F2B]" />
              <h2 className="font-serif font-semibold text-lg text-[#202820]">Registrations &amp; Licenses</h2>
              <ul className="space-y-1.5 text-xs sm:text-sm text-[#6B756B]">
                <li><strong>FSSAI Central:</strong> 12425009000671</li>
                <li><strong>GSTIN:</strong> 33AAOCB0453D1Z3</li>
                <li><strong>IEC Code:</strong> AAOCB0453D</li>
                <li><strong>Standards:</strong> ISO 9001:2015, ISO 22000:2018 &amp; GMP</li>
              </ul>
            </div>
          </section>
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
