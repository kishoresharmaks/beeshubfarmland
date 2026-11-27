import fs from 'fs';
import { NextResponse } from 'next/server';
import { resolveCoaFilePath } from '@/lib/coaStorage';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const resolved = resolveCoaFilePath(params.filename);
    if (!resolved) {
      return NextResponse.json(
        { success: false, message: 'COA document not found.' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get('download') === '1';
    const fileBuffer = await fs.promises.readFile(resolved.filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': resolved.mime,
        'Content-Disposition': `${isDownload ? 'attachment' : 'inline'}; filename="${resolved.filename}"`,
        'Cache-Control': 'public, max-age=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to read COA file.' },
      { status: 500 }
    );
  }
}
