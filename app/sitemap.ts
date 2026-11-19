import { MetadataRoute } from 'next';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import BlogPost from '@/models/BlogPost';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://beeshubfarmland.com';

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  try {
    await connectToDatabase();
    // Fetch all product IDs and updated dates for dynamic product URLs
    const products = await Product.find({}, '_id updatedAt').lean();

    const productUrls: MetadataRoute.Sitemap = products.map((item: any) => ({
      url: `${baseUrl}/product/${item._id}`,
      lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // Fetch published blog posts
    const blogPosts = await BlogPost.find({ status: 'published' }, 'slug updatedAt').lean();
    const blogUrls: MetadataRoute.Sitemap = blogPosts.map((post: any) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...routes, ...productUrls, ...blogUrls];
  } catch (error) {
    console.error('Error fetching data for sitemap:', error);
    return routes;
  }
}
