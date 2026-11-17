import type { Metadata } from 'next';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import ProductClientRedirect from './ProductClientRedirect';

interface Props {
  params: { id: string };
}

export const dynamic = 'force-dynamic';

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

export default async function ProductPage({ params }: Props) {
  let product: any = null;
  try {
    await connectToDatabase();
    product = await Product.findById(params.id).lean();
  } catch (e) {}

  const productJsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.image
          ? product.image.startsWith('http') || product.image.startsWith('/')
            ? product.image
            : `https://beeshubfarmland.com/logo.jpg`
          : 'https://beeshubfarmland.com/logo.jpg',
        brand: {
          '@type': 'Brand',
          name: 'BeesHub Farmland',
        },
        category: product.category || 'Organic Farm Produce',
        sku: String(product._id),
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'INR',
          availability:
            product.quantity > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          url: `https://beeshubfarmland.com/product/${params.id}`,
          itemCondition: 'https://schema.org/NewCondition',
          seller: {
            '@type': 'Organization',
            name: 'BEES HUB FARMLAND PRIVATE LIMITED',
            telephone: '+919578784431',
          },
        },
      }
    : null;

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productJsonLd),
          }}
        />
      )}
      <ProductClientRedirect id={params.id} />
    </>
  );
}
