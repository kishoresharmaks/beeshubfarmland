import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import WholesaleLead from '@/models/WholesaleLead';
import { isAuthenticatedAdmin, unauthenticatedResponse } from '@/lib/authCheck';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    if (!isAuthenticatedAdmin(request)) {
      return unauthenticatedResponse();
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'ALL';
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '20', 10));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status !== 'ALL') {
      query.status = status;
    }

    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { companyName: regex },
        { contactPerson: regex },
        { phone: regex },
        { city: regex },
        { 'items.productName': regex },
      ];
    }

    const [leads, total, newCount] = await Promise.all([
      WholesaleLead.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      WholesaleLead.countDocuments(query),
      WholesaleLead.countDocuments({ status: 'NEW' }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: leads,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
        newLeadsCount: newCount,
      },
      {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );
  } catch (error: any) {
    console.error('Failed to fetch wholesale leads:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch wholesale leads' },
      { status: 500 }
    );
  }
}
