import { NextResponse } from 'next/server';
import { isAuthenticatedAdmin, unauthenticatedResponse } from '@/lib/authCheck';
import { saveCoaFileLocally } from '@/lib/coaStorage';

const MAX_COA_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request) {
  try {
    if (!isAuthenticatedAdmin(request)) {
      return unauthenticatedResponse();
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: 'No COA file uploaded.' },
        { status: 400 }
      );
    }

    if (file.size <= 0 || file.size > MAX_COA_BYTES) {
      return NextResponse.json(
        { success: false, message: 'COA file must be between 1 byte and 10 MB.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const saved = await saveCoaFileLocally(buffer, file.name);

    return NextResponse.json(
      {
        success: true,
        url: saved.url,
        filename: saved.filename,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to upload COA file.' },
      { status: 400 }
    );
  }
}
