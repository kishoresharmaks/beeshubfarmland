import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { verifyRazorpayWebhookSignature } from '@/lib/razorpay';
import { fulfillOrderAtomically } from '@/lib/inventory';
import { captureServerEvent, captureServerException } from '@/lib/posthog-server';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // 1. Next.js 14 Raw Body Extraction for HMAC Validation
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || '';

    if (!signature) {
      return NextResponse.json(
        { success: false, message: 'Missing x-razorpay-signature header' },
        { status: 400 }
      );
    }

    // 2. Cryptographic Webhook HMAC SHA-256 Signature Verification
    const isSignatureValid = verifyRazorpayWebhookSignature({
      rawBody,
      signature,
    });

    if (!isSignatureValid) {
      console.warn('Unauthorized webhook delivery attempt: invalid x-razorpay-signature.');
      return NextResponse.json(
        { success: false, message: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    // 3. Parse Verified Event Payload
    const eventData = JSON.parse(rawBody);
    const eventType = eventData.event;

    // We reconcile on both 'order.paid' and 'payment.captured'
    if (eventType === 'order.paid' || eventType === 'payment.captured') {
      const razorpayOrderId =
        eventData.payload?.order?.entity?.id ||
        eventData.payload?.payment?.entity?.order_id;
      const razorpayPaymentId = eventData.payload?.payment?.entity?.id || '';

      if (razorpayOrderId) {
        // Execute Idempotent Order Fulfillment
        const result = await fulfillOrderAtomically({
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature: 'WEBHOOK_VERIFIED',
          isCOD: false,
        });

        await captureServerEvent(
          request,
          'razorpay_webhook_reconciliation',
          {
            eventType,
            orderId: result.order.orderId,
            razorpayOrderId,
            alreadyFulfilled: result.alreadyFulfilled,
            conflict: result.conflict,
          },
          `order:${String(result.order._id)}`
        );
      }
    }

    // Acknowledge receipt within SLA to prevent gateway delivery retries
    return NextResponse.json({ status: 'ok', received: true });
  } catch (error: any) {
    console.error('Error handling Razorpay webhook:', error);
    await captureServerException(request, error, 'razorpay-webhook-handler');
    return NextResponse.json(
      { success: false, message: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
