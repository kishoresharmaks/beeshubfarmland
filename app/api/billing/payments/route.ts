import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import PaymentTransaction from '@/models/PaymentTransaction';
import SaleDocument from '@/models/SaleDocument';
import PurchaseDocument from '@/models/PurchaseDocument';
import Order from '@/models/Order';
import Party from '@/models/Party';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('paymentType');

    const filter: any = {};
    if (type) filter.paymentType = type;

    const txns = await PaymentTransaction.find(filter).sort({ createdAt: -1 }).lean();
    const existingDocNumbers = new Set(
      txns.map((t: any) => t.docNumber).filter((d: string) => Boolean(d))
    );

    if (!type || type === 'PAYMENT_IN') {
      // 1. Fetch POS Counter & Online Order payments (excluding already recorded docNumbers)
      const orderPayments = await Order.find({
        status: { $ne: 'Cancelled' },
        $or: [{ paymentStatus: 'Paid' }, { cashReceived: { $gt: 0 } }],
        invoiceNumber: { $nin: Array.from(existingDocNumbers) },
        orderNumber: { $nin: Array.from(existingDocNumbers) },
      })
        .sort({ createdAt: -1 })
        .lean();

      const mappedOrderPayments = orderPayments.map((ord: any) => ({
        _id: `ord_${ord._id}`,
        paymentType: 'PAYMENT_IN',
        partyName: ord.customerName || ord.shippingAddress?.fullName || 'Walk-in Guest',
        partyPhone: ord.customerPhone || ord.shippingAddress?.phone || '0000000000',
        amount: ord.paymentStatus === 'Paid' ? ord.totalAmount : ord.cashReceived || ord.totalAmount,
        paymentMode: ord.paymentMethod || 'CASH',
        referenceNo: ord.transactionId || ord.paymentMethod || 'DIRECT',
        docNumber: ord.invoiceNumber || ord.orderNumber || `BH-POS-${String(ord._id).slice(-6).toUpperCase()}`,
        notes: ord.orderType === 'POS' ? 'POS Counter Billing' : 'Online Customer Checkout',
        createdAt: ord.createdAt,
      }));

      // 2. Fetch Sale Document payments where paidAmount > 0 (excluding already recorded docNumbers)
      const saleDocPayments = await SaleDocument.find({
        docType: 'SALE_INVOICE',
        paidAmount: { $gt: 0 },
        docNumber: { $nin: Array.from(existingDocNumbers) },
      })
        .sort({ createdAt: -1 })
        .lean();

      const mappedSaleDocPayments = saleDocPayments.map((doc: any) => ({
        _id: `saledoc_${doc._id}`,
        paymentType: 'PAYMENT_IN',
        partyName: doc.customerName,
        partyPhone: doc.customerPhone,
        amount: doc.paidAmount,
        paymentMode: doc.paymentMethod || 'CASH',
        referenceNo: 'TAX_INVOICE_PAID',
        docNumber: doc.docNumber,
        notes: `Sale Invoice Payout (#${doc.docNumber})`,
        createdAt: doc.createdAt,
      }));

      const combinedIn = [...txns, ...mappedOrderPayments, ...mappedSaleDocPayments].sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return NextResponse.json({ success: true, data: combinedIn });
    }

    if (type === 'PAYMENT_OUT') {
      // Fetch Purchase Document payouts where paidAmount > 0 (excluding already recorded docNumbers)
      const purDocPayments = await PurchaseDocument.find({
        docType: 'PURCHASE_BILL',
        paidAmount: { $gt: 0 },
        docNumber: { $nin: Array.from(existingDocNumbers) },
      })
        .sort({ createdAt: -1 })
        .lean();

      const mappedPurDocPayments = purDocPayments.map((doc: any) => ({
        _id: `purdoc_${doc._id}`,
        paymentType: 'PAYMENT_OUT',
        partyName: doc.vendorName,
        partyPhone: doc.vendorPhone,
        amount: doc.paidAmount,
        paymentMode: doc.paymentMethod || 'CASH',
        referenceNo: 'SUPPLIER_BILL_PAID',
        docNumber: doc.docNumber,
        notes: `Vendor Purchase Bill Payout (#${doc.docNumber})`,
        createdAt: doc.createdAt,
      }));

      const combinedOut = [...txns, ...mappedPurDocPayments].sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return NextResponse.json({ success: true, data: combinedOut });
    }

    return NextResponse.json({ success: true, data: txns });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const { paymentType, partyName, partyPhone, amount, paymentMode, docId } = body;
    if (!paymentType || !partyName || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Payment type, party name, and valid amount required.' },
        { status: 400 }
      );
    }

    const txn = await PaymentTransaction.create({
      paymentType,
      partyId: body.partyId || '',
      partyName,
      partyPhone: partyPhone || '',
      amount: Number(amount),
      paymentMode: paymentMode || 'CASH',
      referenceNo: body.referenceNo || '',
      docId: docId || '',
      docNumber: body.docNumber || '',
      notes: body.notes || '',
    });

    // Update document balance if docId supplied
    if (docId) {
      if (paymentType === 'PAYMENT_IN') {
        const saleDoc = await SaleDocument.findById(docId);
        if (saleDoc) {
          saleDoc.paidAmount += Number(amount);
          saleDoc.balanceAmount = Math.max(0, saleDoc.grandTotal - saleDoc.paidAmount);
          saleDoc.paymentStatus =
            saleDoc.paidAmount >= saleDoc.grandTotal ? 'Paid' : 'Partial';
          await saleDoc.save();
        }
      } else if (paymentType === 'PAYMENT_OUT') {
        const purDoc = await PurchaseDocument.findById(docId);
        if (purDoc) {
          purDoc.paidAmount += Number(amount);
          purDoc.balanceAmount = Math.max(0, purDoc.grandTotal - purDoc.paidAmount);
          purDoc.paymentStatus =
            purDoc.paidAmount >= purDoc.grandTotal ? 'Paid' : 'Partial';
          await purDoc.save();
        }
      }
    }

    // Update party balance if partyId supplied
    if (body.partyId) {
      const balanceAdj = paymentType === 'PAYMENT_IN' ? -Number(amount) : Number(amount);
      await Party.findByIdAndUpdate(body.partyId, { $inc: { currentBalance: balanceAdj } });
    }

    return NextResponse.json({ success: true, data: txn }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
