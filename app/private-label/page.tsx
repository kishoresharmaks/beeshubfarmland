import type { Metadata } from 'next';
import PrivateLabelClient from './PrivateLabelClient';

export const metadata: Metadata = {
  title: 'Private Label Honey, Superfood Powders & Custom Bottling | BeesHub Farmland',
  description:
    'OEM & contract packaging for pure raw forest honey, cold-pressed virgin oils, and dehydrated fruit flours. Food-grade glass jars (Square, Hexa, Octa, ITC), automated cleanroom bottling, low pilot MOQ from 100 units.',
  keywords: [
    'Private Label Honey India',
    'Honey Bottling Packaging Manufacturer',
    'Contract Bottling Tamil Nadu',
    'Square Honey Series Glass Jars',
    'Hexagonal Honey Jars Wholesale',
    'Dehydrated Nendran Banana Powder OEM',
    'Cold Pressed Virgin Coconut Oil Bulk',
    'White Label Superfoods India',
    'NMR Tested Honey Manufacturer',
    'BeesHub Farmland Private Label',
  ],
  alternates: {
    canonical: 'https://beeshubfarmland.com/private-label',
  },
  openGraph: {
    title: 'Private Label Honey, Superfood Powders & Bottling | BeesHub Farmland',
    description:
      'Contract bottling & OEM manufacturing for raw forest honey, cold-pressed oils, and dehydrated superfood flours in food-grade glass jars. FSSAI Central certified facility.',
    url: 'https://beeshubfarmland.com/private-label',
    siteName: 'BEES HUB FARMLAND PRIVATE LIMITED',
    images: [
      {
        url: '/images/packaging/square-honey-series.webp',
        width: 1024,
        height: 767,
        alt: 'BeesHub Private Label Glass Honey Jars',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Private Label Honey & Custom Bottling | BeesHub Farmland',
    description: 'OEM contract packaging for raw honey, oils, and dehydrated fruit flours from Kanyakumari farmlands.',
    images: ['/images/packaging/square-honey-series.webp'],
  },
};

export default function PrivateLabelPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': 'https://beeshubfarmland.com/private-label#service',
        name: 'Private Label & Contract Bottling Services',
        serviceType: 'Contract Food Manufacturing and Packaging',
        provider: {
          '@id': 'https://beeshubfarmland.com/#organization',
        },
        description:
          'Comprehensive private label manufacturing and bottling for pure wild forest honey, wood cold-pressed virgin oils, dehydrated fruit powders, and wellness supplements. Certified FSSAI Central cleanroom facility with low pilot batch MOQs.',
        areaServed: {
          '@type': 'Country',
          name: 'India',
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Private Label Packaging & Bottling Formats',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Product',
                name: 'Square Honey Series Glass Jars',
                description: 'Heavy-flint square glass jars available in 50ml, 100ml, 250ml, 500ml, and 1kg.',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Product',
                name: 'Hexa Jar Series Glass Jars',
                description: 'Faceted hexagonal glass jars available in 45ml, 100ml, 200ml, 250ml, 400ml, and 750ml.',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Product',
                name: 'AGW Octa Jar Series Glass Jars',
                description: 'Architectural tapered octagonal luxury jars in 100ml, 250ml, and 500ml.',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Product',
                name: 'AGW ITC Jar Series Glass Jars',
                description: 'Heavy-base square export luxury jars in 45ml, 100ml, 200ml, 250ml, 400ml, and 750ml.',
              },
            },
          ],
        },
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://beeshubfarmland.com/private-label#faq',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is the minimum order quantity (MOQ) for private label bottling?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Our pilot MOQ starts at just 100 units for standard glass jar series and 25 kg for dehydrated superfood flours, allowing emerging brands to enter retail markets with minimal capital exposure.',
            },
          },
          {
            '@type': 'Question',
            name: 'What glass jar formats are available for private label honey?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'We stock four standardized food-grade glass jar series: Square Honey Series (50ml to 1kg), Hexa Jar Series (45ml to 750ml), AGW Octa Jar Series (100ml to 500ml), and AGW ITC Jar Series (45ml to 750ml), all equipped with airtight lug and twist closures.',
            },
          },
          {
            '@type': 'Question',
            name: 'Do you provide lab testing COA certificates for every batch?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Every batch leaves our Kanyakumari cleanroom with a comprehensive Certificate of Analysis (COA) confirming zero C3/C4 sugar adulteration via NMR spectroscopy, moisture under 19%, and full compliance with FSSAI regulations.',
            },
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://beeshubfarmland.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Private Label & Contract Bottling',
            item: 'https://beeshubfarmland.com/private-label',
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PrivateLabelClient />
    </>
  );
}
