'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, BookOpen } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

/**
 * Section 14: Blog and Farm Stories
 * Renders up to 3 published articles from the backend blog system.
 * Never invents fake publication dates or author identities.
 */
export default function BlogStoriesSection() {
  const { blogPosts } = useStore();
  const visiblePosts = Array.isArray(blogPosts) ? blogPosts.slice(0, 3) : [];

  if (visiblePosts.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-14 sm:py-20 bg-[#F7F4EB]/45 border-b border-[#E4E7E1]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#A97843]">
              The Farmland Journal
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-[#202820] tracking-tight">
              Blog &amp; Farm Stories
            </h2>
            <p className="text-sm text-[#6B756B]">
              Educational guides on honey purity, superfood processing, and regional farming practices.
            </p>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#173F2B] hover:text-[#102E20] shrink-0 group"
          >
            <span>Explore All Articles</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div
          className={`grid grid-cols-1 gap-6 ${
            visiblePosts.length === 1
              ? 'lg:grid-cols-12'
              : visiblePosts.length === 2
              ? 'md:grid-cols-2'
              : 'md:grid-cols-3'
          }`}
        >
          {visiblePosts.map((post) => {
            const formattedDate = post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : null;

            return (
              <article
                key={post._id}
                className={`bg-white rounded-2xl border border-[#E4E7E1] shadow-card hover:shadow-hover transition-all overflow-hidden flex ${
                  visiblePosts.length === 1
                    ? 'lg:col-span-8 flex-col md:flex-row'
                    : 'flex-col justify-between'
                }`}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className={`relative bg-[#F7F4EB] overflow-hidden shrink-0 ${
                    visiblePosts.length === 1
                      ? 'aspect-[16/10] md:aspect-auto md:w-2/5'
                      : 'aspect-[16/10] w-full'
                  }`}
                >
                  <Image
                    src={post.coverImage || '/images/beeshub-pure-forest-honey-spotlight.webp'}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 95vw, 400px"
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#6B756B]">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E8EFE6] text-[#173F2B] font-semibold">
                        {post.category}
                      </span>
                      {formattedDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#A97843]" />
                          <time dateTime={post.publishedAt}>{formattedDate}</time>
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif font-semibold text-lg sm:text-xl text-[#202820] leading-snug">
                      <Link href={`/blog/${post.slug}`} className="hover:text-[#173F2B] transition-colors">
                        {post.title}
                      </Link>
                    </h3>

                    <p className="text-xs sm:text-sm text-[#6B756B] line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E4E7E1] flex items-center justify-between text-xs">
                    <span className="text-[#6B756B] font-medium">
                      {post.author || 'Bees Hub Farmland'}
                    </span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1.5 font-semibold text-[#173F2B] hover:text-[#102E20]"
                    >
                      <span>Read Article</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}

          {visiblePosts.length === 1 && (
            <div className="lg:col-span-4 rounded-2xl p-6 sm:p-8 bg-[#173F2B] text-white flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#F7F4EB]" />
                </div>
                <h3 className="font-serif font-bold text-xl text-white">
                  The Farmland Journal
                </h3>
                <p className="text-xs sm:text-sm text-[#E8EFE6] leading-relaxed">
                  Explore guides on identifying pure forest honey, understanding low-temperature solar dehydration, and sourcing wood cold-pressed oils from Tamil Nadu.
                </p>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#F7F4EB] hover:bg-white text-[#102E20] font-semibold text-xs transition-colors"
              >
                <span>Visit Blog Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
