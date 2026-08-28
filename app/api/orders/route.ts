import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Party from '@/models/Party';

export async function GET() {
  try {
    await connectToDatabase();
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: orders.length, data: orders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const {
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      pincode,
      items,
      paymentMethod,
      transactionId,
    } = body;

    if (
      !customerName ||
      !customerPhone ||
      !customerEmail ||
      !shippingAddress ||
      !pincode ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: 'Customer details and at least one order item are required.' },
        { status: 400 }
      );
    }

    // Precise GST & Subtotal Calculation
    let subtotal = 0;
    let totalGst = 0;

    for (const item of items) {
      const itemPrice = Number(item.price) || 0;
      const itemQty = Number(item.quantity) || 1;
      const itemGstRate = item.gst !== undefined ? Number(item.gst) : 0;

      const itemSubtotal = itemPrice * itemQty;
      const itemGstAmount = (itemSubtotal * itemGstRate) / 100;

      subtotal += itemSubtotal;
      totalGst += itemGstAmount;

      // Decrement product inventory if product exists
      if (item.productId) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { quantity: -itemQty },
        });
      }
    }

    subtotal = Math.round(subtotal);
    totalGst = Math.round(totalGst);
    const totalAmount = subtotal + totalGst;

    // Generate strictly sequential order ID starting from ORD-1001
    const orderCount = await Order.countDocuments();
    const nextSeqNumber = 1001 + orderCount;
    const orderId = `ORD-${nextSeqNumber}`;

    const method = paymentMethod === 'UPI' ? 'UPI' : 'COD';
    // Online UPI & COD orders start as 'Pending' until manually verified by Admin
    const pStatus = 'Pending';

    const newOrder = await Order.create({
      orderId,
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      pincode,
      items,
      subtotal,
      totalGst,
      totalAmount,
      paymentMethod: method,
      paymentStatus: pStatus,
      transactionId: transactionId || '',
      status: 'Pending',
    });

    // Auto-sync Customer into Party Directory for billing & accounting
    if (customerPhone && customerPhone !== '0000000000') {
      try {
        await Party.findOneAndUpdate(
          { phone: customerPhone.trim() },
          {
            $setOnInsert: { partyType: 'CUSTOMER', openingBalance: 0, currentBalance: 0 },
            $set: {
              name: customerName.trim(),
              phone: customerPhone.trim(),
              email: customerEmail.trim(),
              address: `${shippingAddress}, ${pincode}`,
            },
          },
          { upsert: true, new: true }
        );
      } catch (partyErr) {
        console.error('Failed to sync party', partyErr);
      }
    }

    return NextResponse.json(
      { success: true, message: 'Order created successfully', data: newOrder },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to place order' },
      { status: 500 }
    );
  }
}
