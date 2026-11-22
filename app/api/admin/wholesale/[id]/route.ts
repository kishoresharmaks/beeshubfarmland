import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import WholesaleLead from '@/models/WholesaleLead';
import { isAuthenticatedAdmin, unauthenticatedResponse } from '@/lib/authCheck';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!isAuthenticatedAdmin(request)) {
      return unauthenticatedResponse();
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Lead ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    const lead = await WholesaleLead.findById(id).lean();

    if (!lead) {
      return NextResponse.json({ success: false, message: 'Wholesale lead not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...lead,
        enquiryCategory: (lead as any).enquiryCategory || 'WHOLESALE',
      },
    });
  } catch (error: any) {
    console.error('Failed to fetch wholesale lead:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch wholesale lead' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!isAuthenticatedAdmin(request)) {
      return unauthenticatedResponse();
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Lead ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { status, adminNotes, quotedAmount, enquiryCategory } = body;

    const updateFields: any = {};
    if (status && ['NEW', 'CONTACTED', 'QUOTED', 'CONVERTED', 'REJECTED'].includes(status)) {
      updateFields.status = status;
    }
    if (typeof adminNotes === 'string') {
      updateFields.adminNotes = adminNotes;
    }
    if (quotedAmount !== undefined) {
      updateFields.quotedAmount = Number(quotedAmount) || 0;
    }
    if (enquiryCategory && ['WHOLESALE', 'PRIVATE_LABEL', 'GIFT_HAMPER', 'GENERAL'].includes(enquiryCategory)) {
      updateFields.enquiryCategory = enquiryCategory;
    }

    await connectToDatabase();

    const updated = await WholesaleLead.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Wholesale lead not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        enquiryCategory: (updated as any).enquiryCategory || 'WHOLESALE',
      },
    });
  } catch (error: any) {
    console.error('Failed to update wholesale lead:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update wholesale lead' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!isAuthenticatedAdmin(request)) {
      return unauthenticatedResponse();
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Lead ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    await WholesaleLead.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete wholesale lead:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete wholesale lead' },
      { status: 500 }
    );
  }
}
