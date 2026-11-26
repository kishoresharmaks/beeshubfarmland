import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import connectToDatabase from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import Product from '@/models/Product';
import ShareButtons from './ShareButtons';
import MarkdownRenderer from '@/components/blog/MarkdownRenderer';
import {
  Calendar,
  Clock,
  ArrowLeft,
  ChevronRight,
  ShoppingBag,
  PackageCheck,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await connectToDatabase();
  const post = await BlogPost.findOne({ slug: params.slug.toLowerCase(), isPublished: true }).lean();

  if (!post) {
    return {
      title: 'Article Not Found | BeesHub Farmland',
    };
  }

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const imageUrl = post.coverImage || 'https://beeshubfarmland.com/images/beeshub-logo.png';

  return {
    title: `${title} | BeesHub Farmland`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author || 'BeesHub Farmland'],
      images: [imageUrl],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  await connectToDatabase();

  const post = await BlogPost.findOne({
    slug: params.slug.toLowerCase(),
    isPublished: true,
  }).lean();

  if (!post) {
    notFound();
  }

  // Increment view counter asynchronously
  BlogPost.findByIdAndUpdate(post._id, { $inc: { views: 1 } })
    .exec()
    .catch(() => {});

  // Fetch related store products if linked
  let relatedProducts: any[] = [];
  if (Array.isArray(post.relatedProductIds) && post.relatedProductIds.length > 0) {
    try {
      relatedProducts = await Product.find({
        _id: { $in: post.relatedProductIds },
      })
        .select('name price mrp discount image category quantity gst')
        .lean();
    } catch (err) {
      console.error('Failed to query related products:', err);
    }
  }

  // Fetch 2-3 recent articles from same category
  const recentPosts = await BlogPost.find({
    category: post.category,
    isPublished: true,
    _id: { $ne: post._id },
  })
    .sort({ publishedAt: -1 })
    .limit(3)
    .select('title slug coverImage category readTime publishedAt')
    .lean();

  // JSON-LD Article Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage || 'https://beeshubfarmland.com/images/beeshub-logo.png',
    datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: 'BeesHub Farmland Pvt Ltd',
      url: 'https://beeshubfarmland.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'BeesHub Farmland Pvt Ltd',
      logo: {
        '@type': 'ImageObject',
        url: 'https://beeshubfarmland.com/images/beeshub-logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://beeshubfarmland.com/blog/${post.slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-[#FFFCFB] text-[#163B5C] font-sans flex flex-col">
      {/* Article Schema for Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header Nav */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8EDF2] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/images/beeshub-logo.png"
              alt="BeesHub Farmland Logo"
              className="w-10 h-10 object-contain rounded-xl shadow-xs border border-[#E8EDF2]"
            />
            <div>
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-[#163B5C]">
                BeesHub <span className="text-[#ED3500]">Farmland</span>
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-[#64748B] font-bold -mt-1">
                Pvt Ltd
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              className="px-4 py-2 rounded-full border border-[#E8EDF2] hover:border-[#163B5C]/30 text-[#163B5C] font-bold text-xs transition-all bg-white flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Stories</span>
            </Link>

            <Link
              href="/"
              className="px-5 py-2 rounded-full bg-[#ED3500] hover:bg-[#D02E00] text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-[#ED3500]/20 transition-all flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Shop Store</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Article Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-[#64748B]">
          <Link href="/" className="hover:text-[#163B5C] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/blog" className="hover:text-[#163B5C] transition-colors">
            Farmland Journal
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-bold text-[#163B5C] truncate max-w-[200px] sm:max-w-xs">
            {post.title}
          </span>
        </nav>

        {/* Article Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="px-3 py-1 rounded-full bg-[#FFF8F5] border border-[#ED3500]/20 text-[#ED3500] font-black uppercase text-[10px] tracking-wider">
              {post.category}
            </span>
            <span className="flex items-center gap-1 text-[#64748B]">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {new Date(post.publishedAt || Date.now()).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <span className="text-[#64748B]">•</span>
            <span className="flex items-center gap-1 text-[#64748B]">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {post.readTime}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#163B5C] tracking-tight leading-tight">
            {post.title}
          </h1>

          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed font-medium">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-[#E8EDF2] flex items-center justify-center font-bold text-xs text-[#163B5C]">
              BH
            </div>
            <div>
              <span className="font-extrabold text-xs text-[#163B5C] block">
                {post.author || 'BeesHub Farmland Team'}
              </span>
              <span className="text-[10px] text-[#64748B] block">
                BeesHub Farmland Research & Apiculture Desk
              </span>
            </div>
          </div>
        </header>

        {/* Cover Image Banner */}
        {post.coverImage && (
          <div className="rounded-3xl overflow-hidden border border-[#E8EDF2] shadow-sm aspect-[16/9] bg-[#FFF8F5]">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Social Share Bar */}
        <ShareButtons title={post.title} slug={post.slug} />

        {/* Article Body Content */}
        <article className="prose prose-slate max-w-none text-slate-700 space-y-4">
          <MarkdownRenderer content={post.content} />
        </article>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="pt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#64748B]">Tags:</span>
            {post.tags.map((t: string) => (
              <span
                key={t}
                className="px-2.5 py-1 rounded-lg bg-slate-100 text-[#163B5C] text-xs font-semibold"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* FEATURED FARM PRODUCTS IN THIS STORY (High-Converting E-Commerce Cross-Sell) */}
        {relatedProducts.length > 0 && (
          <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#FFF8F5] via-[#FFFCFB] to-[#FFF5F2] border border-[#ED3500]/20 shadow-sm space-y-5 my-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#ED3500] text-white font-black text-[10px] uppercase tracking-wider inline-block mb-1">
                  Farm Direct Harvest
                </span>
                <h3 className="text-xl font-black text-[#163B5C] flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-[#ED3500]" />
                  <span>Featured Products in this Story</span>
                </h3>
                <p className="text-xs text-[#64748B]">
                  Handpicked directly from our Kanyakumari farmlands. Certified pure with zero chemicals.
                </p>
              </div>
              <Link
                href="/#catalog-section"
                className="text-xs font-extrabold text-[#ED3500] hover:text-[#D02E00] flex items-center gap-1 shrink-0"
              >
                <span>View Full Store</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              {relatedProducts.map((prod: any) => (
                <div
                  key={prod._id.toString()}
                  className="bg-white p-4 rounded-2xl border border-[#E8EDF2] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-[#FFF8F5] relative">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {prod.discount > 0 && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#ED3500] text-white text-[10px] font-black">
                        -{prod.discount}%
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase">{prod.category}</span>
                    <h4 className="font-extrabold text-sm text-[#163B5C] line-clamp-1 group-hover:text-[#ED3500] transition-colors">
                      {prod.name}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E8EDF2]">
                    <div>
                      <span className="text-sm font-black text-[#ED3500]">₹{prod.price}</span>
                      {prod.mrp > prod.price && (
                        <span className="text-[11px] text-slate-400 line-through ml-1.5">
                          ₹{prod.mrp}
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/?highlight=${prod._id}#catalog-section`}
                      className="px-3.5 py-1.5 rounded-xl bg-[#ED3500] hover:bg-[#D02E00] text-white text-xs font-bold transition-all shadow-xs"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* More Stories from Farmland Journal */}
        {recentPosts.length > 0 && (
          <section className="space-y-4 pt-8 border-t border-[#E8EDF2]">
            <h3 className="text-lg font-black text-[#163B5C] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ED3500]" />
              <span>More Stories on {post.category}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recentPosts.map((rPost: any) => (
                <Link
                  key={rPost._id.toString()}
                  href={`/blog/${rPost.slug}`}
                  className="bg-white p-3 rounded-2xl border border-[#E8EDF2] hover:shadow-md transition-all flex flex-col space-y-2 group"
                >
                  <div className="aspect-[16/10] rounded-xl overflow-hidden bg-[#FFF8F5]">
                    <img
                      src={rPost.coverImage || '/images/beeshub-logo.png'}
                      alt={rPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#ED3500]">{rPost.category}</span>
                  <h4 className="font-extrabold text-xs text-[#163B5C] line-clamp-2 group-hover:text-[#ED3500] transition-colors">
                    {rPost.title}
                  </h4>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Wholesale CTA Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#163B5C] to-[#0E273E] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-extrabold text-base">Are you a Hotel, Brand, or Bulk Distributor?</h4>
            <p className="text-xs text-slate-300">
              Procure certified raw honey and spices directly from Kanyakumari with commercial GST invoices.
            </p>
          </div>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#163B5C] font-black text-xs uppercase tracking-wider shrink-0 transition-all"
          >
            Contact B2B Desk
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E8EDF2] pt-12 pb-8 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 border-b border-[#E8EDF2]">
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/images/beeshub-logo.png"
                alt="BeesHub Farmland Logo"
                className="w-9 h-9 object-contain rounded-xl border border-[#E8EDF2]"
              />
              <span className="font-black text-base text-[#163B5C]">BEES HUB FARMLAND</span>
            </Link>
            <div className="flex items-center gap-4 text-xs font-bold text-[#64748B]">
              <Link href="/" className="hover:text-[#ED3500]">
                Storefront
              </Link>
              <Link href="/blog" className="text-[#ED3500]">
                Farmland Journal
              </Link>
              <Link href="/#catalog-section" className="hover:text-[#ED3500]">
                Raw Honey
              </Link>
              <Link href="/#catalog-section" className="hover:text-[#ED3500]">
                Spices
              </Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
            <span>© {new Date().getFullYear()} BeesHub Farmland Pvt Ltd. All rights reserved.</span>
            <span>100% Raw Single-Origin Harvest • FSSAI Certified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
