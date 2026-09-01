import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import LicenseSetting from '@/models/LicenseSetting';
import { getLicensingServerUrl, computeClientLicenseState } from '@/lib/licensing/licenseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { licenseKey } = body;

    if (!licenseKey || !licenseKey.trim()) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid License Key.' },
        { status: 400 }
      );
    }

    const cleanKey = String(licenseKey).trim().toUpperCase();
    const host = request.headers.get('host') || 'localhost';
    const licensingServerUrl = getLicensingServerUrl();

    // Ping standalone Licensing Server to activate
    let serverRes: Response;
    try {
      serverRes = await fetch(`${licensingServerUrl}/api/license/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenseKey: cleanKey,
          domain: host,
        }),
        cache: 'no-store',
      });
    } catch (netErr: any) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot connect to Licensing Authority Server at ${licensingServerUrl}. Make sure the licensing server is online.`,
        },
        { status: 503 }
      );
    }

    const serverData = await serverRes.json();

    if (!serverRes.ok || !serverData.success) {
      return NextResponse.json(
        { success: false, message: serverData.message || 'License activation rejected by server.' },
        { status: serverRes.status || 400 }
      );
    }

    const lic = serverData.license;

    // Save activated license into e-commerce store database
    await connectToDatabase();
    const updatedSetting = await LicenseSetting.findOneAndUpdate(
      { key: 'current_license' },
      {
        licenseKey: lic.licenseKey,
        businessName: lic.businessName,
        domain: lic.clientDomain,
        status: lic.status || 'ACTIVE',
        validUntil: new Date(lic.validUntil),
        issuedAt: new Date(lic.issuedAt),
        lastPingAt: new Date(),
        signedToken: serverData.token || '',
        activatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    const clientState = computeClientLicenseState({
      licenseKey: updatedSetting.licenseKey,
      businessName: updatedSetting.businessName,
      domain: updatedSetting.domain,
      status: updatedSetting.status,
      validUntil: updatedSetting.validUntil,
      issuedAt: updatedSetting.issuedAt,
      lastPingAt: updatedSetting.lastPingAt,
      token: updatedSetting.signedToken,
    });

    console.log(`✅ Store activated with License Key: ${cleanKey} (${lic.businessName})`);

    return NextResponse.json({
      success: true,
      message: 'License activated successfully! Welcome to BeesHub.',
      license: clientState,
    });
  } catch (error: any) {
    console.error('Activation Error in Store:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to activate license.' },
      { status: 500 }
    );
  }
}
