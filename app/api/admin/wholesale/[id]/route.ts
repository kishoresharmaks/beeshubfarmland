import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import WholesaleLead from '@/models/WholesaleLead';
import { isAuthenticatedAdmin, unauthenticatedResponse } from '@/lib/authCheck';

export const dynamic = 'force-dynamic';

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
    const { status, adminNotes, quotedAmount } = body;

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

    await connectToDatabase();

    const updated = await WholesaleLead.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Wholesale lead not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
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
