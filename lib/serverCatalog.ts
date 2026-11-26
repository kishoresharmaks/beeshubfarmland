import fs from 'fs';
import path from 'path';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Banner from '@/models/Banner';
import BlogPost from '@/models/BlogPost';
import Settings from '@/models/Settings';
import { processAndSaveImage } from '@/lib/imageStorage';
import { formatProductDisplayName, slugifyProduct } from '@/lib/productFormatting';

/**
 * Resolves a local authentic fallback image from public/images when a legacy /uploads/
 * file does not exist on disk in local environments (while preserving existing files on VPS).
 */
function resolveLocalProductImageFallback(name: string, currentUrl: string): string {
  if (!currentUrl || typeof currentUrl !== 'string') {
    return '/images/beeshub-logo.png';
  }
  if (currentUrl.startsWith('/uploads/')) {
    const diskPath = path.join(process.cwd(), 'public', currentUrl.replace(/^\/+/, ''));
    if (fs.existsSync(diskPath)) {
      return currentUrl;
    }
    const n = (name || '').toLowerCase();
    if (n.includes('honey')) return '/images/beeshub-pure-forest-honey-spotlight.webp';
    if (n.includes('red banana')) return '/images/products/red-banana-powder.png';
    if (n.includes('banana')) return '/images/products/banana-powder.png';
    if (n.includes('coffee')) return '/images/products/dates-coffee.jpg';
    if (n.includes('dates')) return '/images/products/dates-powder-natural.jpg';
    if (n.includes('coconut')) return '/images/products/coconut-oil.png';
    if (n.includes('sesame')) return '/images/products/sesame-oil.jpg';
    if (n.includes('groundnut')) return '/images/products/groundnut-oil.png';
    if (n.includes('capsule')) return '/images/products/moringa-capsules.jpg';
    if (n.includes('moring')) return '/images/products/moringa-powder.jpg';
    if (n.includes('sweet potato')) return '/images/products/sweet-potato-powder.jpg';
    if (n.includes('makhana')) return '/images/products/makhana.jpg';
    if (n.includes('soap')) return '/images/products/herbal-soaps.png';
    if (n.includes('beetroot') || n.includes('carrot') || n.includes('pineapple')) {
      return '/images/products/dates-powder-natural.jpg';
    }
    return '/images/beeshub-pure-forest-honey-spotlight.webp';
  }
  return currentUrl;
}

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

  imageUrl = resolveLocalProductImageFallback(p.name || '', imageUrl);

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

    const [rawProducts, rawCategories, rawBanners, rawSettings, rawBlogs] = await Promise.all([
      Product.find({}).sort({ createdAt: -1 }).allowDiskUse(true).lean(),
      Category.find({}).sort({ name: 1 }).lean(),
      Banner.find({}).sort({ createdAt: -1 }).lean(),
      Settings.findOne({ key: 'global' }).lean(),
      BlogPost.find({ isPublished: true })
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(3)
        .select('title slug excerpt coverImage category author readTime publishedAt')
        .lean(),
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

    const blogPosts = rawBlogs.map((post: any) => ({
      ...post,
      _id: String(post._id),
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

    return JSON.parse(JSON.stringify({ products, categories, banners, blogPosts, settings }));
  } catch (error) {
    console.error('SSR getServerStoreData fallback:', error);
    return {
      products: [],
      categories: [],
      banners: [],
      blogPosts: [],
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
