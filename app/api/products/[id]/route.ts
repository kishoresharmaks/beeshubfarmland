import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import { isAuthenticatedAdmin, unauthenticatedResponse } from '@/lib/authCheck';
import { processAndSaveImage } from '@/lib/imageStorage';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;
    const product = await Product.findById(id).lean();
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // F-02: Require administrator authentication
    if (!isAuthenticatedAdmin(request)) {
      return unauthenticatedResponse();
    }

    await connectToDatabase();
    const { id } = params;

    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
      data: deletedProduct,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // F-02: Require administrator authentication
    if (!isAuthenticatedAdmin(request)) {
      return unauthenticatedResponse();
    }

    await connectToDatabase();
    const { id } = params;
    const body = await request.json();

    if (body.mrp !== undefined || body.price !== undefined) {
      const m = Number(body.mrp ?? 0);
      const p = Number(body.price ?? 0);
      body.discount = m > 0 && p > 0 && m > p ? Math.round(((m - p) / m) * 100) : 0;
    }

    // F-06: Optimize image payloads if base64 provided
    if (body.image) {
      body.image = await processAndSaveImage(body.image, 'prod');
    }

    if (body.showOnHomepage !== undefined) {
      body.showOnHomepage = Boolean(body.showOnHomepage);
    }
    if (body.coaUrl !== undefined) {
      body.coaUrl = typeof body.coaUrl === 'string' ? body.coaUrl.trim() : '';
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}
