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
    const category = searchParams.get('category') || 'ALL';
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '20', 10));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status !== 'ALL') {
      query.status = status;
    }

    if (category !== 'ALL') {
      if (category === 'WHOLESALE') {
        query.$or = [
          { enquiryCategory: 'WHOLESALE' },
          { enquiryCategory: { $exists: false } },
          { enquiryCategory: null },
        ];
      } else {
        query.enquiryCategory = category;
      }
    }

    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      const searchConditions = [
        { companyName: regex },
        { contactPerson: regex },
        { phone: regex },
        { city: regex },
        { 'items.productName': regex },
        { notes: regex },
      ];
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { $or: searchConditions },
        ];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    const [leads, total, newCount, allCount, plCount, giftCount, wholesaleCount, generalCount] =
      await Promise.all([
        WholesaleLead.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        WholesaleLead.countDocuments(query),
        WholesaleLead.countDocuments({ status: 'NEW' }),
        WholesaleLead.countDocuments({}),
        WholesaleLead.countDocuments({ enquiryCategory: 'PRIVATE_LABEL' }),
        WholesaleLead.countDocuments({ enquiryCategory: 'GIFT_HAMPER' }),
        WholesaleLead.countDocuments({
          $or: [
            { enquiryCategory: 'WHOLESALE' },
            { enquiryCategory: { $exists: false } },
            { enquiryCategory: null },
          ],
        }),
        WholesaleLead.countDocuments({ enquiryCategory: 'GENERAL' }),
      ]);

    const normalizedLeads = leads.map((lead: any) => ({
      ...lead,
      enquiryCategory: lead.enquiryCategory || 'WHOLESALE',
    }));

    return NextResponse.json(
      {
        success: true,
        data: normalizedLeads,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
        newLeadsCount: newCount,
        categoryCounts: {
          ALL: allCount,
          PRIVATE_LABEL: plCount,
          GIFT_HAMPER: giftCount,
          WHOLESALE: wholesaleCount,
          GENERAL: generalCount,
        },
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
