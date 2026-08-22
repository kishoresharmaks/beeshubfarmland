import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Auto seeding disabled. Products and categories are managed exclusively by Admin.',
  });
}
