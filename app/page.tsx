import React from 'react';
import { StoreProvider } from '@/context/StoreContext';
import StoreThemeV2 from '@/components/theme-v2/StoreThemeV2';
import StoreThemeV1 from '@/components/theme-v1/StoreThemeV1';
import { getServerStoreData } from '@/lib/serverCatalog';

export const dynamic = 'force-dynamic';

const homepageFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the Minimum Order Quantity (MOQ) for wholesale honey and spices?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'For bulk raw honey in food-grade drums, our standard starting MOQ is 50 kg. For customized private label retail jars, our starting batch begins at 500 units per variant.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you provide batch-specific Certificate of Analysis (COA) test reports?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Every commercial shipment is dispatched with an authentic, lot-coded COA detailing moisture content, invert sugar percentages, C4/NMR sugar screen results, and heavy metal testing.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can you provide private label bottling and custom branding?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely. We offer complete OEM co-packing in our ISO 22000 cleanroom, including custom glass bottle sourcing, induction sealing, front/back labeling, and outer master carton packing.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do you ensure honey is not adulterated with inverted sugar or rice syrup?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We operate proprietary apiary colonies in Western Ghats reserves and never feed artificial sugar syrup. Furthermore, all harvest undergoes periodic third-party testing at NABL-accredited labs.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the shelf life and storage recommendation for bulk raw honey?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Raw honey naturally has an indefinite shelf life when stored sealed in food-grade drums at ambient room temperature (18°C - 28°C), away from direct sunlight and humidity.',
      },
    },
    {
      '@type': 'Question',
      name: 'How are commercial bulk orders shipped and insured across India?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We partner with leading national freight carriers (V-Trans, SafeExpress, TCI Freight) providing palletized or individual drum transit with full transit insurance and live tracking.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I request pre-shipment lab samples prior to placing a volume contract?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Our trade desk provides 100g - 250g sealed bench evaluation samples delivered to your QA laboratory within 48 to 72 hours across major Indian metro zones.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are your accepted payment terms for corporate and institutional procurement?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We accept RTGS/NEFT institutional bank transfers, verified UPI, and structured letter of credit (LC) or milestone terms for recurring enterprise supply agreements.',
      },
    },
  ],
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageFaqJsonLd) }}
      />
      <StoreProvider initialData={initialData}>
        {activeTheme === 'v1' ? <StoreThemeV1 /> : <StoreThemeV2 />}
      </StoreProvider>
    </>
  );
}
