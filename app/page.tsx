import React from 'react';
import type { Metadata } from 'next';
import { StoreProvider } from '@/context/StoreContext';
import StoreThemeV2 from '@/components/theme-v2/StoreThemeV2';
import StoreThemeV1 from '@/components/theme-v1/StoreThemeV1';
import { getServerStoreData } from '@/lib/serverCatalog';
import { formatProductDisplayName, getProductSlugUrl } from '@/lib/productFormatting';
import { RETAIL_FAQS, WHOLESALE_FAQS } from '@/lib/faqData';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    absolute: 'Bees Hub Farmland | Pure Honey & Organic Products India',
  },
  description:
    'Discover farm-sourced honey, superfood powders and cold-pressed oils from Bees Hub Farmland, Tamil Nadu. Explore quality agricultural products and wholesale supply solutions.',
  alternates: {
    canonical: 'https://beeshubfarmland.com',
  },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { theme?: string };
}) {
  const initialData = await getServerStoreData();
  const queryTheme = searchParams?.theme;
  const activeTheme =
    queryTheme === 'v1' || queryTheme === 'v2'
      ? queryTheme
      : initialData.settings?.activeTheme || 'v2';

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [...RETAIL_FAQS, ...WHOLESALE_FAQS].map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  const featuredForSchema = (initialData.products || []).slice(0, 8);
  const catalogJsonLd =
    featuredForSchema.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Bees Hub Farmland Featured Agricultural Products',
          itemListElement: featuredForSchema.map((p: any, idx: number) => {
            const displayName = formatProductDisplayName(p.name);
            const productUrl = `https://beeshubfarmland.com${getProductSlugUrl(p)}`;
            const imageUrl =
              p.image && p.image.startsWith('http')
                ? p.image
                : `https://beeshubfarmland.com${p.image?.startsWith('/') ? p.image : '/images/beeshub-logo.png'}`;

            return {
              '@type': 'ListItem',
              position: idx + 1,
              item: {
                '@type': 'Product',
                name: displayName,
                description: p.description || displayName,
                image: imageUrl,
                url: productUrl,
                brand: {
                  '@type': 'Brand',
                  name: 'Bees Hub Farmland',
                },
                offers: {
                  '@type': 'Offer',
                  price: p.price,
                  priceCurrency: 'INR',
                  availability:
                    p.quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                  url: productUrl,
                },
              },
            };
          }),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {catalogJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogJsonLd) }}
        />
      )}
      <StoreProvider initialData={initialData}>
        {activeTheme === 'v1' ? <StoreThemeV1 /> : <StoreThemeV2 />}
      </StoreProvider>
    </>
  );
}
