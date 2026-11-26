import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Banner from '@/models/Banner';
import Settings from '@/models/Settings';
import { processAndSaveImage } from '@/lib/imageStorage';
import { formatProductDisplayName, slugifyProduct } from '@/lib/productFormatting';

/**
 * Ensures any legacy base64 data URI on a product is extracted to a static file
 * and persisted back to MongoDB so API & SSR payloads remain lightweight.
 */
export async function sanitizeProductRecord(p: any) {
  let imageUrl = p.image || '/images/beeshub-logo.png';
  if (typeof imageUrl === 'string' && imageUrl.startsWith('data:image/')) {
    try {
      const savedUrl = await processAndSaveImage(imageUrl, `prod_${String(p._id).slice(-6)}`);
      if (savedUrl && !savedUrl.startsWith('data:image/')) {
        imageUrl = savedUrl;
        await Product.updateOne({ _id: p._id }, { $set: { image: savedUrl } });
      }
    } catch {
      imageUrl = '/images/beeshub-logo.png';
    }
  }

  return {
    ...p,
    _id: String(p._id),
    image: imageUrl,
    displayName: formatProductDisplayName(p.name),
    slug: slugifyProduct(p.name),
  };
}

export async function getServerStoreData() {
  try {
    await connectToDatabase();

    const [rawProducts, rawCategories, rawBanners, rawSettings] = await Promise.all([
      Product.find({}).sort({ createdAt: -1 }).allowDiskUse(true).lean(),
      Category.find({}).sort({ name: 1 }).lean(),
      Banner.find({}).sort({ createdAt: -1 }).lean(),
      Settings.findOne({ key: 'global' }).lean(),
    ]);

    const products = await Promise.all(rawProducts.map(sanitizeProductRecord));

    const banners = await Promise.all(
      rawBanners.map(async (b: any) => {
        let img = b.image || '';
        if (typeof img === 'string' && img.startsWith('data:image/')) {
          img = await processAndSaveImage(img, `banner_${String(b._id).slice(-6)}`);
          await Banner.updateOne({ _id: b._id }, { $set: { image: img } }).catch(() => {});
        }
        return { ...b, _id: String(b._id), image: img };
      })
    );

    const categories = rawCategories.map((c: any) => ({
      ...c,
      _id: String(c._id),
    }));

    const settings = rawSettings
      ? {
          activeTheme: rawSettings.activeTheme || 'v2',
          enableOnlinePayment: rawSettings.enableOnlinePayment ?? true,
          enableUPI: rawSettings.enableUPI ?? true,
          enableCOD: rawSettings.enableCOD ?? true,
          fssaiNumber: rawSettings.fssaiNumber || '12425009000671',
          gstin: rawSettings.gstin || '33AAOCB0453D1Z3',
          enableWholesale: rawSettings.enableWholesale ?? true,
        }
      : {
          activeTheme: 'v2' as const,
          enableOnlinePayment: true,
          enableUPI: true,
          enableCOD: true,
          enableWholesale: true,
        };

    return JSON.parse(JSON.stringify({ products, categories, banners, settings }));
  } catch (error) {
    console.error('SSR getServerStoreData fallback:', error);
    return {
      products: [],
      categories: [],
      banners: [],
      settings: {
        activeTheme: 'v2' as const,
        enableOnlinePayment: true,
        enableUPI: true,
        enableCOD: true,
        enableWholesale: true,
      },
    };
  }
}
