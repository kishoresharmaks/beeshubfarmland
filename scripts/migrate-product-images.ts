import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import connectToDatabase from '../lib/db';
import Product from '../models/Product';
import Banner from '../models/Banner';

/**
 * Migration script to optimize existing base64 image payloads in MongoDB.
 * Extracts base64 images to static files in public/images/products/
 * and replaces the MongoDB string with the clean relative URL.
 */
async function migrateImages() {
  console.log('Connecting to database...');
  await connectToDatabase();

  const products = await Product.find({ image: { $regex: '^data:image/' } });
  console.log(`Found ${products.length} products with base64 embedded images.`);

  const targetDir = path.join(process.cwd(), 'public', 'images', 'products');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  let migratedCount = 0;
  for (const product of products) {
    try {
      const matches = product.image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (matches && matches.length >= 3) {
        let ext = matches[1].toLowerCase();
        if (ext === 'jpeg') ext = 'jpg';
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `prod_migrated_${String(product._id)}_${Date.now()}.${ext}`;
        const filePath = path.join(targetDir, filename);

        await fs.promises.writeFile(filePath, buffer);
        product.image = `/images/products/${filename}`;
        await product.save();
        migratedCount++;
        console.log(`✓ Migrated product: "${product.name}" -> /images/products/${filename}`);
      }
    } catch (err) {
      console.error(`Failed to migrate product ${product._id}:`, err);
    }
  }

  console.log(`Migration complete! Successfully migrated ${migratedCount} products.`);
  await mongoose.disconnect();
}

if (require.main === module) {
  migrateImages().catch(console.error);
}

export default migrateImages;
