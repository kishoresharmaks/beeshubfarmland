import { NextRequest, NextResponse } from 'next/server';
import { getConfiguredLicenseKey, getLicensingServerUrl } from '@/lib/licensing/licenseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      planId,
      utrNumber,
      payerName,
      payerUpiOrAccount,
      manualNotes,
      licenseKey = getConfiguredLicenseKey(),
    } = body;

    const licensingServerUrl = getLicensingServerUrl() || 'http://localhost:4000';

    const res = await fetch(`${licensingServerUrl}/api/license/renew/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId,
        utrNumber,
        payerName,
        payerUpiOrAccount,
        manualNotes,
        licenseKey,
      }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to submit manual payment to Licensing Server' },
      { status: 500 }
    );
  }
}
