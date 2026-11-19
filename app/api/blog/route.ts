import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import BlogPost from '@/models/BlogPost';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'ALL';
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '9', 10));
    const skip = (page - 1) * limit;

    const query: any = { isPublished: true };

    if (category !== 'ALL' && category.trim()) {
      query.category = category.trim();
    }

    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: regex },
        { excerpt: regex },
        { tags: regex },
        { author: regex },
      ];
    }

    const [posts, total, allCategories] = await Promise.all([
      BlogPost.find(query)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-content') // Exclude full long content from list view for efficiency
        .lean(),
      BlogPost.countDocuments(query),
      BlogPost.distinct('category', { isPublished: true }),
    ]);

    // Standard baseline categories
    const defaultCategories = [
      'Honey & Apiculture',
      'Organic Spices',
      'Health & Wellness',
      'Farm Stories',
      'Wholesale Guides',
    ];
    const uniqueCategories = Array.from(new Set([...defaultCategories, ...allCategories]));

    return NextResponse.json(
      {
        success: true,
        data: posts,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
        categories: uniqueCategories,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error: any) {
    console.error('Failed to fetch blog posts:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}
