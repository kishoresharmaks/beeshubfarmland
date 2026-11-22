'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Briefcase,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  MessageCircle,
  AlertCircle,
  Loader2,
  HelpCircle,
  Package,
  Tag,
  Gift,
  Check,
} from 'lucide-react';
import { useStore, EnquiryCategory } from '@/context/StoreContext';

interface FormItem {
  productId: string;
  productName: string;
  isCustom?: boolean;
  quantity: number | string;
  unit: 'KG' | 'LITRE' | 'CASES' | 'PIECES';
  targetPrice?: number | string;
}

const defaultCatalogFallback = [
  { _id: 'cat-1', name: 'Nendran Banana Powder', category: 'Powder' },
  { _id: 'cat-2', name: 'Red Banana Powder', category: 'Powder' },
  { _id: 'cat-3', name: 'Moringai Leaf Powder', category: 'Powder' },
  { _id: 'cat-4', name: 'Sweet Potato Powder', category: 'Powder' },
  { _id: 'cat-5', name: 'Dates Natural Powder', category: 'Powder' },
  { _id: 'cat-6', name: 'Beetroot & Carrot Powder', category: 'Powder' },
  { _id: 'cat-7', name: 'Pure Forest Honey', category: 'Healthy Foods' },
  { _id: 'cat-8', name: 'Cold Pressed Virgin Coconut Oil', category: 'Oil' },
  { _id: 'cat-9', name: 'Cold Pressed Sesame Oil', category: 'Oil' },
  { _id: 'cat-10', name: 'Cold Pressed Groundnuts Oil', category: 'Oil' },
  { _id: 'cat-11', name: 'Makhana (Fox Nut) Grade 6', category: 'Product' },
  { _id: 'cat-12', name: 'Moringai Powder Capsules', category: 'Product (White Label)' },
  { _id: 'cat-13', name: 'Private Label & Custom Packaging', category: 'B2B Services' },
  { _id: 'cat-14', name: 'Wedding & Event Gift Hampers', category: 'Gifting' },
];

/**
 * Section R: Unified Enquiry & Quotation Modal
 * Supports 4 distinct categories:
 * 1. PRIVATE_LABEL: Turnkey private labeling, custom bottling, jar series
 * 2. GIFT_HAMPER: Bespoke event, wedding return gifts, corporate hampers
 * 3. WHOLESALE: Direct bulk farmgate raw honey, oils, superfood powders
 * 4. GENERAL: Normal customer questions, retail support & apiary info
 */
