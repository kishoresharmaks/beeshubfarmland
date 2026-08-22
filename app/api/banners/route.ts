import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Banner from '@/models/Banner';

export async function GET() {
  try {
    await connectToDatabase();
    try {
      await Banner.createIndexes();
    } catch (e) {}

    const banners = await Banner.find({}).sort({ createdAt: -1 }).allowDiskUse(true);
    return NextResponse.json({ success: true, data: banners }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { title, image, link } = body;

    if (!title || !image) {
      return NextResponse.json(
        { success: false, message: 'Banner title and image are required' },
        { status: 400 }
      );
    }

    const banner = await Banner.create({ title, image, link: link || '' });
    return NextResponse.json({ success: true, data: banner }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create banner' },
      { status: 500 }
    );
  }
}
