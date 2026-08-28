import { NextRequest, NextResponse } from 'next/server';

export function isAuthenticatedAdmin(req: NextRequest): boolean {
  const adminToken = req.cookies.get('admin_token')?.value;
  return adminToken === 'logged_in_admin_session_key';
}

export function unauthenticatedResponse() {
  return NextResponse.json(
    { success: false, message: 'Unauthorized. Admin session required.' },
    { status: 401 }
  );
}
