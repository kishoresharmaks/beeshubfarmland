import type { Metadata } from 'next';
import { MapPin, Phone, Mail, ShieldCheck, MessageCircle } from 'lucide-react';
import { StoreProvider } from '@/context/StoreContext';
import { getServerStoreData } from '@/lib/serverCatalog';
import TopUtilityBar from '@/components/theme-v2/TopUtilityBar';
import HeaderNav from '@/components/theme-v2/HeaderNav';
import Footer from '@/components/theme-v2/Footer';
import CartDrawer from '@/components/theme-v2/store-bridge/CartDrawer';
import CheckoutModal from '@/components/theme-v2/store-bridge/CheckoutModal';
import OrderTrackingModal from '@/components/theme-v2/store-bridge/OrderTrackingModal';
import QuoteModal from '@/components/theme-v2/QuoteModal';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact & B2B Trade Desk | BeesHub Farmland',
  description:
    'Contact BEES HUB FARMLAND PRIVATE LIMITED in Nagercoil, Kanyakumari for wholesale honey, superfood powders, private label bottling, and retail support. Phone: +91 95787 84431.',
  alternates: {
    canonical: 'https://beeshubfarmland.com/contact',
  },
};

export default async function ContactPage() {
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
                Contact BeesHub Farmland
              </h1>
              <p className="text-sm sm:text-base text-slate-200 max-w-2xl">
                Direct farmgate trade desk for retail orders, bulk wholesale quotations, private label manufacturing, and export inquiries.
              </p>
            </div>
          </section>

          <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-[#E8EDF2] shadow-card space-y-3">
              <MapPin className="w-6 h-6 text-[#ED3500]" />
              <h2 className="font-heading font-bold text-lg text-[#163B5C]">Facility &amp; Farm Office</h2>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                BEES HUB FARMLAND PRIVATE LIMITED
                <br />
                Door No: 2/26-1, Muhilanvilai, Monikettipottal-Post,
                <br />
                Nagercoil, Kanyakumari District, Tamil Nadu - 629501, India
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#E8EDF2] shadow-card space-y-3">
              <Phone className="w-6 h-6 text-[#ED3500]" />
              <h2 className="font-heading font-bold text-lg text-[#163B5C]">Direct Trade &amp; Support</h2>
              <div className="space-y-2 text-xs sm:text-sm text-[#64748B]">
                <p>
                  <strong>Phone:</strong>{' '}
                  <a href="tel:+919578784431" className="text-[#163B5C] font-semibold hover:text-[#ED3500]">
                    +91 95787 84431
                  </a>
                </p>
                <p className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[#ED3500]" />
                  <a href="mailto:admin@beeshubfarmland.com" className="text-[#163B5C] font-semibold hover:text-[#ED3500]">
                    admin@beeshubfarmland.com
                  </a>
                </p>
                <a
                  href="https://wa.me/919578784431"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-full bg-[#25D366] text-white text-xs font-bold"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#E8EDF2] shadow-card space-y-3">
              <ShieldCheck className="w-6 h-6 text-[#10B981]" />
              <h2 className="font-heading font-bold text-lg text-[#163B5C]">Registrations &amp; Licenses</h2>
              <ul className="space-y-1.5 text-xs sm:text-sm text-[#64748B]">
                <li><strong>FSSAI Central:</strong> 12425009000671</li>
                <li><strong>GSTIN:</strong> 33AAOCB0453D1Z3</li>
                <li><strong>IEC Code:</strong> AAOCB0453D</li>
                <li><strong>ISO:</strong> 22000 &amp; 9001:2015 Certified</li>
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
