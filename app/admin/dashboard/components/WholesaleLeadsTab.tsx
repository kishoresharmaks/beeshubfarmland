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
} from 'lucide-react';

interface WholesaleItem {
  productId?: string;
  productName: string;
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
  items: WholesaleItem[];
  orderType: string;
  notes?: string;
  status: 'NEW' | 'CONTACTED' | 'QUOTED' | 'CONVERTED' | 'REJECTED';
  adminNotes?: string;
  quotedAmount?: number;
  createdAt: string;
}

interface WholesaleLeadsTabProps {
  onLeadsUpdated?: () => void;
}

export default function WholesaleLeadsTab({ onLeadsUpdated }: WholesaleLeadsTabProps) {
  const [leads, setLeads] = useState<WholesaleLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);

  // Edit Notes & Quote Modal
  const [editingLead, setEditingLead] = useState<WholesaleLead | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editQuotedAmount, setEditQuotedAmount] = useState<string | number>('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
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
        if (onLeadsUpdated) onLeadsUpdated();
      }
    } catch (err) {
      console.error('Failed to load wholesale leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, page]);

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
        if (onLeadsUpdated) onLeadsUpdated();
      }
    } catch (err) {
      console.error('Failed to update lead status:', err);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to remove this quotation lead?')) return;
    try {
      const res = await fetch(`/api/admin/wholesale/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setLeads((prev) => prev.filter((lead) => lead._id !== id));
        if (onLeadsUpdated) onLeadsUpdated();
      }
    } catch (err) {
      console.error('Failed to delete lead:', err);
    }
  };

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
        return 'bg-amber-500/10 text-amber-600 border-amber-500/30 font-black';
      case 'CONTACTED':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'QUOTED':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/30';
      case 'CONVERTED':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold';
      case 'REJECTED':
        return 'bg-red-500/10 text-red-600 border-red-500/30';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/30';
    }
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
              <h2 className="text-xl font-extrabold text-[#163B5C]">Wholesale & B2B Leads</h2>
              <p className="text-xs text-[#64748B]">
                Manage commercial quotation requests, buyer contacts, and trade discussions
              </p>
            </div>
          </div>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search company, phone, city..."
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        {['ALL', 'NEW', 'CONTACTED', 'QUOTED', 'CONVERTED', 'REJECTED'].map((st) => (
          <button
            key={st}
            onClick={() => {
              setStatusFilter(st);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all ${
              statusFilter === st
                ? 'bg-[#163B5C] text-white shadow-md shadow-[#163B5C]/20'
                : 'bg-white border border-[#E8EDF2] text-[#64748B] hover:text-[#163B5C]'
            }`}
          >
            {st === 'ALL' ? `All Inquiries (${totalLeads})` : st}
          </button>
        ))}
      </div>

      {/* Leads Table Card */}
      <div className="bg-white rounded-3xl border border-[#E8EDF2] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#ED3500] animate-spin mx-auto" />
            <p className="text-xs text-[#64748B] font-semibold">Loading wholesale leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-sm text-[#163B5C]">No wholesale inquiries found</h4>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              {statusFilter !== 'ALL'
                ? `No inquiries currently marked as ${statusFilter}.`
                : 'When commercial buyers submit quotation requests from the storefront hero, they will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E8EDF2] bg-[#FFFCFB] text-[#64748B] font-extrabold uppercase text-[10px] tracking-wider">
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
                  const cleanPhone = lead.phone.replace(/\D/g, '');
                  const waPrefill = encodeURIComponent(
                    `Hello ${lead.contactPerson},\n\nThis is BeesHub Farmland Trade Desk regarding your bulk inquiry for ${lead.companyName}.\nWe have reviewed your request for ${lead.items.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')}.\n\nCould we discuss packaging options and the delivery timeline?`
                  );
                  const whatsappLink = `https://wa.me/91${cleanPhone.slice(-10)}?text=${waPrefill}`;

                  return (
                    <tr key={lead._id} className="hover:bg-[#FFFCFB] transition-colors">
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
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-[#163B5C] text-sm">
                          {lead.companyName}
                        </div>
                        <div className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5">
                          <span>{lead.contactPerson}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <a
                            href={`tel:${cleanPhone}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[#163B5C] text-[10px] font-bold transition-colors"
                          >
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span>{lead.phone}</span>
                          </a>
                          <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold transition-colors"
                            title="Chat on WhatsApp with prefilled quotation prompt"
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
                          {lead.items.map((it, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-xs">
                              <span className="px-1.5 py-0.5 rounded-md bg-[#ED3500]/10 text-[#ED3500] font-black text-[10px]">
                                {it.quantity} {it.unit}
                              </span>
                              <span className="font-bold text-[#163B5C] line-clamp-1">
                                {it.productName}
                              </span>
                              {it.targetPrice ? (
                                <span className="text-[10px] text-emerald-600 font-semibold">
                                  @ ₹{it.targetPrice}
                                </span>
                              ) : null}
                            </div>
                          ))}
                          {lead.notes && (
                            <p className="text-[10px] text-[#64748B] italic bg-[#FFFCFB] p-1.5 rounded-lg border border-[#E8EDF2] mt-1 max-w-xs">
                              &ldquo;{lead.notes}&rdquo;
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4">
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
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(lead)}
                            className="p-1.5 rounded-lg text-[#163B5C] hover:bg-slate-100 transition-colors"
                            title="Edit Quote & Internal Notes"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLead(lead._id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete Lead"
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
              Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong>
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

      {/* Edit Notes & Quoted Value Modal */}
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
