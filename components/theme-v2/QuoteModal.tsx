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
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

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
 * Section R: Quote & Enquiry Modal
 * Prompts user first for:
 * 1. B2B / Wholesale Enquiry (Product compulsory via store dropdown)
 * 2. General Enquiry (Product optional, general message compulsory)
 * Focus trap, Esc to close, honeypot anti-spam, success screen.
 * Submits to POST /api/wholesale.
 */
export default function QuoteModal() {
  const {
    isQuoteModalOpen,
    setIsQuoteModalOpen,
    quoteModalInitialProduct,
    setQuoteModalInitialProduct,
    products,
    companyConfig,
    showToast,
  } = useStore();

  // Mode: B2B Wholesale vs General Customer Enquiry
  const [inquiryType, setInquiryType] = useState<'B2B' | 'GENERAL'>('B2B');

  // Shared Fields
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [notes, setNotes] = useState('');
  const [honeypot, setHoneypot] = useState('');

  // B2B Specific Fields
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

  // Auto-load clicked product when modal opens
  useEffect(() => {
    if (isQuoteModalOpen && quoteModalInitialProduct) {
      setInquiryType('B2B');
      const target = quoteModalInitialProduct.toLowerCase().trim();

      const isPackagingOrHamper =
        target.includes('series') ||
        target.includes('jar') ||
        target.includes('chest') ||
        target.includes('trunk') ||
        target.includes('hamper') ||
        target.includes('box');

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
            quantity: 50,
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
            quantity: 100,
            unit: isPackagingOrHamper ? 'PIECES' : 'KG',
            targetPrice: '',
            isCustom: true,
          },
        ]);
        setGeneralSelectedProductId('');
      }
    }
  }, [isQuoteModalOpen, quoteModalInitialProduct]);

  const handleCloseModal = () => {
    setIsQuoteModalOpen(false);
    setQuoteModalInitialProduct(null);
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

  // Set default initial product for B2B if not set yet
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        productId: '',
        productName: '',
        quantity: 50,
        unit: 'KG',
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
      setErrorMessage('A valid mobile number is required.');
      return;
    }

    let payload: any = {};

    if (inquiryType === 'B2B') {
      // B2B Strict Validations
      if (!companyName.trim()) {
        setErrorMessage('Company or business name is required for B2B quotations.');
        return;
      }
      if (!city.trim() || !pincode.trim()) {
        setErrorMessage('Delivery city and pincode are required.');
        return;
      }

      // Check product is compulsory for B2B
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (!it.productName.trim()) {
          setErrorMessage(`Please select a product for Item #${i + 1}. Product selection is compulsory for B2B enquiries.`);
          return;
        }
        if (!it.quantity || Number(it.quantity) <= 0) {
          setErrorMessage(`Please specify a valid quantity greater than 0 for Item #${i + 1}.`);
          return;
        }
      }

      payload = {
        inquiryType: 'B2B',
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
          inquiryType === 'B2B'
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
  const whatsappSummaryMessage = encodeURIComponent(
    inquiryType === 'B2B'
      ? `Hello BeesHub Farmland Commercial Desk,\n\nI have submitted a wholesale quotation request for ${companyName || 'our business'}.\nContact: ${contactPerson} (${phone})\nRequirement: ${items.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')}\nDelivery: ${city} - ${pincode}.\n\nPlease share official bulk pricing and batch availability.`
      : `Hello BeesHub Farmland Team,\n\nI have submitted an enquiry on your website.\nName: ${contactPerson} (${phone})\nMessage: ${notes.slice(0, 150)}...\n\nPlease assist me.`
  );
  const whatsappUrl = `https://wa.me/91${cleanStorePhone}?text=${whatsappSummaryMessage}`;

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
              Sending your {inquiryType === 'B2B' ? 'quotation request' : 'enquiry'}…
            </p>
          </div>
        )}

        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#E8EDF2] bg-[#163B5C] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center">
              {inquiryType === 'B2B' ? (
                <Briefcase className="w-5 h-5" />
              ) : (
                <MessageCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg">
                {inquiryType === 'B2B' ? 'Request Wholesale Quotation' : 'Customer & General Enquiry'}
              </h3>
              <p className="text-xs text-slate-300">
                {inquiryType === 'B2B'
                  ? 'Direct farm harvest with accredited lab certification.'
                  : 'Have questions regarding our farm, products, or orders? Let us know.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {submittedLeadId ? (
            /* Success Confirmation Screen */
            <div className="py-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center mx-auto border border-[#A7F3D0] shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h4 className="font-heading font-bold text-xl sm:text-2xl text-[#163B5C]">
                  {inquiryType === 'B2B'
                    ? 'Quotation request received'
                    : 'Enquiry received successfully'}
                </h4>
                <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-[#163B5C]">{contactPerson}</strong>. Our team has received your details
                  {inquiryType === 'B2B' && companyName ? (
                    <> for <strong className="text-[#163B5C]">{companyName}</strong></>
                  ) : null}. We will review batch availability and respond within 24 hours.
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
              {/* STEP 1: Enquiry Type Selector (B2B vs General) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#163B5C]">
                  Please select your enquiry type:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setInquiryType('B2B');
                      setErrorMessage('');
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                      inquiryType === 'B2B'
                        ? 'border-[#ED3500] bg-[#FFF8F5] ring-2 ring-[#ED3500]/20 shadow-xs'
                        : 'border-[#E8EDF2] bg-white hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        inquiryType === 'B2B'
                          ? 'bg-[#ED3500] text-white'
                          : 'bg-slate-100 text-[#163B5C]'
                      }`}
                    >
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-heading font-bold text-xs sm:text-sm text-[#163B5C]">
                        B2B / Wholesale
                      </div>
                      <div className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                        Bulk supply, drums, export & private label
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setInquiryType('GENERAL');
                      setErrorMessage('');
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                      inquiryType === 'GENERAL'
                        ? 'border-[#10B981] bg-[#ECFDF5] ring-2 ring-[#10B981]/20 shadow-xs'
                        : 'border-[#E8EDF2] bg-white hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        inquiryType === 'GENERAL'
                          ? 'bg-[#10B981] text-white'
                          : 'bg-slate-100 text-[#163B5C]'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-heading font-bold text-xs sm:text-sm text-[#163B5C]">
                        General Enquiry
                      </div>
                      <div className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                        Product queries, order help & farm info
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Pre-selected Product Pill Banner */}
              {quoteModalInitialProduct && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF8F5] border border-[#FFD5C7] text-xs">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#ED3500]" />
                    <span className="text-[#163B5C] font-medium">Selected Formulation:</span>
                    <span className="font-semibold text-[#ED3500]">
                      {items[0]?.productName || quoteModalInitialProduct}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-[#64748B] bg-white px-2 py-0.5 rounded-md border border-[#E8EDF2]">
                    Auto-loaded
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

              {/* Basic Contact Info */}
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

                {/* Company Name (Compulsory for B2B, Optional for General) */}
                <div>
                  <label className="block text-xs font-semibold text-[#163B5C] mb-1">
                    {inquiryType === 'B2B' ? 'Company / Trade Name *' : 'Company / Organization (Optional)'}
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required={inquiryType === 'B2B'}
                      placeholder={
                        inquiryType === 'B2B'
                          ? 'e.g. PureHealth Organics Ltd'
                          : 'Optional company name'
                      }
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
                    Email Address {inquiryType === 'GENERAL' ? '(Optional)' : ''}
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
                    {inquiryType === 'B2B' ? 'Delivery City *' : 'City / Location (Optional)'}
                  </label>
                  <input
                    type="text"
                    required={inquiryType === 'B2B'}
                    placeholder="e.g. Chennai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#163B5C] mb-1">
                    {inquiryType === 'B2B' ? 'Pincode *' : 'Pincode (Optional)'}
                  </label>
                  <input
                    type="text"
                    required={inquiryType === 'B2B'}
                    maxLength={6}
                    placeholder="600001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#163B5C] mb-1">
                    GSTIN {inquiryType === 'B2B' ? '(Optional)' : '(N/A)'}
                  </label>
                  <input
                    type="text"
                    disabled={inquiryType === 'GENERAL'}
                    placeholder={inquiryType === 'B2B' ? '33AAAAA0000A1Z5' : 'Not required'}
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2.5 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500] uppercase disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>
              </div>

              {/* SPECIFIC SECTIONS ACCORDING TO ENQUIRY TYPE */}
              {inquiryType === 'B2B' ? (
                /* =================== B2B MODE: PRODUCTS COMPULSORY =================== */
                <div className="space-y-4 pt-2 border-t border-[#E8EDF2]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#163B5C] flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-[#ED3500]" />
                        <span>Requested Products & Quantity *</span>
                      </span>
                      <p className="text-[11px] text-[#64748B]">
                        Select from catalog dropdown (Compulsory for B2B).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-xs font-bold text-[#ED3500] hover:text-[#D02E00] flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Product</span>
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
                                -- Select a Product from Catalog * --
                              </option>
                              {catalogList.map((p) => (
                                <option key={p._id} value={p._id}>
                                  {p.name} {p.category ? `(${p.category})` : ''}
                                </option>
                              ))}
                              <option value="CUSTOM">
                                + Other / Custom Farm Produce (Type below)
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
                              <option value="PIECES">PCS</option>
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
                              placeholder="Enter custom product name or botanical specifications *"
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
                      Supply Arrangement
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'ONE_TIME', label: 'One-Time Bulk' },
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
                      Packaging / Quality Specifications
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. 50kg steel drums, private label retail bottling, or specific COA parameters."
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
                      Interested Product (Optional - Not Compulsory)
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
                      placeholder="How can we assist you? Tell us about your query, requirement, or questions..."
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
                    inquiryType === 'B2B'
                      ? 'bg-[#ED3500] hover:bg-[#D02E00] shadow-[#ED3500]/25'
                      : 'bg-[#10B981] hover:bg-[#059669] shadow-[#10B981]/25'
                  }`}
                >
                  {inquiryType === 'B2B' ? (
                    <>
                      <Briefcase className="w-4 h-4" />
                      <span>Submit Wholesale Quotation Request</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4" />
                      <span>Submit General Enquiry</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
