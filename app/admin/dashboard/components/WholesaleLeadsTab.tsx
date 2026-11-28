'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  RefreshCw,
  Phone,
  MessageCircle,
  Building2,
  Calendar,
  MapPin,
  FileText,
  DollarSign,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit3,
  X,
  AlertCircle,
  ExternalLink,
  Eye,
  Tag,
  Gift,
  Package,
  User,
  Mail,
  Send,
  Check,
} from 'lucide-react';

export type EnquiryCategory = 'WHOLESALE' | 'PRIVATE_LABEL' | 'GIFT_HAMPER' | 'GENERAL';

interface WholesaleItem {
  productId?: string;
  productName: string;
  variantName?: string;
  quantity: number;
  unit: string;
  targetPrice?: number;
}

interface WholesaleLead {
  _id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  gstin?: string;
  city: string;
  pincode: string;
  enquiryCategory: EnquiryCategory;
  items: WholesaleItem[];
  orderType: string;
  notes?: string;
  status: 'NEW' | 'CONTACTED' | 'QUOTED' | 'CONVERTED' | 'REJECTED';
  adminNotes?: string;
  quotedAmount?: number;
  ipAddress?: string;
  createdAt: string;
  updatedAt?: string;
}

interface CategoryCounts {
  ALL: number;
  PRIVATE_LABEL: number;
  GIFT_HAMPER: number;
  WHOLESALE: number;
  GENERAL: number;
}

interface WholesaleLeadsTabProps {
  onLeadsUpdated?: () => void;
}

