import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import PurchaseDocument from '@/models/PurchaseDocument';
import Product from '@/models/Product';
import Party from '@/models/Party';
import { generateDocPrefix, formatDocNumber } from '@/lib/billingUtils';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const docType = searchParams.get('docType');

    const filter: any = {};
    if (docType) filter.docType = docType;

    const docs = await PurchaseDocument.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: docs });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const { docType, vendorName, vendorPhone, items, paidAmount = 0 } = body;
    if (!docType || !vendorName || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid payload. Items and Vendor details required.' },
        { status: 400 }
      );
    }

    // 1. Generate unique Document Number
    const prefix = generateDocPrefix(docType);
    const count = await PurchaseDocument.countDocuments({ docType });
    const docNumber = formatDocNumber(prefix, count);

    // 2. Perform Stock Adjustments
    if (docType === 'PURCHASE_BILL') {
      // Inward Stock: Add stock
      for (const item of items) {
        if (item.variantName) {
          const res = await Product.updateOne(
            { _id: item.productId, 'variants.name': item.variantName },
            { $inc: { 'variants.$.quantity': item.quantity, stock: item.quantity } }
          );
          if (res.modifiedCount === 0) {
            await Product.updateOne(
              { _id: item.productId },
              { $inc: { stock: item.quantity } }
            );
          }
        } else {
          await Product.updateOne(
            { _id: item.productId },
            { $inc: { stock: item.quantity } }
          );
        }
      }
    } else if (docType === 'PURCHASE_RETURN') {
      // Return to vendor: Deduct stock
      for (const item of items) {
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
    }

    // 3. Compute Totals
    const subtotal = items.reduce((s: number, i: any) => s + (i.lineSubtotal || i.purchasePrice * i.quantity), 0);
    const totalGst = items.reduce((s: number, i: any) => s + (i.lineGst || 0), 0);
    const grandTotal = items.reduce((s: number, i: any) => s + (i.lineTotal || i.purchasePrice * i.quantity), 0);
    const balanceAmount = Math.max(0, grandTotal - paidAmount);
    const paymentStatus = paidAmount >= grandTotal ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Pending';

    // 4. Create Purchase Document
    const newDoc = await PurchaseDocument.create({
      docType,
      docNumber,
      vendorId: body.vendorId || '',
      vendorName,
      vendorPhone,
      vendorGstin: body.vendorGstin || '',
      vendorAddress: body.vendorAddress || '',
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

    // 5. Update Vendor Balance if vendorId provided
    if (body.vendorId) {
      const balanceChange = docType === 'PURCHASE_RETURN' ? grandTotal : -balanceAmount;
      await Party.findByIdAndUpdate(body.vendorId, { $inc: { currentBalance: balanceChange } });
    }

    return NextResponse.json({ success: true, data: newDoc }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { action, docId } = body;

    if (action === 'convert_to_bill' && docId) {
      const poDoc = await PurchaseDocument.findById(docId);
      if (!poDoc) {
        return NextResponse.json({ success: false, message: 'PO document not found.' }, { status: 404 });
      }

      // Create new PURCHASE_BILL from PO
      const prefix = generateDocPrefix('PURCHASE_BILL');
      const count = await PurchaseDocument.countDocuments({ docType: 'PURCHASE_BILL' });
      const billNumber = formatDocNumber(prefix, count);

      // Add inward stock for new purchase bill
      for (const item of poDoc.items) {
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

      const billDoc = await PurchaseDocument.create({
        docType: 'PURCHASE_BILL',
        docNumber: billNumber,
        vendorId: poDoc.vendorId,
        vendorName: poDoc.vendorName,
        vendorPhone: poDoc.vendorPhone,
        vendorGstin: poDoc.vendorGstin,
        vendorAddress: poDoc.vendorAddress,
        items: poDoc.items,
        subtotal: poDoc.subtotal,
        totalGst: poDoc.totalGst,
        grandTotal: poDoc.grandTotal,
        paidAmount: 0,
        balanceAmount: poDoc.grandTotal,
        paymentStatus: 'Pending',
        status: 'Active',
        notes: `Converted from PO #${poDoc.docNumber}`,
      });

      // Mark PO as Converted
      poDoc.status = 'Converted';
      poDoc.convertedToDocId = String(billDoc._id);
      await poDoc.save();

      return NextResponse.json({ success: true, data: billDoc });
    }

    return NextResponse.json({ success: false, message: 'Invalid action.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