export default function QuoteModal() {
  const {
    isQuoteModalOpen,
    setIsQuoteModalOpen,
    quoteModalInitialProduct,
    setQuoteModalInitialProduct,
    quoteModalCategory,
    setQuoteModalCategory,
    products,
    companyConfig,
    showToast,
  } = useStore();

  // Enquiry Category State: WHOLESALE | PRIVATE_LABEL | GIFT_HAMPER | GENERAL
  const [enquiryCategory, setEnquiryCategory] = useState<EnquiryCategory>('WHOLESALE');

  // Shared Fields
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [notes, setNotes] = useState('');
  const [honeypot, setHoneypot] = useState('');

  // Commercial / Organization Specific Fields
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [orderType, setOrderType] = useState<'ONE_TIME' | 'MONTHLY_RECURRING' | 'CONTRACT_FARMING'>('ONE_TIME');
  const [items, setItems] = useState<FormItem[]>([
    {
      productId: '',
      productName: '',
      quantity: 50,
      unit: 'KG',
      targetPrice: '',
    },
  ]);

  // General Enquiry Specific Field (Product is OPTIONAL)
  const [generalSelectedProductId, setGeneralSelectedProductId] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Catalog items for the dropdown
  const baseCatalog = products && products.length > 0 ? products : defaultCatalogFallback;
  const catalogList = [
    ...baseCatalog,
    ...(baseCatalog.some((p) => p.name.includes('Private Label'))
      ? []
      : [{ _id: 'cat-pl', name: 'Private Label & Custom Bottling', category: 'B2B Services' }]),
    ...(baseCatalog.some((p) => p.name.includes('Gift Hamper'))
      ? []
      : [{ _id: 'cat-gift', name: 'Wedding & Event Gift Hampers', category: 'Gifting' }]),
  ];

  // Auto-detect & pre-select appropriate category and load clicked product when modal opens
  useEffect(() => {
    if (!isQuoteModalOpen) return;

    // 1. If explicit category requested, prioritize it
    if (quoteModalCategory) {
      setEnquiryCategory(quoteModalCategory);
    } else if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('/private-label')) {
        setEnquiryCategory('PRIVATE_LABEL');
      } else if (path.includes('/gift')) {
        setEnquiryCategory('GIFT_HAMPER');
      }
    }

    // 2. If a product was clicked, load it and infer category if not explicitly set
    if (quoteModalInitialProduct) {
      const target = quoteModalInitialProduct.toLowerCase().trim();

      const isPrivateLabel =
        target.includes('series') ||
        target.includes('jar') ||
        target.includes('hexa') ||
        target.includes('octa') ||
        target.includes('square') ||
        target.includes('private label') ||
        target.includes('white label') ||
        target.includes('bottling');

      const isGiftHamper =
        target.includes('hamper') ||
        target.includes('chest') ||
        target.includes('trunk') ||
        target.includes('wedding') ||
        target.includes('gala') ||
        target.includes('favor');

      if (!quoteModalCategory) {
        if (isPrivateLabel) {
          setEnquiryCategory('PRIVATE_LABEL');
        } else if (isGiftHamper) {
          setEnquiryCategory('GIFT_HAMPER');
        }
      }

      const isPackagingOrHamper = isPrivateLabel || isGiftHamper;

      const matched = !isPackagingOrHamper
        ? catalogList.find((p) => {
            const name = p.name.toLowerCase();
            return (
              name === target ||
              name.includes(target) ||
              (target.includes('banana') && name.includes('banana')) ||
              (target.includes('moringa') && name.includes('moringa')) ||
              (target.includes('honey') && name.includes('honey')) ||
              (target.includes('coconut') && name.includes('coconut')) ||
              (target.includes('sesame') && name.includes('sesame')) ||
              (target.includes('groundnut') && name.includes('groundnut')) ||
              (target.includes('makhana') && name.includes('makhana')) ||
              (target.includes('sweet potato') && name.includes('sweet potato')) ||
              (target.includes('dates') && name.includes('dates'))
            );
          })
        : null;

      if (matched) {
        setItems([
          {
            productId: matched._id,
            productName: matched.name,
            quantity: matched.category === 'Oil' ? 50 : 100,
            unit: matched.category === 'Oil' ? 'LITRE' : 'KG',
            targetPrice: '',
            isCustom: false,
          },
        ]);
        setGeneralSelectedProductId(matched._id);
      } else {
        setItems([
          {
            productId: 'CUSTOM',
            productName: quoteModalInitialProduct,
            quantity: isPackagingOrHamper ? 100 : 50,
            unit: isPackagingOrHamper ? 'PIECES' : 'KG',
            targetPrice: '',
            isCustom: true,
          },
        ]);
        setGeneralSelectedProductId('');
      }
    }
  }, [isQuoteModalOpen, quoteModalInitialProduct, quoteModalCategory]);

  const handleCloseModal = () => {
    setIsQuoteModalOpen(false);
    setQuoteModalInitialProduct(null);
    if (setQuoteModalCategory) setQuoteModalCategory(null);
    setSubmittedLeadId(null);
    setErrorMessage('');
  };

  // Focus Trap & Esc Key Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isQuoteModalOpen) {
        handleCloseModal();
      }
    };
    if (isQuoteModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isQuoteModalOpen]);

  if (!isQuoteModalOpen) return null;

  const isGeneral = enquiryCategory === 'GENERAL';

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        productId: '',
        productName: '',
        quantity: enquiryCategory === 'WHOLESALE' ? 50 : 100,
        unit: enquiryCategory === 'WHOLESALE' ? 'KG' : 'PIECES',
        targetPrice: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleProductSelect = (index: number, selectedId: string) => {
    setItems((prev) => {
      const copy = [...prev];
      if (selectedId === 'CUSTOM') {
        copy[index] = {
          ...copy[index],
          productId: 'CUSTOM',
          productName: '',
          isCustom: true,
        };
      } else {
        const found = catalogList.find((p) => p._id === selectedId);
        copy[index] = {
          ...copy[index],
          productId: selectedId,
          productName: found ? found.name : selectedId,
          isCustom: false,
        };
      }
      return copy;
    });
  };

  const handleItemFieldChange = (index: number, field: keyof FormItem, value: any) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Shared Validations
    if (!contactPerson.trim()) {
      setErrorMessage('Your name is required.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('A valid 10-digit mobile number is required.');
      return;
    }

    let payload: any = {};

    if (!isGeneral) {
      // Commercial / Occasion Validations
      const companyLabel =
        enquiryCategory === 'GIFT_HAMPER'
          ? 'Occasion or organization name'
          : enquiryCategory === 'PRIVATE_LABEL'
          ? 'Brand or company name'
          : 'Company or business name';

      if (!companyName.trim()) {
        setErrorMessage(`${companyLabel} is required.`);
        return;
      }
      if (!city.trim() || !pincode.trim()) {
        setErrorMessage('Delivery city and 6-digit pincode are required.');
        return;
      }

      // Check product is compulsory for B2B / Private Label / Hampers
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (!it.productName.trim()) {
          setErrorMessage(`Please select or specify a product/specification for Item #${i + 1}.`);
          return;
        }
        if (!it.quantity || Number(it.quantity) <= 0) {
          setErrorMessage(`Please specify a valid quantity greater than 0 for Item #${i + 1}.`);
          return;
        }
      }

      payload = {
        inquiryType: 'B2B',
        enquiryCategory,
        companyName: companyName.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim(),
        gstin: gstin.trim().toUpperCase(),
        city: city.trim(),
        pincode: pincode.trim(),
        orderType,
        notes: notes.trim(),
        website_url: honeypot,
        items: items.map((it) => ({
          productId: it.productId || '',
          productName: it.productName.trim(),
          quantity: Number(it.quantity) || 1,
          unit: it.unit,
          targetPrice: it.targetPrice ? Number(it.targetPrice) : undefined,
        })),
      };
    } else {
      // General Enquiry Validations (Product NOT compulsory)
      if (!notes.trim()) {
        setErrorMessage('Please enter your enquiry message or question.');
        return;
      }

      let generalItem: any[] = [];
      if (generalSelectedProductId) {
        const matched = catalogList.find((p) => p._id === generalSelectedProductId);
        generalItem = [
          {
            productId: generalSelectedProductId,
            productName: matched ? matched.name : generalSelectedProductId,
            quantity: 1,
            unit: 'PIECES',
          },
        ];
      } else {
        generalItem = [
          {
            productId: '',
            productName: 'General Customer Enquiry',
            quantity: 1,
            unit: 'PIECES',
          },
        ];
      }

      payload = {
        inquiryType: 'GENERAL',
        enquiryCategory: 'GENERAL',
        companyName: companyName.trim() || contactPerson.trim() || 'Individual Customer',
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim(),
        gstin: '',
        city: city.trim() || 'General Inquiry',
        pincode: pincode.trim() || '600001',
        orderType: 'ONE_TIME',
        notes: `[General Enquiry] ${notes.trim()}`,
        website_url: honeypot,
        items: generalItem,
      };
    }

    try {
      setSubmitting(true);

      const res = await fetch('/api/wholesale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setSubmittedLeadId(data.id || 'SUBMITTED');
        showToast(
          enquiryCategory === 'PRIVATE_LABEL'
            ? 'Private label enquiry submitted!'
            : enquiryCategory === 'GIFT_HAMPER'
            ? 'Gift hamper enquiry submitted!'
            : enquiryCategory === 'WHOLESALE'
            ? 'Wholesale quotation request submitted!'
            : 'General enquiry submitted successfully!'
        );
      } else {
        setErrorMessage(data.message || 'Failed to submit enquiry. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage('Network error while submitting. Please check your internet connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const cleanStorePhone = companyConfig.phone.replace(/\D/g, '') || '9578784431';

  const categoryTitles = {
    PRIVATE_LABEL: {
      heading: 'Private Label & Custom Bottling',
      sub: 'Custom jar series (Hexa, Square, Octa), turnkey bottling, and white-label pure agro products.',
      companyPlaceholder: 'e.g. PureRoots Naturals / Your Brand Name',
      companyLabel: 'Brand or Company Name *',
      submitLabel: 'Submit Private Label Enquiry',
    },
    GIFT_HAMPER: {
      heading: 'Wedding & Event Gift Hampers',
      sub: 'Bespoke heirloom pine-wood chests and gift boxes for weddings, ceremonies, and galas.',
      companyPlaceholder: 'e.g. Arun & Divya Wedding Reception / Corporate Gala',
      companyLabel: 'Occasion or Family / Corporate Name *',
      submitLabel: 'Submit Gift Hamper Enquiry',
    },
    WHOLESALE: {
      heading: 'Request Bulk Wholesale Quotation',
      sub: 'Direct farmgate raw honey, superfood powders & cold-pressed virgin oils in commercial volumes.',
      companyPlaceholder: 'e.g. Sri Murugan Trading / PureFoods Corp',
      companyLabel: 'Company / Trade Name *',
      submitLabel: 'Submit Wholesale Quotation Request',
    },
    GENERAL: {
      heading: 'Customer & General Enquiry',
      sub: 'Have questions regarding our products, farm visits, pure honey, or orders? Let us know.',
      companyPlaceholder: 'Optional organization name',
      companyLabel: 'Organization (Optional)',
      submitLabel: 'Submit General Enquiry',
    },
  };

  const currentCopy = categoryTitles[enquiryCategory];

  const whatsappMessageTemplate = () => {
    if (enquiryCategory === 'PRIVATE_LABEL') {
      return `Hello BeesHub Farmland Team,\n\nI have submitted a Private Label & Bottling enquiry for ${companyName || 'our brand'}.\nContact: ${contactPerson} (${phone})\nRequirement: ${items.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')}\nLocation: ${city} - ${pincode}.\n\nPlease share jar catalog, MOQs, and private label bottling rates.`;
    }
    if (enquiryCategory === 'GIFT_HAMPER') {
      return `Hello BeesHub Farmland Gifting Desk,\n\nI have submitted an event gift hamper enquiry for ${companyName || 'our upcoming event'}.\nContact: ${contactPerson} (${phone})\nSelected Hampers: ${items.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')}\nDelivery: ${city} - ${pincode}.\n\nPlease share hamper customization options and bulk wedding pricing.`;
    }
    if (enquiryCategory === 'WHOLESALE') {
      return `Hello BeesHub Farmland Commercial Desk,\n\nI have submitted a wholesale quotation request for ${companyName || 'our business'}.\nContact: ${contactPerson} (${phone})\nRequirement: ${items.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')}\nDelivery: ${city} - ${pincode}.\n\nPlease share official bulk pricing and batch availability.`;
    }
    return `Hello BeesHub Farmland Team,\n\nI have submitted an enquiry on your website.\nName: ${contactPerson} (${phone})\nMessage: ${notes.slice(0, 150)}...\n\nPlease assist me.`;
  };

  const whatsappUrl = `https://wa.me/91${cleanStorePhone}?text=${encodeURIComponent(whatsappMessageTemplate())}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E8EDF2] max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Loading Overlay */}
        {submitting && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-xs z-50 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#ED3500] animate-spin" />
            <p className="font-heading font-semibold text-sm text-[#163B5C]">
              Sending your {enquiryCategory.toLowerCase().replace('_', ' ')} enquiry…
            </p>
          </div>
        )}

        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#E8EDF2] bg-[#163B5C] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center shrink-0">
              {enquiryCategory === 'PRIVATE_LABEL' ? (
                <Tag className="w-5 h-5 text-indigo-300" />
              ) : enquiryCategory === 'GIFT_HAMPER' ? (
                <Gift className="w-5 h-5 text-rose-300" />
              ) : enquiryCategory === 'GENERAL' ? (
                <MessageCircle className="w-5 h-5 text-emerald-300" />
              ) : (
                <Briefcase className="w-5 h-5 text-amber-300" />
              )}
            </div>
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg">
                {currentCopy.heading}
              </h3>
              <p className="text-xs text-slate-300 leading-snug">
                {currentCopy.sub}
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 ml-2"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {submittedLeadId ? (
            /* Success Confirmation Screen */
            <div className="py-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center mx-auto border border-[#A7F3D0] shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h4 className="font-heading font-bold text-xl sm:text-2xl text-[#163B5C]">
                  {enquiryCategory === 'PRIVATE_LABEL'
                    ? 'Private Label Enquiry Received'
                    : enquiryCategory === 'GIFT_HAMPER'
                    ? 'Gift Hamper Enquiry Received'
                    : enquiryCategory === 'WHOLESALE'
                    ? 'Quotation Request Received'
                    : 'Enquiry Received Successfully'}
                </h4>
                <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-[#163B5C]">{contactPerson}</strong>. Our commercial desk has received your request
                  {companyName ? (
                    <> for <strong className="text-[#163B5C]">{companyName}</strong></>
                  ) : null}. We will review product availability and respond within 24 hours.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFFCFB] border border-[#E8EDF2] max-w-md mx-auto text-left space-y-1.5 text-xs">
                <div className="text-[10px] font-semibold uppercase text-[#64748B]">Reference ID</div>
                <div className="font-mono font-bold text-[#163B5C] text-sm break-all">
                  {submittedLeadId}
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Connect on WhatsApp</span>
                </a>
                <button
                  onClick={handleCloseModal}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#163B5C] hover:bg-[#0E273E] text-white font-semibold text-xs transition-colors"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            /* Submission Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* CATEGORY SELECTOR TABS */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#163B5C]">
                  Select Enquiry Category:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    {
                      id: 'WHOLESALE' as EnquiryCategory,
                      label: 'Bulk Wholesale',
                      icon: Package,
                      desc: 'Raw drums & lots',
                      activeColor: 'border-amber-500 bg-amber-50/50 text-[#163B5C]',
                    },
                    {
                      id: 'PRIVATE_LABEL' as EnquiryCategory,
                      label: 'Private Label',
                      icon: Tag,
                      desc: 'Bottling & jars',
                      activeColor: 'border-indigo-500 bg-indigo-50/50 text-[#163B5C]',
                    },
                    {
                      id: 'GIFT_HAMPER' as EnquiryCategory,
                      label: 'Gift Hampers',
                      icon: Gift,
                      desc: 'Weddings & galas',
                      activeColor: 'border-rose-500 bg-rose-50/50 text-[#163B5C]',
                    },
                    {
                      id: 'GENERAL' as EnquiryCategory,
                      label: 'General / Support',
                      icon: MessageCircle,
                      desc: 'Normal inquiry',
                      activeColor: 'border-emerald-500 bg-emerald-50/50 text-[#163B5C]',
                    },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = enquiryCategory === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setEnquiryCategory(tab.id);
                          setErrorMessage('');
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          isActive
                            ? `${tab.activeColor} ring-2 ring-current/20 shadow-xs`
                            : 'border-[#E8EDF2] bg-white hover:border-slate-300 text-[#64748B]'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-[#ED3500]' : 'text-slate-400'}`} />
                          {isActive && <Check className="w-3.5 h-3.5 text-[#ED3500]" />}
                        </div>
                        <div>
                          <div className={`font-heading font-bold text-xs ${isActive ? 'text-[#163B5C]' : 'text-[#64748B]'}`}>
                            {tab.label}
                          </div>
                          <div className="text-[10px] text-slate-400 leading-tight">
                            {tab.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pre-selected Product Pill Banner */}
              {quoteModalInitialProduct && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF8F5] border border-[#FFD5C7] text-xs">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#ED3500]" />
                    <span className="text-[#163B5C] font-medium">Selected Item:</span>
                    <span className="font-semibold text-[#ED3500]">
                      {items[0]?.productName || quoteModalInitialProduct}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-[#64748B] bg-white px-2 py-0.5 rounded-md border border-[#E8EDF2]">
                    Pre-loaded
                  </span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Bot Honeypot (Hidden) */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="website_url"
                  tabIndex={-1}
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  autoComplete="off"
                />
              </div>

              {/* Contact Person & Company / Occasion */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Contact Person Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#163B5C] mb-1">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Patel"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                    />
                  </div>
                </div>

                {/* Company / Brand / Occasion Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#163B5C] mb-1">
                    {currentCopy.companyLabel}
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required={!isGeneral}
                      placeholder={currentCopy.companyPlaceholder}
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                    />
                  </div>
                </div>
              </div>

              {/* Phone & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#163B5C] mb-1">
                    Mobile Number (10 Digits) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#163B5C] mb-1">
                    Email Address {isGeneral ? '(Optional)' : ''}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      placeholder="e.g. contact@business.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                    />
                  </div>
                </div>
              </div>

              {/* Location Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#163B5C] mb-1">
                    {!isGeneral ? 'Delivery City *' : 'City / Location (Optional)'}
                  </label>
                  <input
                    type="text"
                    required={!isGeneral}
                    placeholder="e.g. Chennai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#163B5C] mb-1">
                    {!isGeneral ? 'Pincode *' : 'Pincode (Optional)'}
                  </label>
                  <input
                    type="text"
                    required={!isGeneral}
                    maxLength={6}
                    placeholder="600001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#163B5C] mb-1">
                    GSTIN {!isGeneral ? '(Optional)' : '(N/A)'}
                  </label>
                  <input
                    type="text"
                    disabled={isGeneral}
                    placeholder={!isGeneral ? '33AAAAA0000A1Z5' : 'Not required'}
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2.5 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500] uppercase disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>
              </div>

              {/* =================== COMMERCIAL / PRIVATE LABEL / HAMPER REQUIREMENTS =================== */}
              {!isGeneral ? (
                <div className="space-y-4 pt-2 border-t border-[#E8EDF2]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#163B5C] flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-[#ED3500]" />
                        <span>
                          {enquiryCategory === 'PRIVATE_LABEL'
                            ? 'Requested Formulations or Jar Packaging Series *'
                            : enquiryCategory === 'GIFT_HAMPER'
                            ? 'Requested Hamper Curations or Box Styles *'
                            : 'Requested Products & Quantity *'}
                        </span>
                      </span>
                      <p className="text-[11px] text-[#64748B]">
                        Select from catalog or enter custom harvest/packaging specification.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-xs font-bold text-[#ED3500] hover:text-[#D02E00] flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Item</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-[#FFFCFB] rounded-2xl border border-[#E8EDF2] space-y-2.5"
                      >
                        <div className="grid grid-cols-12 gap-2 items-center">
                          {/* Products Dropdown Selector */}
                          <div className="col-span-12 sm:col-span-6">
                            <select
                              required
                              value={item.isCustom ? 'CUSTOM' : item.productId}
                              onChange={(e) => handleProductSelect(idx, e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-[#E8EDF2] rounded-lg text-xs font-semibold text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                            >
                              <option value="" disabled>
                                -- Select from Catalog or Packaging * --
                              </option>
                              {catalogList.map((p) => (
                                <option key={p._id} value={p._id}>
                                  {p.name} {p.category ? `(${p.category})` : ''}
                                </option>
                              ))}
                              <option value="CUSTOM">
                                + Custom Variety / Jar Specification (Type below)
                              </option>
                            </select>
                          </div>

                          {/* Quantity & Unit */}
                          <div className="col-span-7 sm:col-span-3 flex items-center gap-1.5">
                            <input
                              type="number"
                              required
                              min={1}
                              placeholder="Qty"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemFieldChange(idx, 'quantity', e.target.value)
                              }
                              className="w-full px-2.5 py-2 bg-white border border-[#E8EDF2] rounded-lg text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                            />
                            <select
                              value={item.unit}
                              onChange={(e) =>
                                handleItemFieldChange(idx, 'unit', e.target.value)
                              }
                              className="px-2 py-2 bg-white border border-[#E8EDF2] rounded-lg text-xs font-bold text-[#163B5C] focus:outline-none"
                            >
                              <option value="KG">KG</option>
                              <option value="LITRE">LTR</option>
                              <option value="CASES">CASES</option>
                              <option value="PIECES">PIECES</option>
                            </select>
                          </div>

                          {/* Target Price */}
                          <div className="col-span-4 sm:col-span-2">
                            <input
                              type="number"
                              placeholder="Target ₹"
                              value={item.targetPrice}
                              onChange={(e) =>
                                handleItemFieldChange(idx, 'targetPrice', e.target.value)
                              }
                              className="w-full px-2 py-2 bg-white border border-[#E8EDF2] rounded-lg text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                            />
                          </div>

                          {/* Remove button */}
                          <div className="col-span-1 flex justify-center">
                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Custom product name field if user selected CUSTOM */}
                        {item.isCustom && (
                          <div>
                            <input
                              type="text"
                              required
                              placeholder={
                                enquiryCategory === 'PRIVATE_LABEL'
                                  ? 'e.g. Hexa Jar Series 250ml with custom gold lid & front branding'
                                  : enquiryCategory === 'GIFT_HAMPER'
                                  ? 'e.g. Handcrafted Pine-Wood Chest with laser engraved wedding monogram'
                                  : 'Enter custom product name or botanical specifications *'
                              }
                              value={item.productName}
                              onChange={(e) =>
                                handleItemFieldChange(idx, 'productName', e.target.value)
                              }
                              className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Supply Cycle Type */}
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs font-semibold text-[#163B5C]">
                      Order Type / Engagement Model
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'ONE_TIME', label: 'One-Time Order' },
                        { id: 'MONTHLY_RECURRING', label: 'Monthly Recurring' },
                        { id: 'CONTRACT_FARMING', label: 'Contract Farming' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setOrderType(t.id as any)}
                          className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                            orderType === t.id
                              ? 'bg-[#163B5C] text-white border-[#163B5C] shadow-xs'
                              : 'bg-[#FFFCFB] text-[#64748B] border-[#E8EDF2] hover:border-slate-300'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-[#163B5C] mb-1">
                      {enquiryCategory === 'PRIVATE_LABEL'
                        ? 'Packaging, Labeling & Delivery Specifications'
                        : enquiryCategory === 'GIFT_HAMPER'
                        ? 'Event Date, Delivery Venue & Engraving Requirements'
                        : 'Bulk Packaging / Quality Specifications'}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={
                        enquiryCategory === 'PRIVATE_LABEL'
                          ? 'e.g. Need 500 jars with customer-supplied label artwork, batch expiry printing, and safe tamper-evident shrink sleeve.'
                          : enquiryCategory === 'GIFT_HAMPER'
                          ? 'e.g. Event on Nov 15th at Chennai. Require custom brass latch pine-wood boxes with couple initials laser engraved.'
                          : 'e.g. 50kg food-grade steel drums, COA pesticide residue lab report required, dispatched via V-Trans.'
                      }
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                    />
                  </div>
                </div>
              ) : (
                /* =================== GENERAL MODE: PRODUCT OPTIONAL =================== */
                <div className="space-y-4 pt-2 border-t border-[#E8EDF2]">
                  {/* Optional Product Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-[#163B5C] mb-1">
                      Interested Product (Optional)
                    </label>
                    <select
                      value={generalSelectedProductId}
                      onChange={(e) => setGeneralSelectedProductId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#10B981]"
                    >
                      <option value="">
                        -- None / General Inquiry or Question --
                      </option>
                      {catalogList.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} {p.category ? `(${p.category})` : ''}
                        </option>
                      ))}
                    </select>
                    <span className="text-[11px] text-[#64748B] block mt-1">
                      Select a product if your query is about an item in our catalog, or leave blank.
                    </span>
                  </div>

                  {/* Compulsory Message Field for General Enquiry */}
                  <div>
                    <label className="block text-xs font-semibold text-[#163B5C] mb-1">
                      Your Enquiry / Message *
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="How can we assist you? Tell us about your query, requirement, retail availability, or questions..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-3.5 rounded-full text-white font-semibold text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-2 ${
                    enquiryCategory === 'PRIVATE_LABEL'
                      ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25'
                      : enquiryCategory === 'GIFT_HAMPER'
                      ? 'bg-[#ED3500] hover:bg-[#D02E00] shadow-[#ED3500]/25'
                      : enquiryCategory === 'WHOLESALE'
                      ? 'bg-[#163B5C] hover:bg-[#0E273E] shadow-[#163B5C]/25'
                      : 'bg-[#10B981] hover:bg-[#059669] shadow-[#10B981]/25'
                  }`}
                >
                  {enquiryCategory === 'PRIVATE_LABEL' ? (
                    <Tag className="w-4 h-4" />
                  ) : enquiryCategory === 'GIFT_HAMPER' ? (
                    <Gift className="w-4 h-4" />
                  ) : enquiryCategory === 'WHOLESALE' ? (
                    <Briefcase className="w-4 h-4" />
                  ) : (
                    <MessageCircle className="w-4 h-4" />
                  )}
                  <span>{currentCopy.submitLabel}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
