import { NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/authCheck';

export async function GET(request: Request) {
  try {
    if (isAuthenticatedAdmin(request)) {
      return NextResponse.json({ authenticated: true });
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
