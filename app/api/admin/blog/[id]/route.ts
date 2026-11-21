import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import { isAuthenticatedAdmin, unauthenticatedResponse } from '@/lib/authCheck';

export const dynamic = 'force-dynamic';

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!isAuthenticatedAdmin(request)) {
      return unauthenticatedResponse();
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Post ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const updateFields: any = {};

    if (body.title !== undefined) updateFields.title = body.title.trim();
    if (body.slug !== undefined && body.slug.trim()) {
      const cleanSlug = generateSlug(body.slug);
      // Check for slug collision on other posts
      const existing = await BlogPost.findOne({ slug: cleanSlug, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json(
          { success: false, message: 'An article with this URL slug already exists.' },
          { status: 400 }
        );
      }
      updateFields.slug = cleanSlug;
    }
    if (body.excerpt !== undefined) updateFields.excerpt = body.excerpt.trim();
    if (body.content !== undefined) updateFields.content = body.content;
    if (body.coverImage !== undefined) updateFields.coverImage = body.coverImage;
    if (body.category !== undefined) updateFields.category = body.category.trim();
    if (Array.isArray(body.tags)) updateFields.tags = body.tags;
    if (body.author !== undefined) updateFields.author = body.author.trim();
    if (body.readTime !== undefined) updateFields.readTime = body.readTime.trim();
    if (Array.isArray(body.relatedProductIds)) updateFields.relatedProductIds = body.relatedProductIds;
    if (body.seoTitle !== undefined) updateFields.seoTitle = body.seoTitle.trim();
    if (body.seoDescription !== undefined) updateFields.seoDescription = body.seoDescription.trim();

    if (typeof body.isPublished === 'boolean') {
      updateFields.isPublished = body.isPublished;
      if (body.isPublished) {
        // If publishing and no previous publish date, set now
        const current = await BlogPost.findById(id).select('publishedAt').lean();
        if (!current?.publishedAt) {
          updateFields.publishedAt = new Date();
        }
      }
    }

    await connectToDatabase();

    const updated = await BlogPost.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Failed to update blog post:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update article' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!isAuthenticatedAdmin(request)) {
      return unauthenticatedResponse();
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Post ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    await BlogPost.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Article deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete blog post:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete article' },
      { status: 500 }
    );
  }
}
