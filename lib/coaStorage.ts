import fs from 'fs';
import path from 'path';

const ALLOWED_EXTENSIONS = new Set(['pdf', 'png', 'jpg', 'jpeg', 'webp']);

const MIME_BY_EXT: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

/**
 * Validates file magic bytes against its declared extension to prevent arbitrary file uploads.
 */
export function detectCoaMimeFromBuffer(buf: Buffer, ext: string): string | null {
  if (!buf || buf.length < 4) return null;
  const cleanExt = ext.toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(cleanExt)) return null;

  // %PDF-
  if (cleanExt === 'pdf' && buf.subarray(0, 5).toString('ascii') === '%PDF-') {
    return 'application/pdf';
  }
  // PNG: 89 50 4E 47
  if (cleanExt === 'png' && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return 'image/png';
  }
  // JPEG: FF D8 FF
  if ((cleanExt === 'jpg' || cleanExt === 'jpeg') && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'image/jpeg';
  }
  // WEBP: RIFF....WEBP
  if (
    cleanExt === 'webp' &&
    buf.length >= 12 &&
    buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buf.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp';
  }
  return null;
}

/**
 * Saves an uploaded COA file locally into `public/uploads/coa/` (which symlinks to
 * `/var/www/beeshubfarmland/shared/uploads/coa` on production VPS deployments)
 * and returns a clean URL served via `/api/coa/<filename>`.
 */
export async function saveCoaFileLocally(buffer: Buffer, originalName: string): Promise<{ url: string; filename: string }> {
  const rawExt = path.extname(originalName || '').replace(/^\./, '').toLowerCase();
  const ext = rawExt === 'jpeg' ? 'jpg' : rawExt;
  const mime = detectCoaMimeFromBuffer(buffer, ext);
  if (!mime) {
    throw new Error('Invalid file format. Please upload a valid PDF, PNG, JPG, or WEBP COA document.');
  }

  const coaDir = path.join(process.cwd(), 'public', 'uploads', 'coa');
  await fs.promises.mkdir(coaDir, { recursive: true });

  const safeBase = path
    .basename(originalName || 'coa', path.extname(originalName || ''))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32) || 'coa';

  const filename = `${safeBase}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const targetPath = path.join(coaDir, filename);
  await fs.promises.writeFile(targetPath, buffer);

  return {
    filename,
    url: `/api/coa/${filename}`,
  };
}

/**
 * Resolves a stored COA file on disk across local, standalone, and VPS shared upload paths.
 */
export function resolveCoaFilePath(rawFilename: string): { filePath: string; mime: string; filename: string } | null {
  const filename = path.basename(rawFilename || '');
  if (!filename || filename.includes('..')) return null;

  const ext = path.extname(filename).replace(/^\./, '').toLowerCase();
  const mime = MIME_BY_EXT[ext];
  if (!mime) return null;

  const candidates = [
    path.join(process.cwd(), 'public', 'uploads', 'coa', filename),
    path.join(process.cwd(), '..', '..', 'public', 'uploads', 'coa', filename),
    path.join('/var/www/beeshubfarmland/shared/uploads/coa', filename),
  ];

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return { filePath: candidate, mime, filename };
      }
    } catch {
      // Ignore permission or path resolution errors
    }
  }
  return null;
}
