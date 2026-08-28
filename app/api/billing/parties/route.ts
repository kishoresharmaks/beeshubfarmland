import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Party from '@/models/Party';
import { isAuthenticatedAdmin, unauthenticatedResponse } from '@/lib/authCheck';

export async function GET(req: NextRequest) {
  if (!isAuthenticatedAdmin(req)) return unauthenticatedResponse();
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    const query: any = {};
    if (type) {
      query.$or = [{ partyType: type }, { partyType: 'BOTH' }];
    }

    const parties = await Party.find(query).sort({ name: 1 }).lean();
    return NextResponse.json({ success: true, data: parties });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthenticatedAdmin(req)) return unauthenticatedResponse();
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.name || !body.phone) {
      return NextResponse.json(
        { success: false, message: 'Name and Phone are required.' },
        { status: 400 }
      );
    }

    const party = await Party.create({
      partyType: body.partyType || 'CUSTOMER',
      name: body.name,
      phone: body.phone,
      email: body.email || '',
      address: body.address || '',
      gstin: body.gstin || '',
      openingBalance: Number(body.openingBalance || 0),
      currentBalance: Number(body.openingBalance || 0),
    });

    return NextResponse.json({ success: true, data: party }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
