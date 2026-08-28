import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Party from '@/models/Party';
import Order from '@/models/Order';
import SaleDocument from '@/models/SaleDocument';
import { isAuthenticatedAdmin, unauthenticatedResponse } from '@/lib/authCheck';

export async function GET(req: NextRequest) {
  if (!isAuthenticatedAdmin(req)) return unauthenticatedResponse();
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    // Auto-sync real customers from Order & SaleDocument into Party collection (excluding Walk-in Guest & 0000000000)
    try {
      const orders = await Order.find({
        customerName: { $nin: ['Walk-in Guest', '', null] },
        customerPhone: { $nin: ['0000000000', '', null] },
      }).lean();

      const saleDocs = await SaleDocument.find({
        customerName: { $nin: ['Walk-in Guest', '', null] },
        customerPhone: { $nin: ['0000000000', '', null] },
      }).lean();

      const customerMap = new Map();

      for (const ord of orders) {
        if (ord.customerPhone && ord.customerPhone !== '0000000000' && ord.customerName !== 'Walk-in Guest') {
          const emailVal = (ord.customerEmail || '').trim();
          customerMap.set(ord.customerPhone.trim(), {
            name: ord.customerName.trim(),
            phone: ord.customerPhone.trim(),
            email: emailVal === 'pos@beeshubfarmland.com' ? '' : emailVal,
            address: ord.shippingAddress || '',
          });
        }
      }

      for (const doc of saleDocs) {
        if (doc.customerPhone && doc.customerPhone !== '0000000000' && doc.customerName !== 'Walk-in Guest') {
          const emailVal = (doc.customerEmail || '').trim();
          customerMap.set(doc.customerPhone.trim(), {
            name: doc.customerName.trim(),
            phone: doc.customerPhone.trim(),
            email: emailVal === 'pos@beeshubfarmland.com' ? '' : emailVal,
            address: doc.billingAddress || '',
          });
        }
      }

      for (const [phone, cust] of customerMap.entries()) {
        await Party.findOneAndUpdate(
          { phone },
          {
            $setOnInsert: {
              partyType: 'CUSTOMER',
              name: cust.name,
              phone: cust.phone,
              email: cust.email,
              address: cust.address,
              openingBalance: 0,
              currentBalance: 0,
            },
          },
          { upsert: true, new: true }
        );
      }
    } catch (syncErr) {
      console.error('Party auto-sync warning:', syncErr);
    }

    const query: any = {
      name: { $ne: 'Walk-in Guest' },
      phone: { $ne: '0000000000' },
    };
    if (type) {
      query.$or = [{ partyType: type }, { partyType: 'BOTH' }];
    }

    const rawParties = await Party.find(query).sort({ name: 1 }).lean();

    // Recalculate exact live currentBalance for each party from SaleDocument & Payment records
    const partiesWithLiveBalance = await Promise.all(
      rawParties.map(async (party: any) => {
        const saleDocs = await SaleDocument.find({
          status: 'Active',
          $or: [{ partyId: party._id }, { customerPhone: party.phone }],
        }).lean();

        let liveBalance = Number(party.openingBalance || 0);

        for (const doc of saleDocs) {
          if (doc.docType === 'SALE_INVOICE') {
            liveBalance += Number(doc.balanceAmount || 0);
          } else if (doc.docType === 'SALE_RETURN') {
            liveBalance -= Number(doc.grandTotal || 0);
          }
        }

        return {
          ...party,
          currentBalance: liveBalance,
        };
      })
    );

    return NextResponse.json({ success: true, data: partiesWithLiveBalance });
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

export async function PUT(req: NextRequest) {
  if (!isAuthenticatedAdmin(req)) return unauthenticatedResponse();
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.partyId) {
      return NextResponse.json(
        { success: false, message: 'Party ID is required for editing.' },
        { status: 400 }
      );
    }

    const updatedParty = await Party.findByIdAndUpdate(
      body.partyId,
      {
        partyType: body.partyType || 'CUSTOMER',
        name: body.name,
        phone: body.phone,
        email: body.email || '',
        address: body.address || '',
        gstin: body.gstin || '',
        openingBalance: Number(body.openingBalance || 0),
      },
      { new: true }
    );

    if (!updatedParty) {
      return NextResponse.json(
        { success: false, message: 'Party not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedParty });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
