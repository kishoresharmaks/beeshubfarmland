import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import WholesaleLead from '@/models/WholesaleLead';

// In-memory rate limiter: IP -> timestamps array
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(ip, validTimestamps);
    return true;
  }
  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return false;
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown-ip';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, message: 'Too many submissions. Please wait 15 minutes before submitting again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      inquiryType = 'B2B',
      companyName,
      contactPerson,
      phone,
      email,
      gstin,
      city,
      pincode,
      items,
      orderType,
      notes,
      website_url, // Honeypot field
    } = body;

    const isGeneralEnquiry = inquiryType === 'GENERAL';

    // Honeypot check: If bot filled website_url, silently discard and return success
    if (website_url && typeof website_url === 'string' && website_url.trim().length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Wholesale quotation request received. Our trade desk will contact you within 24 hours.',
        id: 'discarded_bot_lead',
      });
    }

    const effectiveCompanyName = companyName?.trim() || (isGeneralEnquiry ? contactPerson?.trim() || 'Individual' : '');
    const effectiveContactPerson = contactPerson?.trim() || '';
    const effectiveCity = city?.trim() || (isGeneralEnquiry ? 'Direct Inquiry' : '');
    const effectivePincode = pincode?.trim() || (isGeneralEnquiry ? '000000' : '');

    if (!effectiveCompanyName) {
      return NextResponse.json({ success: false, message: 'Company or Business name is required' }, { status: 400 });
    }
    if (!effectiveContactPerson) {
      return NextResponse.json({ success: false, message: 'Contact person name is required' }, { status: 400 });
    }
    if (!effectiveCity) {
      return NextResponse.json({ success: false, message: 'City is required' }, { status: 400 });
    }
    if (!effectivePincode) {
      return NextResponse.json({ success: false, message: 'Pincode is required' }, { status: 400 });
    }

    // Phone Pre-Sanitization
    let sanitizedPhone = (phone || '').toString().replace(/\D/g, '');
    if (sanitizedPhone.length > 10 && sanitizedPhone.startsWith('91')) {
      sanitizedPhone = sanitizedPhone.slice(2);
    } else if (sanitizedPhone.length > 10 && sanitizedPhone.startsWith('0')) {
      sanitizedPhone = sanitizedPhone.slice(1);
    }

    const indianPhoneRegex = /^[6-9]\d{9}$/;
    if (!indianPhoneRegex.test(sanitizedPhone)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 10-digit Indian mobile number' },
        { status: 400 }
      );
    }

    // Validate Items (compulsory for B2B, optional for General Enquiry)
    let validItems: any[] = [];
    if (Array.isArray(items) && items.length > 0) {
      validItems = items
        .filter((item) => item && item.productName && Number(item.quantity) > 0)
        .map((item) => ({
          productId: item.productId || '',
          productName: String(item.productName).trim(),
          quantity: Math.max(1, Number(item.quantity)),
          unit: ['KG', 'LITRE', 'CASES', 'PIECES'].includes(item.unit) ? item.unit : 'KG',
          targetPrice: item.targetPrice ? Number(item.targetPrice) : undefined,
        }));
    }

    if (validItems.length === 0) {
      if (isGeneralEnquiry) {
        validItems = [
          {
            productId: '',
            productName: 'General Enquiry / Customer Support',
            quantity: 1,
            unit: 'PIECES',
          },
        ];
      } else {
        return NextResponse.json(
          { success: false, message: 'At least one product with quantity must be selected for B2B quotations' },
          { status: 400 }
        );
      }
    }

    await connectToDatabase();

    const leadNotes = isGeneralEnquiry && !String(notes || '').startsWith('[General Enquiry]')
      ? `[General Enquiry] ${notes ? String(notes).trim() : ''}`.trim()
      : notes ? String(notes).trim() : '';

    const newLead = await WholesaleLead.create({
      companyName: effectiveCompanyName,
      contactPerson: effectiveContactPerson,
      phone: sanitizedPhone,
      email: email ? String(email).trim().toLowerCase() : '',
      gstin: gstin ? String(gstin).trim().toUpperCase() : '',
      city: effectiveCity,
      pincode: effectivePincode,
      items: validItems,
      orderType: ['ONE_TIME', 'MONTHLY_RECURRING', 'CONTRACT_FARMING'].includes(orderType)
        ? orderType
        : 'ONE_TIME',
      notes: leadNotes,
      status: 'NEW',
      ipAddress: ip,
    });

    return NextResponse.json({
      success: true,
      message: 'Wholesale quotation request received. Our trade desk will contact you within 24 hours.',
      id: newLead._id,
    });
  } catch (error: any) {
    console.error('Wholesale lead submission error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error while processing quotation request' },
      { status: 500 }
    );
  }
}
