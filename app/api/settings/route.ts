import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Settings from '@/models/Settings';

export async function GET() {
  try {
    await connectToDatabase();
    let settings = await Settings.findOne({ key: 'global' }).lean();
    if (!settings) {
      const created = await Settings.create({ key: 'global', enableUPI: true, enableCOD: true });
      settings = created.toObject();
    }
    return NextResponse.json(
      { success: true, data: settings },
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
    await connectToDatabase();
    const body = await request.json();
    const { enableUPI, enableCOD } = body;

    const updateFields: any = {};
    if (typeof enableUPI === 'boolean') updateFields.enableUPI = enableUPI;
    if (typeof enableCOD === 'boolean') updateFields.enableCOD = enableCOD;

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
