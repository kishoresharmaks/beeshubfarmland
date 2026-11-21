import fs from 'fs';
import path from 'path';

/**
 * Saves a base64 Data URI to a local file in public/images/products/ and returns the URL.
 * If the input is already a URL or relative path, it returns it unchanged.
 */
export async function processAndSaveImage(
  imageData: string | undefined | null,
  prefix = 'prod'
): Promise<string> {
  if (!imageData || typeof imageData !== 'string') {
    return '/logo.jpg';
  }

  // Already a URL or relative path
  if (!imageData.startsWith('data:image/')) {
    return imageData;
  }

  try {
    const matches = imageData.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches || matches.length < 3) {
      return imageData;
    }

    let ext = matches[1].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const targetDir = path.join(process.cwd(), 'public', 'images', 'products');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(targetDir, filename);

    await fs.promises.writeFile(filePath, buffer);

    return `/images/products/${filename}`;
  } catch (error) {
    console.error('Failed to process and save product image:', error);
    return imageData;
  }
}
