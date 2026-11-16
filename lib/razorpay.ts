import crypto from 'crypto';

export interface IRazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status: string;
}

export function getRazorpayKeys() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId) {
    throw new Error('Missing required environment variable: RAZORPAY_KEY_ID or NEXT_PUBLIC_RAZORPAY_KEY_ID');
  }
  if (!keySecret) {
    throw new Error('Missing required environment variable: RAZORPAY_KEY_SECRET');
  }

  return { keyId, keySecret };
}

/**
 * Creates a Razorpay Order using Razorpay REST API
 */
export async function createRazorpayOrder(options: {
  amountInINR: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<IRazorpayOrderResponse> {
  const { keyId, keySecret } = getRazorpayKeys();
  const amountInPaise = Math.round(options.amountInINR * 100);

  const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: 'INR',
      receipt: options.receipt,
      payment_capture: 1,
      notes: options.notes || {},
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(
      errData.error?.description || `Razorpay order creation failed with status ${response.status}`
    );
  }

  const orderData = await response.json();
  return {
    id: orderData.id,
    amount: orderData.amount,
    currency: orderData.currency,
    receipt: orderData.receipt,
    status: orderData.status,
  };
}

/**
 * Verifies Razorpay payment signature from client checkout.
 * Digested text is: `${razorpayOrderId}|${razorpayPaymentId}`
 */
export function verifyRazorpayPaymentSignature(options: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const { keySecret } = getRazorpayKeys();
  if (!options.razorpayOrderId || !options.razorpayPaymentId || !options.razorpaySignature) {
    return false;
  }

  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${options.razorpayOrderId}|${options.razorpayPaymentId}`)
    .digest('hex');

  const received = Buffer.from(options.razorpaySignature, 'utf8');
  const expected = Buffer.from(generatedSignature, 'utf8');

  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}

/**
 * Verifies Razorpay Webhook signature against raw request text body
 */
export function verifyRazorpayWebhookSignature(options: {
  rawBody: string;
  signature: string;
}): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
  if (!webhookSecret) {
    throw new Error('Missing RAZORPAY_WEBHOOK_SECRET or RAZORPAY_KEY_SECRET for webhook verification');
  }

  if (!options.rawBody || !options.signature) {
    return false;
  }

  const generatedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(options.rawBody)
    .digest('hex');

  const received = Buffer.from(options.signature, 'utf8');
  const expected = Buffer.from(generatedSignature, 'utf8');

  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}
