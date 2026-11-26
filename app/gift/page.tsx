import type { Metadata } from 'next';
import GiftClient from './GiftClient';

export const metadata: Metadata = {
  title: 'Wedding Return Gift Hampers & Corporate Chests',
  description:
    'Wedding return favors and corporate gift hampers featuring pure forest honey, cold-pressed oils, superfood powders, and makhana in engraved pine-wood chests.',
  keywords: [
    'Wedding Return Gift Hampers',
    'Auspicious Honey Wedding Favors',
    'Corporate Wellness Gift Hampers',
    'Handcrafted Pine Wood Gift Chest',
    'Eco-Friendly Event Favors India',
    'Housewarming Return Gifts Kanyakumari',
    'Pure Forest Honey Gift Box',
    'Custom Laser Engraved Gift Box',
    'BeesHub Farmland Event Hampers',
    'South India Wedding Favors',
  ],
  alternates: {
    canonical: 'https://beeshubfarmland.com/gift',
  },
  openGraph: {
    title: 'Wedding Return Gift Hampers & Corporate Wellness Chests | BeesHub Farmland',
    description:
      'Curated wedding favors and corporate gift chests featuring pure wild forest honey, cold-pressed virgin oils, and superfoods in laser-engraved solid pine-wood chests.',
    url: 'https://beeshubfarmland.com/gift',
    siteName: 'BEES HUB FARMLAND PRIVATE LIMITED',
    images: [
      {
        url: '/images/hampers/luxury-wellness-chest.webp',
        width: 1200,
        height: 896,
        alt: 'BeesHub Luxury Wellness Gift Hamper Chest',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wedding & Event Gift Hampers | BeesHub Farmland',
    description: 'Artisanal wellness hampers with pure forest honey, cold-pressed oils, and superfood powders.',
    images: ['/images/hampers/luxury-wellness-chest.webp'],
  },
};

export default function GiftPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': 'https://beeshubfarmland.com/gift#product',
        name: 'The Royal Farmstead Wellness Chest',
        description:
          'Handcrafted solid pine-wood heirloom gift chest featuring pure wild forest honey (500g), cold-pressed virgin coconut oil (250ml), dehydrated Nendran banana powder (150g), jumbo Fox Nut Makhana, and botanical herbal soap.',
        image: 'https://beeshubfarmland.com/images/hampers/luxury-wellness-chest.webp',
        brand: {
          '@type': 'Brand',
          name: 'BeesHub Farmland',
        },
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'INR',
          lowPrice: '850',
          highPrice: '1150',
          priceValidUntil: '2027-12-31',
          availability: 'https://schema.org/InStock',
        },
      },
      {
        '@type': 'OfferCatalog',
        '@id': 'https://beeshubfarmland.com/gift#catalog',
        name: 'Event & Wedding Return Gift Hampers',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Product',
              name: 'The Royal Farmstead Wellness Chest',
              description: 'Luxury wedding return gift in solid pine-wood chest with laser-engraved lid.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Product',
              name: 'The Auspicious Heritage Pooja Box',
              description: 'Traditional ceremonies & housewarmings favor in gold-embossed rigid gift box.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Product',
              name: 'The Executive Superfood & Energy Trunk',
              description: 'Corporate conferences & galas gift in eco-friendly woven jute and cork trunk.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Product',
              name: 'The Golden Harvest Fruit & Nectar Box',
              description: 'High-volume banquet favor in minimalist twin sliding drawer box.',
            },
          },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://beeshubfarmland.com/gift#faq',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Can we order a physical sample hamper before confirming our guest order?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. We deliver a complete sample hamper directly to your residence containing your selected honey jars, oils, powders, and wooden box finish so your family or event committee can verify craftsmanship and taste firsthand.',
            },
          },
          {
            '@type': 'Question',
            name: 'What is the minimum order quantity for custom laser-engraved hampers?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'We accept custom event hamper orders starting at 25 units. Complimentary laser engraving of host names, wedding dates, or corporate logos is included on orders of 50 units or more.',
            },
          },
          {
            '@type': 'Question',
            name: 'Do you deliver directly to the wedding hall or event venue?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. We coordinate dedicated express freight delivery directly to marriage halls, hotels, and banquet venues across all Indian cities and towns, scheduled to arrive 48 hours prior to your ceremony.',
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
            name: 'Wedding & Event Gift Hampers',
            item: 'https://beeshubfarmland.com/gift',
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
      <GiftClient />
    </>
  );
}
