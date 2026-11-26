'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Gift,
  CheckCircle2,
  Sparkles,
  Truck,
  MessageCircle,
  Package,
  Box,
  Layers,
  ArrowRight,
  ShieldCheck,
  Award,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { StoreProvider, useStore } from '@/context/StoreContext';
import TopUtilityBar from '@/components/theme-v2/TopUtilityBar';
import HeaderNav from '@/components/theme-v2/HeaderNav';
import Footer from '@/components/theme-v2/Footer';
import FloatingActions from '@/components/theme-v2/FloatingActions';
import QuoteModal from '@/components/theme-v2/QuoteModal';
import CartDrawer from '@/components/theme-v2/store-bridge/CartDrawer';
import CheckoutModal from '@/components/theme-v2/store-bridge/CheckoutModal';
import ProductQuickViewModal from '@/components/theme-v2/store-bridge/ProductQuickViewModal';
import OrderTrackingModal from '@/components/theme-v2/store-bridge/OrderTrackingModal';

interface HamperItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  desc: string;
  packagingType: string;
  packagingDetails: string;
  heroImage: string;
  badge: string;
  priceEstimate: string;
  moq: string;
  productsIncluded: {
    name: string;
    category: string;
    image: string;
    portion: string;
  }[];
  highlights: string[];
}

