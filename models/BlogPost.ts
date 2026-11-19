import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: string;
  authorAvatar: string;
  readTime: string;
  isPublished: boolean;
  publishedAt: Date;
  relatedProductIds: string[];
  seoTitle?: string;
  seoDescription?: string;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    coverImage: { type: String, default: '' },
    category: {
      type: String,
      required: true,
      default: 'Honey & Apiculture',
      index: true,
    },
    tags: { type: [String], default: [] },
    author: { type: String, default: 'BeesHub Farmland Team', trim: true },
    authorAvatar: { type: String, default: '/logo.jpg' },
    readTime: { type: String, default: '4 min read' },
    isPublished: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date, default: Date.now, index: true },
    relatedProductIds: { type: [String], default: [] },
    seoTitle: { type: String, default: '', trim: true },
    seoDescription: { type: String, default: '', trim: true },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

BlogPostSchema.index({ isPublished: 1, publishedAt: -1 });
BlogPostSchema.index({ category: 1, isPublished: 1 });

const BlogPost: Model<IBlogPost> =
  mongoose.models.BlogPost || mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);

export default BlogPost;
