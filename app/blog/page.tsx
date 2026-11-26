import type { Metadata } from 'next';
import connectToDatabase from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import BlogHubClient from './BlogHubClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'The Farmland Journal — Farm & Purity Stories',
  description:
    'Read guides on pure forest honey, dehydrated Nendran banana and dates powders, wood cold-pressed oils, and Kanyakumari farming from Bees Hub Farmland.',
  alternates: {
    canonical: 'https://beeshubfarmland.com/blog',
  },
  openGraph: {
    title: 'The Farmland Journal | Bees Hub Farmland',
    description:
      'Authentic farm stories, honey purity tests, and organic nutrition insights from Kanyakumari, Tamil Nadu.',
    url: 'https://beeshubfarmland.com/blog',
    type: 'website',
    images: [{ url: '/images/beeshub-pure-forest-honey-spotlight.webp', width: 1200, height: 630, alt: 'Bees Hub Farmland Journal' }],
  },
};

export default async function BlogHubPage() {
  let posts: any[] = [];
  let categories: string[] = [];

  try {
    await connectToDatabase();
    const rawPosts = await BlogPost.find({ isPublished: true })
      .select('title slug excerpt coverImage category tags author readTime publishedAt views')
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(24)
      .lean();

    posts = JSON.parse(JSON.stringify(rawPosts));
    const catSet = new Set<string>();
    for (const p of posts) {
      if (p.category) catSet.add(p.category);
    }
    categories = Array.from(catSet);
  } catch (error) {
    console.error('SSR BlogHubPage fetch error:', error);
  }

  return <BlogHubClient initialPosts={posts} initialCategories={categories} />;
}