function GiftPageContent() {
  const { openQuoteModal, companyConfig } = useStore();

  const [activeHeroTab, setActiveHeroTab] = useState(0);
  const [eventType, setEventType] = useState('Wedding / Reception');
  const [guestCount, setGuestCount] = useState('100 - 250 Guests');
  const [boxStyle, setBoxStyle] = useState('Handcrafted Solid Pine-Wood Keepsake Chest');
  const [selectedItems, setSelectedItems] = useState<string[]>([
    'Pure Forest Honey',
    'Cold-Pressed Virgin Coconut Oil',
    'Nendran Banana Powder',
    'Jumbo Fox Nut Makhana',
  ]);

  const cleanPhone = companyConfig.phone?.replace(/\D/g, '') || '9578784431';

  const toggleItemSelection = (itemName: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemName) ? prev.filter((i) => i !== itemName) : [...prev, itemName]
    );
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const summary = `${eventType} (${guestCount}) - ${boxStyle} with [${selectedItems.join(', ')}]`;
    openQuoteModal(summary);
  };

  const hampers: HamperItem[] = [
    {
      id: 'royal-wellness-chest',
      title: 'The Royal Farmstead Wellness Chest',
      subtitle: 'Luxury Wedding Return Gift',
      category: 'Weddings & Grand Galas',
      desc: 'Handcrafted solid pine-wood heirloom chest with brass swing latch. An auspicious ensemble of pure forest honey, cold-pressed virgin coconut oil, sun-dried Nendran banana powder, crunchy jumbo fox nuts, and botanical herbal soap.',
      packagingType: 'Handcrafted Solid Pine-Wood Keepsake Chest',
      packagingDetails: 'Laser-engraved lid with bride & groom names, date, brass latch, natural wood-wool cushion.',
      heroImage: '/images/hampers/luxury-wellness-chest.webp',
      badge: 'Bestseller for Weddings',
      priceEstimate: '₹850 - ₹1,150 per chest',
      moq: '25 Hampers',
      productsIncluded: [
        {
          name: 'Pure Wild Forest Honey',
          category: 'Honey',
          image: '/images/beeshub-pure-forest-honey-spotlight.webp',
          portion: '500g Glass Hex Jar + Dipper',
        },
        {
          name: 'Cold Pressed Virgin Coconut Oil',
          category: 'Cold-Pressed Oil',
          image: '/images/products/coconut-oil.png',
          portion: '250ml Glass Flagon',
        },
        {
          name: 'Nendran Banana Powder',
          category: 'Superfood Powder',
          image: '/images/products/banana-powder.png',
          portion: '150g Kraft Seal Pouch',
        },
        {
          name: 'Jumbo Fox Nut Makhana',
          category: 'Crunchy Superfood',
          image: '/images/products/makhana.jpg',
          portion: '100g Cork Glass Jar',
        },
        {
          name: 'Handcrafted Botanical Herbal Soap',
          category: 'Natural Bath Care',
          image: '/images/products/herbal-soaps.png',
          portion: '100g Twine-Wrapped Bar',
        },
      ],
      highlights: [
        'Solid pine wood chest with laser engraved custom monogram',
        'Direct venue delivery 48h prior to function date',
        'Zero artificial additives, preservatives, or refined sugar',
        'Includes handwritten host blessing card on textured cotton cardstock',
      ],
    },
    {
      id: 'auspicious-heritage-box',
      title: 'The Auspicious Heritage Pooja Box',
      subtitle: 'Traditional Ceremonies & Housewarmings',
      category: 'Griha Pravesh & Poojas',
      desc: 'Gold-foiled rigid luxury gift box featuring sacred raw forest honey, cold-pressed wood sesame (gingelly) oil, nutrient-dense sweet potato powder, and natural cold-process herbal soap.',
      packagingType: 'Royal Gold-Embossed Rigid Keepsake Box',
      packagingDetails: '1200 GSM rigid box with matte emerald exterior, gold-foil insignia, and velvet die-cut tray.',
      heroImage: '/images/hampers/luxury-wellness-chest.webp',
      badge: 'Griha Pravesh & Poojas',
      priceEstimate: '₹620 - ₹820 per box',
      moq: '35 Hampers',
      productsIncluded: [
        {
          name: 'Pure Wild Forest Honey',
          category: 'Honey',
          image: '/images/beeshub-pure-forest-honey-spotlight.webp',
          portion: '250g Hexagonal Jar',
        },
        {
          name: 'Cold Pressed Sesame Oil',
          category: 'Cold-Pressed Oil',
          image: '/images/products/sesame-oil.jpg',
          portion: '250ml Glass Bottle',
        },
        {
          name: 'Sweet Potato Powder',
          category: 'Superfood Powder',
          image: '/images/products/sweet-potato-powder.jpg',
          portion: '150g Zipper Pouch',
        },
        {
          name: 'Handcrafted Botanical Herbal Soap',
          category: 'Natural Bath Care',
          image: '/images/products/herbal-soaps.png',
          portion: '100g Natural Bar',
        },
      ],
      highlights: [
        'Auspicious combination for traditional Indian rituals and wellness',
        'High-density rigid box with metallic gold foil stamping',
        'Custom auspicious blessing slip with personalized host family text',
        '100% Shelf life security with zero perishable sweets',
      ],
    },
    {
      id: 'executive-wellness-trunk',
      title: 'The Executive Superfood & Energy Trunk',
      subtitle: 'Corporate Galas & Leadership Summits',
      category: 'Corporate Favors',
      desc: 'Eco-friendly cork and woven jute gift trunk curated with pure wild forest honey, caffeine-free roasted Dates Coffee Powder, Moringa Leaf Capsules, and roasted jumbo Fox Nut Makhana.',
      packagingType: 'Eco-Friendly Handwoven Jute & Cork Trunk',
      packagingDetails: 'Natural golden jute weave, sustainable cork lid, cotton ribbon, corporate metal badge.',
      heroImage: '/images/hampers/luxury-wellness-chest.webp',
      badge: 'Corporate Favors',
      priceEstimate: '₹550 - ₹780 per trunk',
      moq: '25 Hampers',
      productsIncluded: [
        {
          name: 'Pure Wild Forest Honey',
          category: 'Honey',
          image: '/images/beeshub-pure-forest-honey-spotlight.webp',
          portion: '350g Glass Jar',
        },
        {
          name: 'Dates Coffee Powder',
          category: 'Superfood Powder',
          image: '/images/products/dates-coffee.jpg',
          portion: '150g Natural Tin',
        },
        {
          name: 'Moringa Leaf Capsules',
          category: 'Wellness Botanical',
          image: '/images/products/moringa-capsules.jpg',
          portion: '60 Veg Capsules Bottle',
        },
        {
          name: 'Jumbo Fox Nut Makhana',
          category: 'Crunchy Superfood',
          image: '/images/products/makhana.jpg',
          portion: '100g Kraft Pouch',
        },
      ],
      highlights: [
        'Health-first corporate gifting that partners actually consume daily',
        'Custom corporate sleeve with company branding and logo embossing',
        'Eco-friendly sustainable packaging aligned with ESG initiatives',
        'Nationwide conference venue dispatch with tracking support',
      ],
    },
    {
      id: 'golden-harvest-nectar-box',
      title: 'The Golden Harvest Fruit & Nectar Box',
      subtitle: 'High-Volume Celebrations & Favors',
      category: 'High-Volume Favors',
      desc: 'Minimalist twin-drawer presentation box pairing pure raw forest honey with artisanal dehydrated Red Banana and Nendran Banana powders, complete with a mini wooden drizzle wand.',
      packagingType: 'Minimalist Twin Sliding Drawer Box',
      packagingDetails: 'Dual-tier slide-out chambers, foil-stamped monogram, satin grosgrain pull-ribbon.',
      heroImage: '/images/hampers/luxury-wellness-chest.webp',
      badge: 'High-Volume Favors',
      priceEstimate: '₹350 - ₹480 per box',
      moq: '50 Hampers',
      productsIncluded: [
        {
          name: 'Pure Wild Forest Honey',
          category: 'Honey',
          image: '/images/beeshub-pure-forest-honey-spotlight.webp',
          portion: '150g Hexagonal Jar',
        },
        {
          name: 'Red Banana Powder',
          category: 'Fruit Powder',
          image: '/images/products/red-banana-powder.png',
          portion: '150g Airtight Pouch',
        },
        {
          name: 'Nendran Banana Powder',
          category: 'Fruit Powder',
          image: '/images/products/banana-powder.png',
          portion: '150g Airtight Pouch',
        },
      ],
      highlights: [
        'Compact form factor optimized for large 200+ banquet gatherings',
        'Cost-effective premium favor that delivers lasting culinary delight',
        'Personalized satin ribbon band and gold foil crest seal',
        'Doorstep tasting sample delivered prior to mass production',
      ],
    },
  ];

  const packagingFormats = [
    {
      title: 'Handcrafted Pine-Wood Keepsake Chest',
      material: 'Kiln-Seasoned Solid Pine Wood',
      finish: 'Natural Matte Lacquer & Brass Swing Clasp',
      customization: 'Precision Laser Engraving of Host Names, Event Date, or Emblem',
      cushioning: 'Biodegradable Shredded Natural Wood-Wool Cushion',
      dimensions: '28 cm x 20 cm x 12 cm',
      moq: '25 Units',
      badge: 'Heirloom Keepsake',
      image: '/images/hampers/luxury-wellness-chest.webp',
    },
    {
      title: 'Royal Gold-Embossed Rigid Keepsake Box',
      material: '1200 GSM High-Density Rigid Board',
      finish: 'Matte Deep Emerald / Navy Blue with Metallic Gold Foil Stamping',
      customization: 'Hot Foil Stamped Monogram, Satin Pull Ribbon, Custom Card',
      cushioning: 'Velvet Die-Cut Precision Molded Interior Cradle',
      dimensions: '25 cm x 18 cm x 10 cm',
      moq: '35 Units',
      badge: 'Classic Luxury',
      image: '/images/products/coconut-oil.png',
    },
    {
      title: 'Eco-Friendly Handwoven Jute & Cork Trunk',
      material: '100% Natural Golden Jute Weave & Portuguese Cork',
      finish: 'Cotton Twill Trim with Vegetable-Tanned Leather Pull Tab',
      customization: 'Engraved Wood/Cork Tag & Screen-Printed Organza Ribbon',
      cushioning: 'Recycled Honeycomb Kraft Paper Protective Padding',
      dimensions: '30 cm x 22 cm x 14 cm',
      moq: '25 Units',
      badge: '100% Sustainable',
      image: '/images/products/makhana.jpg',
    },
    {
      title: 'Minimalist Twin Sliding Drawer Box',
      material: 'Dual-Tier Reinforced Architectural Kraft Cardboard',
      finish: 'Warm Pearl Texture with Blind Debossed Typography',
      customization: 'Custom Color Satin Grosgrain Ribbon & Metallic Wax Seal',
      cushioning: 'Eco-Friendly Molded Pulp Cradle',
      dimensions: '22 cm x 15 cm x 8 cm',
      moq: '50 Units',
      badge: 'Compact & Modern',
      image: '/images/products/banana-powder.png',
    },
  ];

  const occasions = [
    {
      title: 'Weddings & Receptions',
      tag: 'Mangala Vivaham Favors',
      desc: 'In Indian tradition, pure honey (Madhu) and virgin oils symbolize sacred longevity, sweetness, and prosperity. Delight guests with gifts of lasting health that surpass perishable sweets.',
    },
    {
      title: 'Housewarming Ceremonies',
      tag: 'Griha Pravesh Blessings',
      desc: 'Grace new households with pure cold-pressed sesame oil, raw forest honey, and nutritious superfoods that bless the kitchen hearth with purity and divine nourishment.',
    },
    {
      title: 'Corporate Galas & Summits',
      tag: 'Executive Wellness Hampers',
      desc: 'Honor delegates, directors, and keynote speakers with sustainably packed farm wellness gifts customized with your corporate seal, supporting authentic farmer livelihoods.',
    },
    {
      title: 'Festivals & Family Milestones',
      tag: 'Diwali, Pongal & Anniversaries',
      desc: 'Share genuine festival joy with wholesome nutrition that relatives of all generations can consume and relish throughout the season.',
    },
  ];

  const availableCatalogProducts = [
    { name: 'Pure Forest Honey', category: 'Honey', image: '/images/beeshub-pure-forest-honey-spotlight.webp' },
    { name: 'Cold-Pressed Virgin Coconut Oil', category: 'Oil', image: '/images/products/coconut-oil.png' },
    { name: 'Cold-Pressed Sesame Oil', category: 'Oil', image: '/images/products/sesame-oil.jpg' },
    { name: 'Nendran Banana Powder', category: 'Powder', image: '/images/products/banana-powder.png' },
    { name: 'Red Banana Powder', category: 'Powder', image: '/images/products/red-banana-powder.png' },
    { name: 'Sweet Potato Powder', category: 'Powder', image: '/images/products/sweet-potato-powder.jpg' },
    { name: 'Dates Coffee Powder', category: 'Powder', image: '/images/products/dates-coffee.jpg' },
    { name: 'Jumbo Fox Nut Makhana', category: 'Superfood', image: '/images/products/makhana.jpg' },
    { name: 'Moringa Leaf Capsules', category: 'Wellness', image: '/images/products/moringa-capsules.jpg' },
    { name: 'Handcrafted Botanical Herbal Soap', category: 'Bath', image: '/images/products/herbal-soaps.png' },
  ];

  const faqs = [
    {
      q: 'What products can we include inside our event gift hampers?',
      a: 'You can mix and match across BeesHub’s full farm portfolio: Pure Wild Forest Honey (with carved dipper), Wood Cold-Pressed Virgin Coconut Oil, Sesame Oil, Groundnuts Oil, Dehydrated Superfood Powders (Nendran Banana, Red Banana, Sweet Potato, Dates Coffee, Beetroot), Jumbo Fox Nut Makhana, and Handcrafted Botanical Soaps.',
    },
    {
      q: 'Can we inspect a physical sample hamper before placing our final order?',
      a: 'Yes. We deliver a complete sample hamper directly to your doorstep with your selected products, packaging finish, and sample engraving so your family or event committee can verify craftsmanship and taste firsthand.',
    },
    {
      q: 'What is the minimum quantity for custom laser-engraved hampers?',
      a: 'We accept custom hamper orders starting at 25 units. Laser engraving of bride & groom names, event dates, or corporate logos is complimentary on orders of 50 units or more.',
    },
    {
      q: 'How are the hampers delivered to the wedding hall or event venue?',
      a: 'We manage full end-to-end logistics with dedicated express freight directly to marriage halls, convention hotels, or private venues across all Indian cities and towns, scheduled to arrive 48 hours prior to your ceremony.',
    },
    {
      q: 'Why choose natural farm hampers over conventional sweets (mithai)?',
      a: 'Commercial sweets perish within 2 to 4 days, contain heavy refined sugars and coloring, and are frequently discarded by health-conscious or diabetic guests. BeesHub’s raw honey, cold-pressed oils, and superfoods are 100% shelf-stable, deeply auspicious in Indian heritage, and cherished daily in home cooking.',
    },
  ];

  const currentHeroHamper = hampers[activeHeroTab];

  const whatsappMessage = encodeURIComponent(
    `Hello BeesHub Farmland Team,\n\nI am planning an upcoming event and interested in event gift hampers.\nEvent: ${eventType}\nGuests: ${guestCount}\nPreferred Packaging: ${boxStyle}\nSelected Products: ${selectedItems.join(', ')}\n\nPlease share hamper catalogs, bulk pricing, and doorstep sample delivery details.`
  );
  const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${whatsappMessage}`;

  return (
    <main className="flex-1">
      {/* 1. Hero Section with Interactive Hamper Showcase */}
      <section className="w-full py-12 sm:py-20 bg-gradient-to-b from-[#FFF8F5] via-[#FFFCFB] to-white border-b border-[#E8EDF2]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Copy & Key Value Props */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8F5] border border-orange-200 text-[#ED3500] text-xs font-semibold tracking-wide">
                <Gift className="w-4 h-4 text-[#ED3500]" />
                <span>Bespoke Event & Wedding Return Gift Hampers</span>
              </div>

              <div className="space-y-4">
                <h1 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl lg:text-[34px] xl:text-[40px] text-[#163B5C] tracking-tight leading-[1.2]">
                  <span className="block whitespace-normal sm:whitespace-nowrap">Wholesome Farmstead Gift Hampers </span>
                  <span className="block text-[#ED3500] mt-1 sm:mt-1.5 whitespace-normal sm:whitespace-nowrap">For Weddings, Ceremonies &amp; Galas</span>
                </h1>
                <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-xl">
                  Celebrate auspicious weddings, Griha Pravesh ceremonies, festivals, and corporate galas with wholesome gifts of wellness. Curated gift hampers featuring pure raw forest honey, wood cold-pressed virgin oils, dehydrated fruit &amp; superfood powders (Nendran Banana, Red Banana, Sweet Potato, Dates), crunchy Fox Nut Makhana, and botanical herbal soaps, hand-packed in artisanal pine wood chests with custom laser engraving and direct venue delivery.
                </p>

                {/* Line by Line Feature Highlights */}
                <div className="space-y-2 pt-1 text-xs sm:text-sm text-[#475569]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#ED3500] shrink-0" />
                    <span><strong className="text-[#163B5C]">Handcrafted Keepsakes:</strong> Solid pine-wood chests, royal gold-embossed boxes, and sustainable jute trunks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#ED3500] shrink-0" />
                    <span><strong className="text-[#163B5C]">Pure Farm Harvest:</strong> Raw forest honey, wood cold-pressed virgin oils, banana &amp; dates powders, and makhana</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#ED3500] shrink-0" />
                    <span><strong className="text-[#163B5C]">Custom Personalization:</strong> Laser-engraved host names, auspicious wedding dates, and custom blessing cards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#ED3500] shrink-0" />
                    <span><strong className="text-[#163B5C]">Direct Venue Delivery:</strong> Coordinated pan-India freight arrival 48 hours prior to your ceremony or reception</span>
                  </div>
                </div>
              </div>

              {/* Event Host Key Guarantees */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {[
                  { title: 'Personalized', desc: 'Custom laser engraving' },
                  { title: 'Venue Delivery', desc: 'Pan-India 48h prior' },
                  { title: 'Sample First', desc: 'Doorstep tasting box' },
                  { title: 'Auspicious', desc: '100% Pure & healthy' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-2xl border border-[#E8EDF2] shadow-2xs">
                    <div className="font-heading font-bold text-xs sm:text-sm text-[#163B5C]">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => openQuoteModal(currentHeroHamper.title)}
                  className="px-7 py-3.5 rounded-full bg-[#ED3500] hover:bg-[#D02E00] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#ED3500]/25 transition-colors flex items-center gap-2"
                >
                  <Gift className="w-4 h-4" />
                  <span>Inquire for Event Hampers</span>
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 border border-[#E8EDF2] text-[#163B5C] font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>Chat with Gifting Desk</span>
                </a>
              </div>
            </div>

            {/* Right Interactive Hamper Showcase */}
            <div className="lg:col-span-5 space-y-4">
              {/* Category Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-[#E8EDF2] shadow-2xs overflow-x-auto">
                {hampers.map((hamper, idx) => (
                  <button
                    key={hamper.id}
                    type="button"
                    onClick={() => setActiveHeroTab(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      activeHeroTab === idx
                        ? 'bg-[#163B5C] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#163B5C] hover:bg-slate-50'
                    }`}
                  >
                    {hamper.subtitle.split('&')[0].trim()}
                  </button>
                ))}
              </div>

              {/* Active Showcase Card */}
              <div className="bg-white rounded-3xl border border-[#E8EDF2] shadow-card overflow-hidden transition-all duration-300">
                <div className="relative h-60 sm:h-64 w-full bg-slate-100 overflow-hidden">
                  <Image
                    src={currentHeroHamper.heroImage}
                    alt={currentHeroHamper.title}
                    fill
                    className="object-cover object-center"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

                  <div className="absolute top-3.5 left-3.5">
                    <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-bold text-[#163B5C] border border-[#E8EDF2]">
                      {currentHeroHamper.badge}
                    </span>
                  </div>

                  <div className="absolute bottom-3.5 left-4 right-4 text-white">
                    <div className="text-[11px] font-semibold text-amber-300">
                      {currentHeroHamper.packagingType}
                    </div>
                    <div className="font-heading font-bold text-base sm:text-lg leading-snug">
                      {currentHeroHamper.title}
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-3">
                  <div className="text-xs text-[#64748B]">
                    {currentHeroHamper.desc}
                  </div>

                  {/* Included Farm Products Chips */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-semibold text-[#163B5C]">
                      Included Farm Produce in this Hamper:
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {currentHeroHamper.productsIncluded.slice(0, 4).map((p, pIdx) => (
                        <div
                          key={pIdx}
                          className="flex items-center gap-2 p-1.5 rounded-xl bg-[#FFF8F5] border border-orange-100"
                        >
                          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white shrink-0 border border-slate-100">
                            <Image
                              src={p.image}
                              alt={p.name}
                              fill
                              className="object-contain p-0.5"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-semibold text-[#163B5C] truncate">
                              {p.name}
                            </div>
                            <div className="text-[9px] text-[#64748B] truncate">
                              {p.portion}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing and Direct Quote Button */}
                  <div className="pt-2.5 border-t border-[#E8EDF2] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-[#64748B]">Bulk Host Pricing</div>
                      <div className="text-xs sm:text-sm font-bold text-[#163B5C]">
                        {currentHeroHamper.priceEstimate}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openQuoteModal(currentHeroHamper.title)}
                      className="px-4 py-2 rounded-xl bg-[#ED3500] hover:bg-[#D02E00] text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      Inquire this Hamper
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Occasions Catered */}
      <section className="w-full py-16 sm:py-20 bg-white border-b border-[#E8EDF2]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#163B5C] tracking-tight">
              Curated for life&apos;s most auspicious moments
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Every function deserves a thoughtful, wholesome gift that guests will treasure and enjoy daily in their homes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {occasions.map((occ, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-[#FFFCFB] border border-[#E8EDF2] shadow-2xs hover:border-[#ED3500] transition-colors space-y-3"
              >
                <div className="text-xs font-semibold text-[#ED3500]">
                  {occ.tag}
                </div>
                <h3 className="font-heading font-bold text-base text-[#163B5C]">
                  {occ.title}
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  {occ.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Curated Signature Hampers (Diagonal & Staggered Multi-Product Showcase) */}
      <section className="w-full py-16 sm:py-24 bg-[#FFFCFB] border-b border-[#E8EDF2]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-xs font-semibold text-[#ED3500]">
              <Package className="w-3.5 h-3.5" />
              <span>Multi-Product Curations</span>
            </div>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-[#163B5C] tracking-tight">
              Signature event gift hamper collections
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Featuring BeesHub&apos;s complete harvest: Raw Forest Honey, Cold-Pressed Virgin Oils, Dehydrated Superfood & Fruit Powders, and Crunch Makhana.
            </p>
          </div>

          {/* Staggered Diagonal Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {hampers.map((hamper, idx) => (
              <div
                key={hamper.id}
                className={`bg-white rounded-3xl border border-[#E8EDF2] overflow-hidden shadow-card flex flex-col justify-between group hover:border-[#ED3500] transition-all duration-300 ${
                  idx % 2 === 1 ? 'md:translate-y-4' : ''
                }`}
              >
                {/* Hamper Top Visual & Packaging Header */}
                <div className="relative h-60 w-full bg-slate-100 overflow-hidden">
                  <Image
                    src={hamper.heroImage}
                    alt={hamper.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                  <div className="absolute top-3.5 left-3.5">
                    <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[11px] font-bold text-[#163B5C] border border-[#E8EDF2]">
                      {hamper.badge}
                    </span>
                  </div>

                  <div className="absolute bottom-3.5 left-4 right-4 text-white">
                    <div className="text-[11px] font-semibold text-amber-300">
                      {hamper.subtitle}
                    </div>
                    <h3 className="font-heading font-bold text-lg leading-snug">
                      {hamper.title}
                    </h3>
                  </div>
                </div>

                {/* Hamper Content & Composition */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                      {hamper.desc}
                    </p>

                    {/* Packaging Specs */}
                    <div className="p-3 rounded-2xl bg-[#FFFCFB] border border-[#E8EDF2] flex items-start gap-2.5">
                      <Box className="w-4 h-4 text-[#ED3500] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-[#163B5C]">
                          {hamper.packagingType}
                        </div>
                        <div className="text-[11px] text-[#64748B] mt-0.5">
                          {hamper.packagingDetails}
                        </div>
                      </div>
                    </div>

                    {/* Included Real Products Row */}
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-[#163B5C]">
                        Included Harvest Products ({hamper.productsIncluded.length} items):
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {hamper.productsIncluded.map((prod, pIdx) => (
                          <div
                            key={pIdx}
                            className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100"
                          >
                            <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-white shrink-0 border border-slate-200">
                              <Image
                                src={prod.image}
                                alt={prod.name}
                                fill
                                className="object-contain p-0.5"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-[#163B5C] truncate">
                                {prod.name}
                              </div>
                              <div className="text-[10px] text-[#64748B] truncate">
                                {prod.portion}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Highlights */}
                    <ul className="space-y-1.5 pt-2 border-t border-slate-100">
                      {hamper.highlights.map((hl, hIdx) => (
                        <li key={hIdx} className="flex items-center gap-2 text-xs font-medium text-[#163B5C]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-4 border-t border-[#E8EDF2] flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-[#64748B]">Bulk Event Pricing</div>
                      <div className="text-xs sm:text-sm font-bold text-[#163B5C]">
                        {hamper.priceEstimate}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openQuoteModal(hamper.title)}
                      className="px-5 py-2.5 rounded-full bg-[#ED3500] hover:bg-[#D02E00] text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Inquire This Hamper</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Demo Packaging Showcase & Keepsake Craftsmanship */}
      <section className="w-full py-16 sm:py-24 bg-white border-b border-[#E8EDF2]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-[#163B5C]">
              <Layers className="w-3.5 h-3.5" />
              <span>Demo Packaging Formats</span>
            </div>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-[#163B5C] tracking-tight">
              Artisanal demo packaging tailored for your event
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Every packaging format is engineered for heirloom keepsakes, zero transit damage, and memorable host prestige.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {packagingFormats.map((pkg, idx) => (
              <div
                key={idx}
                className="bg-[#FFFCFB] rounded-3xl border border-[#E8EDF2] p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-[#ED3500] transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-white text-[10px] font-bold text-[#163B5C] border border-[#E8EDF2]">
                      {pkg.badge}
                    </span>
                    <span className="text-[10px] font-semibold text-[#10B981]">
                      MOQ: {pkg.moq}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-base text-[#163B5C] leading-snug">
                    {pkg.title}
                  </h3>

                  <div className="space-y-2 text-xs text-[#64748B]">
                    <div>
                      <span className="font-semibold text-[#163B5C]">Material: </span>
                      {pkg.material}
                    </div>
                    <div>
                      <span className="font-semibold text-[#163B5C]">Finish: </span>
                      {pkg.finish}
                    </div>
                    <div>
                      <span className="font-semibold text-[#163B5C]">Customization: </span>
                      {pkg.customization}
                    </div>
                    <div>
                      <span className="font-semibold text-[#163B5C]">Dimensions: </span>
                      {pkg.dimensions}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => openQuoteModal(pkg.title)}
                    className="w-full py-2 rounded-xl bg-white hover:bg-[#ED3500] text-[#163B5C] hover:text-white font-semibold text-xs border border-[#E8EDF2] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Request Sample Box</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Honey & Wellness vs Conventional Sweets Comparison */}
      <section className="w-full py-16 sm:py-20 bg-[#FFFCFB] border-b border-[#E8EDF2]">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#163B5C] tracking-tight">
              Why modern event hosts choose wellness hampers over conventional sweets
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Guests deeply appreciate wholesome nutrition and shelf stability over perishable sugar confectionery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Conventional Mithai */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="font-heading font-bold text-base text-slate-700">
                Conventional Sugar Confectionery (Mithai)
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">&times;</span>
                  <span>Perishable within 2 to 4 days, especially during hot banquet halls and travel.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">&times;</span>
                  <span>Loaded with refined white sugar, trans fats, and synthetic colorings.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">&times;</span>
                  <span>Often discarded or left uneaten due to diabetes and fitness diets.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">&times;</span>
                  <span>Disposable paper boxes with zero keepsake value.</span>
                </li>
              </ul>
            </div>

            {/* BeesHub Natural Farm Hampers */}
            <div className="p-6 rounded-3xl bg-[#FFF8F5] border border-orange-200 space-y-4 ring-1 ring-orange-200">
              <div className="font-heading font-bold text-base text-[#ED3500]">
                BeesHub Farmstead Wellness Hampers
              </div>
              <ul className="space-y-2.5 text-xs text-[#163B5C] font-semibold">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span>100% Shelf-stable raw honey and wood cold-pressed virgin oils that never spoil.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span>Sacred Indian tradition (Madhu & Tailam) symbolizing purity, health, and sweetness.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span>Cherished by all generations, fitness enthusiasts, elders, and young families.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span>Reusable solid pine wood chests laser-engraved with your celebration date.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Custom Event Hamper Builder Form */}
      <section className="w-full py-16 sm:py-20 bg-white border-b border-[#E8EDF2]">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6">
          <div className="bg-[#163B5C] text-white rounded-3xl p-6 sm:p-10 shadow-card space-y-8">
            <div className="space-y-2 text-center sm:text-left">
              <span className="px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold border border-white/15">
                Event Booking Planner
              </span>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white">
                Customize your event gift hampers
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Select your occasion, packaging, and harvest produce. We will dispatch a physical sample box and personalized quote sheet.
              </p>
            </div>

            <form onSubmit={handleInquirySubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Event Type */}
                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    Function / Occasion
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white text-[#163B5C] rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    <option value="Wedding / Reception">Wedding / Reception</option>
                    <option value="Corporate Gala / Summit">Corporate Gala / Summit</option>
                    <option value="Housewarming (Griha Pravesh)">Housewarming (Griha Pravesh)</option>
                    <option value="Festival & Milestone Gathering">Festival & Milestone Gathering</option>
                    <option value="Family Ceremony / Baby Shower">Family Ceremony / Baby Shower</option>
                  </select>
                </div>

                {/* Estimated Guests */}
                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    Expected Hampers
                  </label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white text-[#163B5C] rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    <option value="25 - 50 Hampers">25 - 50 Hampers</option>
                    <option value="50 - 150 Hampers">50 - 150 Hampers</option>
                    <option value="150 - 350 Hampers">150 - 350 Hampers</option>
                    <option value="350 - 1000+ Hampers">350 - 1,000+ Hampers</option>
                  </select>
                </div>

                {/* Preferred Packaging */}
                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    Box Presentation
                  </label>
                  <select
                    value={boxStyle}
                    onChange={(e) => setBoxStyle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white text-[#163B5C] rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    <option value="Handcrafted Solid Pine-Wood Keepsake Chest">Pine-Wood Keepsake Chest</option>
                    <option value="Royal Gold-Embossed Rigid Keepsake Box">Gold-Embossed Rigid Box</option>
                    <option value="Eco-Friendly Handwoven Jute & Cork Trunk">Eco-Friendly Jute & Cork Trunk</option>
                    <option value="Minimalist Twin Sliding Drawer Box">Minimalist Twin Drawer Box</option>
                  </select>
                </div>
              </div>

              {/* Multi-Product Selection Checkboxes */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-white">
                  Select Harvest Products to Include in Your Custom Hamper:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {availableCatalogProducts.map((p) => {
                    const isChecked = selectedItems.includes(p.name);
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => toggleItemSelection(p.name)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          isChecked
                            ? 'bg-white text-[#163B5C] border-white font-semibold'
                            : 'bg-white/10 text-slate-300 border-white/15 hover:bg-white/15'
                        }`}
                      >
                        <div className="relative w-6 h-6 rounded-md overflow-hidden bg-white shrink-0">
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            className="object-contain p-0.5"
                          />
                        </div>
                        <span className="text-[11px] truncate flex-1">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  className="w-full sm:flex-1 py-3.5 rounded-full bg-[#ED3500] hover:bg-[#D02E00] text-white font-semibold text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Gift className="w-4 h-4" />
                  <span>Request Custom Hamper Quotation</span>
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 7. Event Host FAQs */}
      <section className="w-full py-16 sm:py-20 bg-[#FFFCFB] border-b border-[#E8EDF2]">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#163B5C] tracking-tight">
              Event host questions & answers
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Everything you need to know about custom hampers, samples, and wedding hall logistics.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-[#E8EDF2] space-y-2 shadow-2xs"
              >
                <h3 className="font-heading font-bold text-sm sm:text-base text-[#163B5C]">
                  {faq.q}
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Closing CTA Strip */}
      <section className="w-full py-16 bg-[#163B5C] text-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h2 className="font-heading font-bold text-xl sm:text-2xl">
              Planning your upcoming function or ceremony?
            </h2>
            <p className="text-xs text-slate-300">
              Order a tasting sample hamper today and consult with our dedicated event gifting desk.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openQuoteModal('Wedding & Event Gift Hampers')}
            className="px-8 py-3.5 rounded-full bg-[#ED3500] hover:bg-[#D02E00] text-white font-semibold text-xs sm:text-sm whitespace-nowrap shadow-md transition-colors shrink-0"
          >
            Inquire Event Hampers
          </button>
        </div>
      </section>
    </main>
  );
}

export default function GiftClient() {
  return (
    <StoreProvider>
      <div className="min-h-screen bg-[#FFFCFB] text-[#163B5C] flex flex-col justify-between selection:bg-amber-200 selection:text-[#163B5C]">
        <TopUtilityBar />
        <HeaderNav />
        <GiftPageContent />
        <Footer />
        <FloatingActions />
        <QuoteModal />
        <CartDrawer />
        <CheckoutModal />
        <ProductQuickViewModal />
        <OrderTrackingModal />
      </div>
    </StoreProvider>
  );
}
