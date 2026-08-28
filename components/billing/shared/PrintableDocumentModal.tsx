'use client';

import React, { useState } from 'react';
import { X, Printer, Share2, Check } from 'lucide-react';

interface PrintableDocumentModalProps {
  document: any;
  onClose: () => void;
}

export default function PrintableDocumentModal({
  document: doc,
  onClose,
}: PrintableDocumentModalProps) {
  const [printMode, setPrintMode] = useState<'A4' | 'THERMAL'>('A4');
  const [isCopied, setIsCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const getWhatsappText = () => {
    let msg = `*BEES HUB FARMLAND PVT LTD*\n`;
    msg += `Document: *${doc.docType.replace('_', ' ')}*\n`;
    msg += `Doc No: *${doc.docNumber}*\n`;
    msg += `Date: ${new Date(doc.createdAt).toLocaleDateString('en-IN')}\n`;
    msg += `Party: ${doc.customerName || doc.vendorName}\n`;
    msg += `--------------------------------\n`;
    doc.items?.forEach((i: any, idx: number) => {
      msg += `${idx + 1}. ${i.name} ${i.variantName ? `(${i.variantName})` : ''} x ${i.quantity} = ₹${i.lineTotal}\n`;
    });
    msg += `--------------------------------\n`;
    msg += `Subtotal: ₹${doc.subtotal}\n`;
    msg += `GST: ₹${doc.totalGst}\n`;
    msg += `*Grand Total: ₹${doc.grandTotal}*\n`;
    msg += `Balance Due: ₹${doc.balanceAmount}\n`;
    msg += `Payment Status: ${doc.paymentStatus}\n`;
    msg += `Thank you for doing business with BeesHub Farmland! 🐝🌾`;
    return encodeURIComponent(msg);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-5 border border-[#E8EDF2] shadow-2xl relative my-8">
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between border-b border-[#E8EDF2] pb-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ED3500]/10 text-[#ED3500] flex items-center justify-center font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#163B5C]">
                {doc.docType.replace('_', ' ')} — {doc.docNumber}
              </h3>
              <p className="text-xs text-[#64748B]">Preview, Print A4/Thermal Receipt or Share WhatsApp</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPrintMode(printMode === 'A4' ? 'THERMAL' : 'A4')}
              className="px-3 py-1.5 rounded-xl border border-[#E8EDF2] text-xs font-bold text-[#163B5C] hover:bg-gray-50"
            >
              Mode: {printMode === 'A4' ? '📄 A4 Format' : '🧾 Thermal 80mm'}
            </button>
            <a
              href={`https://wa.me/91${doc.customerPhone || doc.vendorPhone}?text=${getWhatsappText()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" /> WhatsApp
            </a>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-[#ED3500] hover:bg-[#D02E00] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#ED3500]/20"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-[#64748B]">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className={`p-6 bg-white border rounded-2xl ${printMode === 'THERMAL' ? 'max-w-md mx-auto text-xs font-mono' : 'text-sm'}`}>
          <div className="text-center border-b border-gray-200 pb-4 space-y-1">
            <h2 className="font-black text-lg text-[#163B5C]">BEES HUB FARMLAND PVT LTD</h2>
            <p className="text-xs text-gray-500">Pure Organic Honey, Spices & Natural Farm Produce</p>
            <p className="text-xs font-semibold text-gray-700">Phone: +91 95787 84431 | GSTIN: 33AAAAA0000A1Z5</p>
          </div>

          {/* Doc Details */}
          <div className="py-4 border-b border-gray-200 flex justify-between gap-4 text-xs">
            <div>
              <span className="font-extrabold uppercase text-[#ED3500] block mb-1">
                {doc.docType.replace('_', ' ')}
              </span>
              <p><strong>Doc No:</strong> {doc.docNumber}</p>
              <p><strong>Date:</strong> {new Date(doc.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
            <div className="text-right">
              <span className="font-bold text-gray-700 block mb-1">Billed To:</span>
              <p className="font-extrabold text-[#163B5C]">{doc.customerName || doc.vendorName}</p>
              <p>Phone: {doc.customerPhone || doc.vendorPhone}</p>
              {doc.billingAddress && <p className="text-[11px] text-gray-500">{doc.billingAddress}</p>}
            </div>
          </div>

          {/* Items Table */}
          <div className="py-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 font-bold uppercase">
                  <th className="py-2">Item</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {doc.items?.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-2">
                      <span className="font-bold text-[#163B5C]">{item.name}</span>
                      {item.variantName && (
                        <span className="block text-[10px] text-gray-500">({item.variantName})</span>
                      )}
                    </td>
                    <td className="py-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-right">₹{item.price || item.purchasePrice}</td>
                    <td className="py-2 text-right font-bold">₹{item.lineTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 pt-3 space-y-1.5 text-xs text-right">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal:</span>
              <span className="font-bold">₹{doc.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">GST Tax:</span>
              <span className="font-bold">₹{doc.totalGst}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-[#ED3500] pt-1 border-t">
              <span>Grand Total:</span>
              <span>₹{doc.grandTotal}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Paid Amount:</span>
              <span>₹{doc.paidAmount}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-rose-600">
              <span>Balance Due:</span>
              <span>₹{doc.balanceAmount}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-dashed border-gray-300 text-center text-[10px] text-gray-400">
            This is a computer-generated tax invoice from BeesHub Farmland Billing System.
          </div>
        </div>
      </div>
    </div>
  );
}
