'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  ShoppingBag,
  Receipt,
  PieChart,
  ArrowLeft,
  RefreshCw,
  Plus,
  Users,
} from 'lucide-react';
import SalesTabContainer from '@/components/billing/sales/SalesTabContainer';
import PurchaseTabContainer from '@/components/billing/purchase/PurchaseTabContainer';
import ExpenseTabContainer from '@/components/billing/expenses/ExpenseTabContainer';
import ReportsTabContainer from '@/components/billing/reports/ReportsTabContainer';
import PartyModal from '@/components/billing/shared/PartyModal';

export default function AdminBillingPage() {
  const [activeTab, setActiveTab] = useState<'sales' | 'purchase' | 'expenses' | 'reports' | 'parties'>('sales');
  const [products, setProducts] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [prodRes, partyRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/billing/parties'),
      ]);

      const prodData = await prodRes.json();
      const partyData = await partyRes.json();

      if (prodData.success) setProducts(prodData.data);
      if (partyData.success) setParties(partyData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFCFB] text-[#163B5C] flex flex-col justify-between">
      {/* Billing Header Bar */}
      <header className="bg-white border-b border-[#E8EDF2] sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="p-2 rounded-xl border border-[#E8EDF2] text-[#64748B] hover:text-[#ED3500] hover:bg-[#FFF8F5] transition-all"
              title="Return to Main Admin Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <img
              src="/logo.jpg"
              alt="BeesHub Logo"
              className="w-9 h-9 object-contain rounded-xl border border-[#E8EDF2]"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <h1 className="font-extrabold text-base sm:text-xl text-[#163B5C]">
                BeesHub Enterprise Billing & Accounting
              </h1>
              <span className="text-xs text-[#64748B] hidden sm:block">
                Invoices, Purchases, Daily Expenses & Profit & Loss Statement
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPartyModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#163B5C] hover:bg-[#0F2A42] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Users className="w-4 h-4" /> + Add Customer / Vendor Party
            </button>
          </div>
        </div>
      </header>

      {/* Main Billing Portal Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E8EDF2] pb-1 overflow-x-auto scrollbar-none scroll-smooth">
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'sales'
                ? 'border-[#ED3500] text-[#ED3500] bg-[#FFF8F5]'
                : 'border-transparent text-[#64748B] hover:text-[#163B5C]'
            }`}
          >
            <FileText className="w-4 h-4" /> 1. Sales Module
          </button>
          <button
            onClick={() => setActiveTab('purchase')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'purchase'
                ? 'border-[#ED3500] text-[#ED3500] bg-[#FFF8F5]'
                : 'border-transparent text-[#64748B] hover:text-[#163B5C]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> 2. Purchase Module
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'expenses'
                ? 'border-[#ED3500] text-[#ED3500] bg-[#FFF8F5]'
                : 'border-transparent text-[#64748B] hover:text-[#163B5C]'
            }`}
          >
            <Receipt className="w-4 h-4" /> 3. Daily Expenses
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'reports'
                ? 'border-[#ED3500] text-[#ED3500] bg-[#FFF8F5]'
                : 'border-transparent text-[#64748B] hover:text-[#163B5C]'
            }`}
          >
            <PieChart className="w-4 h-4" /> 4. P&L & GST Reports
          </button>
          <button
            onClick={() => setActiveTab('parties')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'parties'
                ? 'border-[#ED3500] text-[#ED3500] bg-[#FFF8F5]'
                : 'border-transparent text-[#64748B] hover:text-[#163B5C]'
            }`}
          >
            <Users className="w-4 h-4" /> 5. Parties Ledger ({parties.length})
          </button>
        </div>

        {/* Tab Views */}
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 text-[#ED3500] animate-spin mx-auto" />
          </div>
        ) : (
          <>
            {activeTab === 'sales' && <SalesTabContainer products={products} />}
            {activeTab === 'purchase' && <PurchaseTabContainer products={products} />}
            {activeTab === 'expenses' && <ExpenseTabContainer />}
            {activeTab === 'reports' && <ReportsTabContainer />}
            {activeTab === 'parties' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-lg text-[#163B5C]">Customers & Suppliers Directory</h3>
                  <button
                    onClick={() => setIsPartyModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[#163B5C] text-white font-bold text-xs uppercase"
                  >
                    + Add New Party
                  </button>
                </div>
                <div className="bg-white rounded-2xl border border-[#E8EDF2] overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#FFFCFB] border-b border-[#E8EDF2] text-[#64748B] font-bold uppercase">
                          <th className="p-4">Party Type</th>
                          <th className="p-4">Name</th>
                          <th className="p-4">Mobile Phone</th>
                          <th className="p-4">GSTIN</th>
                          <th className="p-4 text-right">Account Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8EDF2]">
                        {parties.map((p) => (
                          <tr key={p._id} className="hover:bg-[#FFFCFB]/80">
                            <td className="p-4">
                              <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700">
                                {p.partyType}
                              </span>
                            </td>
                            <td className="p-4 font-bold text-[#163B5C]">{p.name}</td>
                            <td className="p-4 font-semibold text-gray-600">{p.phone}</td>
                            <td className="p-4 font-mono text-gray-500">{p.gstin || 'Unregistered'}</td>
                            <td className="p-4 text-right font-black text-[#163B5C]">
                              ₹{p.currentBalance?.toLocaleString('en-IN') || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {isPartyModalOpen && (
        <PartyModal
          onClose={() => setIsPartyModalOpen(false)}
          onSuccess={() => fetchInitialData()}
        />
      )}
    </div>
  );
}
