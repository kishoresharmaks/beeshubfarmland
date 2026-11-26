import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import { StoreProvider } from '@/context/StoreContext';
import { getServerStoreData, sanitizeProductRecord } from '@/lib/serverCatalog';
import { formatProductDisplayName, slugifyProduct } from '@/lib/productFormatting';
import ProductDetailClient from './ProductDetailClient';

interface Props {
  params: { id: string };
}

export const dynamic = 'force-dynamic';

async function resolveProductByIdOrSlug(idOrSlug: string) {
  await connectToDatabase();
  const isObjectId = /^[a-f0-9]{24}$/i.test(idOrSlug);

  if (isObjectId) {
    const raw = await Product.findById(idOrSlug).lean();
    if (!raw) return { product: null, isLegacyObjectId: true };
    const sanitized = await sanitizeProductRecord(raw);
    return { product: sanitized, isLegacyObjectId: true };
  }

  const allProducts = await Product.find({}).lean();
  const matched = allProducts.find((p: any) => slugifyProduct(p.name) === idOrSlug);
  if (!matched) return { product: null, isLegacyObjectId: false };
  const sanitized = await sanitizeProductRecord(matched);
  return { product: sanitized, isLegacyObjectId: false };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { product } = await resolveProductByIdOrSlug(params.id);
    if (!product) {
      return {
        title: 'Product Not Found',
      };
    }

    const displayName = formatProductDisplayName(product.name);
    const slug = slugifyProduct(product.name);
    const canonicalUrl = `https://beeshubfarmland.com/product/${slug}`;
    const priceText = product.price ? `₹${product.price.toLocaleString('en-IN')}` : '';
    const mrpText =
      product.mrp && product.mrp > product.price
        ? ` (MRP: ₹${product.mrp.toLocaleString('en-IN')})`
        : '';

    const description = `Buy ${displayName} online for ${priceText}${mrpText}. 100% pure farmgate produce from Kanyakumari, Western Ghats. Express delivery & GST billing.`;
    const ogImage =
      product.image && (product.image.startsWith('http') || product.image.startsWith('/'))
        ? product.image
        : '/images/beeshub-logo.png';

    return {
      title: displayName,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${displayName} | BeesHub Farmland`,
        description,
        url: canonicalUrl,
        siteName: 'BEES HUB FARMLAND PRIVATE LIMITED',
        images: [{ url: ogImage, width: 800, height: 800, alt: displayName }],
        locale: 'en_IN',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${displayName} | BeesHub Farmland`,
        description,
        images: [ogImage],
      },
    };
  } catch {
    return {
      title: 'Pure Organic Produce',
    };
  }
}

export default async function ProductPage({ params }: Props) {
  const { product, isLegacyObjectId } = await resolveProductByIdOrSlug(params.id);

  if (!product) {
    notFound();
  }

  const slug = slugifyProduct(product.name);
  if (isLegacyObjectId && slug && slug !== params.id) {
    permanentRedirect(`/product/${slug}`);
  }

  const initialData = await getServerStoreData();
  const displayName = formatProductDisplayName(product.name);
  const canonicalUrl = `https://beeshubfarmland.com/product/${slug}`;
  const productImageUrl =
    product.image && product.image.startsWith('http')
      ? product.image
      : `https://beeshubfarmland.com${
          product.image && product.image.startsWith('/') ? product.image : '/images/beeshub-logo.png'
        }`;

  const offers =
    Array.isArray(product.variants) && product.variants.length > 0
      ? product.variants.map((v: any) => ({
          '@type': 'Offer',
          name: `${displayName} - ${v.name}`,
          price: v.price,
          priceCurrency: 'INR',
          availability:
            v.quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          url: canonicalUrl,
          itemCondition: 'https://schema.org/NewCondition',
          seller: {
            '@type': 'Organization',
            name: 'BEES HUB FARMLAND PRIVATE LIMITED',
            telephone: '+919578784431',
          },
        }))
      : {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'INR',
          availability:
            product.quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          url: canonicalUrl,
          itemCondition: 'https://schema.org/NewCondition',
          seller: {
            '@type': 'Organization',
            name: 'BEES HUB FARMLAND PRIVATE LIMITED',
            telephone: '+919578784431',
          },
        };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: displayName,
        description: product.description,
        image: productImageUrl,
        brand: {
          '@type': 'Brand',
          name: 'BeesHub Farmland',
        },
        category: product.category || 'Organic Farm Produce',
        sku: String(product._id),
        offers,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://beeshubfarmland.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Shop',
            item: 'https://beeshubfarmland.com/shop',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: displayName,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  const relatedProducts = (initialData.products || [])
    .filter((p: any) => String(p._id) !== String(product._id))
    .slice(0, 4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StoreProvider initialData={initialData}>
        <ProductDetailClient product={JSON.parse(JSON.stringify(product))} relatedProducts={relatedProducts} />
      </StoreProvider>
    </>
  );
}
