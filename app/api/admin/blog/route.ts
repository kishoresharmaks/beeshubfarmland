import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/db';
import BlogPost from '@/models/BlogPost';

export const dynamic = 'force-dynamic';

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const adminToken = cookieStore.get('admin_token')?.value;

    if (adminToken !== 'logged_in_admin_session_key') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'ALL'; // ALL | PUBLISHED | DRAFT
    const category = searchParams.get('category') || 'ALL';
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '20', 10));
    const skip = (page - 1) * limit;

    const query: any = {};

    if (status === 'PUBLISHED') {
      query.isPublished = true;
    } else if (status === 'DRAFT') {
      query.isPublished = false;
    }

    if (category !== 'ALL' && category.trim()) {
      query.category = category.trim();
    }

    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: regex },
        { slug: regex },
        { excerpt: regex },
        { author: regex },
        { tags: regex },
      ];
    }

    const [posts, total, publishedCount, draftCount] = await Promise.all([
      BlogPost.find(query)
        .sort({ updatedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BlogPost.countDocuments(query),
      BlogPost.countDocuments({ isPublished: true }),
      BlogPost.countDocuments({ isPublished: false }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: posts,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
        counts: {
          total: publishedCount + draftCount,
          published: publishedCount,
          drafts: draftCount,
        },
      },
      {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );
  } catch (error: any) {
    console.error('Failed to fetch admin blog posts:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const adminToken = cookieStore.get('admin_token')?.value;

    if (adminToken !== 'logged_in_admin_session_key') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      slug: customSlug,
      excerpt,
      content,
      coverImage,
      category,
      tags,
      author,
      readTime,
      isPublished,
      relatedProductIds,
      seoTitle,
      seoDescription,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 });
    }
    if (!excerpt || !excerpt.trim()) {
      return NextResponse.json({ success: false, message: 'Excerpt is required' }, { status: 400 });
    }
    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, message: 'Content is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Determine unique slug
    let baseSlug = customSlug ? generateSlug(customSlug) : generateSlug(title);
    if (!baseSlug) baseSlug = 'article-' + Date.now();

    let finalSlug = baseSlug;
    let counter = 1;
    while (await BlogPost.exists({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const publishedStatus = Boolean(isPublished);

    const post = await BlogPost.create({
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt.trim(),
      content,
      coverImage: coverImage || '',
      category: category ? category.trim() : 'Honey & Apiculture',
      tags: Array.isArray(tags) ? tags.map((t: string) => t.trim()).filter(Boolean) : [],
      author: author ? author.trim() : 'BeesHub Farmland Team',
      authorAvatar: '/logo.jpg',
      readTime: readTime ? readTime.trim() : '4 min read',
      isPublished: publishedStatus,
      publishedAt: publishedStatus ? new Date() : undefined,
      relatedProductIds: Array.isArray(relatedProductIds) ? relatedProductIds : [],
      seoTitle: seoTitle ? seoTitle.trim() : title.trim(),
      seoDescription: seoDescription ? seoDescription.trim() : excerpt.trim(),
      views: 0,
    });

    return NextResponse.json({ success: true, data: post });
  } catch (error: any) {
    console.error('Failed to create blog post:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create blog post' },
      { status: 500 }
    );
  }
}
