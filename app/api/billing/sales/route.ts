import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import SaleDocument from '@/models/SaleDocument';
import Product from '@/models/Product';
import Party from '@/models/Party';
import Order from '@/models/Order';
import { generateDocPrefix, formatDocNumber } from '@/lib/billingUtils';
import { isAuthenticatedAdmin, unauthenticatedResponse } from '@/lib/authCheck';

export async function GET(req: NextRequest) {
  if (!isAuthenticatedAdmin(req)) return unauthenticatedResponse();
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const docType = searchParams.get('docType');

    const filter: any = {};
    if (docType) filter.docType = docType;

    const docs = await SaleDocument.find(filter).sort({ createdAt: -1 }).lean();

    // If querying SALE_INVOICE, automatically include POS Counter & Online Storefront orders
    if (!docType || docType === 'SALE_INVOICE') {
      const orders = await Order.find({ status: { $ne: 'Cancelled' } })
        .sort({ createdAt: -1 })
        .lean();

      const mappedDocs = docs.map((d: any) => ({
        ...d,
        status: d.status === 'Converted' ? 'Converted' : d.paymentStatus === 'Paid' ? 'Completed' : 'Active',
      }));

      const mappedOrders = orders.map((ord: any) => ({
        _id: String(ord._id),
        docType: 'SALE_INVOICE',
        docNumber: ord.invoiceNumber || ord.orderNumber || `BH-POS-${String(ord._id).slice(-6).toUpperCase()}`,
        customerName: ord.customerName || ord.shippingAddress?.fullName || 'Walk-in Guest',
        customerPhone: ord.customerPhone || ord.shippingAddress?.phone || '0000000000',
        customerEmail: ord.customerEmail || '',
        items: ord.items || [],
        subtotal: ord.subtotal || ord.totalAmount,
        totalGst: ord.totalGst || 0,
        grandTotal: ord.totalAmount,
        paidAmount: ord.paymentStatus === 'Paid' ? ord.totalAmount : ord.cashReceived || 0,
        balanceAmount: ord.paymentStatus === 'Paid' ? 0 : Math.max(0, ord.totalAmount - (ord.cashReceived || 0)),
        paymentMethod: ord.paymentMethod || 'CASH',
        paymentStatus: ord.paymentStatus || 'Paid',
        status: 'Completed',
        orderSource: ord.orderType || 'ONLINE',
        createdAt: ord.createdAt,
      }));

      const combined = [...mappedDocs, ...mappedOrders].sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return NextResponse.json({ success: true, data: combined });
    }

    // If querying SALE_ORDER, automatically include active/pending online customer orders
    if (docType === 'SALE_ORDER') {
      const saleOrders = await Order.find({
        orderType: { $ne: 'POS' },
        status: { $ne: 'Cancelled' },
      })
        .sort({ createdAt: -1 })
        .lean();

      const mappedSaleOrders = saleOrders.map((ord: any) => ({
        _id: String(ord._id),
        docType: 'SALE_ORDER',
        docNumber: ord.orderNumber || ord.invoiceNumber || `BH-ORD-${String(ord._id).slice(-6).toUpperCase()}`,
        customerName: ord.customerName || ord.shippingAddress?.fullName || 'Online Customer',
        customerPhone: ord.customerPhone || ord.shippingAddress?.phone || '0000000000',
        customerEmail: ord.customerEmail || '',
        items: ord.items || [],
        subtotal: ord.subtotal || ord.totalAmount,
        totalGst: ord.totalGst || 0,
        grandTotal: ord.totalAmount,
        paidAmount: ord.paymentStatus === 'Paid' ? ord.totalAmount : 0,
        balanceAmount: ord.paymentStatus === 'Paid' ? 0 : ord.totalAmount,
        paymentMethod: ord.paymentMethod || 'COD',
        paymentStatus: ord.paymentStatus || 'Pending',
        status: ord.status || 'Active',
        orderSource: ord.orderType || 'ONLINE',
        createdAt: ord.createdAt,
      }));

      const combined = [...docs, ...mappedSaleOrders].sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return NextResponse.json({ success: true, data: combined });
    }

    return NextResponse.json({ success: true, data: docs });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthenticatedAdmin(req)) return unauthenticatedResponse();
  try {
    await connectToDatabase();
    const body = await req.json();

    const { docType, customerName, customerPhone, items, paidAmount = 0 } = body;
    if (!docType || !customerName || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid payload. Items and Customer details required.' },
        { status: 400 }
      );
    }

    // 1. Generate unique Document Number
    const prefix = generateDocPrefix(docType);
    const count = await SaleDocument.countDocuments({ docType });
    const docNumber = formatDocNumber(prefix, count);

    // 2. Perform Stock Adjustments
    if (docType === 'SALE_INVOICE') {
      for (const item of items) {
        if (item.variantName) {
          const res = await Product.updateOne(
            { _id: item.productId, 'variants.name': item.variantName },
            { $inc: { 'variants.$.quantity': -item.quantity, stock: -item.quantity } }
          );
          if (res.modifiedCount === 0) {
            await Product.updateOne(
              { _id: item.productId },
              { $inc: { stock: -item.quantity } }
            );
          }
        } else {
          await Product.updateOne(
            { _id: item.productId },
            { $inc: { stock: -item.quantity } }
          );
        }
      }
    } else if (docType === 'SALE_RETURN') {
      // Add stock back
      for (const item of items) {
        if (item.variantName) {
          await Product.updateOne(
            { _id: item.productId, 'variants.name': item.variantName },
            { $inc: { 'variants.$.quantity': item.quantity, stock: item.quantity } }
          );
        } else {
          await Product.updateOne(
            { _id: item.productId },
            { $inc: { stock: item.quantity } }
          );
        }
      }
    }

    // 3. Compute Totals
    const subtotal = items.reduce((s: number, i: any) => s + (i.lineSubtotal || i.price * i.quantity), 0);
    const totalGst = items.reduce((s: number, i: any) => s + (i.lineGst || 0), 0);
    const grandTotal = items.reduce((s: number, i: any) => s + (i.lineTotal || i.price * i.quantity), 0);
    const balanceAmount = Math.max(0, grandTotal - paidAmount);
    const paymentStatus = paidAmount >= grandTotal ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Pending';

    // 4. Create Document
    const newDoc = await SaleDocument.create({
      docType,
      docNumber,
      partyId: body.partyId || '',
      customerName,
      customerPhone,
      customerEmail: body.customerEmail || '',
      billingAddress: body.billingAddress || '',
      items,
      subtotal,
      totalGst,
      grandTotal,
      paidAmount,
      balanceAmount,
      paymentMethod: body.paymentMethod || 'CASH',
      paymentStatus,
      status: 'Active',
      notes: body.notes || '',
    });

    // 5. Update Party Balance if partyId provided
    if (body.partyId) {
      const balanceChange = docType === 'SALE_RETURN' ? -grandTotal : balanceAmount;
      await Party.findByIdAndUpdate(body.partyId, { $inc: { currentBalance: balanceChange } });
    }

    return NextResponse.json({ success: true, data: newDoc }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!isAuthenticatedAdmin(req)) return unauthenticatedResponse();
  try {
    await connectToDatabase();
    const body = await req.json();
    const { action, docId } = body;

    if (action === 'convert_to_invoice' && docId) {
      const sourceDoc = await SaleDocument.findById(docId);
      if (!sourceDoc) {
        return NextResponse.json({ success: false, message: 'Source document not found.' }, { status: 404 });
      }

      // Create new SALE_INVOICE from Quotation/Proforma
      const prefix = generateDocPrefix('SALE_INVOICE');
      const count = await SaleDocument.countDocuments({ docType: 'SALE_INVOICE' });
      const invoiceNumber = formatDocNumber(prefix, count);

      // Deduct stock for new invoice
      for (const item of sourceDoc.items) {
        if (item.variantName) {
          await Product.updateOne(
            { _id: item.productId, 'variants.name': item.variantName },
            { $inc: { 'variants.$.quantity': -item.quantity, stock: -item.quantity } }
          );
        } else {
          await Product.updateOne(
            { _id: item.productId },
            { $inc: { stock: -item.quantity } }
          );
        }
      }

      const advancePaid = sourceDoc.paidAmount || 0;
      const remainingBalance = Math.max(0, sourceDoc.grandTotal - advancePaid);
      const convertedPaymentStatus =
        advancePaid >= sourceDoc.grandTotal ? 'Paid' : advancePaid > 0 ? 'Partial' : 'Pending';

      const invoiceDoc = await SaleDocument.create({
        docType: 'SALE_INVOICE',
        docNumber: invoiceNumber,
        partyId: sourceDoc.partyId,
        customerName: sourceDoc.customerName,
        customerPhone: sourceDoc.customerPhone,
        customerEmail: sourceDoc.customerEmail,
        billingAddress: sourceDoc.billingAddress,
        items: sourceDoc.items,
        subtotal: sourceDoc.subtotal,
        totalGst: sourceDoc.totalGst,
        grandTotal: sourceDoc.grandTotal,
        paidAmount: advancePaid,
        balanceAmount: remainingBalance,
        paymentStatus: convertedPaymentStatus,
        status: advancePaid >= sourceDoc.grandTotal ? 'Completed' : 'Active',
        notes: `Converted from ${sourceDoc.docType} #${sourceDoc.docNumber}`,
      });

      // Mark source doc as Converted, clear balance and set paymentStatus to Paid
      sourceDoc.status = 'Converted';
      sourceDoc.convertedToDocId = String(invoiceDoc._id);
      sourceDoc.balanceAmount = 0;
      sourceDoc.paymentStatus = 'Paid';
      await sourceDoc.save();

      return NextResponse.json({ success: true, data: invoiceDoc });
    }

    return NextResponse.json({ success: false, message: 'Invalid action.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
