'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Factory,
  Package,
  Layers,
  FileCheck,
  Truck,
  MessageCircle,
  HelpCircle,
  Award,
  Leaf,
  Sliders,
  Sparkles,
  Droplet,
  Hexagon,
  PackageCheck,
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

function PrivateLabelContent() {
  const { setIsQuoteModalOpen, openQuoteModal, companyConfig } = useStore();

  const heroCategories = [
    {
      id: 'powders',
      name: 'Superfood Powders',
      icon: Leaf,
      iconColor: 'text-[#10B981]',
      defaultProductIndex: 0,
    },
    {
      id: 'oils',
      name: 'Cold-Pressed Oils',
      icon: Droplet,
      iconColor: 'text-[#0EA5E9]',
      defaultProductIndex: 4,
    },
    {
      id: 'honey',
      name: 'Raw Forest Honey',
      icon: Hexagon,
      iconColor: 'text-[#F59E0B]',
      defaultProductIndex: 3,
    },
    {
      id: 'snacks',
      name: 'Capsules & Snacks',
      icon: PackageCheck,
      iconColor: 'text-[#10B981]',
      defaultProductIndex: 5,
    },
  ];

  const heroProducts = [
    {
      id: 'red-banana',
      categoryId: 'powders',
      selectorLabel: 'Red Banana',
      name: 'Red Banana Powder (Chevvazhai)',
      tag: 'Infant & Bakery Grade Superfood',
      subtitle: 'Nutrient-dense, gluten-free traditional South Indian red banana flour rich in potassium, natural antioxidants, and dietary fiber.',
      heroImage: '/images/products/red-banana-powder.png',
      thumbnail: '/images/products/red-banana-powder.png',
      specs: ['Resistant Starch', 'Moisture < 5%', '80–100 Mesh', 'Baby-Food Grade'],
      quoteValue: 'Red Banana Powder (Chevvazhai)',
    },
    {
      id: 'nendran-banana',
      categoryId: 'powders',
      selectorLabel: 'Nendran Banana',
      name: 'Nendran Raw Banana Powder',
      tag: 'Prebiotic Resistant Starch',
      subtitle: 'Sun-ripened Kanyakumari Nendran bananas, solar-dehydrated below 50°C. 100% natural, zero added sugar or starch.',
      heroImage: '/images/products/banana-powder.png',
      thumbnail: '/images/products/banana-powder.png',
      specs: ['Prebiotic Fiber', 'Low GI', 'Zero Sugar', 'Solar Dehydrated'],
      quoteValue: 'Nendran Banana Powder (Raw & Fine)',
    },
    {
      id: 'dates-powder',
      categoryId: 'powders',
      selectorLabel: 'Dates Powder',
      name: 'Natural Dehydrated Dates Powder',
      tag: '100% Pure Fruit Sweetener',
      subtitle: 'Handpicked natural dates, pitted and dehydrated into fine 80–100 mesh powder. A healthy unrefined alternative to white sugar.',
      heroImage: '/images/products/dates-powder-natural.jpg',
      thumbnail: '/images/products/dates-powder-natural.jpg',
      specs: ['Zero Refined Sugar', 'High Fiber & Iron', 'Preservative Free', 'Infant Safe'],
      quoteValue: 'Dates Powder Natural _Shyn&Dev - 250 Gm',
    },
    {
      id: 'raw-honey',
      categoryId: 'honey',
      selectorLabel: 'Raw Honey',
      name: 'Western Ghats Raw Forest Honey',
      tag: 'NMR Tested Unheated Apiculture',
      subtitle: 'Unheated, unpasteurized forest honey with natural pollen enzymes intact. Certified zero C3/C4 sugar adulteration.',
      heroImage: '/images/beeshub-pure-forest-honey-spotlight.webp',
      thumbnail: '/images/beeshub-pure-forest-honey-spotlight.webp',
      specs: ['Zero C4 Sugars', 'Diastase > 8', 'FSSAI Certified', 'Raw & Unheated'],
      quoteValue: 'Pure Wild Forest Honey',
    },
    {
      id: 'cold-pressed-oil',
      categoryId: 'oils',
      selectorLabel: 'Cold-Pressed Oil',
      name: 'Wood Cold-Pressed Virgin Coconut Oil',
      tag: 'Traditional Marachekku Milling',
      subtitle: 'Centrifuged zero-heat expeller extraction preserving natural lauric acid, antioxidants, and authentic fresh farm aroma.',
      heroImage: '/images/products/coconut-oil.png',
      thumbnail: '/images/products/coconut-oil.png',
      specs: ['Expeller < 45°C', 'High Lauric Acid', 'Zero Mineral Oil', 'Single Press'],
      quoteValue: 'Cold-Pressed Virgin Coconut Oil',
    },
    {
      id: 'moringa-snacks',
      categoryId: 'snacks',
      selectorLabel: 'Moringa & Snacks',
      name: 'Moringa Capsules & Popped Makhana',
      tag: 'Plant Nutrition & Healthy Snacks',
      subtitle: 'Vegetable cellulose capsules, handcrafted botanical herbal soaps, and Grade 6 jumbo popped fox nuts.',
      heroImage: '/images/products/moringa-capsules.jpg',
      thumbnail: '/images/products/makhana.jpg',
      specs: ['Chlorophyll Rich', 'Jumbo Grade 6', 'Pure Cellulose', 'Zero Chemical Fillers'],
      quoteValue: 'Moringai Leaf Powder & Capsules',
    },
  ];

  const [activeCategory, setActiveCategory] = useState(0);
  const [activeProductIndex, setActiveProductIndex] = useState(0);

  const handleSelectCategory = (catIdx: number) => {
    setActiveCategory(catIdx);
    const targetProductIdx = heroCategories[catIdx].defaultProductIndex;
    if (targetProductIdx !== undefined && heroProducts[targetProductIdx]) {
      setActiveProductIndex(targetProductIdx);
    }
  };

  const handleSelectProduct = (prodIdx: number) => {
    setActiveProductIndex(prodIdx);
    const prod = heroProducts[prodIdx];
    const catIdx = heroCategories.findIndex((c) => c.id === prod.categoryId);
    if (catIdx !== -1) {
      setActiveCategory(catIdx);
    }
  };

  const currentProduct = heroProducts[activeProductIndex];

  const [selectedProduct, setSelectedProduct] = useState('Nendran Banana Powder (Dehydrated)');
  const [selectedContainer, setSelectedContainer] = useState('Standup Zipper Pouch (200g)');
  const [estimatedQty, setEstimatedQty] = useState('250');

  const cleanPhone = companyConfig.phone?.replace(/\D/g, '') || '9578784431';

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openQuoteModal(currentProduct.quoteValue);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello BeesHub Farmland Team,\n\nI am interested in your Private Label & Contract Manufacturing services for ${currentProduct.name}.\nPackaging Format: Pouches, Glass Jars, Tins & Bottles.\nEstimated Batch: Starts from 100 units.\n\nPlease share catalog, MOQ, and sample dispatch details.`
  );
  const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${whatsappMessage}`;

  const varieties = [
    {
      name: 'Nendran Banana Powder (Raw & Fine)',
      category: 'Dehydrated Fruit Flours',
      origin: 'Kanyakumari Agricultural Belt',
      notes: 'Natural infant porridge base, bakery ingredient, gluten-free resistant starch (68%+).',
      curation: 'Baby Food & Bakery Top Seller',
      packaging: 'Barrier Pouches (200g-1kg) & 25kg Liners',
      moq: '100 Units / 50 kg',
      image: '/images/products/banana-powder.png',
    },
    {
      name: 'Red Banana Powder (Chevvazhai)',
      category: 'Dehydrated Fruit Flours',
      origin: 'Western Ghats Hill Groves',
      notes: 'Traditional South Indian fruit powder, rich in potassium, natural carotenoids and prebiotic fiber.',
      curation: 'Functional Health & Smoothies',
      packaging: 'Barrier Pouches & 25kg Liners',
      moq: '100 Units / 25 kg',
      image: '/images/products/red-banana-powder.png',
    },
    {
      name: 'Pure Wild Forest Honey',
      category: 'Raw Honey Harvest',
      origin: 'Western Ghats Forest Apiaries',
      notes: 'Unheated, unpasteurized, NMR and C4 certified, rich active enzymes and native pollen.',
      curation: 'Export & Premium Retail',
      packaging: 'Hexagonal Glass Jars & 300kg Steel Drums',
      moq: '100 Jars / 30 kg',
      image: '/images/beeshub-pure-forest-honey-spotlight.webp',
    },
    {
      name: 'Moringai Leaf Powder & Capsules',
      category: 'Superfoods & Supplements',
      origin: 'Organic Tamil Nadu Farms',
      notes: 'Low-temperature shade dried, chlorophyll intact, available in bulk powder or vegan cellulose capsules.',
      curation: 'Daily Immunity & White Label',
      packaging: 'HDPE Safety Jars (60/120s) & Pouches',
      moq: '150 Units / 25 kg',
      image: '/images/products/moringa-capsules.jpg',
    },
    {
      name: 'Cold-Pressed Virgin Coconut Oil',
      category: 'Wood-Pressed Oils',
      origin: 'Kanyakumari Coastal Groves',
      notes: 'Centrifuged zero-heat expeller extraction, high lauric acid (50%+), pure fresh coconut aroma.',
      curation: 'Culinary & Cosmetic Grade',
      packaging: 'Amber Glass Bottles & Food Tins',
      moq: '100 Bottles / 50 Litres',
      image: '/images/products/coconut-oil.png',
    },
    {
      name: 'Cold-Pressed Sesame & Groundnut Oils',
      category: 'Wood-Pressed Oils',
      origin: 'Selected Farmgate Seeds',
      notes: 'Traditional Marachekku stone-press, unrefined, rich in natural sesamol and vitamin E antioxidants.',
      curation: 'Authentic Traditional Cooking',
      packaging: 'Dark Amber Glass & Lithographed Tins',
      moq: '100 Bottles / 50 Litres',
      image: '/images/products/sesame-oil.jpg',
    },
    {
      name: 'Sweet Potato Powder',
      category: 'Dehydrated Root Powders',
      origin: 'Farmgate Root Harvest',
      notes: 'Dehydrated complex carbohydrate flour for fitness nutrition, porridge blends, and bakery mixes.',
      curation: 'Clean-Label Sports Nutrition',
      packaging: 'Resealable Pouches & Bulk Sacks',
      moq: '100 Units / 50 kg',
      image: '/images/products/sweet-potato-powder.jpg',
    },
    {
      name: 'Natural Dates Powder & Dates Coffee',
      category: 'Nutrient Sweeteners',
      origin: 'Selected Natural Dates',
      notes: 'Zero refined sugar sweetener powder for milk drinks, baby food, and caffeine-free dates coffee.',
      curation: 'Natural Infant Sweetener',
      packaging: 'Standup Pouches & Composite Cans',
      moq: '100 Units / 25 kg',
      image: '/images/products/dates-coffee.jpg',
    },
    {
      name: 'Makhana (Fox Nuts) Grade 5 & 6',
      category: 'Healthy Popped Snacks',
      origin: 'Selected Jumbo Kernels',
      notes: 'Evenly popped, low moisture, crunch-optimized lotus seeds for premium roasted snack brands.',
      curation: 'Healthy Roasted Snacks',
      packaging: 'Barrier Pouches & Master Cartons',
      moq: '200 Units / 50 kg',
      image: '/images/products/makhana.jpg',
    },
  ];

  const jarPackagingSeries = [
    {
      id: 'square-honey-series',
      name: 'Square Honey Series',
      headline: 'Heavy-Flint Square Glass Jars',
      desc: 'Four-sided square profile with flat facet label panels, flat base stability, and secure lug or threaded screw closures.',
      capacities: ['50ml', '100ml', '250ml', '500ml', '1kg'],
      image: '/images/packaging/square-honey-series.webp',
      closure: 'Lug and twist caps (Gold, Deep Black, or Yellow screw cap on 1kg)',
      finish: 'Flint glass with airtight induction or foam liner',
      recommendedFor: 'Raw forest honey, organic spreads, and dense nectars',
      moq: '100 units / size',
    },
    {
      id: 'hexa-jar-series',
      name: 'Hexa Jar Series',
      headline: 'Faceted Hexagonal Glass Jars',
      desc: 'Iconic six-sided apiculture geometry providing multi-angle light refraction, highlighting natural honey clarity on retail displays.',
      capacities: ['45ml', '100ml', '200ml', '250ml', '400ml', '750ml'],
      image: '/images/packaging/hexa-jar-series.webp',
      closure: 'Deep-twist metallic gold lug caps',
      finish: 'Food-grade flint glass with tamper-evident seal band',
      recommendedFor: 'Single-origin wild forest honey, honeycomb pieces, and wedding favors',
      moq: '100 units / size',
    },
    {
      id: 'octa-jar-series',
      name: 'AGW Octa Jar Series',
      headline: 'Tapered Octagonal Luxury Jars',
      desc: 'Eight-sided architectural glass silhouette with gently sloping shoulders, designed for premium organic shelf positioning.',
      capacities: ['100ml', '250ml', '500ml'],
      image: '/images/packaging/octa-jar-series.webp',
      closure: 'High-gloss gold lug twist caps with plastisol liner',
      finish: 'Heavy clarity glass with airtight vacuum seal',
      recommendedFor: 'Medicinal stingless bee honey, infused botanical honey, and cold-pressed oils',
      moq: '100 units / size',
    },
    {
      id: 'itc-jar-series',
      name: 'AGW ITC Jar Series',
      headline: 'Heavy-Base Square Luxury Jars',
      desc: 'Wide-mouth heavy-flint square glass profile with substantial base thickness, engineered for export markets and supermarket prominence.',
      capacities: ['45ml', '100ml', '200ml', '250ml', '400ml', '750ml'],
      image: '/images/packaging/itc-jar-series.webp',
      closure: 'Wide-mouth metallic gold twist closures',
      finish: 'Extra-clear flint glass with hermetic seal',
      recommendedFor: 'Export honey grades, botanical fruit preserves, and gourmet spreads',
      moq: '100 units / size',
    },
  ];

  const steps = [
    {
      step: 'Step 1',
      title: 'Produce & Floral Selection',
      desc: 'Choose from our certified harvest varieties (Forest, Acacia, Stingless, or custom spice blends) based on your target retail audience and price points.',
    },
    {
      step: 'Step 2',
      title: 'Packaging & Closure Engineering',
      desc: 'Select from glass hexagons, squeezer bottles, or ceramic crocks. We provide container samples and cap finishes tailored to your design.',
    },
    {
      step: 'Step 3',
      title: 'Labeling & Regulatory Compliance',
      desc: 'We review your artwork against mandatory FSSAI, Legal Metrology, and barcode standards. We handle batch printing and expiry coding.',
    },
    {
      step: 'Step 4',
      title: 'Pilot Batch & Lab NMR Certification',
      desc: 'Every production batch is tested for C4 sugar adulteration, moisture under 18%, and HMF count, backed by a comprehensive Certificate of Analysis (COA).',
    },
    {
      step: 'Step 5',
      title: 'Production & Palletized Logistics',
      desc: 'Your custom-packaged products are packed in heavy-duty master cartons and shipped via surface cargo or export freight directly to your warehouse.',
    },
  ];

  const faqs = [
    {
      q: 'What is the Minimum Order Quantity (MOQ) for Private Labeling?',
      a: 'We support emerging brands and startups with flexible MOQs starting at just 100 to 250 jars for standard glass jars. For fully customized mold bottles or specialized lithographed packaging, MOQs generally start at 1,000 units.',
    },
    {
      q: 'Do you provide lab test certificates (COA) for our brand batches?',
      a: 'Yes. Every private label batch comes with an accredited laboratory Certificate of Analysis (COA) confirming zero C3/C4 sugar adulteration (NMR tested), moisture strictly below 18%-19%, and zero chemical pesticide residues.',
    },
    {
      q: 'Can you assist with FSSAI license compliance and label legalities?',
      a: 'Our regulatory specialists verify your label artwork to ensure strict adherence to FSSAI packaging guidelines, mandatory font sizes, allergen statements, barcode placement, and batch serialization.',
    },
    {
      q: 'Can we receive product samples before confirming our commercial run?',
      a: 'We courier pre-production sample kits containing sample packs, jars, or bottles with your chosen powders, oils, honey, or capsules directly to your office within 3 to 4 business days.',
    },
    {
      q: 'What is the standard production turnaround time?',
      a: 'Standard orders with approved label designs typically complete within 7 to 12 business days from artwork approval, followed by doorstep road cargo delivery across India.',
    },
  ];

  return (
    <main className="flex-1">
      {/* 1. Hero Section - Clean Editorial Private Label Showcase */}
      <section className="w-full relative py-12 lg:py-16 bg-[#FFFCFB] border-b border-[#E9E5DF] min-h-[700px] lg:min-h-[760px] flex items-center">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center">
            {/* Left Column (~44% on desktop) */}
            <div className="lg:col-span-5 xl:col-span-5 space-y-6">
              {/* Certification Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-xs font-semibold tracking-wide shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>FSSAI &amp; GMP Certified Contract Manufacturer</span>
              </div>

              {/* Main Heading */}
              <div className="space-y-3">
                <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-[42px] xl:text-[46px] text-[#12334D] tracking-tight leading-[1.16]">
                  <span className="block">Launch Your Own Brand with </span>
                  <span className="block text-[#F0440A] mt-1 sm:mt-1.5">Our Private Label Solutions</span>
                </h1>
                <p className="text-sm sm:text-[15px] xl:text-base text-[#64748B] leading-relaxed max-w-xl">
                  Turn our farm-sourced superfoods, oils, honey and wellness products into your own brand. We handle sourcing, processing, packaging and regulatory compliance, while you grow your brand.
                </p>
              </div>

              {/* Four Benefit Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
                {/* 1 */}
                <div className="p-3 sm:p-3.5 bg-white rounded-2xl border border-[#E9E5DF] shadow-2xs hover:border-[#10B981] transition-colors flex flex-col justify-between">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[#10B981] mb-2">
                    <Leaf className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <div>
                    <div className="font-heading font-bold text-xs sm:text-[13px] text-[#12334D] leading-tight">
                      100% Farm Pure
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-0.5 leading-tight">
                      No fillers or additives
                    </div>
                  </div>
                </div>

                {/* 2 */}
                <div className="p-3 sm:p-3.5 bg-white rounded-2xl border border-[#E9E5DF] shadow-2xs hover:border-[#F0440A] transition-colors flex flex-col justify-between">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[#F0440A] mb-2">
                    <Layers className="w-5 h-5 text-[#F0440A]" />
                  </div>
                  <div>
                    <div className="font-heading font-bold text-xs sm:text-[13px] text-[#12334D] leading-tight">
                      Low MOQ
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-0.5 leading-tight">
                      Starts from 100 units
                    </div>
                  </div>
                </div>

                {/* 3 */}
                <div className="p-3 sm:p-3.5 bg-white rounded-2xl border border-[#E9E5DF] shadow-2xs hover:border-[#F0440A] transition-colors flex flex-col justify-between">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[#F0440A] mb-2">
                    <Package className="w-5 h-5 text-[#F0440A]" />
                  </div>
                  <div>
                    <div className="font-heading font-bold text-xs sm:text-[13px] text-[#12334D] leading-tight">
                      Custom Packaging
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-0.5 leading-tight">
                      Pouches, jars, tins &amp; more
                    </div>
                  </div>
                </div>

                {/* 4 */}
                <div className="p-3 sm:p-3.5 bg-white rounded-2xl border border-[#E9E5DF] shadow-2xs hover:border-[#F0440A] transition-colors flex flex-col justify-between">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[#F0440A] mb-2">
                    <Award className="w-5 h-5 text-[#F0440A]" />
                  </div>
                  <div>
                    <div className="font-heading font-bold text-xs sm:text-[13px] text-[#12334D] leading-tight">
                      FSSAI Ready
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-0.5 leading-tight">
                      Complete batch COA
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => openQuoteModal(currentProduct.quoteValue)}
                  className="px-7 py-3.5 rounded-full bg-[#F0440A] hover:bg-[#D43805] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#F0440A]/25 transition-all flex items-center gap-2 group"
                >
                  <Package className="w-4 h-4" />
                  <span>Request Private Label Quote</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 border border-[#E9E5DF] text-[#12334D] font-semibold text-xs sm:text-sm shadow-2xs transition-all flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>Chat with Commercial Desk</span>
                </a>
              </div>
            </div>

            {/* Right Column: Large Premium Product Showcase (~56% on desktop) */}
            <div className="lg:col-span-7 xl:col-span-7">
              <div className="bg-white rounded-[28px] sm:rounded-[32px] border border-[#E9E5DF] shadow-xl p-4 sm:p-6 lg:p-7 relative overflow-hidden">
                {/* Category Tabs (4 Tabs in a row) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 sm:mb-5">
                  {heroCategories.map((cat, idx) => {
                    const Icon = cat.icon;
                    const isActive = activeCategory === idx;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectCategory(idx)}
                        className={`px-3 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          isActive
                            ? 'bg-[#174C35] text-white shadow-sm ring-1 ring-[#174C35]'
                            : 'bg-white border border-[#E9E5DF] text-[#12334D] hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : cat.iconColor}`} />
                        <span className="truncate">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Featured Product Clean Editorial Stage */}
                <div className="w-full rounded-2xl sm:rounded-3xl bg-[#FFFDFB] border border-[#E9E5DF] p-5 sm:p-6 lg:p-7 mb-4 sm:mb-5 shadow-2xs">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Left: Product Editorial Metadata */}
                    <div className="md:col-span-7 space-y-3">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-[11px] font-semibold">
                        <Leaf className="w-3 h-3 text-[#10B981]" />
                        <span>{currentProduct.tag}</span>
                      </div>

                      <h3 className="font-heading font-bold text-xl sm:text-2xl text-[#12334D] leading-tight">
                        {currentProduct.name}
                      </h3>

                      <p className="text-xs sm:text-[13px] text-[#64748B] leading-relaxed">
                        {currentProduct.subtitle}
                      </p>

                      {/* Micro Quality Specs */}
                      <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] font-medium text-[#12334D]">
                        {currentProduct.specs.map((spec, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2.5 py-1 rounded-lg bg-white border border-[#E9E5DF] shadow-2xs"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>

                      <div className="pt-1.5">
                        <button
                          type="button"
                          onClick={() => openQuoteModal(currentProduct.quoteValue)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F0440A] hover:underline"
                        >
                          <span>Request Private Label Quote for {currentProduct.selectorLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Right: Real Product Photography Stage (Properly Fitted, Object-Contain) */}
                    <div className="md:col-span-5 flex items-center justify-center">
                      <div className="relative w-44 h-44 sm:w-52 sm:h-52 p-3 rounded-2xl bg-white border border-[#E9E5DF] shadow-xs flex items-center justify-center group">
                        <Image
                          src={currentProduct.heroImage}
                          alt={currentProduct.name}
                          fill
                          className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                          priority
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Thumbnail Navigation (6 Selector Cards) */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5">
                  {heroProducts.map((prod, idx) => {
                    const isSelected = activeProductIndex === idx;
                    return (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => handleSelectProduct(idx)}
                        className={`p-2 sm:p-2.5 rounded-2xl text-center transition-all flex flex-col items-center justify-between group ${
                          isSelected
                            ? 'border-2 border-[#F0440A] bg-orange-50/40 shadow-2xs scale-[1.02]'
                            : 'border border-[#E9E5DF] bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="relative w-12 h-10 sm:w-14 sm:h-12 mb-1 flex items-center justify-center">
                          <Image
                            src={prod.thumbnail}
                            alt={prod.selectorLabel}
                            fill
                            className="object-contain p-0.5"
                          />
                        </div>
                        <span
                          className={`text-[11px] sm:text-xs leading-tight transition-colors line-clamp-1 ${
                            isSelected ? 'font-bold text-[#F0440A]' : 'font-medium text-[#12334D] group-hover:text-[#F0440A]'
                          }`}
                        >
                          {prod.selectorLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Core Pillars of BeesHub Private Label */}
      <section className="w-full py-16 sm:py-20 bg-white border-b border-[#E8EDF2]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#163B5C] tracking-tight">
              Why leading brands choose BeesHub Farmland
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Integrated supply security from Western Ghats farmgates and apiaries to your packaged retail line.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Leaf,
                title: 'Western Ghats Origins',
                desc: 'Estate-grown produce, cold-pressed oils, and bio-reserve apiaries harvested under strict residue-free practices.',
              },
              {
                icon: Factory,
                title: 'Certified Cleanroom',
                desc: 'Hygienic semi-automated and automated bottling lines equipped with induction cap sealing and anti-crystallization warmth baths.',
              },
              {
                icon: ShieldCheck,
                title: 'NMR & Purity Verified',
                desc: 'Rigorous analytical testing for C4 sugar adulteration, antibiotic absence, and heavy metal compliance for domestic and export tiers.',
              },
              {
                icon: Layers,
                title: 'Low Startup MOQs',
                desc: 'Start with small pilot batches from 100 units to test your market, scaling seamlessly to truckloads and container shipments.',
              },
            ].map((col, idx) => {
              const Icon = col.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-[#FFFCFB] border border-[#E8EDF2] shadow-2xs hover:border-[#10B981] transition-colors space-y-3"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center border border-[#A7F3D0]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-bold text-base text-[#163B5C]">
                    {col.title}
                  </h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {col.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Farmgate Harvest Varieties & Formulations */}
      <section className="w-full py-16 sm:py-24 bg-white border-b border-[#E8EDF2] overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-[#163B5C] tracking-tight">
              Select your base harvest varieties
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Direct farmgate dehydrated fruit powders, wood cold-pressed virgin oils, raw forest honey, and herbal supplements.
            </p>
          </div>

          {/* Diagonal Staggered Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 pt-2 pb-6">
            {varieties.map((v, idx) => {
              const isEven = idx % 2 === 0;
              const colOffset = idx % 3 === 1 ? 'lg:translate-y-4' : idx % 3 === 2 ? 'lg:translate-y-8' : '';

              return (
                <div
                  key={idx}
                  className={`bg-[#FFFCFB] rounded-3xl border border-[#E8EDF2] overflow-hidden shadow-card hover:border-[#ED3500] hover:shadow-md transition-all duration-300 flex flex-col justify-between group ${colOffset}`}
                >
                  {/* Diagonal-cut Image Stage */}
                  <div className="relative overflow-hidden">
                    <div
                      className={`relative h-52 sm:h-56 w-full bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] border-b border-[#E8EDF2] flex items-center justify-center p-4 transition-transform duration-500 ${
                        isEven
                          ? '[clip-path:polygon(0_0,100%_0,100%_90%,0_100%)]'
                          : '[clip-path:polygon(0_0,100%_0,100%_100%,0_90%)]'
                      }`}
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={v.image}
                          alt={v.name}
                          fill
                          className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                      <span className="text-[10px] font-semibold text-[#059669] bg-[#ECFDF5]/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-[#A7F3D0] shadow-2xs">
                        {v.origin}
                      </span>
                      <span className="text-[10px] font-semibold text-[#163B5C] bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-[#E8EDF2] shadow-2xs">
                        {v.curation}
                      </span>
                    </div>
                  </div>

                  {/* Card Content & Specifications */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-[#ED3500]">
                        {v.category}
                      </div>
                      <h3 className="font-heading font-bold text-base text-[#163B5C] leading-snug group-hover:text-[#ED3500] transition-colors">
                        {v.name}
                      </h3>
                      <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2">
                        {v.notes}
                      </p>
                    </div>

                    {/* Specifications Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F1F5F9] text-xs">
                      <div className="space-y-0.5">
                        <div className="text-[10px] font-medium text-[#94A3B8]">
                          Packaging
                        </div>
                        <div className="text-[11px] font-semibold text-[#163B5C] line-clamp-1">
                          {v.packaging}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-[10px] font-medium text-[#94A3B8]">
                          Pilot MOQ
                        </div>
                        <div className="text-[11px] font-semibold text-[#163B5C]">
                          {v.moq}
                        </div>
                      </div>
                    </div>

                    {/* Action Button: Pre-loads this product in QuoteModal */}
                    <div className="pt-1">
                      <button
                        onClick={() => openQuoteModal(v.name)}
                        className="w-full py-2.5 rounded-xl bg-[#FFF8F5] hover:bg-[#ED3500] text-[#ED3500] hover:text-white font-semibold text-xs border border-[#FFD5C7] hover:border-[#ED3500] transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Request Quote for {v.name.split(' ')[0]}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Food-Grade Glass Jar Packaging Series */}
      <section className="w-full py-16 sm:py-24 bg-white border-b border-[#E8EDF2]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-[#163B5C] tracking-tight">
              Food-grade glass jar packaging series
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Standard bottling formats with airtight lug and twist closures, tested for automated filling lines and retail shelf impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {jarPackagingSeries.map((jar) => (
              <div
                key={jar.id}
                className="bg-[#FFFCFB] rounded-3xl border border-[#E8EDF2] overflow-hidden shadow-card hover:border-[#ED3500] transition-colors flex flex-col justify-between group"
              >
                {/* Product Photo Stage */}
                <div className="relative h-64 sm:h-72 w-full bg-slate-50 border-b border-[#E8EDF2] flex items-center justify-center p-4 overflow-hidden">
                  <Image
                    src={jar.image}
                    alt={jar.name}
                    fill
                    className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[11px] font-semibold text-[#163B5C] border border-[#E8EDF2] shadow-2xs">
                      {jar.capacities.length} Available Capacities
                    </span>
                  </div>
                </div>

                {/* Jar Specifications & Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-[#ED3500]">
                        {jar.headline}
                      </div>
                      <h3 className="font-heading font-bold text-lg text-[#163B5C]">
                        {jar.name}
                      </h3>
                      <p className="text-xs text-[#64748B] leading-relaxed">
                        {jar.desc}
                      </p>
                    </div>

                    {/* Available Sizes Pills */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-semibold text-[#163B5C]">
                        Standard Available Volumes:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {jar.capacities.map((cap) => (
                          <span
                            key={cap}
                            className="px-2.5 py-1 rounded-lg bg-white text-[11px] font-semibold text-[#163B5C] border border-[#E8EDF2]"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Technical Specifications */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 text-xs">
                      <div className="space-y-0.5">
                        <div className="text-[10px] font-medium text-[#94A3B8]">
                          Closure Type
                        </div>
                        <div className="text-[11px] font-semibold text-[#163B5C]">
                          {jar.closure}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-[10px] font-medium text-[#94A3B8]">
                          Pilot MOQ
                        </div>
                        <div className="text-[11px] font-semibold text-[#163B5C]">
                          {jar.moq}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quote Modal Action Button */}
                  <div className="pt-2 border-t border-[#E8EDF2]">
                    <button
                      type="button"
                      onClick={() => openQuoteModal(jar.name)}
                      className="w-full py-2.5 rounded-xl bg-[#FFF8F5] hover:bg-[#ED3500] text-[#ED3500] hover:text-white font-semibold text-xs border border-orange-200 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Request Quote for {jar.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Step-by-Step OEM Process */}
      <section className="w-full py-16 sm:py-24 bg-[#FFFCFB] border-b border-[#E8EDF2]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-[#163B5C] tracking-tight">
              How our private label process works
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              From concept to dispatched retail pallets in 5 straightforward phases.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((st, idx) => (
              <div
                key={idx}
                className="p-5 bg-white rounded-3xl border border-[#E8EDF2] shadow-2xs space-y-3 relative"
              >
                <div className="inline-block text-xs font-bold text-[#ED3500] bg-[#FFF8F5] px-2.5 py-1 rounded-md border border-orange-200">
                  {st.step}
                </div>
                <h3 className="font-heading font-bold text-sm text-[#163B5C] leading-snug">
                  {st.title}
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Interactive Private Label Specification Builder */}
      <section className="w-full py-16 sm:py-20 bg-white border-b border-[#E8EDF2]">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6">
          <div className="bg-[#163B5C] text-white rounded-3xl p-6 sm:p-10 shadow-card space-y-8">
            <div className="space-y-2 text-center sm:text-left">
              <span className="px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold border border-white/15">
                Quick Estimate Builder
              </span>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white">
                Customize your private label parameters
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Configure your preferred specifications below to instantly request official bulk pricing and lead times.
              </p>
            </div>

            <form onSubmit={handleInquirySubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Product Selection */}
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Select Farm Product
                  </label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white text-[#163B5C] rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    <option value="Nendran Banana Powder (Dehydrated)">Nendran Banana Powder (Dehydrated)</option>
                    <option value="Red Banana Powder (Chevvazhai)">Red Banana Powder (Chevvazhai)</option>
                    <option value="Pure Wild Forest Honey">Pure Wild Forest Honey</option>
                    <option value="Moringai Leaf Powder & Capsules">Moringai Leaf Powder & Capsules</option>
                    <option value="Cold-Pressed Virgin Coconut Oil">Cold-Pressed Virgin Coconut Oil</option>
                    <option value="Cold-Pressed Sesame & Groundnut Oils">Cold-Pressed Sesame & Groundnut Oils</option>
                    <option value="Sweet Potato Powder">Sweet Potato Powder</option>
                    <option value="Natural Dates Powder & Coffee">Natural Dates Powder & Coffee</option>
                    <option value="Makhana Jumbo Fox Nuts">Makhana Jumbo Fox Nuts</option>
                  </select>
                </div>

                {/* Packaging Selection */}
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Packaging Format
                  </label>
                  <select
                    value={selectedContainer}
                    onChange={(e) => setSelectedContainer(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white text-[#163B5C] rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    <option value="Square Honey Series Glass Jars (50ml - 1kg)">Square Honey Series Glass Jars (50ml - 1kg)</option>
                    <option value="Hexa Jar Series Glass Jars (45ml - 750ml)">Hexa Jar Series Glass Jars (45ml - 750ml)</option>
                    <option value="AGW Octa Jar Series Glass Jars (100ml - 500ml)">AGW Octa Jar Series Glass Jars (100ml - 500ml)</option>
                    <option value="AGW ITC Jar Series Glass Jars (45ml - 750ml)">AGW ITC Jar Series Glass Jars (45ml - 750ml)</option>
                    <option value="Standup Zipper Barrier Pouch (200g/500g)">Standup Zipper Barrier Pouch (200g/500g)</option>
                    <option value="Cold-Pressed Oil Amber Bottle (500ml/1L)">Cold-Pressed Oil Amber Bottle (500ml/1L)</option>
                    <option value="HDPE Capsule Bottle (60/120 Caps)">HDPE Capsule Bottle (60/120 Caps)</option>
                    <option value="Bulk 25kg Vacuum Liner Carton">Bulk 25kg Vacuum Liner Carton</option>
                    <option value="Bulk 50kg/300kg Steel Drum">Bulk 50kg/300kg Steel Drum</option>
                  </select>
                </div>

                {/* Estimated Quantity */}
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Estimated Quantity
                  </label>
                  <select
                    value={estimatedQty}
                    onChange={(e) => setEstimatedQty(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white text-[#163B5C] rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    <option value="100">100 - 250 units (Pilot MOQ)</option>
                    <option value="500">500 - 1,000 units</option>
                    <option value="2500">2,500 - 5,000 units</option>
                    <option value="10000">10,000+ units (Enterprise)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  className="w-full sm:flex-1 py-3.5 rounded-full bg-[#ED3500] hover:bg-[#D02E00] text-white font-semibold text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Factory className="w-4 h-4" />
                  <span>Submit Specification for Quotation</span>
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Fast WhatsApp Inquire</span>
                </a>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 7. FAQs */}
      <section className="w-full py-16 sm:py-20 bg-[#FFFCFB] border-b border-[#E8EDF2]">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#163B5C] tracking-tight">
              Frequently asked questions
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Key considerations when contracting private label bottling with BeesHub Farmland.
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
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h2 className="font-heading font-bold text-xl sm:text-2xl">
              Ready to launch your food or wellness brand with verified farmgate purity?
            </h2>
            <p className="text-xs text-slate-300">
              Speak with our commercial trade desk to receive pre-production samples, COA documentation, and wholesale price schedules.
            </p>
          </div>
          <button
            onClick={() => openQuoteModal('Turnkey Private Label & Packaging')}
            className="px-8 py-3.5 rounded-full bg-[#ED3500] hover:bg-[#D02E00] text-white font-semibold text-xs sm:text-sm whitespace-nowrap shadow-md transition-colors shrink-0"
          >
            Request Commercial Quote
          </button>
        </div>
      </section>
    </main>
  );
}

export default function PrivateLabelClient() {
  return (
    <StoreProvider>
      <div className="min-h-screen bg-[#FFFCFB] text-[#163B5C] flex flex-col justify-between selection:bg-amber-200 selection:text-[#163B5C]">
        <TopUtilityBar />
        <HeaderNav />
        <PrivateLabelContent />
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
