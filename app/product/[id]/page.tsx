import type { Metadata } from 'next';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import ProductClientRedirect from './ProductClientRedirect';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    await connectToDatabase();
    const product = await Product.findById(params.id).lean();
    if (!product) {
      return {
        title: 'Product Not Found — BEES HUB FARMLAND PRIVATE LIMITED',
      };
    }

    const priceText = product.price ? `₹${product.price.toLocaleString('en-IN')}` : '';
    const mrpText = product.mrp && product.mrp > product.price ? ` (MRP: ₹${product.mrp.toLocaleString('en-IN')})` : '';

    const title = `${product.name} — BEES HUB FARMLAND PRIVATE LIMITED`;
    const description = `Buy ${product.name} online for ${priceText}${mrpText}. 100% pure organic produce direct from farmlands. Express delivery & GST billing.`;

    return {
      title,
      description,
      openGraph: {
        title: `${product.name} | BeesHub Farmland`,
        description,
        url: `https://beeshubfarmland.com/product/${params.id}`,
        siteName: 'BEES HUB FARMLAND PRIVATE LIMITED',
        images: product.image
          ? [
              {
                url: product.image,
                width: 800,
                height: 800,
                alt: product.name,
              },
            ]
          : [{ url: '/logo.jpg' }],
        locale: 'en_IN',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} — BeesHub Farmland`,
        description,
        images: product.image ? [product.image] : ['/logo.jpg'],
      },
    };
  } catch (error) {
    return {
      title: 'BeesHub Farmland — Pure Organic Produce',
    };
  }
}

export default function ProductPage({ params }: Props) {
  return <ProductClientRedirect id={params.id} />;
}
