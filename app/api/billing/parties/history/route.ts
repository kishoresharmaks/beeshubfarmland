import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import SaleDocument from '@/models/SaleDocument';
import { isAuthenticatedAdmin, unauthenticatedResponse } from '@/lib/authCheck';

export async function GET(req: NextRequest) {
  if (!isAuthenticatedAdmin(req)) return unauthenticatedResponse();
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    const partyId = searchParams.get('partyId');

    if (!phone && !partyId) {
      return NextResponse.json(
        { success: false, message: 'Phone or PartyId is required.' },
        { status: 400 }
      );
    }

    const orderQuery: any = {};
    const saleDocQuery: any = { status: 'Active' };

    if (phone) {
      orderQuery.customerPhone = phone;
      saleDocQuery.$or = [{ customerPhone: phone }];
      if (partyId) saleDocQuery.$or.push({ partyId });
    } else if (partyId) {
      saleDocQuery.partyId = partyId;
    }

    const [orders, saleDocs] = await Promise.all([
      Order.find(orderQuery).sort({ createdAt: -1 }).lean(),
      SaleDocument.find(saleDocQuery).sort({ createdAt: -1 }).lean(),
    ]);

    // Format all transactions into a unified customer purchase history list
    const transactions: any[] = [];

    for (const ord of orders) {
      transactions.push({
        id: ord._id,
        type: ord.orderType === 'POS' ? 'POS_SALE' : 'ONLINE_ORDER',
        docNumber: ord.invoiceNumber || ord.orderId,
        date: ord.createdAt,
        totalAmount: ord.totalAmount,
        paidAmount: ord.paymentStatus === 'Paid' ? ord.totalAmount : (ord.cashReceived || 0),
        balanceAmount: ord.paymentStatus === 'Paid' ? 0 : ord.totalAmount,
        paymentStatus: ord.paymentStatus,
        paymentMethod: ord.paymentMethod,
        items: ord.items || [],
        rawDoc: ord,
      });
    }

    for (const doc of saleDocs) {
      transactions.push({
        id: doc._id,
        type: doc.docType,
        docNumber: doc.docNumber,
        date: (doc as any).date || doc.createdAt,
        totalAmount: doc.grandTotal,
        paidAmount: doc.paidAmount,
        balanceAmount: doc.balanceAmount,
        paymentStatus: doc.paymentStatus,
        paymentMethod: doc.paymentMethod,
        items: doc.items || [],
        rawDoc: doc,
      });
    }

    // Sort all transactions by date descending
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
