import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const ADMIN_USER = process.env.ADMIN_USERNAME || 'ntvigneswaran@gmail.com';
    const ADMIN_PASS = process.env.ADMIN_PASSWORD || '957878443V@';

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const response = NextResponse.json(
        { success: true, message: 'Authentication successful' },
        { status: 200 }
      );

      // Set cookie for session
      response.cookies.set('admin_token', 'logged_in_admin_session_key', {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Invalid username or password' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
