'use client';

import React, { useState } from 'react';
import {
  X,
  PackageCheck,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  Loader2,
  Calendar,
} from 'lucide-react';
import { useStore, TrackedOrder } from '@/context/StoreContext';

/**
 * Public Order Tracking Modal
 * Rate-limited query against /api/orders/track without exposing customer PII.
 */
export default function OrderTrackingModal() {
  const { isTrackingModalOpen, setIsTrackingModalOpen } = useStore();

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [trackedOrders, setTrackedOrders] = useState<TrackedOrder[]>([]);

  if (!isTrackingModalOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setErrorMsg('');
      setSearched(true);

      const res = await fetch(`/api/orders/track?query=${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (data.success) {
        setTrackedOrders(data.data || []);
      } else {
        setErrorMsg(data.message || 'No orders found matching your search.');
        setTrackedOrders([]);
      }
    } catch (err: any) {
      setErrorMsg('Network error while querying tracking server.');
      setTrackedOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Confirmed':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E8EDF2] max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E8EDF2] bg-[#173F2B] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base leading-tight">
                Track Farmgate Order Status
              </h3>
              <p className="text-[11px] text-slate-300">
                Enter your mobile number, email, or Order ID
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsTrackingModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Close tracking modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="e.g. 9876543210 or ORD-123456"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-[#FFFCFB] border border-[#E8EDF2] rounded-2xl text-xs text-[#202820] focus:outline-none focus:border-[#173F2B]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 rounded-2xl bg-[#173F2B] hover:bg-[#D02E00] text-white font-semibold text-xs transition-colors disabled:bg-slate-300"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Track'}
            </button>
          </form>

          {/* Results Area */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {searched && !loading && trackedOrders.length === 0 && !errorMsg && (
            <div className="text-center py-8 text-xs text-[#64748B]">
              No active or historical orders found for query: <strong>{query}</strong>.
            </div>
          )}

          <div className="space-y-4">
            {trackedOrders.map((ord) => (
              <div
                key={ord._id}
                className="p-5 rounded-2xl bg-[#FFFCFB] border border-[#E8EDF2] space-y-3.5 shadow-2xs"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#E8EDF2]">
                  <div>
                    <span className="font-mono font-black text-xs text-[#173F2B] block">
                      {ord.orderId}
                    </span>
                    <span className="text-[10px] text-[#64748B] flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase border ${getStatusBadge(
                      ord.status
                    )}`}
                  >
                    {ord.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="text-[11px] font-bold text-[#64748B]">Purchased Produce:</div>
                  <ul className="space-y-1 pl-1">
                    {ord.items.map((it, iIdx) => (
                      <li key={iIdx} className="flex justify-between text-xs text-[#202820]">
                        <span>
                          {it.name} {it.variantName ? `(${it.variantName})` : ''} × {it.quantity}
                        </span>
                        <span className="font-bold">₹{(it.price * it.quantity).toLocaleString('en-IN')}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-[#E8EDF2] flex justify-between items-center text-xs">
                  <span className="text-[#64748B]">Total Amount:</span>
                  <span className="font-black text-sm text-[#202820]">
                    ₹{ord.totalAmount?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
