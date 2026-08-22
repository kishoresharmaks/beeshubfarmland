import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('search');
    const category = searchParams.get('category');

    let filter: any = {};
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }
    if (category && category !== 'All') {
      filter.category = category;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: products.length, data: products });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const { name, description, image, mrp, price, quantity, gst, category } = body;

    // Validation
    if (!name || !description || !image || mrp === undefined || price === undefined || quantity === undefined || gst === undefined) {
      return NextResponse.json(
        { success: false, message: 'Please provide all required product fields (name, description, image, mrp, price, quantity, gst)' },
        { status: 400 }
      );
    }

    const numMrp = Number(mrp);
    const numPrice = Number(price);
    const numQuantity = Number(quantity);
    const numGst = Number(gst);

    const discount = numMrp > numPrice ? Math.round(((numMrp - numPrice) / numMrp) * 100) : 0;

    const newProduct = await Product.create({
      name,
      description,
      image,
      mrp: numMrp,
      price: numPrice,
      discount,
      quantity: numQuantity,
      gst: numGst,
      category: category || 'General',
    });

    return NextResponse.json(
      { success: true, message: 'Product created successfully', data: newProduct },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
