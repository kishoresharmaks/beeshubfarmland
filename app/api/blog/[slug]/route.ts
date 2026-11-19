import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    await connectToDatabase();

    const { slug } = params;
    if (!slug) {
      return NextResponse.json({ success: false, message: 'Slug is required' }, { status: 400 });
    }

    const post = await BlogPost.findOne({ slug: slug.toLowerCase(), isPublished: true }).lean();

    if (!post) {
      return NextResponse.json({ success: false, message: 'Article not found' }, { status: 404 });
    }

    // Increment view count asynchronously
    BlogPost.findByIdAndUpdate(post._id, { $inc: { views: 1 } }).exec().catch((e) =>
      console.error('Failed to increment views:', e)
    );

    // Fetch related products if any IDs linked
    let relatedProducts: any[] = [];
    if (Array.isArray(post.relatedProductIds) && post.relatedProductIds.length > 0) {
      try {
        relatedProducts = await Product.find({
          _id: { $in: post.relatedProductIds },
        })
          .select('name price mrp discount image category quantity gst')
          .lean();
      } catch (err) {
        console.error('Failed to fetch related products:', err);
      }
    }

    // Fetch up to 3 recent articles in the same category
    const recentPosts = await BlogPost.find({
      category: post.category,
      isPublished: true,
      _id: { $ne: post._id },
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .select('title slug coverImage category readTime publishedAt excerpt')
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: post,
        relatedProducts,
        recentPosts,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
        },
      }
    );
  } catch (error: any) {
    console.error('Failed to fetch article by slug:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch article' },
      { status: 500 }
    );
  }
}
