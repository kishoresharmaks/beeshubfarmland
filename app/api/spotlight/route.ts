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

    // 1. Resolve raw spotlight list from database
    let rawList: any[] = [];
    if (Array.isArray(settings?.spotlights) && settings.spotlights.length > 0) {
      rawList = settings.spotlights;
    } else if (settings?.spotlight) {
      rawList = [settings.spotlight];
    } else {
      rawList = [
        {
          isActive: true,
          productId: '',
          badgeText: 'NEW ARRIVAL ✨',
          headingPrefix: 'Introducing Our',
          productTitle: 'Pure Forest Honey',
          shortDescription:
            'Raw, unprocessed and 100% natural honey directly from trusted farm beekeepers in Western Ghats, Kanyakumari.',
          productImage: '/images/beeshub-pure-forest-honey-spotlight.webp',
          benefits: [
            { icon: 'natural', text: '100% Natural' },
            { icon: 'additives', text: 'No Additives' },
            { icon: 'farm', text: 'Farm Sourced' },
          ],
          ctaLabel: 'Shop New Product',
          ctaLink: '',
        },
      ];
    }

    const now = new Date();
    const activeResolvedItems: any[] = [];

    for (const spotlightConfig of rawList) {
      // Check active state
      if (spotlightConfig.isActive === false) continue;

      // Check scheduled campaign date ranges
      if (spotlightConfig.startDate && new Date(spotlightConfig.startDate) > now) continue;
      if (spotlightConfig.endDate && new Date(spotlightConfig.endDate) < now) continue;

      // Resolve linked product from catalog
      let product: any = null;
      if (spotlightConfig.productId) {
        try {
          product = await Product.findById(spotlightConfig.productId).lean();
        } catch (err) {}
      }

      if (!product && activeResolvedItems.length === 0) {
        // Fallback for first item
        product = await Product.findOne({
          name: { $regex: /Pure Forest Honey|Honey/i },
        }).lean();
      }

      const productIdStr = product ? String(product._id) : spotlightConfig.productId || '';
      const inStock = product ? product.quantity > 0 : true;

      activeResolvedItems.push({
        productId: productIdStr,
        productName: product?.name || spotlightConfig.productTitle,
        badgeText: spotlightConfig.badgeText || 'NEW ARRIVAL ✨',
        headingPrefix: spotlightConfig.headingPrefix || 'Introducing Our',
        productTitle: spotlightConfig.productTitle || product?.name || 'New Arrival Product',
        shortDescription:
          spotlightConfig.shortDescription ||
          product?.description ||
          'Fresh organic farm produce directly from BeesHub Farmland.',
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
      });
    }

    const hasActive = activeResolvedItems.length > 0;

    return NextResponse.json(
      {
        success: true,
        active: hasActive,
        count: activeResolvedItems.length,
        data: activeResolvedItems,
        item: activeResolvedItems[0] || null,
      },
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

    const updateFields: any = {};
    if (Array.isArray(body.spotlights)) {
      updateFields.spotlights = body.spotlights;
      if (body.spotlights.length > 0) {
        updateFields.spotlight = body.spotlights[0];
      }
    } else if (body.spotlight) {
      updateFields.spotlight = body.spotlight;
      updateFields.spotlights = [body.spotlight];
    }

    const updated = await Settings.findOneAndUpdate(
      { key: 'global' },
      { $set: updateFields },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      data: updated.spotlights || [updated.spotlight],
    });
  } catch (error: any) {
    console.error('Error updating spotlight:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update spotlight' },
      { status: 500 }
    );
  }
}
