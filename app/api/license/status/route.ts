import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import LicenseSetting from '@/models/LicenseSetting';
import { getLicensingServerUrl, computeClientLicenseState } from '@/lib/licensing/licenseClient';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const savedSetting = await LicenseSetting.findOne({ key: 'current_license' });

    // 1. Check if store is unlicensed
    if (!savedSetting || !savedSetting.licenseKey) {
      const unlicensedState = computeClientLicenseState({});
      return NextResponse.json({
        success: true,
        isActivated: false,
        license: unlicensedState,
      });
    }

    const licensingServerUrl = getLicensingServerUrl();
    const host = request.headers.get('host') || 'localhost';

    let liveStatus = savedSetting.status;
    let liveValidUntil = savedSetting.validUntil;
    let liveBusinessName = savedSetting.businessName;
    let serverMessage = '';

    let isServerOnline = true;

    // 2. Real-time Ping / Heartbeat to Licensing Server
    try {
      const pingRes = await fetch(`${licensingServerUrl}/api/license/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenseKey: savedSetting.licenseKey,
          domain: host,
        }),
        cache: 'no-store',
      });

      if (pingRes.ok) {
        const pingData = await pingRes.json();
        if (pingData.success) {
          liveStatus = pingData.status;
          serverMessage = pingData.message || '';
          if (pingData.license?.validUntil) {
            liveValidUntil = new Date(pingData.license.validUntil);
          }
          if (pingData.license?.businessName) {
            liveBusinessName = pingData.license.businessName;
          }

          // Update local DB with real-time status from licensing authority
          savedSetting.status = liveStatus;
          savedSetting.validUntil = liveValidUntil;
          savedSetting.lastPingAt = new Date();
          if (pingData.token) savedSetting.signedToken = pingData.token;
          await savedSetting.save();
        }
      } else {
        const pingData = await pingRes.json().catch(() => null);
        liveStatus = 'INVALID';
        serverMessage = pingData?.message || 'License key not found or invalid on licensing server.';
        savedSetting.status = 'INVALID';
        savedSetting.lastPingAt = new Date();
        await savedSetting.save();
      }
    } catch (pingErr) {
      console.warn(`[License Client] Could not ping licensing authority at ${licensingServerUrl}:`, pingErr);
      isServerOnline = false;
      liveStatus = 'INVALID';
      serverMessage = 'Unable to connect to the NEXUS Licensing Service. Please verify your connection or contact support.';
      savedSetting.status = 'INVALID';
      await savedSetting.save().catch(() => null);
    }

    const clientState = computeClientLicenseState({
      licenseKey: savedSetting.licenseKey,
      businessName: liveBusinessName,
      domain: savedSetting.domain,
      status: liveStatus,
      validUntil: liveValidUntil,
      issuedAt: savedSetting.issuedAt,
      lastPingAt: savedSetting.lastPingAt,
      token: savedSetting.signedToken,
      message: serverMessage,
      serverOnline: isServerOnline,
    });

    const supportEmail = process.env.LICENSE_SUPPORT_EMAIL || process.env.NEXT_PUBLIC_LICENSE_SUPPORT_EMAIL || 'krishkishoreks@gmail.com';
    const supportPhone = process.env.LICENSE_SUPPORT_PHONE || process.env.NEXT_PUBLIC_LICENSE_SUPPORT_PHONE || '+917695946750';

    return NextResponse.json({
      success: true,
      isActivated: true,
      license: {
        ...clientState,
        supportEmail,
        supportPhone,
      },
      licensingServerUrl,
    });
  } catch (error: any) {
    console.error('License Status Check Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to check license status' },
      { status: 500 }
    );
  }
}
