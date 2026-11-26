import fs from 'fs';
import path from 'path';

/**
 * Saves a base64 Data URI to a static file and returns its clean URL.
 * Prefers persistent `public/uploads/products/` if available (survives blue-green deploys),
 * otherwise writes to `public/images/products/`.
 * If the input is already a URL or relative path, returns it unchanged.
 */
export async function processAndSaveImage(
  imageData: string | undefined | null,
  prefix = 'prod'
): Promise<string> {
  if (!imageData || typeof imageData !== 'string') {
    return '/images/beeshub-logo.png';
  }

  // Already a URL or relative path
  if (!imageData.startsWith('data:image/')) {
    return imageData;
  }

  try {
    const matches = imageData.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches || matches.length < 3) {
      return '/images/beeshub-logo.png';
    }

    let ext = matches[1].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const uploadsRoot = path.join(process.cwd(), 'public', 'uploads');
    const useUploads = fs.existsSync(uploadsRoot);
    const subDir = useUploads ? path.join('uploads', 'products') : path.join('images', 'products');
    const targetDir = path.join(process.cwd(), 'public', subDir);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(targetDir, filename);

    await fs.promises.writeFile(filePath, buffer);

    return `/${subDir.replace(/\\/g, '/')}/${filename}`;
  } catch (error) {
    console.error('Failed to process and save product image:', error);
    return '/images/beeshub-logo.png';
  }
}
