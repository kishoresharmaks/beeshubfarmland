import crypto from 'crypto';

export interface IRazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status: string;
}

/**
 * Server-side Razorpay credentials are missing or rejected by the gateway.
 * The message is for operators only; do not show it to customers.
 */
export class RazorpayConfigError extends Error {
  constructor(message: string, public readonly httpStatus?: number) {
    super(message);
    this.name = 'RazorpayConfigError';
  }
}

export function getRazorpayKeys() {
  let keyId = process.env.RAZORPAY_KEY_ID;
  let keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId) {
    throw new RazorpayConfigError('Missing required environment variable: RAZORPAY_KEY_ID');
  }
  if (!keySecret) {
    throw new RazorpayConfigError('Missing required environment variable: RAZORPAY_KEY_SECRET');
  }

  // Strip accidental leading/trailing quotes or whitespace from environment variables
  keyId = keyId.trim().replace(/^['"]|['"]$/g, '');
  keySecret = keySecret.trim().replace(/^['"]|['"]$/g, '');

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
    const description = errData.error?.description || `Razorpay order creation failed with status ${response.status}`;
    
    console.error(`Razorpay order creation failed [HTTP ${response.status}]:`, {
      code: errData.error?.code,
      description: errData.error?.description,
      keyPrefix: keyId ? `${keyId.substring(0, 8)}... (len: ${keyId.length})` : 'none',
      hasSecret: !!keySecret,
      secretLength: keySecret ? keySecret.length : 0,
    });

    if (response.status === 401) {
      throw new RazorpayConfigError(
        'Authentication failed with Razorpay: Invalid Key ID or Key Secret. Verify that RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your server .env match the same mode (test vs live) and are active in Razorpay Dashboard.',
        response.status
      );
    }

    throw new Error(description);
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
  let webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
  if (!webhookSecret) {
    throw new Error('Missing RAZORPAY_WEBHOOK_SECRET or RAZORPAY_KEY_SECRET for webhook verification');
  }

  webhookSecret = webhookSecret.trim().replace(/^['"]|['"]$/g, '');

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
