import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import { checkRateLimit, recordFailedAttempt, getClientIp } from '@/lib/rateLimit';

// Escape regex characters to prevent regex-injection / wildcard enumeration
function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export async function GET(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateLimitKey = `order-track:${clientIp}`;

    // Rate limit order tracking lookups to prevent brute force harvesting
    const limitStatus = checkRateLimit(rateLimitKey, {
      maxAttempts: 20,
      windowMs: 15 * 60 * 1000,
      lockoutMs: 15 * 60 * 1000,
    });

    if (!limitStatus.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many tracking requests. Please try again later.',
        },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query || query.trim().length < 4) {
      recordFailedAttempt(rateLimitKey);
      return NextResponse.json(
        { success: false, message: 'Valid phone number, email, or order ID is required to track order.' },
        { status: 400 }
      );
    }

    const cleanQuery = query.trim();
    const safeRegex = new RegExp(escapeRegex(cleanQuery), 'i');

    await connectToDatabase();

    const orders = await Order.find({
      $or: [
        { customerPhone: safeRegex },
        { customerEmail: safeRegex },
        { orderId: safeRegex },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Data-Minimization: Strip all customer PII from public tracking responses.
    // Never expose customer names, phone numbers, email addresses, street addresses, or pincodes.
    const sanitizedOrders = orders.map((order: any) => ({
      _id: String(order._id),
      orderId: order.orderId,
      status: order.status,
      createdAt: order.createdAt,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      items: Array.isArray(order.items)
        ? order.items.map((item: any) => ({
            name: item.name,
            variantName: item.variantName,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          }))
        : [],
    }));

    return NextResponse.json({
      success: true,
      count: sanitizedOrders.length,
      data: sanitizedOrders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to track order' },
      { status: 500 }
    );
  }
}
