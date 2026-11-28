import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Settings from '@/models/Settings';
import { createRazorpayOrder, getRazorpayKeys, RazorpayConfigError } from '@/lib/razorpay';
import { captureServerEvent, captureServerException } from '@/lib/posthog-server';

export async function POST(request: NextRequest) {
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
    } = body;

    if (
      !customerName ||
      !customerPhone ||
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

    // 1. Check Store Settings: verify online payments are enabled
    const settings = await Settings.findOne({ key: 'global' }).lean();
    const isOnlinePaymentEnabled =
      settings?.enableOnlinePayment ?? settings?.enableUPI ?? true;

    if (!isOnlinePaymentEnabled) {
      return NextResponse.json(
        {
          success: false,
          message: 'Online payment is currently disabled by store administration. Please choose Cash on Delivery.',
        },
        { status: 403 }
      );
    }

    // 2. Authoritative Server-Side Pricing & Inventory Pre-check
    let subtotal = 0;
    let totalGst = 0;
    const validatedItems: any[] = [];

    for (const item of items) {
      const productId = item.productId;
      if (!productId) {
        return NextResponse.json(
          { success: false, message: 'Invalid item: missing product identifier.' },
          { status: 400 }
        );
      }

      const product = await Product.findById(productId).lean();
      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product not found for ID: ${productId}` },
          { status: 404 }
        );
      }

      const requestedQty = Math.max(1, Number(item.quantity) || 1);
      const variantName = item.variantName?.trim() || '';

      // Determine authoritative price and check stock
      let unitPrice = Number(product.price) || 0;
      let availableStock = Number(product.quantity) || 0;

      if (variantName && Array.isArray(product.variants) && product.variants.length > 0) {
        const matchingVariant = product.variants.find(
          (v: any) => v.name?.trim().toLowerCase() === variantName.toLowerCase()
        );

        if (!matchingVariant) {
          return NextResponse.json(
            { success: false, message: `Selected variant "${variantName}" not found for product "${product.name}".` },
            { status: 400 }
          );
        }

        unitPrice =
          matchingVariant.price !== undefined && matchingVariant.price !== null
            ? Number(matchingVariant.price)
            : unitPrice;
        availableStock = Number(matchingVariant.quantity) || 0;
      }

      if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: `"${product.name}" requires an enquiry instead of online checkout.`,
          },
          { status: 400 }
        );
      }

      if (availableStock < requestedQty) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient stock for "${product.name}"${variantName ? ` (${variantName})` : ''}. Available: ${availableStock}, Requested: ${requestedQty}.`,
          },
          { status: 400 }
        );
      }

      const gstRate = product.gst !== undefined ? Number(product.gst) : 0;
      const itemSubtotal = unitPrice * requestedQty;
      const itemGst = (itemSubtotal * gstRate) / 100;

      subtotal += itemSubtotal;
      totalGst += itemGst;

      validatedItems.push({
        productId: String(product._id),
        name: product.name,
        variantName: variantName,
        price: unitPrice,
        quantity: requestedQty,
        gst: gstRate,
        image: product.image || item.image || '',
      });
    }

    subtotal = Math.round(subtotal);
    totalGst = Math.round(totalGst);
    const totalAmount = subtotal + totalGst;

    if (totalAmount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid order amount.' },
        { status: 400 }
      );
    }

    // 3. Collision-Resistant Sequential Order ID
    const timestampSuffix = Date.now().toString().slice(-6);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-${timestampSuffix}-${randomSuffix}`;

    // 4. Create Gateway Order with Razorpay
    const { keyId } = getRazorpayKeys();
    const rzpOrder = await createRazorpayOrder({
      amountInINR: totalAmount,
      receipt: orderId,
      notes: {
        orderId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
      },
    });

    // 5. Persist Pending Order in Database (Inventory is NOT yet decremented)
    const newOrder = await Order.create({
      orderId,
      orderType: 'ONLINE',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail?.trim() || '',
      shippingAddress: shippingAddress.trim(),
      pincode: pincode.trim(),
      items: validatedItems,
      subtotal,
      totalGst,
      totalAmount,
      paymentMethod: 'RAZORPAY',
      paymentStatus: 'Pending',
      status: 'Pending',
      razorpayOrderId: rzpOrder.id,
      inventoryDeducted: false,
      inventoryConflict: false,
    });

    // 6. PostHog Telemetry Tracking
    await captureServerEvent(
      request,
      'razorpay_order_created',
      {
        orderId,
        razorpayOrderId: rzpOrder.id,
        amount: totalAmount,
        itemCount: validatedItems.length,
      },
      `order:${String(newOrder._id)}`
    );

    return NextResponse.json({
      success: true,
      orderId,
      razorpayOrderId: rzpOrder.id,
      amount: totalAmount,
      amountInPaise: rzpOrder.amount,
      currency: 'INR',
      keyId,
    });
  } catch (error: any) {
    console.error('Error in /api/orders/razorpay/create:', error);
    const isConfigError = error instanceof RazorpayConfigError;
    await captureServerException(request, error, 'razorpay-order-create', {
      route: '/api/orders/razorpay/create',
      razorpay_http_status: isConfigError ? error.httpStatus : undefined,
    });

    if (isConfigError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Online payment is temporarily unavailable. Please choose Cash on Delivery or try again later.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || 'Failed to initiate online payment order.' },
      { status: 500 }
    );
  }
}
