export interface FaqItem {
  q: string;
  a: string;
}

export const RETAIL_FAQS: FaqItem[] = [
  {
    q: 'How do I purchase products?',
    a: 'Browse our Shop or Featured Products section, select your preferred pack size or variant, click Add to Cart, and proceed to checkout by entering your delivery address and payment method.',
  },
  {
    q: 'Which payment methods are supported?',
    a: 'We support secure online payments via Razorpay (UPI, credit/debit cards, and net banking) as well as Cash on Delivery (COD) where enabled in store settings.',
  },
  {
    q: 'What are the shipping charges?',
    a: 'Retail storefront orders currently qualify for free shipping across India as displayed in the shopping cart and checkout summary.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Dispatch timelines depend on your delivery pincode and courier route from Kanyakumari, Tamil Nadu. Once your order is placed, you can monitor live status anytime via the Track Order tool or contact our support desk on +91 95787 84431.',
  },
  {
    q: 'What is the return and refund policy?',
    a: 'If you receive a damaged, leaked, or incorrect product, please contact our support team at admin@beeshubfarmland.com or +91 95787 84431 with your Order ID and package photos so we can arrange a prompt replacement or refund review. Full details are available on our Return & Refund Policy page.',
  },
];

export const WHOLESALE_FAQS: FaqItem[] = [
  {
    q: 'What is the minimum order quantity?',
    a: 'Bulk raw honey in food-grade drums typically starts from 50 kg, dehydrated superfood powders from 25 kg lots, private-label glass jar bottling from 100 pilot units, and custom event gift hampers from 25 units.',
  },
  {
    q: 'Can you provide product samples?',
    a: 'Yes. Commercial buyers can request sealed bench evaluation samples through our Request a Quote form or purchase retail sample packs directly from the online store.',
  },
  {
    q: 'Do you provide COA documentation?',
    a: 'Yes. Commercial wholesale consignments are supplied with batch-level Certificate of Analysis (COA) documentation covering applicable quality, moisture, and C4/NMR sugar purity checks.',
  },
  {
    q: 'Do you offer private-label packaging?',
    a: 'Yes. Our FSSAI Central and ISO 22000:2018 certified facility provides turnkey private-label co-packing in Square, Hexa, Octa, and ITC glass jar series as well as pouches and custom boxes.',
  },
  {
    q: 'Do you support bulk orders and exports?',
    a: 'Yes. Bees Hub Farmland Private Limited holds an active Import Export Code (IEC: AAOCB0453D) and supports pan-India commercial freight as well as export-ready bulk supply enquiries.',
  },
];
