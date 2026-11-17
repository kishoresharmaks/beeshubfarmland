import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Settings from '@/models/Settings';
import Product from '@/models/Product';
import { isAuthenticatedAdmin, unauthenticatedResponse } from '@/lib/authCheck';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await connectToDatabase();
    const settings = await Settings.findOne({ key: 'global' }).lean();

    const spotlightConfig = settings?.spotlight || {
      isActive: true,
      productId: '',
      badgeText: 'NEW ARRIVAL ✨',
      headingPrefix: 'Introducing Our',
      productTitle: 'Pure Forest Honey',
      shortDescription:
        'Raw, unprocessed and 100% natural honey directly from trusted farm beekeepers.',
      productImage: '/images/beeshub-pure-forest-honey-spotlight.webp',
      benefits: [
        { icon: 'natural', text: '100% Natural' },
        { icon: 'additives', text: 'No Additives' },
        { icon: 'farm', text: 'Farm Sourced' },
      ],
      ctaLabel: 'Shop New Product',
      ctaLink: '',
    };

    // 1. Check if spotlight is active
    if (!spotlightConfig.isActive) {
      return NextResponse.json({ success: true, active: false, data: null });
    }

    // 2. Check scheduled campaign date ranges
    const now = new Date();
    if (spotlightConfig.startDate && new Date(spotlightConfig.startDate) > now) {
      return NextResponse.json({ success: true, active: false, data: null });
    }
    if (spotlightConfig.endDate && new Date(spotlightConfig.endDate) < now) {
      return NextResponse.json({ success: true, active: false, data: null });
    }

    // 3. Resolve linked real product
    let product: any = null;
    if (spotlightConfig.productId) {
      try {
        product = await Product.findById(spotlightConfig.productId).lean();
      } catch (err) {
        // invalid objectId format, fallback below
      }
    }

    if (!product) {
      // Fallback: search for Pure Forest Honey or latest available product
      product = await Product.findOne({
        name: { $regex: /Pure Forest Honey|Honey/i },
      }).lean();
    }

    if (!product) {
      product = await Product.findOne({ quantity: { $gt: 0 } }).sort({ createdAt: -1 }).lean();
    }

    const productIdStr = product ? String(product._id) : '';
    const inStock = product ? product.quantity > 0 : true;

    const payload = {
      productId: productIdStr,
      productName: product?.name || spotlightConfig.productTitle,
      badgeText: spotlightConfig.badgeText || 'NEW ARRIVAL ✨',
      headingPrefix: spotlightConfig.headingPrefix || 'Introducing Our',
      productTitle: spotlightConfig.productTitle || product?.name || 'Pure Forest Honey',
      shortDescription:
        spotlightConfig.shortDescription ||
        product?.description ||
        'Raw, unprocessed and 100% natural honey directly from trusted farm beekeepers.',
      productImage:
        spotlightConfig.productImage || product?.image || '/images/beeshub-pure-forest-honey-spotlight.webp',
      benefits:
        spotlightConfig.benefits && spotlightConfig.benefits.length > 0
          ? spotlightConfig.benefits
          : [
              { icon: 'natural', text: '100% Natural' },
              { icon: 'additives', text: 'No Additives' },
              { icon: 'farm', text: 'Farm Sourced' },
            ],
      ctaLabel: spotlightConfig.ctaLabel || 'Shop New Product',
      ctaLink: spotlightConfig.ctaLink || (productIdStr ? `/product/${productIdStr}` : '/'),
      price: product ? product.price : 399,
      mrp: product ? product.mrp : 499,
      discount: product ? product.discount : 20,
      quantity: product ? product.quantity : 50,
      gst: product ? product.gst : 5,
      variants: product?.variants || [],
      inStock,
    };

    return NextResponse.json(
      { success: true, active: true, data: payload },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching spotlight:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch spotlight' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthenticatedAdmin(request)) {
      return unauthenticatedResponse();
    }

    await connectToDatabase();
    const body = await request.json();

    const updated = await Settings.findOneAndUpdate(
      { key: 'global' },
      { $set: { spotlight: body } },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, data: updated.spotlight });
  } catch (error: any) {
    console.error('Error updating spotlight:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update spotlight' },
      { status: 500 }
    );
  }
}
