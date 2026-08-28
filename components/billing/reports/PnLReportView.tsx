'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, PieChart, ShieldCheck, Printer } from 'lucide-react';

export default function PnLReportView() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchPnL = async () => {
    try {
      setLoading(true);
      let url = '/api/billing/reports/pnl';
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setReport(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPnL();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <RefreshCw className="w-8 h-8 text-[#ED3500] animate-spin mx-auto" />
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-6">
      {/* Date Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E8EDF2] shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#64748B]">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#E8EDF2] text-xs font-semibold"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#64748B]">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#E8EDF2] text-xs font-semibold"
            />
          </div>
          <button
            onClick={fetchPnL}
            className="px-4 py-1.5 rounded-xl bg-[#163B5C] text-white text-xs font-extrabold"
          >
            Apply Filter
          </button>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#163B5C] font-bold text-xs flex items-center gap-1.5"
        >
          <Printer className="w-4 h-4" /> Print P&L Statement
        </button>
      </div>

      {/* Net Profit Banner */}
      <div
        className={`p-6 rounded-3xl text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          report.isProfit ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-gradient-to-r from-rose-600 to-red-600'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center font-black">
            {report.isProfit ? <TrendingUp className="w-8 h-8" /> : <TrendingDown className="w-8 h-8" />}
          </div>
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider opacity-80 block">
              Final Net Business Financial Result
            </span>
            <h2 className="text-3xl font-black">
              {report.isProfit ? '+' : '-'} ₹{Math.abs(report.netProfit).toLocaleString('en-IN')}
            </h2>
            <span className="text-xs font-bold opacity-90">
              {report.isProfit ? '🎉 Net Profit Earned' : '⚠️ Net Loss Recorded'}
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right text-xs space-y-1 bg-white/10 p-3.5 rounded-2xl border border-white/20">
          <div>Net Sales: <strong>₹{report.netSalesRevenue?.toLocaleString('en-IN')}</strong></div>
          <div>COGS Purchases: <strong>₹{report.costOfGoodsSold?.toLocaleString('en-IN')}</strong></div>
          <div>Operating Expenses: <strong>₹{report.totalExpenses?.toLocaleString('en-IN')}</strong></div>
        </div>
      </div>

      {/* P&L Breakdown Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Revenue Card */}
        <div className="bg-white p-5 rounded-3xl border border-[#E8EDF2] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8EDF2] pb-3">
            <span className="font-extrabold text-xs text-[#163B5C] uppercase tracking-wider">1. Sales Revenue</span>
            <span className="text-xs font-black text-emerald-600">₹{report.netSalesRevenue?.toLocaleString('en-IN')}</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-[#64748B]">
              <span>Online E-Commerce Sales:</span>
              <span className="font-bold text-[#163B5C]">₹{report.onlineStoreSales?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[#64748B]">
              <span>POS Counter Billing Sales:</span>
              <span className="font-bold text-[#163B5C]">₹{report.posCounterSales?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-rose-600 font-semibold pt-1 border-t">
              <span>Less: Sales Returns:</span>
              <span>- ₹{report.salesReturnTotal?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* 2. COGS Card */}
        <div className="bg-white p-5 rounded-3xl border border-[#E8EDF2] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8EDF2] pb-3">
            <span className="font-extrabold text-xs text-[#163B5C] uppercase tracking-wider">2. Cost of Goods (COGS)</span>
            <span className="text-xs font-black text-rose-600">₹{report.costOfGoodsSold?.toLocaleString('en-IN')}</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-[#64748B]">
              <span>Inward Purchase Bills:</span>
              <span className="font-bold text-[#163B5C]">₹{report.purchaseBillTotal?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-semibold pt-1 border-t">
              <span>Less: Purchase Returns:</span>
              <span>- ₹{report.purchaseReturnTotal?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[#163B5C] font-black pt-2 border-t text-sm">
              <span>Gross Profit:</span>
              <span className="text-emerald-700">₹{report.grossProfit?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* 3. Operating Expenses Card */}
        <div className="bg-white p-5 rounded-3xl border border-[#E8EDF2] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8EDF2] pb-3">
            <span className="font-extrabold text-xs text-[#163B5C] uppercase tracking-wider">3. Daily Expenses</span>
            <span className="text-xs font-black text-rose-600">₹{report.totalExpenses?.toLocaleString('en-IN')}</span>
          </div>
          <div className="space-y-2 text-xs max-h-36 overflow-y-auto pr-1">
            {report.expenseByCategory?.length === 0 ? (
              <span className="text-gray-400 italic">No expenses logged in period</span>
            ) : (
              report.expenseByCategory?.map((cat: any) => (
                <div key={cat.category} className="flex justify-between text-[#64748B]">
                  <span>{cat.category}:</span>
                  <span className="font-bold text-[#163B5C]">₹{cat.amount?.toLocaleString('en-IN')}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* GST Tax Summary Card */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8EDF2] shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-[#163B5C]">
          <ShieldCheck className="w-5 h-5 text-[#ED3500]" />
          <h3 className="font-extrabold text-sm uppercase tracking-wider">GST Tax Summary (Output vs Input Tax Credit)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
            <span className="text-[#64748B] block font-bold">Output GST (Collected on Sales):</span>
            <span className="text-xl font-black text-amber-800">₹{report.outputGstCollected?.toLocaleString('en-IN')}</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-[#64748B] block font-bold">Input Tax Credit (Paid on Purchases):</span>
            <span className="text-xl font-black text-emerald-800">₹{report.inputGstCredit?.toLocaleString('en-IN')}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFF8F5] border border-[#ED3500]/30">
            <span className="text-[#64748B] block font-bold">Net GST Payable to Govt:</span>
            <span className="text-xl font-black text-[#ED3500]">₹{report.netGstPayable?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