export default function WholesaleLeadsTab({ onLeadsUpdated }: WholesaleLeadsTabProps) {
  const [leads, setLeads] = useState<WholesaleLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | EnquiryCategory>('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);

  const [categoryCounts, setCategoryCounts] = useState<CategoryCounts>({
    ALL: 0,
    PRIVATE_LABEL: 0,
    GIFT_HAMPER: 0,
    WHOLESALE: 0,
    GENERAL: 0,
  });

  // Modal 1: Complete Details Popup Modal (The requested full detail view)
  const [inspectingLead, setInspectingLead] = useState<WholesaleLead | null>(null);
  const [detailNotes, setDetailNotes] = useState('');
  const [detailQuotedAmount, setDetailQuotedAmount] = useState<string | number>('');
  const [detailStatus, setDetailStatus] = useState<string>('NEW');
  const [detailCategory, setDetailCategory] = useState<EnquiryCategory>('WHOLESALE');
  const [savingDetails, setSavingDetails] = useState(false);

  // Modal 2: Quick Edit Quote & Notes
  const [editingLead, setEditingLead] = useState<WholesaleLead | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editQuotedAmount, setEditQuotedAmount] = useState<string | number>('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== 'ALL') params.set('category', categoryFilter);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      params.set('page', page.toString());
      params.set('limit', '15');

      const res = await fetch(`/api/admin/wholesale?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLeads(data.data);
        setTotalPages(data.totalPages || 1);
        setTotalLeads(data.total || 0);
        if (data.categoryCounts) {
          setCategoryCounts(data.categoryCounts);
        }
        if (onLeadsUpdated) onLeadsUpdated();
      }
    } catch (err) {
      console.error('Failed to load enquiries and wholesale leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [categoryFilter, statusFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/wholesale/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setLeads((prev) =>
          prev.map((lead) => (lead._id === id ? { ...lead, status: newStatus as any } : lead))
        );
        if (inspectingLead && inspectingLead._id === id) {
          setInspectingLead((prev) => (prev ? { ...prev, status: newStatus as any } : null));
          setDetailStatus(newStatus);
        }
        if (onLeadsUpdated) onLeadsUpdated();
      }
    } catch (err) {
      console.error('Failed to update lead status:', err);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to permanently remove this enquiry?')) return;
    try {
      const res = await fetch(`/api/admin/wholesale/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setLeads((prev) => prev.filter((lead) => lead._id !== id));
        if (inspectingLead && inspectingLead._id === id) {
          setInspectingLead(null);
        }
        if (onLeadsUpdated) onLeadsUpdated();
      }
    } catch (err) {
      console.error('Failed to delete lead:', err);
    }
  };

  // Open Full Detail Popup
  const handleOpenDetails = (lead: WholesaleLead) => {
    setInspectingLead(lead);
    setDetailNotes(lead.adminNotes || '');
    setDetailQuotedAmount(lead.quotedAmount || '');
    setDetailStatus(lead.status || 'NEW');
    setDetailCategory(lead.enquiryCategory || 'WHOLESALE');
  };

  // Save changes from Full Detail Popup
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingLead) return;
    setSavingDetails(true);
    try {
      const res = await fetch(`/api/admin/wholesale/${inspectingLead._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: detailStatus,
          adminNotes: detailNotes.trim(),
          quotedAmount: detailQuotedAmount ? Number(detailQuotedAmount) : 0,
          enquiryCategory: detailCategory,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = data.data;
        setLeads((prev) =>
          prev.map((l) => (l._id === inspectingLead._id ? { ...l, ...updated } : l))
        );
        setInspectingLead({ ...inspectingLead, ...updated });
        fetchLeads(); // refresh counts
      }
    } catch (err) {
      console.error('Failed to update enquiry details:', err);
    } finally {
      setSavingDetails(false);
    }
  };

  // Quick Edit
  const handleOpenEdit = (lead: WholesaleLead) => {
    setEditingLead(lead);
    setEditNotes(lead.adminNotes || '');
    setEditQuotedAmount(lead.quotedAmount || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/wholesale/${editingLead._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminNotes: editNotes.trim(),
          quotedAmount: editQuotedAmount ? Number(editQuotedAmount) : 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLeads((prev) =>
          prev.map((l) =>
            l._id === editingLead._id
              ? {
                  ...l,
                  adminNotes: editNotes.trim(),
                  quotedAmount: editQuotedAmount ? Number(editQuotedAmount) : 0,
                }
              : l
          )
        );
        setEditingLead(null);
      }
    } catch (err) {
      console.error('Failed to save lead updates:', err);
    } finally {
      setSavingEdit(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-amber-500/10 text-amber-700 border-amber-300 font-bold';
      case 'CONTACTED':
        return 'bg-blue-500/10 text-blue-700 border-blue-300';
      case 'QUOTED':
        return 'bg-purple-500/10 text-purple-700 border-purple-300';
      case 'CONVERTED':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-300 font-bold';
      case 'REJECTED':
        return 'bg-rose-500/10 text-rose-700 border-rose-300';
      default:
        return 'bg-slate-500/10 text-slate-700 border-slate-300';
    }
  };

  const getCategoryBadge = (category: EnquiryCategory) => {
    switch (category) {
      case 'PRIVATE_LABEL':
        return {
          label: 'Private Label',
          icon: Tag,
          className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
      case 'GIFT_HAMPER':
        return {
          label: 'Gift Hamper',
          icon: Gift,
          className: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      case 'GENERAL':
        return {
          label: 'General Enquiry',
          icon: MessageCircle,
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'WHOLESALE':
      default:
        return {
          label: 'Bulk Wholesale',
          icon: Package,
          className: 'bg-amber-50 text-amber-700 border-amber-200',
        };
    }
  };

  const buildWhatsAppLink = (lead: WholesaleLead) => {
    const cleanPhone = lead.phone.replace(/\D/g, '');
    let text = '';
    if (lead.enquiryCategory === 'PRIVATE_LABEL') {
      text = `Hello ${lead.contactPerson},\n\nThis is BeesHub Farmland Commercial Desk regarding your Private Label inquiry for ${lead.companyName}.\nWe reviewed your packaging requirements for ${lead.items.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')}.\n\nCould we connect on your custom jar and bottling specifications?`;
    } else if (lead.enquiryCategory === 'GIFT_HAMPER') {
      text = `Hello ${lead.contactPerson},\n\nThis is BeesHub Farmland Gifting Desk regarding your event gift hamper inquiry for ${lead.companyName}.\nWe received your request for ${lead.items.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')}.\n\nCould we discuss the event schedule and personalized chest engraving?`;
    } else if (lead.enquiryCategory === 'GENERAL') {
      const itemsText = lead.items
        .map((i) => `${i.productName}${i.variantName ? ` (${i.variantName})` : ''} × ${i.quantity}`)
        .join(', ');
      text = `Hello ${lead.contactPerson},\n\nThank you for reaching out to BeesHub Farmland. We received your enquiry for ${itemsText || 'our products'}${lead.notes ? ` ("${lead.notes}")` : ''}.\n\nHow can we best assist you today?`;
    } else {
      text = `Hello ${lead.contactPerson},\n\nThis is BeesHub Farmland Trade Desk regarding your bulk wholesale inquiry for ${lead.companyName}.\nWe have reviewed your request for ${lead.items.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')}.\n\nCould we discuss batch COA details, delivery timeline, and commercial pricing?`;
    }
    return `https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#E8EDF2] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#163B5C]">Enquiries & Leads Management</h2>
              <p className="text-xs text-[#64748B]">
                Track, inspect, and quote Wholesale, Private Label, Gift Hampers, and General customer enquiries
              </p>
            </div>
          </div>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search company, buyer, phone, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
            />
          </form>
          <button
            onClick={() => {
              setPage(1);
              fetchLeads();
            }}
            className="p-2.5 rounded-xl border border-[#E8EDF2] text-[#163B5C] hover:bg-[#FFFCFB] transition-colors"
            title="Refresh Leads"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* TOP: Category Tabs (Primary Filter) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {[
          { id: 'ALL', label: 'All Enquiries', count: categoryCounts.ALL, icon: Briefcase },
          { id: 'PRIVATE_LABEL', label: 'Private Label', count: categoryCounts.PRIVATE_LABEL, icon: Tag },
          { id: 'GIFT_HAMPER', label: 'Gift Hampers', count: categoryCounts.GIFT_HAMPER, icon: Gift },
          { id: 'WHOLESALE', label: 'Bulk Wholesale', count: categoryCounts.WHOLESALE, icon: Package },
          { id: 'GENERAL', label: 'General Enquiry', count: categoryCounts.GENERAL, icon: MessageCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = categoryFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setCategoryFilter(tab.id as any);
                setPage(1);
              }}
              className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                isActive
                  ? 'bg-[#163B5C] text-white border-[#163B5C] shadow-md shadow-[#163B5C]/15 ring-2 ring-[#163B5C]/20'
                  : 'bg-white border-[#E8EDF2] text-[#64748B] hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                <span className="font-heading font-bold text-xs truncate">{tab.label}</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#163B5C]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary Status Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mr-1">
          Status:
        </span>
        {['ALL', 'NEW', 'CONTACTED', 'QUOTED', 'CONVERTED', 'REJECTED'].map((st) => (
          <button
            key={st}
            onClick={() => {
              setStatusFilter(st);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
              statusFilter === st
                ? 'bg-[#ED3500] text-white shadow-xs'
                : 'bg-white border border-[#E8EDF2] text-[#64748B] hover:text-[#163B5C]'
            }`}
          >
            {st === 'ALL' ? 'All Statuses' : st}
          </button>
        ))}
      </div>

      {/* Leads Table Card */}
      <div className="bg-white rounded-3xl border border-[#E8EDF2] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#ED3500] animate-spin mx-auto" />
            <p className="text-xs text-[#64748B] font-semibold">Loading enquiries and leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-sm text-[#163B5C]">No enquiries found in this category</h4>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              {statusFilter !== 'ALL' || categoryFilter !== 'ALL'
                ? 'Try resetting the category or status filter to see other enquiries.'
                : 'Customer enquiries and quotation requests submitted from the storefront will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E8EDF2] bg-[#FFFCFB] text-[#64748B] font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Company & Buyer</th>
                  <th className="py-3.5 px-4">Location & GST</th>
                  <th className="py-3.5 px-4">Requirements</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Quote / Notes</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EDF2]">
                {leads.map((lead) => {
                  const categoryMeta = getCategoryBadge(lead.enquiryCategory || 'WHOLESALE');
                  const CategoryIcon = categoryMeta.icon;
                  const cleanPhone = lead.phone.replace(/\D/g, '');
                  const whatsappLink = buildWhatsAppLink(lead);

                  return (
                    <tr
                      key={lead._id}
                      className="hover:bg-[#FFFCFB] transition-colors cursor-pointer group"
                      onClick={() => handleOpenDetails(lead)}
                    >
                      {/* Category Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${categoryMeta.className}`}
                        >
                          <CategoryIcon className="w-3.5 h-3.5" />
                          <span>{categoryMeta.label}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[#64748B]">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block ml-5">
                          {new Date(lead.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      {/* Company & Contact */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="font-extrabold text-[#163B5C] text-sm group-hover:text-[#ED3500] transition-colors">
                          {lead.companyName}
                        </div>
                        <div className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{lead.contactPerson}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <a
                            href={`tel:${cleanPhone}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[#163B5C] text-[10px] font-bold transition-colors"
                            title="Call contact"
                          >
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span>{lead.phone}</span>
                          </a>
                          <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold transition-colors"
                            title="Chat on WhatsApp with customized template"
                          >
                            <MessageCircle className="w-3 h-3 text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </td>

                      {/* Location & GST */}
                      <td className="py-3.5 px-4 text-[#64748B]">
                        <div className="flex items-center gap-1 font-semibold text-[#163B5C]">
                          <MapPin className="w-3 h-3 text-[#ED3500]" />
                          <span>
                            {lead.city} ({lead.pincode})
                          </span>
                        </div>
                        {lead.gstin ? (
                          <span className="text-[10px] font-mono text-blue-600 block mt-0.5 font-bold">
                            GST: {lead.gstin}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 block mt-0.5">No GST</span>
                        )}
                        {lead.email && (
                          <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                            {lead.email}
                          </span>
                        )}
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {lead.items.slice(0, 2).map((it, idx) => (
                            <div key={idx} className="flex items-center flex-wrap gap-1.5 text-xs">
                              <span className="px-1.5 py-0.5 rounded-md bg-[#ED3500]/10 text-[#ED3500] font-black text-[10px]">
                                {it.quantity} {it.unit}
                              </span>
                              <span className="font-bold text-[#163B5C] line-clamp-1 max-w-[180px]">
                                {it.productName}
                              </span>
                              {it.variantName && (
                                <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[10px]">
                                  {it.variantName}
                                </span>
                              )}
                            </div>
                          ))}
                          {lead.items.length > 2 && (
                            <span className="text-[10px] text-slate-400 font-semibold block">
                              +{lead.items.length - 2} more items
                            </span>
                          )}
                          {lead.notes && (
                            <p className="text-[10px] text-[#64748B] italic bg-[#FFFCFB] p-1.5 rounded-lg border border-[#E8EDF2] mt-1 max-w-xs line-clamp-2">
                              &ldquo;{lead.notes}&rdquo;
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                          className={`px-2.5 py-1 rounded-xl text-xs border font-extrabold focus:outline-none ${getStatusBadge(
                            lead.status
                          )}`}
                        >
                          <option value="NEW">NEW LEAD</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="QUOTED">QUOTATION SENT</option>
                          <option value="CONVERTED">CONVERTED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                      </td>

                      {/* Quote & Notes */}
                      <td className="py-3.5 px-4 text-[#64748B]">
                        {lead.quotedAmount ? (
                          <div className="font-extrabold text-emerald-600 text-xs">
                            ₹{lead.quotedAmount.toLocaleString('en-IN')}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">Not quoted yet</span>
                        )}
                        {lead.adminNotes && (
                          <p className="text-[10px] text-slate-600 truncate max-w-[120px] mt-0.5">
                            {lead.adminNotes}
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetails(lead)}
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="View Complete Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(lead)}
                            className="p-1.5 rounded-lg text-[#163B5C] hover:bg-slate-100 transition-colors"
                            title="Quick Edit Quote & Notes"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLead(lead._id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete Enquiry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#E8EDF2] flex items-center justify-between text-xs text-[#64748B]">
            <span>
              Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalLeads} total records)
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-lg border border-[#E8EDF2] disabled:opacity-40 hover:bg-[#FFFCFB]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg border border-[#E8EDF2] disabled:opacity-40 hover:bg-[#FFFCFB]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: COMPLETE ENQUIRY DETAILS POPUP MODAL (USER REQUESTED FEATURE)     */}
      {/* ========================================================================= */}
      {inspectingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#E8EDF2] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E8EDF2] bg-[#163B5C] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold">
                  <Eye className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-extrabold text-base sm:text-lg">
                      Enquiry #{inspectingLead._id.slice(-6).toUpperCase()}
                    </h3>
                    {(() => {
                      const meta = getCategoryBadge(inspectingLead.enquiryCategory || 'WHOLESALE');
                      return (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${meta.className}`}>
                          {meta.label}
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-xs text-slate-300">
                    Received on {new Date(inspectingLead.createdAt).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingLead(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#163B5C]">
              {/* Quick Status & Category Switch Bar */}
              <div className="p-4 rounded-2xl bg-[#FFFCFB] border border-[#E8EDF2] grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1">
                    Enquiry Status
                  </label>
                  <select
                    value={detailStatus}
                    onChange={(e) => setDetailStatus(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs font-bold focus:outline-none ${getStatusBadge(
                      detailStatus
                    )}`}
                  >
                    <option value="NEW">NEW LEAD</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="QUOTED">QUOTATION SENT</option>
                    <option value="CONVERTED">CONVERTED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1">
                    Classified Category
                  </label>
                  <select
                    value={detailCategory}
                    onChange={(e) => setDetailCategory(e.target.value as EnquiryCategory)}
                    className="w-full px-3 py-1.5 bg-white border border-[#E8EDF2] rounded-xl text-xs font-bold text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                  >
                    <option value="WHOLESALE">Bulk Wholesale</option>
                    <option value="PRIVATE_LABEL">Private Label & Bottling</option>
                    <option value="GIFT_HAMPER">Wedding & Event Hampers</option>
                    <option value="GENERAL">General Customer Enquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1">
                    Current Quoted Value
                  </label>
                  <div className="font-extrabold text-sm text-emerald-600">
                    {detailQuotedAmount
                      ? `₹${Number(detailQuotedAmount).toLocaleString('en-IN')}`
                      : 'Pending Quotation'}
                  </div>
                </div>
              </div>

              {/* 2-Column Grid: Contact Information & Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left Card: Buyer & Contact Dossier */}
                <div className="p-4 rounded-2xl border border-[#E8EDF2] bg-white space-y-3.5">
                  <div className="flex items-center gap-2 border-b border-[#E8EDF2] pb-2">
                    <User className="w-4 h-4 text-[#ED3500]" />
                    <h4 className="font-heading font-extrabold text-xs uppercase tracking-wider text-[#163B5C]">
                      Buyer & Organization Profile
                    </h4>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] uppercase text-[#64748B] font-semibold block">Company / Brand / Occasion</span>
                      <strong className="text-sm text-[#163B5C] font-bold">{inspectingLead.companyName}</strong>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase text-[#64748B] font-semibold block">Contact Person</span>
                      <span className="font-medium">{inspectingLead.contactPerson}</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase text-[#64748B] font-semibold block">Mobile Contact</span>
                      <div className="flex items-center gap-2 mt-1">
                        <a
                          href={`tel:${inspectingLead.phone.replace(/\D/g, '')}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#163B5C] font-bold transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{inspectingLead.phone}</span>
                        </a>
                        <a
                          href={buildWhatsAppLink(inspectingLead)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    {inspectingLead.email && (
                      <div>
                        <span className="text-[10px] uppercase text-[#64748B] font-semibold block">Email Address</span>
                        <a
                          href={`mailto:${inspectingLead.email}`}
                          className="text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>{inspectingLead.email}</span>
                        </a>
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] uppercase text-[#64748B] font-semibold block">Delivery Location</span>
                      <div className="flex items-center gap-1 mt-0.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#ED3500]" />
                        <span>{inspectingLead.city} - {inspectingLead.pincode}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase text-[#64748B] font-semibold block">GSTIN Registration</span>
                      {inspectingLead.gstin ? (
                        <span className="font-mono font-bold text-blue-600 text-xs">
                          {inspectingLead.gstin}
                        </span>
                      ) : (
                        <span className="text-slate-400">Unregistered / Not Provided</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Card: Order & Product Specifications */}
                <div className="p-4 rounded-2xl border border-[#E8EDF2] bg-white space-y-3.5">
                  <div className="flex items-center gap-2 border-b border-[#E8EDF2] pb-2">
                    <Package className="w-4 h-4 text-[#ED3500]" />
                    <h4 className="font-heading font-extrabold text-xs uppercase tracking-wider text-[#163B5C]">
                      Items & Requirements
                    </h4>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-[#64748B] font-semibold block mb-1">
                      Engagement Model
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-[#163B5C] inline-block">
                      {inspectingLead.orderType === 'MONTHLY_RECURRING'
                        ? 'Monthly Recurring Supply'
                        : inspectingLead.orderType === 'CONTRACT_FARMING'
                        ? 'Contract Farming Partner'
                        : 'One-Time Consignment'}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase text-[#64748B] font-semibold block">
                      Requested Items ({inspectingLead.items.length})
                    </span>
                    <div className="border border-[#E8EDF2] rounded-xl overflow-hidden divide-y divide-[#E8EDF2]">
                      {inspectingLead.items.map((it, idx) => (
                        <div key={idx} className="p-2.5 flex items-center justify-between bg-[#FFFCFB]">
                          <div>
                            <div className="font-bold text-[#163B5C] flex items-center flex-wrap gap-1.5">
                              <span>{it.productName}</span>
                              {it.variantName && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                                  Variant: {it.variantName}
                                </span>
                              )}
                            </div>
                            {it.targetPrice ? (
                              <div className="text-[10px] text-emerald-600">
                                Customer target: ₹{it.targetPrice}/{it.unit}
                              </div>
                            ) : null}
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-[#ED3500]/10 text-[#ED3500] font-black text-xs">
                            {it.quantity} {it.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {inspectingLead.notes && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase text-[#64748B] font-semibold block">
                        Customer Notes / Message
                      </span>
                      <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 text-[#163B5C] leading-relaxed whitespace-pre-wrap">
                        {inspectingLead.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Desk: Internal Notes & Quoted Amount */}
              <form onSubmit={handleSaveDetails} className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/30 space-y-3">
                <div className="flex items-center gap-2 border-b border-indigo-100 pb-2">
                  <Edit3 className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-heading font-extrabold text-xs uppercase tracking-wider text-indigo-900">
                    Trade Desk Quotation & Action Log
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#163B5C] mb-1">
                      Final Quoted Commercial Amount (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 85000"
                      value={detailQuotedAmount}
                      onChange={(e) => setDetailQuotedAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#163B5C] mb-1">
                      Quick Status Update
                    </label>
                    <select
                      value={detailStatus}
                      onChange={(e) => setDetailStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E8EDF2] rounded-xl text-xs font-bold text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                    >
                      <option value="NEW">NEW LEAD</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="QUOTED">QUOTATION SENT</option>
                      <option value="CONVERTED">CONVERTED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#163B5C] mb-1">
                    Internal Sales Notes & Follow-up Log
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Sent sample tasting box via DTDC tracking #12345. Client requested 500 jars with Octa series. Follow up on Friday."
                    value={detailNotes}
                    onChange={(e) => setDetailNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleDeleteLead(inspectingLead._id)}
                    className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Enquiry</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInspectingLead(null)}
                      className="px-4 py-2 rounded-xl border border-[#E8EDF2] font-bold text-[#64748B] hover:bg-white"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={savingDetails}
                      className="px-5 py-2 rounded-xl bg-[#ED3500] hover:bg-[#D02E00] text-white font-extrabold uppercase tracking-wider shadow-md flex items-center gap-1.5"
                    >
                      {savingDetails ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: QUICK EDIT QUOTED VALUE & INTERNAL NOTES                          */}
      {/* ========================================================================= */}
      {editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E8EDF2] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8EDF2] pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#ED3500]" />
                <h4 className="font-extrabold text-[#163B5C]">Update Quotation Details</h4>
              </div>
              <button
                onClick={() => setEditingLead(null)}
                className="p-1 rounded-full text-slate-400 hover:text-[#163B5C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-[#64748B]">
              Lead: <strong className="text-[#163B5C]">{editingLead.companyName}</strong> (
              {editingLead.contactPerson})
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#163B5C] mb-1">
                  Quoted Commercial Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 75000"
                  value={editQuotedAmount}
                  onChange={(e) => setEditQuotedAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#163B5C] mb-1">
                  Internal Sales Notes & Terms
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Discussed sample shipment of 2kg forest honey via DTDC. Follow up on Monday."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="px-4 py-2 rounded-xl border border-[#E8EDF2] font-bold text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-[#ED3500] hover:bg-[#D02E00] text-white font-extrabold uppercase tracking-wider shadow-md"
                >
                  {savingEdit ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
