'use client';

import React from 'react';
import { X, Printer, Share2, TrendingUp, TrendingDown, ShieldCheck } from 'lucide-react';

interface PrintablePnLModalProps {
  report: any;
  startDate?: string;
  endDate?: string;
  onClose: () => void;
}

export default function PrintablePnLModal({
  report,
  startDate,
  endDate,
  onClose,
}: PrintablePnLModalProps) {
  if (!report) return null;

  const handlePrint = () => {
    window.print();
  };

  const getPeriodText = () => {
    if (startDate && endDate) {
      return `${startDate} to ${endDate}`;
    }
    if (startDate) return `From ${startDate} onwards`;
    if (endDate) return `Up to ${endDate}`;
    return 'All-Time Financial Performance Record';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-hidden print:p-0 print:bg-white print:overflow-visible">
      {/* CSS Print Styles for Formal A4 P&L Report */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: A4 portrait;
          }
          html, body {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            color: black !important;
            overflow: visible !important;
          }
          body * {
            visibility: hidden !important;
          }
          #pnl-printable-document-area,
          #pnl-printable-document-area * {
            visibility: visible !important;
          }
          #pnl-printable-document-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 10mm 15mm !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
            font-family: inherit !important;
            font-size: 12px !important;
            line-height: 1.4 !important;
            z-index: 999999 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-[#E8EDF2] shadow-2xl relative print:border-none print:shadow-none print:p-0 print:my-0 print:max-w-full print:max-h-none overflow-hidden">
        {/* Sticky Modal Control Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E8EDF2] flex items-center justify-between shrink-0 bg-white print:hidden z-10 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#163B5C]/10 text-[#163B5C] flex items-center justify-center font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#163B5C]">
                Profit & Loss Financial Statement Export
              </h3>
              <p className="text-xs text-[#64748B]">Formal A4 Enterprise Report • {getPeriodText()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#163B5C] hover:bg-[#0F2A42] text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-[#64748B]">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Canvas Wrapper */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/70 print:p-0 print:bg-white print:overflow-visible">
          {/* Printable Formal P&L Document Container */}
          <div
            id="pnl-printable-document-area"
            className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-2xl border border-gray-200 shadow-md space-y-6 text-sm text-[#163B5C] print:border-none print:shadow-none print:p-0 print:max-w-full"
          >
          {/* Header Branding */}
          <div className="text-center border-b-2 border-slate-800 pb-4 space-y-1">
            <h1 className="font-black text-2xl tracking-wide uppercase text-slate-900">
              BEES HUB FARMLAND PRIVATE LIMITED
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Pure Organic Honey, Spices & Natural Farm Produce
            </p>
            <p className="text-xs font-bold text-slate-700">
              Phone: +91 95787 84431 | GSTIN: 33AAOCB0453D1Z3
            </p>
          </div>

          {/* Statement Title & Period */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
            <div>
              <h2 className="font-black text-lg text-slate-800 uppercase tracking-wider">
                STATEMENT OF PROFIT & LOSS
              </h2>
              <span className="text-xs font-bold text-slate-500 block">
                Accounting Period: <strong className="text-slate-900">{getPeriodText()}</strong>
              </span>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div>Statement Generated: <strong>{new Date().toLocaleDateString('en-IN')}</strong></div>
              <div>System: <strong>BeesHub Enterprise Accounting</strong></div>
            </div>
          </div>

          {/* Net Result Highlight Summary */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            report.isProfit
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider block opacity-75">
                NET BUSINESS FINANCIAL PERFORMANCE RESULT
              </span>
              <span className="text-2xl font-black">
                {report.isProfit ? '+' : '-'} ₹{Math.abs(report.netProfit || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-white border border-current">
              {report.isProfit ? '🎉 NET PROFIT EARNED' : '⚠️ NET LOSS RECORDED'}
            </span>
          </div>

          {/* Formal Financial Table */}
          <div className="space-y-4">
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-700 border-b pb-1">
              1. FINANCIAL BREAKDOWN SUMMARY
            </h3>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-bold uppercase text-slate-700">
                  <th className="p-2.5">Financial Particulars</th>
                  <th className="p-2.5 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {/* 1. REVENUE */}
                <tr className="bg-slate-50/50">
                  <td className="p-2.5 font-extrabold text-slate-900 uppercase" colSpan={2}>
                    A. REVENUE FROM OPERATIONS (GROSS SALES)
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-6 text-slate-600">Online E-Commerce Sales Revenue</td>
                  <td className="p-2.5 text-right font-semibold">₹{report.onlineStoreSales?.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-6 text-slate-600">POS Counter Billing Sales Revenue</td>
                  <td className="p-2.5 text-right font-semibold">₹{report.posCounterSales?.toLocaleString('en-IN')}</td>
                </tr>
                <tr className="text-rose-600">
                  <td className="p-2.5 pl-6">Less: Sales Returns & Credit Notes Issued</td>
                  <td className="p-2.5 text-right font-semibold">- ₹{report.salesReturnTotal?.toLocaleString('en-IN')}</td>
                </tr>
                <tr className="font-black bg-emerald-50/60 border-t border-b border-emerald-200">
                  <td className="p-2.5 text-slate-900">NET SALES REVENUE (GROSS INCOME)</td>
                  <td className="p-2.5 text-right text-emerald-700 text-sm">₹{report.netSalesRevenue?.toLocaleString('en-IN')}</td>
                </tr>

                {/* 2. COGS */}
                <tr className="bg-slate-50/50">
                  <td className="p-2.5 font-extrabold text-slate-900 uppercase" colSpan={2}>
                    B. COST OF GOODS SOLD (COGS)
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 pl-6 text-slate-600">Inward Inventory Purchase Bills</td>
                  <td className="p-2.5 text-right font-semibold">₹{report.purchaseBillTotal?.toLocaleString('en-IN')}</td>
                </tr>
                <tr className="text-emerald-600">
                  <td className="p-2.5 pl-6">Less: Purchase Returns to Vendors</td>
                  <td className="p-2.5 text-right font-semibold">- ₹{report.purchaseReturnTotal?.toLocaleString('en-IN')}</td>
                </tr>
                <tr className="font-bold border-t">
                  <td className="p-2.5 text-slate-900">TOTAL COST OF GOODS SOLD (COGS)</td>
                  <td className="p-2.5 text-right font-extrabold text-slate-900">₹{report.costOfGoodsSold?.toLocaleString('en-IN')}</td>
                </tr>
                <tr className="font-black bg-slate-100 border-t border-b border-slate-300">
                  <td className="p-2.5 text-slate-900">GROSS PROFIT (NET SALES - COGS)</td>
                  <td className="p-2.5 text-right text-slate-900 text-sm">₹{report.grossProfit?.toLocaleString('en-IN')}</td>
                </tr>

                {/* 3. EXPENSES */}
                <tr className="bg-slate-50/50">
                  <td className="p-2.5 font-extrabold text-slate-900 uppercase" colSpan={2}>
                    C. OPERATING & ADMINISTRATIVE EXPENSES
                  </td>
                </tr>
                {report.expenseByCategory?.length === 0 ? (
                  <tr>
                    <td className="p-2.5 pl-6 italic text-slate-400" colSpan={2}>No operating expenses logged in period</td>
                  </tr>
                ) : (
                  report.expenseByCategory?.map((cat: any) => (
                    <tr key={cat.category}>
                      <td className="p-2.5 pl-6 text-slate-600">{cat.category}</td>
                      <td className="p-2.5 text-right font-semibold">₹{cat.amount?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                )}
                <tr className="font-bold text-rose-700 border-t border-b bg-rose-50/40">
                  <td className="p-2.5">TOTAL OPERATING EXPENSES</td>
                  <td className="p-2.5 text-right font-extrabold">₹{report.totalExpenses?.toLocaleString('en-IN')}</td>
                </tr>

                {/* 4. NET PROFIT */}
                <tr className="font-black bg-slate-900 text-white text-sm">
                  <td className="p-3 uppercase">NET FINANCIAL RESULT (GROSS PROFIT - EXPENSES)</td>
                  <td className={`p-3 text-right ${report.isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {report.isProfit ? '+' : '-'} ₹{Math.abs(report.netProfit || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* GST Tax Compliance Table */}
          <div className="space-y-3 pt-2">
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-700 border-b pb-1">
              2. GST TAX COMPLIANCE SUMMARY (OUTPUT VS INPUT TAX CREDIT)
            </h3>

            <table className="w-full text-left text-xs border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-bold uppercase text-slate-700">
                  <th className="p-2.5">GST Tax Parameter</th>
                  <th className="p-2.5 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2.5 text-slate-600">Output GST Collected on Customer Sales</td>
                  <td className="p-2.5 text-right font-bold text-amber-700">₹{report.outputGstCollected?.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-slate-600">Input Tax Credit (ITC) Paid on Vendor Purchases</td>
                  <td className="p-2.5 text-right font-bold text-emerald-700">₹{report.inputGstCredit?.toLocaleString('en-IN')}</td>
                </tr>
                <tr className="font-black bg-amber-50 text-slate-900 border-t border-amber-200">
                  <td className="p-2.5">NET GST PAYABLE TO GOVERNMENT</td>
                  <td className="p-2.5 text-right text-amber-900 text-sm">₹{report.netGstPayable?.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Signoff */}
          <div className="mt-8 pt-4 border-t border-slate-300 flex justify-between items-end text-xs text-slate-500">
            <div>
              <p className="font-semibold text-slate-700">BeesHub Farmland Pvt Ltd | GSTIN: 33AAOCB0453D1Z3</p>
              <p className="text-[10px]">This is an official computer-generated financial report statement.</p>
            </div>
            <div className="text-right space-y-6">
              <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Authorized Financial Signatory</div>
              <div className="border-t border-slate-400 pt-1 text-[10px] italic">Signature & Company Seal</div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
