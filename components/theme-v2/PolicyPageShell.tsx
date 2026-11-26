import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { StoreProvider } from '@/context/StoreContext';
import { getServerStoreData } from '@/lib/serverCatalog';
import AnnouncementBar from './AnnouncementBar';
import HeaderNav from './HeaderNav';
import Footer from './Footer';
import CartDrawer from './store-bridge/CartDrawer';
import CheckoutModal from './store-bridge/CheckoutModal';
import OrderTrackingModal from './store-bridge/OrderTrackingModal';
import QuoteModal from './QuoteModal';

export default async function PolicyPageShell({
  title,
  subtitle,
  canonicalPath,
  children,
}: {
  title: string;
  subtitle: string;
  canonicalPath: string;
  children: React.ReactNode;
}) {
  const initialData = await getServerStoreData();

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beeshubfarmland.com' },
      { '@type': 'ListItem', position: 2, name: title, item: `https://beeshubfarmland.com${canonicalPath}` },
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
          <section className="bg-[#173F2B] text-white py-12 sm:py-14 px-4 sm:px-6">
            <div className="max-w-[960px] mx-auto space-y-3">
              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#E8EFE6]/80">
                <Link href="/" className="hover:text-white">Home</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-white font-semibold">{title}</span>
              </nav>
              <h1 className="font-serif font-bold text-3xl sm:text-4xl tracking-tight">
                {title}
              </h1>
              <p className="text-sm text-[#E8EFE6] max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            </div>
          </section>

          <section className="max-w-[960px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <div className="rounded-2xl border border-[#E4E7E1] bg-[#F7F4EB]/40 p-6 sm:p-10 space-y-6 text-sm text-[#202820] leading-relaxed">
              {children}
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
