'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Briefcase,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  AlertCircle,
  Loader2,
  PackageCheck,
  ArrowRight,
} from 'lucide-react';

export interface WholesaleProductOption {
  _id: string;
  name: string;
  category?: string;
  price?: number;
}

export interface WholesaleEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: WholesaleProductOption[];
  storePhone?: string;
}

interface FormItem {
  productId: string;
  productName: string;
  quantity: number | string;
  unit: 'KG' | 'LITRE' | 'CASES' | 'PIECES';
  targetPrice?: number | string;
}

export default function WholesaleEnquiryModal({
  isOpen,
  onClose,
  products,
  storePhone = '919876543210',
}: WholesaleEnquiryModalProps) {
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [orderType, setOrderType] = useState<'ONE_TIME' | 'MONTHLY_RECURRING' | 'CONTRACT_FARMING'>('ONE_TIME');
  const [notes, setNotes] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState(''); // Honeypot

  const [items, setItems] = useState<FormItem[]>([
    {
      productId: products[0]?._id || '',
      productName: products[0]?.name || 'Pure Forest Raw Honey',
      quantity: 50,
      unit: 'KG',
      targetPrice: '',
    },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);

  // Sync initial product dropdown if products load after open
  useEffect(() => {
    if (products.length > 0 && items.length === 1 && !items[0].productId) {
      setItems([
        {
          productId: products[0]._id,
          productName: products[0].name,
          quantity: 50,
          unit: 'KG',
          targetPrice: '',
        },
      ]);
    }
  }, [products]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    const defaultProduct = products[0]?.name || 'Pure Honey / Spices';
    setItems((prev) => [
      ...prev,
      {
        productId: products[0]?._id || '',
        productName: defaultProduct,
        quantity: 25,
        unit: 'KG',
        targetPrice: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof FormItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      if (field === 'productId') {
        const selected = products.find((p) => p._id === value);
        updated[index].productId = value;
        if (selected) {
          updated[index].productName = selected.name;
        }
      } else {
        (updated[index] as any)[field] = value;
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!companyName.trim()) {
      setErrorMessage('Please enter your company or business name');
      return;
    }
    if (!contactPerson.trim()) {
      setErrorMessage('Please enter the contact person name');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!city.trim() || !pincode.trim()) {
      setErrorMessage('Please enter city and delivery pincode');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        companyName: companyName.trim(),
        contactPerson: contactPerson.trim(),
        phone: cleanPhone,
        email: email.trim(),
        gstin: gstin.trim().toUpperCase(),
        city: city.trim(),
        pincode: pincode.trim(),
        orderType,
        notes: notes.trim(),
        website_url: websiteUrl, // Honeypot
        items: items.map((it) => ({
          productId: it.productId,
          productName: it.productName,
          quantity: Number(it.quantity) || 1,
          unit: it.unit,
          targetPrice: it.targetPrice ? Number(it.targetPrice) : undefined,
        })),
      };

      const res = await fetch('/api/wholesale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setSubmittedLeadId(data.id || 'SUBMITTED');
        try {
          if (typeof window !== 'undefined' && (window as any).posthog) {
            (window as any).posthog.capture('wholesale_lead_submitted', {
              product_count: items.length,
              order_type: orderType,
              city: city.trim(),
              has_gstin: Boolean(gstin.trim()),
            });
          }
        } catch (err) {}
      } else {
        setErrorMessage(data.message || 'Failed to submit quotation request. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage('Network error while submitting enquiry. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const cleanStorePhone = storePhone.replace(/\D/g, '') || '919876543210';
  const whatsappSummaryMessage = encodeURIComponent(
    `Hello BeesHub Farmland Trade Desk,\n\nI have submitted a wholesale quotation request for ${companyName || 'our business'}.\nContact: ${contactPerson} (${phone})\nRequirement: ${items.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')}\nDelivery: ${city} - ${pincode}.\n\nPlease share official bulk pricing and batch availability.`
  );
  const whatsappUrl = `https://wa.me/${cleanStorePhone}?text=${whatsappSummaryMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E8EDF2] max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E8EDF2] bg-gradient-to-r from-[#163B5C] to-[#0E273E] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg">B2B Wholesale & Bulk Supply</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-[#163B5C] text-[10px] font-black uppercase tracking-wider">
                  Commercial Desk
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Direct farm harvest • Lab certified batches • Pan-India logistics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {submittedLeadId ? (
            /* Success State */
            <div className="py-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-black text-[#163B5C]">Quotation Request Received!</h4>
                <p className="text-sm text-[#64748B] max-w-md mx-auto">
                  Thank you, <strong>{contactPerson}</strong>. Our commercial trade manager will review your
                  requirement for <strong>{companyName}</strong> and share official pricing within 24 hours.
                </p>
                {submittedLeadId !== 'SUBMITTED' && (
                  <span className="inline-block px-3 py-1 bg-[#FFFCFB] border border-[#E8EDF2] rounded-full text-xs font-mono text-[#64748B]">
                    Reference ID: #{submittedLeadId.slice(-8).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Instant WhatsApp Follow-up */}
              <div className="pt-4 max-w-md mx-auto space-y-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    try {
                      if (typeof window !== 'undefined' && (window as any).posthog) {
                        (window as any).posthog.capture('wholesale_whatsapp_click');
                      }
                    } catch (e) {}
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Connect Instantly on WhatsApp</span>
                </a>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-[#64748B] hover:text-[#163B5C] transition-colors"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            /* Active Inquiry Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Honeypot field (hidden from legitimate users) */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="website_url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Section 1: Business & Contact Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#163B5C] uppercase tracking-wider">
                  <Building2 className="w-4 h-4 text-[#ED3500]" />
                  <span>Business & Contact Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#163B5C] mb-1">
                      Business / Company Name <span className="text-[#ED3500]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Royal Greens Supermarket"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl focus:outline-none focus:border-[#ED3500] text-[#163B5C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#163B5C] mb-1">
                      Contact Person Name <span className="text-[#ED3500]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl focus:outline-none focus:border-[#ED3500] text-[#163B5C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#163B5C] mb-1">
                      Mobile / WhatsApp Number <span className="text-[#ED3500]">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#64748B] font-bold">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={12}
                        placeholder="98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-12 pr-3.5 py-2.5 text-xs bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl focus:outline-none focus:border-[#ED3500] text-[#163B5C]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#163B5C] mb-1">
                      Official Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="procurement@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl focus:outline-none focus:border-[#ED3500] text-[#163B5C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#163B5C] mb-1">
                      GSTIN Number <span className="text-slate-400 font-normal">(For Input Tax Credit)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 33AAAAA0000A1Z5"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 text-xs bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl focus:outline-none focus:border-[#ED3500] text-[#163B5C] uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-[#163B5C] mb-1">
                        City <span className="text-[#ED3500]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Chennai"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl focus:outline-none focus:border-[#ED3500] text-[#163B5C]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#163B5C] mb-1">
                        Pincode <span className="text-[#ED3500]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="600001"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3.5 py-2.5 text-xs bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl focus:outline-none focus:border-[#ED3500] text-[#163B5C]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Products & Quantity Required */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#163B5C] uppercase tracking-wider">
                    <PackageCheck className="w-4 h-4 text-[#ED3500]" />
                    <span>Products & Procurement Quantities</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs font-bold text-[#ED3500] hover:text-[#D02E00] flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#FFFCFB] border border-[#E8EDF2] rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 text-xs"
                    >
                      {/* Product Selector */}
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-[#64748B] mb-0.5">
                          Product {items.length > 1 ? `#${idx + 1}` : ''}
                        </label>
                        {products.length > 0 ? (
                          <select
                            value={item.productId}
                            onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                          >
                            {products.map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={item.productName}
                            onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                            placeholder="Product name"
                            className="w-full px-3 py-2 bg-white border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C]"
                          />
                        )}
                      </div>

                      {/* Quantity & Unit */}
                      <div className="w-full sm:w-44 flex items-center gap-1.5">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-[#64748B] mb-0.5">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                          />
                        </div>
                        <div className="w-20">
                          <label className="block text-[10px] font-bold text-[#64748B] mb-0.5">Unit</label>
                          <select
                            value={item.unit}
                            onChange={(e) => handleItemChange(idx, 'unit', e.target.value as any)}
                            className="w-full px-2 py-2 bg-white border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                          >
                            <option value="KG">KG</option>
                            <option value="LITRE">Litres</option>
                            <option value="CASES">Cases</option>
                            <option value="PIECES">Packs</option>
                          </select>
                        </div>
                      </div>

                      {/* Target Price */}
                      <div className="w-full sm:w-32">
                        <label className="block text-[10px] font-bold text-[#64748B] mb-0.5">
                          Target Rate <span className="font-normal">(₹/unit)</span>
                        </label>
                        <input
                          type="number"
                          placeholder="Optional"
                          value={item.targetPrice || ''}
                          onChange={(e) => handleItemChange(idx, 'targetPrice', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                        />
                      </div>

                      {/* Delete button if multiple */}
                      {items.length > 1 && (
                        <div className="flex items-end justify-end sm:pb-0.5">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                            title="Remove line item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Supply Terms & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-[#163B5C] mb-1">Procurement Frequency</label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl focus:outline-none focus:border-[#ED3500] text-[#163B5C]"
                  >
                    <option value="ONE_TIME">One-Time Bulk Order</option>
                    <option value="MONTHLY_RECURRING">Monthly Recurring Contract</option>
                    <option value="CONTRACT_FARMING">Custom / Contract Farming</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#163B5C] mb-1">
                    Special Packaging / Notes <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Need in 25kg food-grade carboys / private labeling inquiry"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl focus:outline-none focus:border-[#ED3500] text-[#163B5C]"
                  />
                </div>
              </div>

              {/* Statutory Guarantee Banner */}
              <div className="p-3.5 rounded-2xl bg-[#FFF8F5] border border-[#ED3500]/20 flex items-center justify-between text-xs text-[#163B5C]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#ED3500] shrink-0" />
                  <span className="font-semibold text-[11px] sm:text-xs">
                    Official FSSAI & GST commercial billing. Direct dispatch from Kanyakumari.
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#ED3500] uppercase hidden sm:inline-block">
                  Guaranteed Pure
                </span>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-[#E8EDF2] text-xs font-bold text-[#64748B] hover:text-[#163B5C] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-[#ED3500] hover:bg-[#D02E00] disabled:bg-gray-400 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#ED3500]/25 transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Quotation...</span>
                    </>
                  ) : (
                    <>
                      <span>Request Official Wholesale Quote</span>
                      <ArrowRight className="w-4 h-4" />
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
