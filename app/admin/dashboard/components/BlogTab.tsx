'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Calendar,
  Tag,
  Image as ImageIcon,
  ExternalLink,
  X,
  AlertCircle,
  FileText,
  Upload,
  Check,
  Package,
} from 'lucide-react';
import MarkdownRenderer from '@/components/blog/MarkdownRenderer';

interface BlogPostItem {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: string;
  readTime: string;
  isPublished: boolean;
  publishedAt?: string;
  relatedProductIds: string[];
  seoTitle?: string;
  seoDescription?: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductOption {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

const CATEGORIES = [
  'Honey & Apiculture',
  'Organic Spices',
  'Health & Wellness',
  'Farm Stories',
  'Wholesale Guides',
];

export default function BlogTab() {
  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState({ total: 0, published: 0, drafts: 0 });

  // Store Products for linking
  const [availableProducts, setAvailableProducts] = useState<ProductOption[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPostItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [activeEditorTab, setActiveEditorTab] = useState<'write' | 'preview'>('write');

  // Form Fields
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Honey & Apiculture',
    tags: '',
    author: 'BeesHub Farmland Team',
    readTime: '4 min read',
    excerpt: '',
    content: '',
    coverImage: '',
    isPublished: true,
    relatedProductIds: [] as string[],
    seoTitle: '',
    seoDescription: '',
  });

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      params.set('page', page.toString());
      params.set('limit', '15');

      const res = await fetch(`/api/admin/blog?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPosts(data.data);
        setTotalPages(data.totalPages || 1);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error('Failed to load blog posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAvailableProducts(
          data.data.map((p: any) => ({
            _id: p._id,
            name: p.name,
            price: p.price,
            image: p.image || '/logo.jpg',
            category: p.category,
          }))
        );
      }
    } catch (e) {
      console.error('Failed to load products for blog linking:', e);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchProducts();
  }, [statusFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  const handleOpenCreateModal = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      slug: '',
      category: 'Honey & Apiculture',
      tags: 'organic, raw honey, kanyakumari',
      author: 'BeesHub Farmland Team',
      readTime: '4 min read',
      excerpt: '',
      content: '',
      coverImage: '',
      isPublished: true,
      relatedProductIds: [],
      seoTitle: '',
      seoDescription: '',
    });
    setModalError('');
    setActiveEditorTab('write');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (post: BlogPostItem) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      category: post.category,
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
      author: post.author || 'BeesHub Farmland Team',
      readTime: post.readTime || '4 min read',
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage || '',
      isPublished: post.isPublished,
      relatedProductIds: post.relatedProductIds || [],
      seoTitle: post.seoTitle || '',
      seoDescription: post.seoDescription || '',
    });
    setModalError('');
    setActiveEditorTab('write');
    setIsModalOpen(true);
  };

  // Auto-slug generator on title blur
  const handleTitleBlur = () => {
    if (!formData.slug && formData.title) {
      const generated = formData.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData((prev) => ({ ...prev, slug: generated }));
    }
  };

  // Image Upload with Canvas Compression
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          setFormData((prev) => ({ ...prev, coverImage: compressed }));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Image compression failed:', err);
    }
  };

  const toggleRelatedProduct = (productId: string) => {
    setFormData((prev) => {
      const exists = prev.relatedProductIds.includes(productId);
      return {
        ...prev,
        relatedProductIds: exists
          ? prev.relatedProductIds.filter((id) => id !== productId)
          : [...prev.relatedProductIds, productId],
      };
    });
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!formData.title.trim()) {
      setModalError('Title is required');
      return;
    }
    if (!formData.excerpt.trim()) {
      setModalError('Excerpt is required');
      return;
    }
    if (!formData.content.trim()) {
      setModalError('Article content is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        category: formData.category,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        author: formData.author.trim(),
        readTime: formData.readTime.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content,
        coverImage: formData.coverImage,
        isPublished: formData.isPublished,
        relatedProductIds: formData.relatedProductIds,
        seoTitle: formData.seoTitle.trim(),
        seoDescription: formData.seoDescription.trim(),
      };

      const url = editingPost ? `/api/admin/blog/${editingPost._id}` : '/api/admin/blog';
      const method = editingPost ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchPosts();
      } else {
        setModalError(data.message || 'Failed to save article.');
      }
    } catch (err) {
      setModalError('Network error while saving article.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (post: BlogPostItem) => {
    try {
      const res = await fetch(`/api/admin/blog/${post._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !post.isPublished }),
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) =>
          prev.map((p) => (p._id === post._id ? { ...p, isPublished: !p.isPublished } : p))
        );
      }
    } catch (e) {
      console.error('Failed to toggle publish status:', e);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this article?')) return;
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (e) {
      console.error('Failed to delete article:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#E8EDF2] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#ED3500]/10 text-[#ED3500] flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#163B5C]">Farmland Blog & Stories</h2>
            <p className="text-xs text-[#64748B]">
              Author educational stories, health guides, and apiculture articles with direct product links
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search title, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
            />
          </form>

          <button
            onClick={() => {
              setPage(1);
              fetchPosts();
            }}
            className="p-2.5 rounded-xl border border-[#E8EDF2] text-[#163B5C] hover:bg-[#FFFCFB] transition-colors"
            title="Reload Stories"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-[#ED3500] hover:bg-[#D02E00] text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-[#ED3500]/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Story</span>
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => {
            setStatusFilter('ALL');
            setPage(1);
          }}
          className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all ${
            statusFilter === 'ALL'
              ? 'bg-[#163B5C] text-white shadow-md'
              : 'bg-white border border-[#E8EDF2] text-[#64748B]'
          }`}
        >
          All Stories ({counts.total})
        </button>
        <button
          onClick={() => {
            setStatusFilter('PUBLISHED');
            setPage(1);
          }}
          className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all ${
            statusFilter === 'PUBLISHED'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white border border-[#E8EDF2] text-[#64748B]'
          }`}
        >
          Published ({counts.published})
        </button>
        <button
          onClick={() => {
            setStatusFilter('DRAFT');
            setPage(1);
          }}
          className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all ${
            statusFilter === 'DRAFT'
              ? 'bg-amber-500 text-white shadow-md'
              : 'bg-white border border-[#E8EDF2] text-[#64748B]'
          }`}
        >
          Drafts ({counts.drafts})
        </button>
      </div>

      {/* Articles Table Card */}
      <div className="bg-white rounded-3xl border border-[#E8EDF2] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#ED3500] animate-spin mx-auto" />
            <p className="text-xs text-[#64748B] font-semibold">Loading articles...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-sm text-[#163B5C]">No blog stories found</h4>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              Click &quot;Write New Story&quot; above to publish your first farm journal article!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E8EDF2] bg-[#FFFCFB] text-[#64748B] font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Story & Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Linked Products</th>
                  <th className="py-3.5 px-4">Views</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Published Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EDF2]">
                {posts.map((post) => (
                  <tr key={post._id} className="hover:bg-[#FFFCFB] transition-colors">
                    {/* Story Title & Cover */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {post.coverImage ? (
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-14 h-12 object-cover rounded-xl border border-[#E8EDF2] shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-12 rounded-xl bg-slate-100 border border-[#E8EDF2] flex items-center justify-center text-slate-400 shrink-0">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-[#163B5C] text-sm line-clamp-1">
                            {post.title}
                          </h4>
                          <span className="text-[10px] font-mono text-[#64748B] block mt-0.5">
                            /blog/{post.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[#163B5C] font-bold text-[10px]">
                        {post.category}
                      </span>
                    </td>

                    {/* Linked Products Count */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {post.relatedProductIds?.length > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#ED3500]/10 text-[#ED3500] font-black text-[10px]">
                          <Package className="w-3 h-3" />
                          <span>{post.relatedProductIds.length} Products</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">None</span>
                      )}
                    </td>

                    {/* Views */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-600">
                      {post.views || 0}
                    </td>

                    {/* Status Badge & Toggle */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleTogglePublish(post)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          post.isPublished
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-300'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300'
                        }`}
                        title="Click to toggle publish status"
                      >
                        {post.isPublished ? '● Published' : '○ Draft'}
                      </button>
                    </td>

                    {/* Published Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-[#64748B] text-[11px]">
                      {post.publishedAt ? (
                        new Date(post.publishedAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      ) : (
                        <span className="text-slate-400">Not published</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {post.isPublished && (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-[#163B5C] hover:bg-slate-100"
                            title="View Public Article"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleOpenEditModal(post)}
                          className="p-1.5 rounded-lg text-[#163B5C] hover:bg-slate-100"
                          title="Edit Article"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                          title="Delete Article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Article Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#E8EDF2] max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E8EDF2] bg-gradient-to-r from-[#163B5C] to-[#0E273E] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base sm:text-lg">
                  {editingPost ? 'Edit Blog Article' : 'Write New Farmland Story'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSavePost} className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
              {modalError && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#163B5C] mb-1">
                    Article Title <span className="text-[#ED3500]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 7 Proven Health Benefits of Raw Forest Honey"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    onBlur={handleTitleBlur}
                    className="w-full px-3.5 py-2.5 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#163B5C] mb-1">
                    URL Slug <span className="text-[#ED3500]">*</span>
                  </label>
                  <div className="flex items-center">
                    <span className="px-2.5 py-2.5 bg-slate-100 border border-r-0 border-[#E8EDF2] rounded-l-xl text-slate-500 font-mono text-[11px]">
                      /blog/
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="raw-forest-honey-benefits"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2.5 bg-[#FFFCFB] border border-[#E8EDF2] rounded-r-xl text-xs text-[#163B5C] font-mono focus:outline-none focus:border-[#ED3500]"
                    />
                  </div>
                </div>
              </div>

              {/* Category, Tags, Author, Read Time */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-[#163B5C] mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#163B5C] mb-1">Tags (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="honey, health, organic"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#163B5C] mb-1">Author Name</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#163B5C] mb-1">Reading Time</label>
                  <input
                    type="text"
                    placeholder="4 min read"
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                  />
                </div>
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <label className="block font-bold text-[#163B5C]">Featured Cover Image</label>
                <div className="flex items-center gap-4">
                  {formData.coverImage ? (
                    <img
                      src={formData.coverImage}
                      alt="Cover Preview"
                      className="w-28 h-20 object-cover rounded-xl border border-[#E8EDF2] shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="w-28 h-20 rounded-xl bg-slate-100 border border-[#E8EDF2] flex items-center justify-center text-slate-400 shrink-0">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#163B5C] font-bold cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload & Compress Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-[#64748B]">
                      Automatically compressed to ~40KB for rapid loading speeds
                    </p>
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block font-bold text-[#163B5C] mb-1">
                  Short Excerpt / Summary <span className="text-[#ED3500]">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="2-3 sentence overview shown on blog index cards and Google search previews..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                />
              </div>

              {/* Article Content Editor with Write/Preview toggle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#163B5C]">
                    Article Body <span className="text-[#ED3500]">*</span>
                  </label>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setActiveEditorTab('write')}
                      className={`px-3 py-1 rounded-md transition-all ${
                        activeEditorTab === 'write' ? 'bg-white text-[#163B5C] shadow-xs' : 'text-[#64748B]'
                      }`}
                    >
                      Write (Markdown / Text)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveEditorTab('preview')}
                      className={`px-3 py-1 rounded-md transition-all ${
                        activeEditorTab === 'preview' ? 'bg-white text-[#163B5C] shadow-xs' : 'text-[#64748B]'
                      }`}
                    >
                      Live Preview
                    </button>
                  </div>
                </div>

                {activeEditorTab === 'write' ? (
                  <textarea
                    rows={12}
                    required
                    placeholder="Write article here in standard Markdown or text paragraphs (use ## for subheadings, * for bullet points, **bold** for emphasis)..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3.5 py-3 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C] font-mono leading-relaxed focus:outline-none focus:border-[#ED3500]"
                  />
                ) : (
                  <div className="p-4 bg-slate-50 border border-[#E8EDF2] rounded-xl min-h-[220px] max-h-[380px] overflow-y-auto prose prose-slate text-xs">
                    {formData.content ? (
                      <MarkdownRenderer content={formData.content} />
                    ) : (
                      <span className="text-slate-400 italic">No content written yet...</span>
                    )}
                  </div>
                )}
              </div>

              {/* Linked Store Products (Cross-Sell Engine) */}
              <div className="p-4 rounded-2xl border border-[#E8EDF2] bg-[#FFFCFB] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#ED3500]" />
                    <h4 className="font-extrabold text-[#163B5C] text-xs">
                      Feature Store Products in this Story
                    </h4>
                  </div>
                  <span className="text-[10px] text-[#64748B]">
                    {formData.relatedProductIds.length} Products Selected
                  </span>
                </div>
                <p className="text-[10px] text-[#64748B]">
                  Checkmark store products to embed product cards with direct buy buttons at the end of this article!
                </p>

                {availableProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1">
                    {availableProducts.map((prod) => {
                      const isSelected = formData.relatedProductIds.includes(prod._id);
                      return (
                        <div
                          key={prod._id}
                          onClick={() => toggleRelatedProduct(prod._id)}
                          className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#ED3500] bg-[#FFF8F5]'
                              : 'border-[#E8EDF2] bg-white hover:border-slate-300'
                          }`}
                        >
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-8 h-8 rounded-lg object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-[10px] text-[#163B5C] block line-clamp-1">
                              {prod.name}
                            </span>
                            <span className="text-[9px] text-[#ED3500] font-black">₹{prod.price}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#ED3500] shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-slate-400 text-[10px]">No store products found.</span>
                )}
              </div>

              {/* SEO Metadata Settings */}
              <div className="p-4 rounded-2xl border border-[#E8EDF2] bg-white space-y-3">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-600" />
                  <h4 className="font-extrabold text-[#163B5C] text-xs">SEO & Social Meta Settings</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] mb-1">
                      Custom SEO Title (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Defaults to article title"
                      value={formData.seoTitle}
                      onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] mb-1">
                      Custom Meta Description (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Defaults to excerpt"
                      value={formData.seoDescription}
                      onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl text-xs text-[#163B5C]"
                    />
                  </div>
                </div>
              </div>

              {/* Publishing Status Toggle & Form Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E8EDF2]">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 text-[#ED3500] rounded focus:ring-0"
                  />
                  <span className="font-extrabold text-xs text-[#163B5C]">
                    Publish Immediately (Visible to public)
                  </span>
                </label>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-[#E8EDF2] font-bold text-[#64748B]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-[#ED3500] hover:bg-[#D02E00] text-white font-extrabold uppercase tracking-wider shadow-md shadow-[#ED3500]/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Saving...' : editingPost ? 'Update Article' : 'Save & Publish'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
