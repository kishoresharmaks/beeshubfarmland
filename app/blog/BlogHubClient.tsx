'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  Calendar,
  Clock,
  ArrowRight,
  Leaf,
  Briefcase,
  ChevronRight,
  ShoppingBag,
  Sparkles,
  Tag,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Truck,
  Facebook,
  Instagram,
  Youtube,
  RefreshCw,
} from 'lucide-react';

interface BlogPostSummary {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: string;
  readTime: string;
  publishedAt: string;
  views: number;
}

export default function BlogHubClient({
  initialPosts = [],
  initialCategories = [],
}: {
  initialPosts?: BlogPostSummary[];
  initialCategories?: string[];
}) {
  const [posts, setPosts] = useState<BlogPostSummary[]>(initialPosts);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(initialPosts.length === 0);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'ALL') params.set('category', selectedCategory);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      params.set('limit', '24');

      const res = await fetch(`/api/blog?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPosts(data.data || []);
        if (data.categories) {
          setCategories(data.categories);
        }
      }
    } catch (err) {
      console.error('Failed to load blog posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCategory === 'ALL' && !searchQuery.trim() && initialPosts.length > 0) {
      return;
    }
    fetchBlogPosts();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBlogPosts();
  };

  const featuredPost = posts[0];
  const gridPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-[#FFFCFB] text-[#163B5C] font-sans flex flex-col">
      {/* Store Header Nav */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8EDF2] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/images/beeshub-logo.png"
              alt="BeesHub Farmland Logo"
              className="h-10 w-auto object-contain rounded-xl shadow-xs border border-[#E8EDF2] bg-white px-1.5 py-1 group-hover:scale-105 transition-transform"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
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

          {/* Navigation Links */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2.5 rounded-full border border-[#E8EDF2] hover:border-[#163B5C]/30 text-[#163B5C] font-bold text-xs transition-all bg-white flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#ED3500]" />
              <span>Shop Store</span>
            </Link>

            <Link
              href="/"
              className="px-5 py-2.5 rounded-full bg-[#ED3500] hover:bg-[#D02E00] text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-[#ED3500]/20 transition-all flex items-center gap-1.5"
            >
              <span>Back to Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header Section */}
      <section className="bg-gradient-to-br from-[#FFF5F2] via-[#FFFCFB] to-[#FFF8F5] border-b border-[#E8EDF2] py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#163B5C]/5 border border-[#163B5C]/10 text-xs font-bold text-[#163B5C]">
            <BookOpen className="w-3.5 h-3.5 text-[#ED3500]" />
            <span>The Farmland Journal • Stories from the Apiary</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#163B5C] tracking-tight leading-tight">
            Natural Wisdom, Farm Stories &{' '}
            <span className="text-[#ED3500] underline decoration-wavy decoration-[#ED3500]/30 underline-offset-8">
              Harvest Insights
            </span>
          </h1>

          <p className="text-[#64748B] text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Explore authentic guides on sustainable beekeeping, pure raw honey benefits, organic spices,
            and farm-to-door harvest traditions straight from the Western Ghats farmlands.
          </p>

          {/* Search Input Bar */}
          <form onSubmit={handleSearchSubmit} className="pt-2 max-w-md mx-auto relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search articles on honey, turmeric, health..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-24 py-3 bg-white border border-[#E8EDF2] rounded-full text-xs sm:text-sm text-[#163B5C] shadow-sm focus:outline-none focus:border-[#ED3500]"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#163B5C] hover:bg-[#0E273E] text-white rounded-full text-xs font-bold transition-all"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        {/* Category Pills Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-[#ED3500] text-white shadow-md shadow-[#ED3500]/20'
                : 'bg-white border border-[#E8EDF2] text-[#64748B] hover:text-[#163B5C]'
            }`}
          >
            All Stories ({posts.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#ED3500] text-white shadow-md shadow-[#ED3500]/20'
                  : 'bg-white border border-[#E8EDF2] text-[#64748B] hover:text-[#163B5C]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#ED3500] animate-spin mx-auto" />
            <p className="text-xs text-[#64748B] font-semibold">Gathering fresh stories from the farm...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-[#E8EDF2] text-center space-y-3 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF8F5] text-[#ED3500] flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-[#163B5C]">No articles found</h3>
            <p className="text-xs text-[#64748B]">
              No articles match your current search or category filter. Check back soon for new farm stories!
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured Hero Article (Topmost Article) */}
            {featuredPost && selectedCategory === 'ALL' && !searchQuery && (
              <div className="bg-white rounded-3xl border border-[#E8EDF2] shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Image */}
                  <div className="lg:col-span-7 relative overflow-hidden aspect-[16/9] lg:aspect-auto">
                    <img
                      src={featuredPost.coverImage || '/logo.jpg'}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-[#ED3500] text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                        Featured Story
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-xs text-[#64748B]">
                        <span className="font-bold text-[#ED3500] bg-[#FFF8F5] px-2.5 py-0.5 rounded-full border border-[#ED3500]/20">
                          {featuredPost.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {featuredPost.readTime}
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-black text-[#163B5C] leading-snug group-hover:text-[#ED3500] transition-colors">
                        <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
                      </h2>

                      <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed line-clamp-3">
                        {featuredPost.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#E8EDF2] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-[#E8EDF2] flex items-center justify-center font-bold text-[10px] text-[#163B5C]">
                          BH
                        </div>
                        <span className="text-xs font-bold text-[#163B5C]">{featuredPost.author}</span>
                      </div>

                      <Link
                        href={`/blog/${featuredPost.slug}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#163B5C] group-hover:bg-[#ED3500] text-white text-xs font-extrabold uppercase tracking-wider transition-all"
                      >
                        <span>Read Story</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Articles Grid */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-lg text-[#163B5C] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#ED3500]" />
                <span>
                  {selectedCategory === 'ALL' ? 'Latest Farm Harvest Stories' : `${selectedCategory} Stories`}
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(selectedCategory === 'ALL' && !searchQuery ? gridPosts : posts).map((post) => (
                  <article
                    key={post._id}
                    className="bg-white rounded-3xl border border-[#E8EDF2] shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
                  >
                    {/* Cover Image */}
                    <Link
                      href={`/blog/${post.slug}`}
                      className="aspect-[16/10] overflow-hidden relative block bg-[#FFF8F5]"
                    >
                      <img
                        src={post.coverImage || '/logo.jpg'}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[#163B5C] text-[10px] font-extrabold shadow-xs">
                        {post.category}
                      </span>
                    </Link>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] text-[#64748B]">
                          <span>
                            {new Date(post.publishedAt || Date.now()).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {post.readTime}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-sm sm:text-base text-[#163B5C] leading-snug group-hover:text-[#ED3500] transition-colors line-clamp-2">
                          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                        </h4>

                        <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">{post.excerpt}</p>
                      </div>

                      <div className="pt-3 border-t border-[#E8EDF2]/70 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-bold text-[#64748B]">{post.author}</span>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="font-extrabold text-[#ED3500] hover:text-[#D02E00] flex items-center gap-1 transition-colors"
                        >
                          <span>Read</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Wholesale & Commercial Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#163B5C] to-[#0E273E] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <span className="px-3 py-1 rounded-full bg-amber-400 text-[#163B5C] font-black text-[10px] uppercase tracking-wider inline-block">
              Commercial Trade Desk
            </span>
            <h3 className="text-xl sm:text-2xl font-black">Need Bulk Raw Honey or Farm Spices?</h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              We supply single-origin honey, turmeric, and pepper to hotels, cloud kitchens, ayurvedic brands,
              and retail distributors. FSSAI & GST commercial billing.
            </p>
          </div>
          <Link
            href="/"
            className="px-6 py-3 rounded-2xl bg-[#ED3500] hover:bg-[#D02E00] text-white font-extrabold text-xs uppercase tracking-wider shrink-0 shadow-lg shadow-[#ED3500]/25 transition-all"
          >
            Request B2B Quote
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E8EDF2] pt-12 pb-8 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="/images/beeshub-logo.png"
                  alt="BeesHub Farmland Logo"
                  className="h-10 w-auto object-contain rounded-xl border border-[#E8EDF2] bg-white px-1.5 py-1"
                />
                <div>
                  <h4 className="font-black text-base text-[#163B5C]">BEES HUB FARMLAND</h4>
                  <span className="text-[10px] text-[#64748B] block -mt-0.5">PVT LTD • KANYAKUMARI</span>
                </div>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Dedicated to raw, unfiltered honey harvesting and sustainable farming practices in the Western
                Ghats terroir of Kanyakumari.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-extrabold text-sm text-[#163B5C]">Explore Farmland</h4>
              <ul className="space-y-2 text-xs text-[#64748B]">
                <li>
                  <Link href="/" className="hover:text-[#ED3500] transition-colors">
                    Storefront Catalog
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-[#ED3500] transition-colors font-bold text-[#ED3500]">
                    The Farmland Journal (Blog)
                  </Link>
                </li>
                <li>
                  <Link href="/#catalog-section" className="hover:text-[#ED3500] transition-colors">
                    Pure Raw Honey Harvest
                  </Link>
                </li>
                <li>
                  <Link href="/#catalog-section" className="hover:text-[#ED3500] transition-colors">
                    Organic Farm Spices
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-extrabold text-sm text-[#163B5C]">Direct Farm Contact</h4>
              <div className="space-y-2 text-xs text-[#64748B]">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#ED3500] shrink-0" />
                  <span>+91 95787 84431</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#ED3500] shrink-0" />
                  <span>admin@beeshubfarmland.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#ED3500] shrink-0" />
                  <span>Kanyakumari, Tamil Nadu, India</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#E8EDF2] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
            <span>© {new Date().getFullYear()} BeesHub Farmland Pvt Ltd. All rights reserved.</span>
            <span>Pure Organic Harvest • FSSAI Certified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
