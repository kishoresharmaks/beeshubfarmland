import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Settings from '@/models/Settings';
import { isAuthenticatedAdmin, unauthenticatedResponse } from '@/lib/authCheck';
import { processAndSaveImage } from '@/lib/imageStorage';

export async function GET() {
  try {
    await connectToDatabase();
    let settings = await Settings.findOne({ key: 'global' }).lean();
    if (!settings) {
      const created = await Settings.create({
        key: 'global',
        activeTheme: 'v2',
        enableOnlinePayment: true,
        enableUPI: true,
        enableCOD: true,
        fssaiNumber: '22424000000000',
        gstin: '33AAAAA0000A1Z5',
        enableWholesale: true,
      });
      settings = created.toObject();
    } else {
      // Backward-compatibility fallback
      if (settings.enableOnlinePayment === undefined) {
        settings.enableOnlinePayment = settings.enableUPI ?? true;
      }
      if (settings.fssaiNumber === undefined) {
        settings.fssaiNumber = '22424000000000';
      }
      if (settings.gstin === undefined) {
        settings.gstin = '33AAAAA0000A1Z5';
      }
      if (settings.enableWholesale === undefined) {
        settings.enableWholesale = true;
      }
      if (!settings.activeTheme) {
        settings.activeTheme = 'v2';
      }
    }
    const sanitizedSpotlight = settings.spotlight
      ? {
          ...settings.spotlight,
          productImage: await processAndSaveImage(settings.spotlight.productImage, 'spotlight'),
        }
      : undefined;

    const sanitizedSpotlights = Array.isArray(settings.spotlights)
      ? await Promise.all(
          settings.spotlights.map(async (sp: any, idx: number) => ({
            ...sp,
            productImage: await processAndSaveImage(sp.productImage, `spotlight_${idx}`),
          }))
        )
      : undefined;

    const publicSettings = {
      activeTheme: settings.activeTheme || 'v2',
      enableOnlinePayment: settings.enableOnlinePayment ?? settings.enableUPI ?? true,
      enableUPI: settings.enableUPI ?? true,
      enableCOD: settings.enableCOD ?? true,
      fssaiNumber: settings.fssaiNumber || '12425009000671',
      gstin: settings.gstin || '33AAOCB0453D1Z3',
      enableWholesale: settings.enableWholesale ?? true,
      ...(sanitizedSpotlight ? { spotlight: sanitizedSpotlight } : {}),
      ...(sanitizedSpotlights ? { spotlights: sanitizedSpotlights } : {}),
    };

    return NextResponse.json(
      { success: true, data: publicSettings },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!isAuthenticatedAdmin(request)) {
      return unauthenticatedResponse();
    }
    await connectToDatabase();
    const body = await request.json();
    const { activeTheme, enableOnlinePayment, enableUPI, enableCOD, fssaiNumber, gstin, enableWholesale, spotlight, spotlights } = body;

    const updateFields: any = {};
    if (activeTheme === 'v1' || activeTheme === 'v2') {
      updateFields.activeTheme = activeTheme;
    }
    if (typeof enableOnlinePayment === 'boolean') {
      updateFields.enableOnlinePayment = enableOnlinePayment;
      updateFields.enableUPI = enableOnlinePayment;
    } else if (typeof enableUPI === 'boolean') {
      updateFields.enableOnlinePayment = enableUPI;
      updateFields.enableUPI = enableUPI;
    }
    if (typeof enableCOD === 'boolean') updateFields.enableCOD = enableCOD;
    if (typeof fssaiNumber === 'string') updateFields.fssaiNumber = fssaiNumber.trim();
    if (typeof gstin === 'string') updateFields.gstin = gstin.trim().toUpperCase();
    if (typeof enableWholesale === 'boolean') updateFields.enableWholesale = enableWholesale;
    if (Array.isArray(spotlights)) {
      updateFields.spotlights = spotlights;
      if (spotlights.length > 0) {
        updateFields.spotlight = spotlights[0];
      }
    } else if (spotlight && typeof spotlight === 'object') {
      updateFields.spotlight = spotlight;
      updateFields.spotlights = [spotlight];
    }

    const settings = await Settings.findOneAndUpdate(
      { key: 'global' },
      { $set: updateFields },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
