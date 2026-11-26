import type { Metadata } from 'next';
import connectToDatabase from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import BlogHubClient from './BlogHubClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'The Farmland Journal — Purity, Apiculture & Superfood Stories',
  description:
    'Read lab-backed guides on identifying pure forest honey, benefits of dehydrated Nendran banana and dates powders, wood cold-pressed oils, and sustainable Kanyakumari farming.',
  alternates: {
    canonical: 'https://beeshubfarmland.com/blog',
  },
  openGraph: {
    title: 'The Farmland Journal | BeesHub Farmland',
    description:
      'Authentic farm stories, honey purity tests, and organic nutrition insights from Kanyakumari, Western Ghats.',
    url: 'https://beeshubfarmland.com/blog',
    type: 'website',
    images: [{ url: '/images/beeshub-logo.png', width: 1137, height: 451, alt: 'BeesHub Farmland Journal' }],
  },
};

export default async function BlogHubPage() {
  let posts: any[] = [];
  let categories: string[] = [];

  try {
    await connectToDatabase();
    const rawPosts = await BlogPost.find({ status: 'published' })
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
