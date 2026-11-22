import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const url = new URL(request.url);
  const redirectTo = url.searchParams.get('redirect') || '/admin/dashboard';
  const response = NextResponse.redirect(new URL(redirectTo, request.url));

  response.cookies.set('admin_token', 'logged_in_admin_session_key', {
    path: '/',
    maxAge: 86400,
    httpOnly: false,
    sameSite: 'lax',
  });

  return response;
}
