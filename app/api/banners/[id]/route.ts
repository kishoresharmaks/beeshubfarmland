import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Banner from '@/models/Banner';
import { isAuthenticatedAdmin, unauthenticatedResponse } from '@/lib/authCheck';
import { processAndSaveImage } from '@/lib/imageStorage';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!isAuthenticatedAdmin(request)) {
      return unauthenticatedResponse();
    }

    await connectToDatabase();
    const body = await request.json();

    if (body.image) {
      body.image = await processAndSaveImage(body.image, 'banner');
    }

    const updatedBanner = await Banner.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedBanner) {
      return NextResponse.json(
        { success: false, message: 'Banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Banner updated successfully', data: updatedBanner },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update banner' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!isAuthenticatedAdmin(request)) {
      return unauthenticatedResponse();
    }

    await connectToDatabase();
    const deletedBanner = await Banner.findByIdAndDelete(params.id);
    if (!deletedBanner) {
      return NextResponse.json(
        { success: false, message: 'Banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Banner deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete banner' },
      { status: 500 }
    );
  }
}
