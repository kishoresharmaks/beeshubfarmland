import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { fulfillOrderAtomically } from '@/lib/inventory';
import { captureServerEvent, captureServerException } from '@/lib/posthog-server';
import { isAuthenticatedAdmin, unauthenticatedResponse } from '@/lib/authCheck';

export async function GET(request: Request) {
  try {
    if (!isAuthenticatedAdmin(request)) {
      return unauthenticatedResponse();
    }
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

    // Authoritative Server-Side Calculation of Prices & Totals
    let subtotal = 0;
    let totalGst = 0;
    const validatedItems: any[] = [];

    for (const item of items) {
      const productId = item.productId;
      if (!productId) continue;

      const product = await Product.findById(productId).lean();
      if (!product) continue;

      const requestedQty = Math.max(1, Number(item.quantity) || 1);
      const variantName = item.variantName?.trim() || '';

      let unitPrice = Number(product.price) || 0;
      if (variantName && Array.isArray(product.variants) && product.variants.length > 0) {
        const matchingVariant = product.variants.find(
          (v: any) => v.name?.trim().toLowerCase() === variantName.toLowerCase()
        );
        if (matchingVariant && matchingVariant.price !== undefined && matchingVariant.price !== null) {
          unitPrice = Number(matchingVariant.price);
        }
      }

      if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: `"${product.name}" requires an enquiry instead of direct online checkout.`,
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

    // Collision-Safe Sequential Order ID
    const timestampSuffix = Date.now().toString().slice(-6);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-${timestampSuffix}-${randomSuffix}`;

    const method = paymentMethod === 'COD' ? 'COD' : 'COD';

    // Create Initial Pending Order
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
      paymentMethod: method,
      paymentStatus: 'Pending',
      status: 'Pending',
      inventoryDeducted: false,
      inventoryConflict: false,
    });

    // Delegate stock decrements and party directory synchronization to unified inventory service
    const fulfillmentResult = await fulfillOrderAtomically({
      orderId,
      isCOD: true,
    });

    await captureServerEvent(
      request,
      'cod_order_placed',
      {
        order_id: orderId,
        item_count: validatedItems.length,
        total_amount: totalAmount,
        payment_method: method,
        conflict: fulfillmentResult.conflict,
      },
      `order:${String(newOrder._id)}`
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully',
        data: fulfillmentResult.order,
        conflict: fulfillmentResult.conflict,
      },
      { status: 201 }
    );
  } catch (error: any) {
    await captureServerException(request, error, 'cod-checkout');
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to place order' },
      { status: 500 }
    );
  }
}
