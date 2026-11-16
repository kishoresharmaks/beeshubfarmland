import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { verifyRazorpayPaymentSignature } from '@/lib/razorpay';
import { fulfillOrderAtomically } from '@/lib/inventory';
import { captureServerEvent, captureServerException } from '@/lib/posthog-server';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required verification tokens (razorpayOrderId, razorpayPaymentId, razorpaySignature).',
        },
        { status: 400 }
      );
    }

    // 1. Cryptographic HMAC SHA-256 Signature Verification
    const isSignatureValid = verifyRazorpayPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isSignatureValid) {
      return NextResponse.json(
        { success: false, message: 'Cryptographic signature verification failed. Untrusted payment payload.' },
        { status: 400 }
      );
    }

    // 2. Atomic Order Fulfillment & Stock Deduction
    const fulfillmentResult = await fulfillOrderAtomically({
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      isCOD: false,
    });

    // 3. PostHog Event Tracking
    await captureServerEvent(
      request,
      'razorpay_payment_verified',
      {
        orderId: fulfillmentResult.order.orderId,
        razorpayOrderId,
        razorpayPaymentId,
        conflict: fulfillmentResult.conflict,
        alreadyFulfilled: fulfillmentResult.alreadyFulfilled,
      },
      `order:${String(fulfillmentResult.order._id)}`
    );

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order confirmed successfully.',
      data: fulfillmentResult.order,
      alreadyFulfilled: fulfillmentResult.alreadyFulfilled,
      conflict: fulfillmentResult.conflict,
      conflictNotes: fulfillmentResult.conflictNotes,
    });
  } catch (error: any) {
    console.error('Error in /api/orders/razorpay/verify:', error);
    await captureServerException(request, error, 'razorpay-payment-verify');
    return NextResponse.json(
      { success: false, message: error.message || 'Payment verification failed.' },
      { status: 500 }
    );
  }
}
