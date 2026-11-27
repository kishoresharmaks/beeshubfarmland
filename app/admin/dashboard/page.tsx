'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import {
  Plus,
  Package,
  ShoppingBag,
  LogOut,
  Trash2,
  Edit,
  Clock,
  X,
  Upload,
  RefreshCw,
  IndianRupee,
  Phone,
  Mail,
  MapPin,
  Filter,
  Layers,
  Tag,
  CreditCard,
  QrCode,
  ChevronLeft,
  ChevronRight,
  Check,
  Image as ImageIcon,
  Zap,
  Store,
  Menu,
  FileText,
  Lock,
  ShieldCheck,
  Sparkles,
  Briefcase,
  BookOpen,
} from 'lucide-react';
import POSCounter from './components/pos/POSCounter';
import SubscriptionTab from '@/components/licensing/SubscriptionTab';
import GracePeriodBanner from '@/components/licensing/GracePeriodBanner';
import LicenseActivationModal from '@/components/licensing/LicenseActivationModal';
import WholesaleLeadsTab from './components/WholesaleLeadsTab';
import BlogTab from './components/BlogTab';
import { IClientLicenseState } from '@/lib/licensing/licenseTypes';

interface BannerItem {
  _id: string;
  title: string;
  image: string;
  link?: string;
  createdAt: string;
}

interface ProductVariant {
  _id?: string;
  name: string;
  mrp: number | string;
  price: number | string;
  quantity: number | string;
  discount?: number;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  image: string;
  mrp: number;
  price: number;
  discount: number;
  quantity: number;
  gst: number;
  category: string;
  showOnHomepage?: boolean;
  coaUrl?: string;
  variants?: ProductVariant[];
  createdAt: string;
}

interface CategoryItem {
  _id: string;
  name: string;
  createdAt: string;
}

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  gst: number;
  image?: string;
}

interface Order {
  _id: string;
  orderId: string;
  invoiceNumber?: string;
  orderType?: 'ONLINE' | 'POS';
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  pincode: string;
  items: OrderItem[];
  subtotal: number;
  totalGst: number;
  totalAmount: number;
  discountType?: 'FLAT' | 'PERCENTAGE';
  discountValue?: number;
  discountAmount?: number;
  paymentMethod: 'COD' | 'UPI' | 'CASH' | 'RAZORPAY';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  transactionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  inventoryConflict?: boolean;
  conflictNotes?: string;
  cashReceived?: number;
  changeReturned?: number;
  cashierName?: string;
  cashierId?: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'products' | 'categories' | 'orders' | 'banners' | 'settings' | 'pos' | 'subscription' | 'wholesale' | 'blog'
  >('products');
  const [licenseState, setLicenseState] = useState<IClientLicenseState | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // POS & Billing Security Lock State
  const [isPosUnlocked, setIsPosUnlocked] = useState(false);
  const [isSecModalOpen, setIsSecModalOpen] = useState(false);
  const [secPasswordInput, setSecPasswordInput] = useState('');
  const [secPasswordError, setSecPasswordError] = useState('');
  const [secSubmitting, setSecSubmitting] = useState(false);
  const [targetTabAfterUnlock, setTargetTabAfterUnlock] = useState<'pos' | 'billing' | null>(null);

  const handleVerifySecPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecPasswordError('');
    setSecSubmitting(true);
    try {
      const res = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: secPasswordInput }),
      });
      const data = await res.json();
      if (data.success) {
        setIsPosUnlocked(true);
        setIsSecModalOpen(false);
        setSecPasswordInput('');
        if (targetTabAfterUnlock === 'pos') {
          setActiveTab('pos');
        } else if (targetTabAfterUnlock === 'billing') {
          router.push('/admin/billing');
        }
      } else {
        setSecPasswordError(data.message || 'Invalid Admin Password');
      }
    } catch (err: any) {
      setSecPasswordError(err.message || 'Verification failed');
    } finally {
      setSecSubmitting(false);
    }
  };

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [productFormError, setProductFormError] = useState('');
  const [productPage, setProductPage] = useState(1);
  const productsPerPage = 8;

  // Add/Edit Product Form State
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    image: '',
    mrp: '',
    price: '',
    quantity: '10',
    gst: '0',
    category: '',
    showOnHomepage: false,
    coaUrl: '',
    variants: [] as ProductVariant[],
  });
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingCoa, setUploadingCoa] = useState(false);
  const [coaUploadError, setCoaUploadError] = useState('');

  // Categories State
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);
  const [catError, setCatError] = useState('');
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [editCatName, setEditCatName] = useState('');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [orderPage, setOrderPage] = useState(1);
  const ordersPerPage = 5;

  // Banners State
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerImage, setNewBannerImage] = useState('');
  const [newBannerLink, setNewBannerLink] = useState('');
  const [bannerImagePreview, setBannerImagePreview] = useState('');
  const [isSubmittingBanner, setIsSubmittingBanner] = useState(false);
  const [bannerError, setBannerError] = useState('');

  // Wholesale Leads Counter State
  const [newLeadsCount, setNewLeadsCount] = useState(0);

  const fetchNewLeadsCount = async () => {
    try {
      const res = await fetch('/api/admin/wholesale?status=NEW&limit=1');
      const data = await res.json();
      if (data.success && typeof data.newLeadsCount === 'number') {
        setNewLeadsCount(data.newLeadsCount);
      }
    } catch (e) {}
  };

  // Settings State
  const [paymentSettings, setPaymentSettings] = useState({
    activeTheme: 'v2' as 'v1' | 'v2',
    enableOnlinePayment: true,
    enableUPI: true,
    enableCOD: true,
    fssaiNumber: '22424000000000',
    gstin: '33AAAAA0000A1Z5',
    enableWholesale: true,
  });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [isSubmittingSettings, setIsSubmittingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Spotlight Settings State (Supports Single or Multiple Spotlight Products)
  interface SpotlightConfigItem {
    isActive: boolean;
    productId: string;
    badgeText: string;
    headingPrefix: string;
    productTitle: string;
    shortDescription: string;
    productImage: string;
    ctaLabel: string;
    benefit1: string;
    benefit2: string;
    benefit3: string;
  }

  const [spotlightsList, setSpotlightsList] = useState<SpotlightConfigItem[]>([
    {
      isActive: true,
      productId: '',
      badgeText: 'NEW ARRIVAL ✨',
      headingPrefix: 'Introducing Our',
      productTitle: 'Pure Forest Honey',
      shortDescription:
        'Raw, unprocessed and 100% natural honey directly from trusted farm beekeepers in Western Ghats, Kanyakumari.',
      productImage: '/images/beeshub-pure-forest-honey-spotlight.webp',
      ctaLabel: 'Shop New Product',
      benefit1: '100% Natural',
      benefit2: 'No Additives',
      benefit3: 'Farm Sourced',
    },
  ]);
  const [isSubmittingSpotlight, setIsSubmittingSpotlight] = useState(false);
  const [spotlightSuccess, setSpotlightSuccess] = useState('');
  const [spotlightError, setSpotlightError] = useState('');

  // Fetch License & Subscription Status
  const fetchLicenseStatus = async () => {
    try {
      const res = await fetch(`/api/license/status?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.license) {
        setLicenseState(data.license);
      }
    } catch (err) {
      console.error('Failed to fetch license status', err);
    }
  };

  // Fetch All Dashboard Data
  const fetchAllData = async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchOrders(),
        fetchBanners(),
        fetchSettings(),
        fetchLicenseStatus(),
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch Products
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
        if (data.data.length > 0 && !productForm.category) {
          setProductForm((prev) => ({ ...prev, category: data.data[0].name }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch Orders
  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch Banners
  const fetchBanners = async () => {
    try {
      setLoadingBanners(true);
      const res = await fetch('/api/banners');
      const data = await res.json();
      if (data.success) {
        setBanners(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBanners(false);
    }
  };

  // Fetch Settings
  const fetchSettings = async () => {
    try {
      setLoadingSettings(true);
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.data) {
        setPaymentSettings({
          activeTheme: data.data.activeTheme || 'v2',
          enableOnlinePayment: data.data.enableOnlinePayment ?? data.data.enableUPI ?? true,
          enableUPI: data.data.enableUPI ?? true,
          enableCOD: data.data.enableCOD ?? true,
          fssaiNumber: data.data.fssaiNumber || '22424000000000',
          gstin: data.data.gstin || '33AAAAA0000A1Z5',
          enableWholesale: data.data.enableWholesale ?? true,
        });

        if (data.data.spotlights && Array.isArray(data.data.spotlights) && data.data.spotlights.length > 0) {
          setSpotlightsList(
            data.data.spotlights.map((sp: any) => ({
              isActive: sp.isActive ?? true,
              productId: sp.productId || '',
              badgeText: sp.badgeText || 'NEW ARRIVAL ✨',
              headingPrefix: sp.headingPrefix || 'Introducing Our',
              productTitle: sp.productTitle || '',
              shortDescription: sp.shortDescription || '',
              productImage: sp.productImage || '/images/beeshub-pure-forest-honey-spotlight.webp',
              ctaLabel: sp.ctaLabel || 'Shop New Product',
              benefit1: sp.benefits?.[0]?.text || '100% Natural',
              benefit2: sp.benefits?.[1]?.text || 'No Additives',
              benefit3: sp.benefits?.[2]?.text || 'Farm Sourced',
            }))
          );
        } else if (data.data.spotlight) {
          const sp = data.data.spotlight;
          setSpotlightsList([
            {
              isActive: sp.isActive ?? true,
              productId: sp.productId || '',
              badgeText: sp.badgeText || 'NEW ARRIVAL ✨',
              headingPrefix: sp.headingPrefix || 'Introducing Our',
              productTitle: sp.productTitle || 'Pure Forest Honey',
              shortDescription: sp.shortDescription || '',
              productImage: sp.productImage || '/images/beeshub-pure-forest-honey-spotlight.webp',
              ctaLabel: sp.ctaLabel || 'Shop New Product',
              benefit1: sp.benefits?.[0]?.text || '100% Natural',
              benefit2: sp.benefits?.[1]?.text || 'No Additives',
              benefit3: sp.benefits?.[2]?.text || 'Farm Sourced',
            },
          ]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch settings', err);
    } finally {
      setLoadingSettings(false);
    }
  };

  // Add another spotlight item
  const handleAddSpotlightItem = () => {
    setSpotlightsList((prev) => [
      ...prev,
      {
        isActive: true,
        productId: '',
        badgeText: 'NEW ARRIVAL ✨',
        headingPrefix: 'Introducing Our',
        productTitle: '',
        shortDescription: '',
        productImage: '/images/beeshub-pure-forest-honey-spotlight.webp',
        ctaLabel: 'Shop New Product',
        benefit1: '100% Pure',
        benefit2: 'Direct from Farm',
        benefit3: 'Premium Quality',
      },
    ]);
  };

  // Remove a spotlight item
  const handleRemoveSpotlightItem = (index: number) => {
    if (spotlightsList.length <= 1) {
      alert(
        'You must keep at least one spotlight configuration. If you do not want it shown on the storefront, toggle its switch to Disabled.'
      );
      return;
    }
    setSpotlightsList((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Update a field in a spotlight item
  const handleUpdateSpotlightItem = (
    index: number,
    field: keyof SpotlightConfigItem,
    value: any
  ) => {
    setSpotlightsList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Save Spotlight Settings
  const handleSaveSpotlight = async (e: React.FormEvent) => {
    e.preventDefault();
    setSpotlightSuccess('');
    setSpotlightError('');
    try {
      setIsSubmittingSpotlight(true);
      const payload = spotlightsList.map((item) => ({
        isActive: item.isActive,
        productId: item.productId,
        badgeText: item.badgeText || 'NEW ARRIVAL ✨',
        headingPrefix: item.headingPrefix || 'Introducing Our',
        productTitle: item.productTitle || 'New Arrival Product',
        shortDescription: item.shortDescription || '',
        productImage: item.productImage || '/images/beeshub-pure-forest-honey-spotlight.webp',
        ctaLabel: item.ctaLabel || 'Shop New Product',
        benefits: [
          { icon: 'natural', text: item.benefit1 || '100% Natural' },
          { icon: 'additives', text: item.benefit2 || 'No Additives' },
          { icon: 'farm', text: item.benefit3 || 'Farm Sourced' },
        ],
      }));

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spotlights: payload,
          spotlight: payload[0] || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSpotlightSuccess('All Product Spotlight banners saved and live on homepage!');
        setTimeout(() => setSpotlightSuccess(''), 3500);
      } else {
        setSpotlightError(data.message || 'Failed to update spotlight settings');
      }
    } catch (err: any) {
      setSpotlightError(err.message || 'Server error updating spotlight settings');
    } finally {
      setIsSubmittingSpotlight(false);
    }
  };

  // Save Payment Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSuccess('');
    setSettingsError('');
    try {
      setIsSubmittingSettings(true);
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentSettings),
      });
      const data = await res.json();
      if (data.success) {
        setSettingsSuccess('Payment method settings saved successfully!');
        setTimeout(() => setSettingsSuccess(''), 3500);
      } else {
        setSettingsError(data.message || 'Failed to update payment settings');
      }
    } catch (err: any) {
      setSettingsError(err.message || 'Server error updating payment settings');
    } finally {
      setIsSubmittingSettings(false);
    }
  };

// Reusable Client-Side Canvas Image Compressor (Reduces base64 size by ~95%)
const compressImage = (file: File, maxWidth = 800, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const elem = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        elem.width = width;
        elem.height = height;
        const ctx = elem.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(elem.toDataURL('image/jpeg', quality));
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

  // Handle Banner Image File Selection with Auto Compression
  const handleBannerImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file, 1200, 0.85);
        setNewBannerImage(compressedBase64);
        setBannerImagePreview(compressedBase64);
      } catch (err) {
        console.error('Banner image compression failed', err);
      }
    }
  };

  // Add New Hero Banner
  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setBannerError('');
    if (!newBannerTitle.trim() || !newBannerImage) {
      setBannerError('Please enter a banner title and upload an image.');
      return;
    }

    try {
      setIsSubmittingBanner(true);
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newBannerTitle.trim(),
          image: newBannerImage,
          link: newBannerLink.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNewBannerTitle('');
        setNewBannerImage('');
        setNewBannerLink('');
        setBannerImagePreview('');
        fetchBanners();
      } else {
        setBannerError(data.message || 'Failed to add banner');
      }
    } catch (err: any) {
      setBannerError('Network error while adding banner');
    } finally {
      setIsSubmittingBanner(false);
    }
  };

  // Delete Hero Banner
  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchBanners();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 1-Click Database Heavy Images Optimizer
  const [isOptimizingDb, setIsOptimizingDb] = useState(false);
  const [optimizeStatus, setOptimizeStatus] = useState('');

  const compressBase64Url = (base64Url: string, maxWidth = 800, quality = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      if (!base64Url || base64Url.length < 150000) {
        resolve(base64Url);
        return;
      }
      const img = new window.Image();
      img.src = base64Url;
      img.onload = () => {
        const elem = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        elem.width = width;
        elem.height = height;
        const ctx = elem.getContext('2d');
        if (!ctx) {
          resolve(base64Url);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(elem.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(base64Url);
    });
  };

  const handleOptimizeExistingDatabaseImages = async () => {
    try {
      setIsOptimizingDb(true);
      setOptimizeStatus('Scanning existing products & banners in database...');

      let optimizedCount = 0;

      // 1. Compress heavy existing products
      for (const p of products) {
        if (p.image && p.image.length > 150000) {
          setOptimizeStatus(`Compressing heavy image for product: ${p.name}...`);
          const compressed = await compressBase64Url(p.image, 800, 0.8);
          if (compressed.length < p.image.length) {
            await fetch(`/api/products/${p._id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...p, image: compressed }),
            });
            optimizedCount++;
          }
        }
      }

      // 2. Compress heavy existing banners
      for (const b of banners) {
        if (b.image && b.image.length > 150000) {
          setOptimizeStatus(`Compressing heavy hero banner: ${b.title}...`);
          const compressed = await compressBase64Url(b.image, 1200, 0.85);
          if (compressed.length < b.image.length) {
            await fetch(`/api/banners/${b._id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...b, image: compressed }),
            });
            optimizedCount++;
          }
        }
      }

      await fetchAllData();
      alert(`Success! Optimized ${optimizedCount} heavy image(s) in database down to ~40KB each.`);
    } catch (err: any) {
      alert('Error during image optimization: ' + (err.message || err));
    } finally {
      setIsOptimizingDb(false);
      setOptimizeStatus('');
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          fetchProducts();
          fetchCategories();
          fetchOrders();
          fetchBanners();
          fetchSettings();
          fetchLicenseStatus();
          fetchNewLeadsCount();
        } else {
          router.replace('/admin/login');
        }
      } catch (err) {
        router.replace('/admin/login');
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkSession();
  }, [router]);

  useEffect(() => {
    if (activeTab === 'settings') {
      fetchSettings();
    }
    fetchNewLeadsCount();
  }, [activeTab]);

  // Handle Product Image Upload & Canvas Compression
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file, 800, 0.8);
        setProductForm((prev) => ({ ...prev, image: compressedBase64 }));
        setImagePreview(compressedBase64);
      } catch (err) {
        console.error('Product image compression failed', err);
      }
    }
  };

  // Handle Variant Row Actions
  const handleAddVariantRow = () => {
    setProductForm((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { name: '', mrp: prev.mrp || '', price: prev.price || '', quantity: '10' },
      ],
    }));
  };

  const handleRemoveVariantRow = (index: number) => {
    setProductForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, idx) => idx !== index),
    }));
  };

  const handleUpdateVariantRow = (index: number, field: keyof ProductVariant, value: string) => {
    setProductForm((prev) => {
      const updated = [...prev.variants];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, variants: updated };
    });
  };

  // Handle COA File Upload (PDF or Image stored locally on server)
  const handleCoaFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoaUploadError('');
    try {
      setUploadingCoa(true);
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/coa', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setProductForm((prev) => ({ ...prev, coaUrl: data.url }));
      } else {
        setCoaUploadError(data.message || 'Failed to upload COA file.');
      }
    } catch (err: any) {
      setCoaUploadError(err.message || 'Network error while uploading COA.');
    } finally {
      setUploadingCoa(false);
      e.target.value = '';
    }
  };

  // Quick toggle Show on Homepage directly from Products table
  const handleToggleHomepage = async (product: Product) => {
    const nextVal = !Boolean(product.showOnHomepage);
    setProducts((prev) =>
      prev.map((p) => (p._id === product._id ? { ...p, showOnHomepage: nextVal } : p))
    );
    try {
      const res = await fetch(`/api/products/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showOnHomepage: nextVal }),
      });
      const data = await res.json();
      if (!data.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === product._id ? { ...p, showOnHomepage: !nextVal } : p))
        );
      }
    } catch {
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, showOnHomepage: !nextVal } : p))
      );
    }
  };

  // Open Edit Product Modal
  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      image: product.image,
      mrp: String(product.mrp),
      price: String(product.price),
      quantity: String(product.quantity),
      gst: String(product.gst !== undefined ? product.gst : 0),
      category: product.category || (categories[0]?.name ?? ''),
      showOnHomepage: Boolean(product.showOnHomepage),
      coaUrl: product.coaUrl || '',
      variants: product.variants ? product.variants.map((v) => ({ ...v })) : [],
    });
    setImagePreview(product.image);
    setCoaUploadError('');
    setProductFormError('');
    setIsAddModalOpen(true);
  };

  // Open Add Product Modal
  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      image: '',
      mrp: '',
      price: '',
      quantity: '10',
      gst: '0',
      category: categories.length > 0 ? categories[0].name : '',
      showOnHomepage: false,
      coaUrl: '',
      variants: [],
    });
    setImagePreview('');
    setCoaUploadError('');
    setProductFormError('');
    setIsAddModalOpen(true);
  };

  // Submit Add / Edit Product Form
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductFormError('');

    if (
      !productForm.name ||
      !productForm.description ||
      !productForm.image ||
      !productForm.mrp ||
      !productForm.price ||
      !productForm.category
    ) {
      setProductFormError('Please fill in all required fields, select a category, and upload an image.');
      return;
    }

    try {
      setIsSubmittingProduct(true);
      const isEdit = !!editingProduct;
      const url = isEdit ? `/api/products/${editingProduct._id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productForm.name,
          description: productForm.description,
          image: productForm.image,
          mrp: Number(productForm.mrp),
          price: Number(productForm.price),
          quantity: Number(productForm.quantity),
          gst: Number(productForm.gst),
          category: productForm.category,
          showOnHomepage: Boolean(productForm.showOnHomepage),
          coaUrl: productForm.coaUrl || '',
          variants: productForm.variants.map((v) => ({
            name: v.name.trim(),
            mrp: Number(v.mrp),
            price: Number(v.price),
            quantity: Number(v.quantity || 10),
          })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        setEditingProduct(null);
        if (data.data) {
          if (isEdit) {
            setProducts((prev) => prev.map((p) => (p._id === data.data._id ? data.data : p)));
          } else {
            setProducts((prev) => [data.data, ...prev]);
          }
        }
        fetchProducts();
      } else {
        setProductFormError(data.message || 'Failed to save product.');
      }
    } catch (err: any) {
      setProductFormError(err.message || 'Network error.');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      setProducts((prev) => prev.filter((p) => p._id !== id));
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
      } else {
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
      fetchProducts();
    }
  };

  // Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatError('');
    if (!newCatName.trim()) return;

    try {
      setIsSubmittingCat(true);
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setNewCatName('');
        fetchCategories();
      } else {
        setCatError(data.message || 'Failed to add category');
      }
    } catch (err: any) {
      setCatError(err.message || 'Error adding category');
    } finally {
      setIsSubmittingCat(false);
    }
  };

  // Edit Category
  const handleSaveEditedCategory = async (id: string) => {
    if (!editCatName.trim()) return;
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editCatName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingCategory(null);
        setEditCatName('');
        fetchCategories();
      } else {
        alert(data.message || 'Failed to update category');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, updates: { status?: string; paymentStatus?: string }) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Logout
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    posthog.reset();
    router.push('/admin/login');
  };

  // Metrics
  const onlineOrders = orders.filter((o) => o.orderType !== 'POS');
  const posOrders = orders.filter((o) => o.orderType === 'POS');
  const onlineRevenue = onlineOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const posRevenue = posOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;

  // Filter & Pagination for Orders
  const filteredOrders = orders.filter((o) =>
    orderStatusFilter === 'All' ? true : o.status === orderStatusFilter
  );
  const totalOrderPages = Math.ceil(filteredOrders.length / ordersPerPage) || 1;
  const paginatedOrders = filteredOrders.slice(
    (orderPage - 1) * ordersPerPage,
    orderPage * ordersPerPage
  );

  // Pagination for Products
  const totalProductPages = Math.ceil(products.length / productsPerPage) || 1;
  const paginatedProducts = products.slice(
    (productPage - 1) * productsPerPage,
    productPage * productsPerPage
  );
  if (isAuthChecking || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FFFCFB] flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF8F5] border border-[#ED3500]/20 flex items-center justify-center mx-auto text-[#ED3500]">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <p className="text-xs font-bold text-[#163B5C] uppercase tracking-wider">
            Verifying Admin Credentials...
          </p>
        </div>
      </div>
    );
  }

  if (!licenseState || !licenseState.isActivated || licenseState.isLocked) {
    return (
      <LicenseActivationModal
        license={licenseState}
        onActivated={() => fetchAllData()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFCFB] text-[#163B5C] flex flex-col justify-between">
      {/* Expiry & Grace Period Alert Banner */}
      <GracePeriodBanner
        license={licenseState}
        onOpenRenewal={() => setActiveTab('subscription')}
      />

      {/* Header with Refresh & Mobile Menu */}
      <header className="bg-white border-b border-[#E8EDF2] sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="BeesHub Farmland Admin Logo"
              className="w-10 h-10 object-contain rounded-xl shadow-xs border border-[#E8EDF2]"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <h1 className="font-extrabold text-base sm:text-xl text-[#163B5C]">BeesHub Farmland Admin</h1>
              <span className="text-[11px] sm:text-xs text-[#64748B] hidden sm:block">Manage Inventory, Categories & Customer Orders</span>
            </div>
          </div>

          {/* Desktop Quick Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setActiveTab('subscription')}
              className={`px-3.5 py-2 rounded-xl border text-xs font-extrabold flex items-center gap-2 transition-all shadow-xs ${
                activeTab === 'subscription'
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-amber-50/80 hover:bg-amber-100 border-amber-200 text-amber-900'
              }`}
              title="Manage Software License & Subscription Plan"
            >
              <ShieldCheck className={`w-4 h-4 ${activeTab === 'subscription' ? 'text-white' : 'text-amber-600'}`} />
              <span>Plan & Subscription</span>
              {licenseState?.daysRemaining !== undefined && licenseState.daysRemaining <= 7 && (
                <span className="px-1.5 py-0.2 text-[10px] font-black bg-amber-600 text-white rounded-full">
                  {licenseState.daysRemaining <= 0 ? '!' : `${licenseState.daysRemaining}d`}
                </span>
              )}
            </button>

            <button
              onClick={handleOptimizeExistingDatabaseImages}
              disabled={isOptimizingDb}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center gap-2 transition-all shadow-xs"
              title="Compress heavy existing images in database down to ~40KB"
            >
              <Zap className={`w-4 h-4 text-emerald-600 ${isOptimizingDb ? 'animate-bounce' : ''}`} />
              <span>{isOptimizingDb ? 'Optimizing...' : 'Optimize DB Images'}</span>
            </button>

            <button
              onClick={fetchAllData}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-xl bg-[#FFFCFB] hover:bg-[#E8EDF2] border border-[#E8EDF2] text-[#163B5C] font-bold text-xs flex items-center gap-2 transition-all shadow-xs"
              title="Refresh Dashboard Data"
            >
              <RefreshCw className={`w-4 h-4 text-[#ED3500] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>

            <Link
              href="/"
              className="text-xs font-semibold text-[#64748B] hover:text-[#ED3500] transition-colors"
            >
              View Store ↗
            </Link>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-[#FFF8F5] text-[#ED3500] hover:bg-[#ED3500] hover:text-white border border-[#ED3500]/20 font-bold text-xs flex items-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl border border-[#E8EDF2] text-[#163B5C] hover:bg-gray-50 transition-colors"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 text-[#ED3500]" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-[#E8EDF2] p-4 space-y-2.5 animate-fadeIn shadow-lg">
            <button
              onClick={() => {
                setActiveTab('subscription');
                setIsMobileMenuOpen(false);
              }}
              className="w-full p-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-extrabold text-xs flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" /> Plan & Subscription
              </span>
              <span className="text-[10px] uppercase font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                License
              </span>
            </button>

            <button
              onClick={() => {
                handleOptimizeExistingDatabaseImages();
                setIsMobileMenuOpen(false);
              }}
              disabled={isOptimizingDb}
              className="w-full p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-xs flex items-center justify-between"
            >
              <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-600" /> Optimize DB Images</span>
              <span className="text-[10px] uppercase font-black bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">Compress</span>
            </button>

            <button
              onClick={() => {
                fetchAllData();
                setIsMobileMenuOpen(false);
              }}
              disabled={isRefreshing}
              className="w-full p-3 rounded-xl bg-gray-50 text-[#163B5C] border border-[#E8EDF2] font-extrabold text-xs flex items-center justify-between"
            >
              <span className="flex items-center gap-2"><RefreshCw className={`w-4 h-4 text-[#ED3500] ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh Dashboard Data</span>
              <span className="text-[10px] text-gray-500">Sync</span>
            </button>

            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full p-3 rounded-xl bg-gray-50 text-[#163B5C] border border-[#E8EDF2] font-extrabold text-xs flex items-center justify-between"
            >
              <span>View Customer Storefront</span>
              <span>↗</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-extrabold text-xs flex items-center justify-between"
            >
              <span className="flex items-center gap-2"><LogOut className="w-4 h-4" /> Logout Admin Session</span>
            </button>
          </div>
        )}
      </header>

      {/* Database Optimization Progress Banner */}
      {isOptimizingDb && (
        <div className="bg-emerald-600 text-white px-4 py-3 text-xs font-bold flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{optimizeStatus || 'Compressing heavy database images...'}</span>
          </div>
          <span>Please wait...</span>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-[#E8EDF2] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#ED3500]/10 text-[#ED3500] flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block">
                Total Products
              </span>
              <span className="text-2xl font-black text-[#163B5C]">
                {products.length}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E8EDF2] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block">
                Total Categories
              </span>
              <span className="text-2xl font-black text-[#163B5C]">
                {categories.length}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E8EDF2] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block">
                Pending Orders
              </span>
              <span className="text-2xl font-black text-[#163B5C]">
                {pendingOrdersCount}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E8EDF2] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block">
                Total Revenue
              </span>
              <span className="text-2xl font-black text-[#ED3500]">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation (Responsive Horizontal Scroll) */}
        <div className="flex items-center justify-between border-b border-[#E8EDF2] gap-2 pb-1 overflow-x-auto scrollbar-none scroll-smooth">
          <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-2 sm:pb-4 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'products'
                  ? 'border-[#ED3500] text-[#ED3500] bg-[#FFF8F5] sm:bg-transparent rounded-t-xl sm:rounded-none'
                  : 'border-transparent text-[#64748B] hover:text-[#163B5C]'
              }`}
            >
              <Package className="w-4 h-4" /> Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-2 sm:pb-4 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'categories'
                  ? 'border-[#ED3500] text-[#ED3500] bg-[#FFF8F5] sm:bg-transparent rounded-t-xl sm:rounded-none'
                  : 'border-transparent text-[#64748B] hover:text-[#163B5C]'
              }`}
            >
              <Layers className="w-4 h-4" /> Categories ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-2 sm:pb-4 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'orders'
                  ? 'border-[#ED3500] text-[#ED3500] bg-[#FFF8F5] sm:bg-transparent rounded-t-xl sm:rounded-none'
                  : 'border-transparent text-[#64748B] hover:text-[#163B5C]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('wholesale')}
              className={`px-3 py-2 sm:pb-4 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'wholesale'
                  ? 'border-[#ED3500] text-[#ED3500] bg-[#FFF8F5] sm:bg-transparent rounded-t-xl sm:rounded-none'
                  : 'border-transparent text-[#64748B] hover:text-[#163B5C]'
              }`}
            >
              <Briefcase className="w-4 h-4 text-amber-500" /> Enquiries & Leads
              {newLeadsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#ED3500] text-white text-[10px] font-black">
                  {newLeadsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('blog')}
              className={`px-3 py-2 sm:pb-4 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'blog'
                  ? 'border-[#ED3500] text-[#ED3500] bg-[#FFF8F5] sm:bg-transparent rounded-t-xl sm:rounded-none'
                  : 'border-transparent text-[#64748B] hover:text-[#163B5C]'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#ED3500]" /> Blog Stories
            </button>
            <button
              onClick={() => setActiveTab('banners')}
              className={`px-3 py-2 sm:pb-4 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'banners'
                  ? 'border-[#ED3500] text-[#ED3500] bg-[#FFF8F5] sm:bg-transparent rounded-t-xl sm:rounded-none'
                  : 'border-transparent text-[#64748B] hover:text-[#163B5C]'
              }`}
            >
              <ImageIcon className="w-4 h-4" /> Banners ({banners.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-2 sm:pb-4 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'settings'
                  ? 'border-[#ED3500] text-[#ED3500] bg-[#FFF8F5] sm:bg-transparent rounded-t-xl sm:rounded-none'
                  : 'border-transparent text-[#64748B] hover:text-[#163B5C]'
              }`}
            >
              <CreditCard className="w-4 h-4" /> Settings
            </button>
            <button
              onClick={() => {
                if (isPosUnlocked) {
                  setActiveTab('pos');
                } else {
                  setTargetTabAfterUnlock('pos');
                  setIsSecModalOpen(true);
                }
              }}
              className={`px-3 py-2 sm:pb-4 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'pos'
                  ? 'border-[#ED3500] text-[#ED3500] bg-[#FFF8F5] sm:bg-transparent rounded-t-xl sm:rounded-none'
                  : 'border-transparent text-[#64748B] hover:text-[#163B5C]'
              }`}
            >
              <Store className="w-4 h-4" /> POS Counter {!isPosUnlocked && <Lock className="w-3 h-3 text-amber-500 inline ml-0.5" />}
            </button>
            <Link
              href="/admin/billing"
              onClick={(e) => {
                if (!isPosUnlocked) {
                  e.preventDefault();
                  setTargetTabAfterUnlock('billing');
                  setIsSecModalOpen(true);
                }
              }}
              className="px-3 py-2 sm:pb-4 text-xs sm:text-sm font-extrabold text-[#ED3500] hover:text-[#D02E00] flex items-center gap-1.5 border-b-2 border-transparent hover:border-[#ED3500] whitespace-nowrap transition-all"
            >
              <FileText className="w-4 h-4 text-[#ED3500]" /> Billing & Accounting ↗ {!isPosUnlocked && <Lock className="w-3 h-3 text-amber-500 inline ml-0.5" />}
            </Link>
          </div>
        </div>

        {/* Products Management View */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-[#E8EDF2] shadow-sm">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#163B5C]">Product Inventory</h3>
                <p className="text-xs text-[#64748B]">Manage, edit, and organize all {products.length} store products</p>
              </div>
              <button
                onClick={openAddProductModal}
                className="px-4 py-2.5 rounded-xl bg-[#ED3500] hover:bg-[#D02E00] text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>

            {loadingProducts ? (
              <div className="py-20 text-center">
                <RefreshCw className="w-8 h-8 text-[#ED3500] animate-spin mx-auto" />
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-[#E8EDF2] p-8 space-y-4">
                <Package className="w-12 h-12 text-[#64748B] mx-auto opacity-40" />
                <h3 className="text-xl font-bold text-[#163B5C]">No products in inventory</h3>
                <p className="text-sm text-[#64748B]">Click below to add your first product.</p>
                <button
                  onClick={openAddProductModal}
                  className="px-5 py-2.5 rounded-full bg-[#ED3500] text-white font-bold text-xs uppercase tracking-wider"
                >
                  + Add Product Now
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E8EDF2] overflow-hidden shadow-sm space-y-4 p-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#FFFCFB] border-b border-[#E8EDF2] text-xs font-bold text-[#64748B] uppercase tracking-wider">
                        <th className="py-4 px-6">Product</th>
                        <th className="py-4 px-6">Category</th>
                        <th className="py-4 px-6">MRP</th>
                        <th className="py-4 px-6">Selling Price</th>
                        <th className="py-4 px-6">Discount</th>
                        <th className="py-4 px-6">GST</th>
                        <th className="py-4 px-6">Stock Quantity</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8EDF2] text-sm">
                      {paginatedProducts.map((p) => (
                        <tr key={p._id} className="hover:bg-[#FFFCFB]/80 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-12 h-12 object-cover rounded-xl bg-[#FFF8F5] border border-[#E8EDF2]"
                              />
                              <div>
                                <h4 className="font-bold text-[#163B5C] line-clamp-1">{p.name}</h4>
                                <p className="text-xs text-[#64748B] line-clamp-1">{p.description}</p>
                                {p.variants && p.variants.length > 0 && (
                                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold text-[10px] border border-purple-200">
                                    {p.variants.length} Variants ({p.variants.map((v) => v.name).join(', ')})
                                  </span>
                                )}
                                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleHomepage(p)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                                      p.showOnHomepage
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                                    }`}
                                    title="Toggle Show on Homepage"
                                  >
                                    {p.showOnHomepage ? '✓ Show on Homepage' : 'Hidden on Homepage'}
                                  </button>
                                  {p.coaUrl && (
                                    <a
                                      href={p.coaUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                                    >
                                      COA Attached
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-xs font-semibold text-[#64748B]">
                            {p.category}
                          </td>
                          <td className="py-4 px-6 font-semibold line-through text-[#64748B]">
                            ₹{p.mrp.toLocaleString('en-IN')}
                          </td>
                          <td className="py-4 px-6 font-black text-[#ED3500]">
                            ₹{p.price.toLocaleString('en-IN')}
                          </td>
                          <td className="py-4 px-6 font-bold text-emerald-600 text-xs">
                            {p.discount}% OFF
                          </td>
                          <td className="py-4 px-6 font-bold text-[#163B5C] text-xs">
                            {p.gst}%
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                p.quantity > 5
                                  ? 'bg-[#10B981]/10 text-[#10B981]'
                                  : p.quantity > 0
                                  ? 'bg-amber-500/10 text-amber-600'
                                  : 'bg-rose-500/10 text-rose-600'
                              }`}
                            >
                              {p.quantity > 0 ? `${p.quantity} Units` : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Edit Product Button */}
                              <button
                                onClick={() => openEditProductModal(p)}
                                className="p-2 rounded-lg text-[#64748B] hover:text-[#163B5C] hover:bg-[#FFFCFB] border border-transparent hover:border-[#E8EDF2] transition-colors"
                                title="Edit Product"
                              >
                                <Edit className="w-4 h-4 text-purple-600" />
                              </button>
                              {/* Delete Product Button */}
                              <button
                                onClick={() => handleDeleteProduct(p._id)}
                                className="p-2 rounded-lg text-[#64748B] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete Product"
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

                {/* Products Pagination Controls */}
                {totalProductPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-[#E8EDF2] text-xs text-[#64748B]">
                    <span>
                      Page <strong className="text-[#163B5C]">{productPage}</strong> of{' '}
                      <strong className="text-[#163B5C]">{totalProductPages}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={productPage === 1}
                        onClick={() => setProductPage((p) => Math.max(p - 1, 1))}
                        className="px-3 py-1.5 rounded-lg border border-[#E8EDF2] bg-white font-bold disabled:opacity-40 hover:bg-[#FFFCFB] flex items-center gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Prev
                      </button>
                      <button
                        disabled={productPage === totalProductPages}
                        onClick={() => setProductPage((p) => Math.min(p + 1, totalProductPages))}
                        className="px-3 py-1.5 rounded-lg border border-[#E8EDF2] bg-white font-bold disabled:opacity-40 hover:bg-[#FFFCFB] flex items-center gap-1"
                      >
                        Next <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Categories Management View */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            {/* Create Category Card */}
            <div className="bg-white rounded-2xl border border-[#E8EDF2] p-6 space-y-4 shadow-sm max-w-xl">
              <h3 className="text-lg font-bold text-[#163B5C]">Create New Category</h3>

              {catError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {catError}
                </div>
              )}

              <form onSubmit={handleAddCategory} className="flex gap-3">
                <input
                  type="text"
                  required
                  placeholder="e.g. Pure Honey, Organic Spices, Dried Fruits..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#E8EDF2] text-sm focus:outline-none focus:border-[#ED3500]"
                />
                <button
                  type="submit"
                  disabled={isSubmittingCat}
                  className="px-5 py-2.5 rounded-xl bg-[#ED3500] hover:bg-[#D02E00] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#ED3500]/20 flex items-center gap-2"
                >
                  {isSubmittingCat ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add Category
                </button>
              </form>
            </div>

            {/* Category List with Edit Option */}
            {loadingCategories ? (
              <div className="py-10 text-center">
                <RefreshCw className="w-6 h-6 text-[#ED3500] animate-spin mx-auto" />
              </div>
            ) : categories.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-2xl border border-[#E8EDF2] p-6 space-y-2">
                <Layers className="w-10 h-10 text-[#64748B] mx-auto opacity-40" />
                <h4 className="font-bold text-[#163B5C]">No categories added yet</h4>
                <p className="text-xs text-[#64748B]">Add categories above to organize your products.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E8EDF2] overflow-hidden shadow-sm max-w-2xl">
                <div className="p-4 bg-[#FFFCFB] border-b border-[#E8EDF2] font-bold text-xs text-[#64748B] uppercase tracking-wider flex justify-between">
                  <span>Category Name</span>
                  <span>Actions</span>
                </div>
                <div className="divide-y divide-[#E8EDF2]">
                  {categories.map((cat) => (
                    <div key={cat._id} className="p-4 flex items-center justify-between text-sm font-semibold text-[#163B5C]">
                      {editingCategory?._id === cat._id ? (
                        <div className="flex items-center gap-2 flex-1 pr-4">
                          <input
                            type="text"
                            value={editCatName}
                            onChange={(e) => setEditCatName(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-[#ED3500] text-xs focus:outline-none flex-1"
                          />
                          <button
                            onClick={() => handleSaveEditedCategory(cat._id)}
                            className="p-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600"
                            title="Save Category Name"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingCategory(null)}
                            className="p-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-[#ED3500]" />
                          {cat.name}
                        </span>
                      )}

                      {editingCategory?._id !== cat._id && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setEditCatName(cat.name);
                            }}
                            className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50"
                            title="Edit Category Name"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat._id)}
                            className="p-1.5 rounded-lg text-[#64748B] hover:text-rose-600 hover:bg-rose-50"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Customer Orders Management View with Responsive Filtering */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Filter by status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#64748B] overflow-x-auto pb-1 scrollbar-none w-full">
                <span className="flex items-center gap-1 shrink-0"><Filter className="w-4 h-4" /> Status:</span>
                {['All', 'Pending', 'Processing', 'Completed', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setOrderStatusFilter(st);
                      setOrderPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-all ${
                      orderStatusFilter === st
                        ? 'bg-[#163B5C] text-white font-bold'
                        : 'bg-white border border-[#E8EDF2] text-[#64748B] hover:text-[#163B5C]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {loadingOrders ? (
              <div className="py-20 text-center">
                <RefreshCw className="w-8 h-8 text-[#ED3500] animate-spin mx-auto" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-[#E8EDF2] p-8 space-y-4">
                <ShoppingBag className="w-12 h-12 text-[#64748B] mx-auto opacity-40" />
                <h3 className="text-xl font-bold text-[#163B5C]">No orders found</h3>
                <p className="text-sm text-[#64748B]">
                  Customer orders will appear here automatically when placed.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedOrders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white rounded-2xl border border-[#E8EDF2] p-6 shadow-sm space-y-4 hover:border-[#ED3500]/30 transition-all"
                  >
                    {/* Top Row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E8EDF2]">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-lg text-[#163B5C]">
                            {order.orderId}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                              order.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : order.status === 'Processing'
                                ? 'bg-blue-100 text-blue-700'
                                : order.status === 'Cancelled'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-700 animate-pulse'
                            }`}
                          >
                            Order: {order.status}
                          </span>

                          {/* Payment Method Badge */}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 ${
                              order.paymentMethod === 'RAZORPAY'
                                ? 'bg-orange-100 text-orange-800'
                                : order.paymentMethod === 'UPI'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {order.paymentMethod === 'RAZORPAY' ? (
                              <>
                                <CreditCard className="w-3.5 h-3.5 text-[#ED3500]" /> Razorpay
                              </>
                            ) : order.paymentMethod === 'UPI' ? (
                              <>
                                <QrCode className="w-3.5 h-3.5" /> Online UPI
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-3.5 h-3.5" /> {order.paymentMethod === 'CASH' ? 'Cash' : 'Cash on Delivery'}
                              </>
                            )}
                          </span>

                          {/* Payment Status Badge */}
                          <span
                            className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                              order.paymentStatus === 'Paid'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-amber-500 text-white'
                            }`}
                          >
                            {order.paymentStatus || 'Pending'}
                          </span>

                          {/* Inventory Conflict Alert Badge */}
                          {order.inventoryConflict && (
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-700 border border-rose-300 flex items-center gap-1">
                              ⚠️ Stock Conflict
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-[#64748B]">
                          Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Status Selector & Payment Status Toggle */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#64748B]">Pay Status:</span>
                          {order.paymentStatus === 'Paid' ? (
                            <span className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1 shadow-xs">
                              🔒 Paid (Verified)
                            </span>
                          ) : (
                            <select
                              value={order.paymentStatus || 'Pending'}
                              onChange={(e) =>
                                handleUpdateOrderStatus(order._id, { paymentStatus: e.target.value })
                              }
                              className="bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                            >
                              <option value="Pending">Pending Verification</option>
                              <option value="Paid">Mark Paid & Verify</option>
                              <option value="Failed">Failed</option>
                            </select>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#64748B]">Order Status:</span>
                          {order.status === 'Completed' ? (
                            <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center gap-1 border border-emerald-300 shadow-xs">
                              🔒 Completed (Locked)
                            </span>
                          ) : (
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleUpdateOrderStatus(order._id, { status: e.target.value })
                              }
                              className="bg-[#FFFCFB] border border-[#E8EDF2] rounded-xl px-3 py-1.5 text-xs font-bold text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Inventory Conflict Alert Banner */}
                    {order.inventoryConflict && (
                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-pulse">
                        <span className="font-black shrink-0 text-rose-600">⚠️ STOCK CONFLICT:</span>
                        <div className="space-y-0.5">
                          <p className="font-semibold">
                            {order.conflictNotes || 'Inventory depleted during simultaneous customer checkout before payment verification.'}
                          </p>
                          <p className="text-[11px] text-rose-600">
                            Action required: Review inventory levels, fulfill manually if stock is available, or initiate a refund.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Customer & Items grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
                      {/* Customer Details */}
                      <div className="p-4 rounded-xl bg-[#FFFCFB] border border-[#E8EDF2] space-y-2">
                        <h5 className="font-bold text-[#163B5C] uppercase tracking-wider text-[11px]">
                          Customer Contact Details
                        </h5>
                        <div className="space-y-1 text-[#64748B]">
                          <p className="font-bold text-[#163B5C] text-sm">{order.customerName}</p>
                          <p className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-[#ED3500]" /> {order.customerPhone}
                          </p>
                          {order.customerEmail ? (
                            <p className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-[#ED3500]" /> {order.customerEmail}
                            </p>
                          ) : null}
                          <p className="flex items-start gap-1.5 pt-1 border-t border-[#E8EDF2]">
                            <MapPin className="w-3.5 h-3.5 text-[#ED3500] shrink-0 mt-0.5" />
                            <span>
                              {order.shippingAddress} (Pincode: {order.pincode})
                            </span>
                          </p>

                          {order.paymentMethod === 'RAZORPAY' && (
                            <div className="pt-2 border-t border-[#E8EDF2] space-y-1 text-xs">
                              <span className="font-bold text-[#163B5C] block">Razorpay Payment ID:</span>
                              <code className="bg-orange-50 text-orange-800 px-2 py-1 rounded font-mono text-[11px] block border border-orange-200">
                                {order.razorpayPaymentId || order.transactionId || 'Awaiting Webhook/Verify'}
                              </code>
                              {order.razorpayOrderId && (
                                <div className="text-[10px] text-[#64748B] pt-0.5">
                                  Order Ref: <span className="font-mono text-[#163B5C]">{order.razorpayOrderId}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {order.paymentMethod === 'UPI' && (
                            <div className="pt-2 border-t border-[#E8EDF2] space-y-1 text-xs">
                              <span className="font-bold text-[#163B5C] block">UPI Payment Ref / UTR:</span>
                              <code className="bg-purple-50 text-purple-800 px-2 py-1 rounded font-mono text-[11px] block border border-purple-200">
                                {order.transactionId || 'No UTR provided'}
                              </code>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="lg:col-span-2 space-y-2">
                        <h5 className="font-bold text-[#163B5C] uppercase tracking-wider text-[11px]">
                          Ordered Items ({order.items.length})
                        </h5>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFFCFB] border border-[#E8EDF2]"
                            >
                              <div className="flex items-center gap-3">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-10 h-10 object-cover rounded-lg bg-white border border-[#E8EDF2]"
                                  />
                                )}
                                <div>
                                  <h6 className="font-bold text-[#163B5C] text-xs">{item.name}</h6>
                                  <span className="text-[#64748B] text-[10px]">
                                    GST: {item.gst}%
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-[#163B5C]">
                                  ₹{item.price.toLocaleString('en-IN')} × {item.quantity}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Bill Breakdown */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#E8EDF2] font-bold text-xs">
                          <span className="text-[#64748B]">
                            Subtotal: ₹{order.subtotal.toLocaleString('en-IN')} | GST: ₹
                            {order.totalGst.toLocaleString('en-IN')}
                          </span>
                          <span className="text-sm font-black text-[#ED3500]">
                            Total Paid: ₹{order.totalAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Orders Pagination Controls */}
                {totalOrderPages > 1 && (
                  <div className="flex items-center justify-between pt-4 bg-white p-4 rounded-2xl border border-[#E8EDF2] text-xs text-[#64748B]">
                    <span>
                      Page <strong className="text-[#163B5C]">{orderPage}</strong> of{' '}
                      <strong className="text-[#163B5C]">{totalOrderPages}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={orderPage === 1}
                        onClick={() => setOrderPage((p) => Math.max(p - 1, 1))}
                        className="px-3 py-1.5 rounded-lg border border-[#E8EDF2] bg-white font-bold disabled:opacity-40 hover:bg-[#FFFCFB] flex items-center gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Prev
                      </button>
                      <button
                        disabled={orderPage === totalOrderPages}
                        onClick={() => setOrderPage((p) => Math.min(p + 1, totalOrderPages))}
                        className="px-3 py-1.5 rounded-lg border border-[#E8EDF2] bg-white font-bold disabled:opacity-40 hover:bg-[#FFFCFB] flex items-center gap-1"
                      >
                        Next <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Hero Banners Management View */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
            {/* Create Banner Form */}
            <div className="bg-white rounded-3xl border border-[#E8EDF2] p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-[#ED3500]">
                <ImageIcon className="w-5 h-5" />
                <h3 className="text-lg font-black text-[#163B5C]">Upload New Hero Banner Image</h3>
              </div>
              <p className="text-xs text-[#64748B]">
                Upload high-res banner images to display dynamically in the homepage hero section with high-performance responsive lazy loading.
              </p>

              {bannerError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {bannerError}
                </div>
              )}

              <form onSubmit={handleAddBanner} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#163B5C] uppercase tracking-wider">
                      Banner Title / Tagline *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 100% Pure Organic Honey Harvest"
                      value={newBannerTitle}
                      onChange={(e) => setNewBannerTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8EDF2] text-sm focus:outline-none focus:border-[#ED3500]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#163B5C] uppercase tracking-wider">
                      Optional Target Link URL
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. /#products or https://..."
                      value={newBannerLink}
                      onChange={(e) => setNewBannerLink(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8EDF2] text-sm focus:outline-none focus:border-[#ED3500]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#163B5C] uppercase tracking-wider block">
                    Upload Banner Image *
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <label className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#FFF8F5] hover:bg-[#ED3500]/10 text-[#ED3500] border border-[#ED3500]/20 text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 transition-all">
                      <Upload className="w-4 h-4" /> Select Banner Image File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerImageChange}
                        className="hidden"
                      />
                    </label>

                    <div className="flex-1 w-full">
                      <input
                        type="text"
                        placeholder="Or paste Image URL (https://...)"
                        value={newBannerImage}
                        onChange={(e) => {
                          setNewBannerImage(e.target.value);
                          setBannerImagePreview(e.target.value);
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E8EDF2] text-xs focus:outline-none focus:border-[#ED3500]"
                      />
                    </div>
                  </div>
                </div>

                {bannerImagePreview && (
                  <div className="p-3 rounded-2xl bg-[#FFFCFB] border border-[#E8EDF2] max-w-md">
                    <span className="text-[11px] font-bold text-[#64748B] block mb-2 uppercase">Image Preview:</span>
                    <img
                      src={bannerImagePreview}
                      alt="Banner Preview"
                      className="w-full h-40 object-cover rounded-xl border border-[#E8EDF2]"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingBanner}
                  className="px-6 py-3 rounded-xl bg-[#ED3500] hover:bg-[#D02E00] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#ED3500]/20 flex items-center gap-2"
                >
                  {isSubmittingBanner ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add Hero Banner Image
                </button>
              </form>
            </div>

            {/* Banners List */}
            {loadingBanners ? (
              <div className="py-12 text-center">
                <RefreshCw className="w-8 h-8 text-[#ED3500] animate-spin mx-auto" />
              </div>
            ) : banners.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-3xl border border-[#E8EDF2] p-6 space-y-2">
                <ImageIcon className="w-10 h-10 text-[#64748B] mx-auto opacity-40" />
                <h4 className="font-bold text-[#163B5C]">No hero banners added yet</h4>
                <p className="text-xs text-[#64748B]">
                  Uploaded banners will render dynamically in the customer storefront hero section.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {banners.map((b) => (
                  <div
                    key={b._id}
                    className="bg-white rounded-2xl border border-[#E8EDF2] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="relative aspect-video bg-[#FFF8F5]">
                      <img
                        src={b.image}
                        alt={b.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4 space-y-3">
                      <h4 className="font-bold text-sm text-[#163B5C] line-clamp-1">{b.title}</h4>
                      {b.link && (
                        <p className="text-[11px] text-blue-600 truncate underline">
                          Link: {b.link}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-[#E8EDF2]">
                        <span className="text-[10px] text-[#64748B]">
                          Added {new Date(b.createdAt).toLocaleDateString('en-IN')}
                        </span>
                        <button
                          onClick={() => handleDeleteBanner(b._id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white font-bold text-xs flex items-center gap-1 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payment Settings Management View */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8EDF2] shadow-sm max-w-3xl">
              <div className="flex items-center justify-between pb-6 border-b border-[#E8EDF2] mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-[#163B5C] flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-[#ED3500]" /> Payment Method Settings
                  </h2>
                  <p className="text-xs text-[#64748B] mt-1">
                    Enable or disable payment methods accepted during customer checkout.
                  </p>
                </div>
                <button
                  onClick={fetchSettings}
                  disabled={loadingSettings}
                  className="p-2 rounded-xl bg-[#FFFCFB] border border-[#E8EDF2] text-[#64748B] hover:text-[#ED3500] transition-colors"
                  title="Reload Settings"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingSettings ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {settingsSuccess && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{settingsSuccess}</span>
                </div>
              )}

              {settingsError && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold">
                  {settingsError}
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* Active Storefront Theme Selection */}
                <div className="p-6 rounded-3xl border-2 border-amber-300/60 bg-gradient-to-br from-amber-50/50 via-white to-amber-100/20 shadow-sm space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                        <Layers className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-base text-[#163B5C]">Active Storefront Theme</h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-[#163B5C]">
                            Live on Store
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B] mt-0.5">
                          Control which frontend theme customers see when visiting your website homepage.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {/* Theme V2 Card */}
                    <div
                      onClick={() => setPaymentSettings({ ...paymentSettings, activeTheme: 'v2' })}
                      className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        paymentSettings.activeTheme === 'v2'
                          ? 'border-[#ED3500] bg-white shadow-md shadow-[#ED3500]/10 ring-2 ring-[#ED3500]/20'
                          : 'border-[#E8EDF2] bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="text-xs font-black uppercase tracking-wider text-[#163B5C]">
                            Theme V2 (Modern B2B Landing & Store)
                          </span>
                        </div>
                        {paymentSettings.activeTheme === 'v2' && (
                          <div className="w-6 h-6 rounded-full bg-[#ED3500] text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-[#64748B] mt-2.5 leading-relaxed">
                        High-converting B2B wholesale landing page with hero banner slider, 6 trust badges, showcase mosaic, logo wall, problem cards, 7 benefits, quote modal & slide-over cart.
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                          Recommended
                        </span>
                        <span className="text-[11px] text-[#64748B]">B2B Leads + Retail Checkout</span>
                      </div>
                    </div>

                    {/* Theme V1 Card */}
                    <div
                      onClick={() => setPaymentSettings({ ...paymentSettings, activeTheme: 'v1' })}
                      className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        paymentSettings.activeTheme === 'v1'
                          ? 'border-[#ED3500] bg-white shadow-md shadow-[#ED3500]/10 ring-2 ring-[#ED3500]/20'
                          : 'border-[#E8EDF2] bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                          <span className="text-xs font-black uppercase tracking-wider text-[#163B5C]">
                            Theme V1 (Classic Retail Store)
                          </span>
                        </div>
                        {paymentSettings.activeTheme === 'v1' && (
                          <div className="w-6 h-6 rounded-full bg-[#ED3500] text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-[#64748B] mt-2.5 leading-relaxed">
                        Direct retail store layout with full-width product catalog, instant category filtering, price sorting, and standard cart modals.
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200">
                          Classic
                        </span>
                        <span className="text-[11px] text-[#64748B]">Retail Focus</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Online Payment (Razorpay) Toggle Card */}
                <div className="p-5 rounded-2xl border border-[#E8EDF2] bg-[#FFFCFB] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#ED3500]/10 text-[#ED3500] flex items-center justify-center font-black">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-[#163B5C]">Online Payment Gateway (Razorpay)</h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            paymentSettings.enableOnlinePayment ?? paymentSettings.enableUPI
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-100 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {(paymentSettings.enableOnlinePayment ?? paymentSettings.enableUPI) ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Allows customers to pay securely online via UPI, Credit/Debit Cards, NetBanking, and Wallets using Razorpay.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={paymentSettings.enableOnlinePayment ?? paymentSettings.enableUPI}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          enableOnlinePayment: e.target.checked,
                          enableUPI: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#ED3500]"></div>
                  </label>
                </div>

                {/* COD Toggle Card */}
                <div className="p-5 rounded-2xl border border-[#E8EDF2] bg-[#FFFCFB] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black">
                      <IndianRupee className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-[#163B5C]">Cash on Delivery (COD)</h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            paymentSettings.enableCOD
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-100 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {paymentSettings.enableCOD ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Allows customers to pay in cash upon receiving their order package at their address.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={paymentSettings.enableCOD}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, enableCOD: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#ED3500]"></div>
                  </label>
                </div>

                {/* B2B Wholesale Toggle Card */}
                <div className="p-5 rounded-2xl border border-[#E8EDF2] bg-[#FFFCFB] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-black">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-[#163B5C]">B2B Wholesale & Bulk Supply Desk</h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            paymentSettings.enableWholesale !== false
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-100 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {paymentSettings.enableWholesale !== false ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Enables the B2B Wholesale button on the storefront hero and allows commercial quotation requests.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={paymentSettings.enableWholesale !== false}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, enableWholesale: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#ED3500]"></div>
                  </label>
                </div>

                {/* Statutory Compliance Credentials (FSSAI & GSTIN) */}
                <div className="p-5 rounded-2xl border border-[#E8EDF2] bg-[#FFFCFB] space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-extrabold text-[#163B5C] text-sm">
                      Statutory Credentials & Compliance Badges
                    </h3>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    These official license numbers display prominently in trust badges on the storefront hero.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-[#163B5C] mb-1">
                        FSSAI License Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 22424000000000"
                        value={paymentSettings.fssaiNumber || ''}
                        onChange={(e) =>
                          setPaymentSettings({ ...paymentSettings, fssaiNumber: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E8EDF2] rounded-xl text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#163B5C] mb-1">
                        GSTIN Registration Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 33AAAAA0000A1Z5"
                        value={paymentSettings.gstin || ''}
                        onChange={(e) =>
                          setPaymentSettings({ ...paymentSettings, gstin: e.target.value.toUpperCase() })
                        }
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E8EDF2] rounded-xl text-[#163B5C] focus:outline-none focus:border-[#ED3500] uppercase"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingSettings}
                  className="w-full py-3.5 rounded-2xl bg-[#ED3500] hover:bg-[#D02E00] text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-[#ED3500]/25 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmittingSettings ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    'Save Settings & Credentials'
                  )}
                </button>
              </form>
            </div>

            {/* Product Spotlight Configuration Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8EDF2] shadow-sm max-w-4xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8EDF2] gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-[#163B5C] flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-[#ED3500]" /> Product Spotlight Banners
                  </h2>
                  <p className="text-xs text-[#64748B] mt-1">
                    Control one or multiple new product spotlight banners below the storefront header. When multiple products are active, they automatically rotate in a smooth carousel with next/prev navigation!
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      spotlightsList.some((s) => s.isActive)
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-100 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {spotlightsList.filter((s) => s.isActive).length} Active on Storefront
                  </span>
                  <button
                    type="button"
                    onClick={handleAddSpotlightItem}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#ED3500] hover:bg-[#D63000] text-white text-xs font-bold shadow transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Spotlight
                  </button>
                </div>
              </div>

              {spotlightSuccess && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{spotlightSuccess}</span>
                </div>
              )}

              {spotlightError && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold">
                  {spotlightError}
                </div>
              )}

              <form onSubmit={handleSaveSpotlight} className="space-y-8">
                {spotlightsList.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 sm:p-6 rounded-2xl border border-[#E8EDF2] bg-[#FFFCFB] space-y-5 relative transition-all hover:border-[#ED3500]/40"
                  >
                    {/* Item Card Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-[#E8EDF2]">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-full bg-[#163B5C] text-white font-extrabold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <h3 className="font-extrabold text-[#163B5C] text-sm">
                            {item.productTitle || `Spotlight Product #${idx + 1}`}
                          </h3>
                          <p className="text-[11px] text-[#64748B]">
                            {item.isActive ? 'Active on banner carousel' : 'Disabled (Hidden from storefront)'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Individual Active Toggle */}
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={item.isActive}
                            onChange={(e) =>
                              handleUpdateSpotlightItem(idx, 'isActive', e.target.checked)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ED3500]"></div>
                        </label>

                        {/* Remove Button */}
                        {spotlightsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSpotlightItem(idx)}
                            className="p-1.5 rounded-lg text-[#64748B] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove this spotlight product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Linked Store Product Selector */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#163B5C] uppercase tracking-wider">
                        Select Linked Store Product
                      </label>
                      <select
                        value={item.productId}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          const selected = products.find((p) => p._id === selectedId);
                          handleUpdateSpotlightItem(idx, 'productId', selectedId);
                          if (selected) {
                            handleUpdateSpotlightItem(idx, 'productTitle', selected.name);
                            handleUpdateSpotlightItem(idx, 'shortDescription', selected.description || '');
                            if (selected.image) {
                              handleUpdateSpotlightItem(idx, 'productImage', selected.image);
                            }
                          }
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E8EDF2] text-sm focus:outline-none focus:border-[#ED3500] bg-white font-medium text-[#163B5C]"
                      >
                        <option value="">Choose a product from store...</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} — ₹{p.price.toLocaleString('en-IN')} ({p.category} | Stock: {p.quantity})
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-[#64748B]">
                        Selecting a product automatically syncs live price, stock availability, and quick-view checkout.
                      </p>
                    </div>

                    {/* Banner Image URL & Preview */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#163B5C] uppercase tracking-wider">
                        Spotlight Product Image (URL or Path)
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-12 rounded-xl border border-[#E8EDF2] bg-white overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt="Spotlight preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <input
                          type="text"
                          value={item.productImage}
                          onChange={(e) =>
                            handleUpdateSpotlightItem(idx, 'productImage', e.target.value)
                          }
                          placeholder="/images/... or https://..."
                          className="flex-1 px-4 py-2 rounded-xl border border-[#E8EDF2] text-sm focus:outline-none focus:border-[#ED3500] bg-white"
                        />
                      </div>
                      <p className="text-[11px] text-[#64748B]">
                        Uses the product image by default, or you can paste a custom high-resolution banner image path (e.g. <code className="bg-gray-100 px-1 rounded">/images/beeshub-pure-forest-honey-spotlight.webp</code>).
                      </p>
                    </div>

                    {/* Banner Copy Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#163B5C] uppercase tracking-wider">
                          Badge Text
                        </label>
                        <input
                          type="text"
                          value={item.badgeText}
                          onChange={(e) =>
                            handleUpdateSpotlightItem(idx, 'badgeText', e.target.value)
                          }
                          placeholder="e.g. NEW ARRIVAL ✨"
                          className="w-full px-4 py-2 rounded-xl border border-[#E8EDF2] text-sm focus:outline-none focus:border-[#ED3500] bg-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#163B5C] uppercase tracking-wider">
                          Intro Prefix
                        </label>
                        <input
                          type="text"
                          value={item.headingPrefix}
                          onChange={(e) =>
                            handleUpdateSpotlightItem(idx, 'headingPrefix', e.target.value)
                          }
                          placeholder="e.g. Introducing Our"
                          className="w-full px-4 py-2 rounded-xl border border-[#E8EDF2] text-sm focus:outline-none focus:border-[#ED3500] bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#163B5C] uppercase tracking-wider">
                          Product Headline Title
                        </label>
                        <input
                          type="text"
                          value={item.productTitle}
                          onChange={(e) =>
                            handleUpdateSpotlightItem(idx, 'productTitle', e.target.value)
                          }
                          placeholder="e.g. Pure Forest Honey"
                          className="w-full px-4 py-2 rounded-xl border border-[#E8EDF2] text-sm focus:outline-none focus:border-[#ED3500] bg-white font-bold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#163B5C] uppercase tracking-wider">
                          CTA Button Text
                        </label>
                        <input
                          type="text"
                          value={item.ctaLabel}
                          onChange={(e) =>
                            handleUpdateSpotlightItem(idx, 'ctaLabel', e.target.value)
                          }
                          placeholder="e.g. Shop New Product"
                          className="w-full px-4 py-2 rounded-xl border border-[#E8EDF2] text-sm focus:outline-none focus:border-[#ED3500] bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#163B5C] uppercase tracking-wider">
                        Short Description
                      </label>
                      <textarea
                        rows={2}
                        value={item.shortDescription}
                        onChange={(e) =>
                          handleUpdateSpotlightItem(idx, 'shortDescription', e.target.value)
                        }
                        placeholder="Brief description for spotlight banner..."
                        className="w-full px-4 py-2 rounded-xl border border-[#E8EDF2] text-sm focus:outline-none focus:border-[#ED3500] bg-white"
                      />
                    </div>

                    {/* 3 Key Benefits */}
                    <div className="space-y-2 pt-2 border-t border-[#E8EDF2]">
                      <label className="block text-xs font-bold text-[#163B5C] uppercase tracking-wider">
                        3 Key Product Benefits
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={item.benefit1}
                          onChange={(e) =>
                            handleUpdateSpotlightItem(idx, 'benefit1', e.target.value)
                          }
                          placeholder="Benefit 1 (e.g. 100% Natural)"
                          className="w-full px-3 py-2 rounded-xl border border-[#E8EDF2] text-xs focus:outline-none focus:border-[#ED3500] bg-white font-semibold"
                        />
                        <input
                          type="text"
                          value={item.benefit2}
                          onChange={(e) =>
                            handleUpdateSpotlightItem(idx, 'benefit2', e.target.value)
                          }
                          placeholder="Benefit 2 (e.g. No Additives)"
                          className="w-full px-3 py-2 rounded-xl border border-[#E8EDF2] text-xs focus:outline-none focus:border-[#ED3500] bg-white font-semibold"
                        />
                        <input
                          type="text"
                          value={item.benefit3}
                          onChange={(e) =>
                            handleUpdateSpotlightItem(idx, 'benefit3', e.target.value)
                          }
                          placeholder="Benefit 3 (e.g. Farm Sourced)"
                          className="w-full px-3 py-2 rounded-xl border border-[#E8EDF2] text-xs focus:outline-none focus:border-[#ED3500] bg-white font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Another Product Button */}
                <button
                  type="button"
                  onClick={handleAddSpotlightItem}
                  className="w-full py-3.5 rounded-2xl border-2 border-dashed border-[#ED3500]/40 hover:border-[#ED3500] bg-[#FFF8F6] hover:bg-[#FFEFEA] text-[#ED3500] font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Plus className="w-5 h-5" /> Add Another Spotlight Product
                </button>

                {/* Save All Button */}
                <button
                  type="submit"
                  disabled={isSubmittingSpotlight}
                  className="w-full py-4 rounded-2xl bg-[#163B5C] hover:bg-[#112F4A] text-white font-bold text-sm uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingSpotlight ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-5 h-5 text-emerald-400" />
                      Save All Spotlight Products
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* POS Counter Management View */}
        {activeTab === 'pos' && (
          licenseState?.features?.posEnabled !== false ? (
            <POSCounter
              products={products}
              categories={categories}
              onRefreshProducts={fetchAllData}
            />
          ) : (
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4 my-12 shadow-2xl">
              <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black">POS Counter Feature Locked</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                The POS Billing Counter module is not enabled in your current subscription plan ({licenseState?.planName || 'Current Plan'}).
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('subscription')}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition"
                >
                  Upgrade Plan in Subscription Tab ↗
                </button>
              </div>
            </div>
          )
        )}

        {/* Subscription & Licensing Management View */}
        {activeTab === 'wholesale' && (
          <WholesaleLeadsTab onLeadsUpdated={fetchNewLeadsCount} />
        )}

        {activeTab === 'blog' && <BlogTab />}

        {activeTab === 'subscription' && (
          <SubscriptionTab
            initialLicense={licenseState}
            onRefreshLicense={fetchAllData}
          />
        )}
      </main>

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E8EDF2] shadow-2xl p-6 sm:p-8 relative">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingProduct(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#E8EDF2] text-[#64748B]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black text-[#163B5C]">
                  {editingProduct ? 'Edit Product Details' : 'Add New Product to Inventory'}
                </h3>
                <p className="text-xs text-[#64748B]">
                  Enter product details, MRP, price, GST slab & upload 1 image.
                </p>
              </div>

              {productFormError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {productFormError}
                </div>
              )}

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#163B5C] uppercase tracking-wider">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Organic Wild Honey 500g"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8EDF2] text-sm focus:outline-none focus:border-[#ED3500]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#163B5C] uppercase tracking-wider">
                    Product Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Detailed description of product origin, purity, packaging..."
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({ ...productForm, description: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8EDF2] text-sm focus:outline-none focus:border-[#ED3500]"
                  />
                </div>

                {/* File Upload Image */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#163B5C] uppercase tracking-wider">
                    Product Image (File Upload) *
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <label className="flex-1 w-full border-2 border-dashed border-[#E8EDF2] hover:border-[#ED3500] rounded-2xl p-4 text-center cursor-pointer bg-[#FFFCFB] transition-colors">
                      <Upload className="w-6 h-6 text-[#ED3500] mx-auto mb-1" />
                      <span className="text-xs font-bold text-[#163B5C] block">
                        {imagePreview ? 'Change Image File' : 'Choose Image File'}
                      </span>
                      <span className="text-[10px] text-[#64748B]">PNG, JPG, WEBP up to 5MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>

                    {imagePreview && (
                      <div className="w-24 h-24 rounded-2xl border border-[#E8EDF2] overflow-hidden bg-[#FFF8F5] relative shrink-0">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#163B5C] uppercase tracking-wider">
                      MRP (Original ₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="999"
                      value={productForm.mrp}
                      onChange={(e) => setProductForm({ ...productForm, mrp: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8EDF2] text-sm focus:outline-none focus:border-[#ED3500]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#163B5C] uppercase tracking-wider">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="699"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8EDF2] text-sm focus:outline-none focus:border-[#ED3500]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#163B5C] uppercase tracking-wider">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="10"
                      value={productForm.quantity}
                      onChange={(e) =>
                        setProductForm({ ...productForm, quantity: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8EDF2] text-sm focus:outline-none focus:border-[#ED3500]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#163B5C] uppercase tracking-wider">
                      GST Percentage (%) *
                    </label>
                    <select
                      value={productForm.gst}
                      onChange={(e) => setProductForm({ ...productForm, gst: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8EDF2] text-sm focus:outline-none focus:border-[#ED3500]"
                    >
                      <option value="0">0% GST (Exempted / Organic Goods)</option>
                      <option value="5">5% GST (Merit Rate / Essential & Processed Food Produce)</option>
                      <option value="18">18% GST (Standard Goods)</option>
                      <option value="28">28% GST (Luxury Items)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#163B5C] uppercase tracking-wider">
                      Category *
                    </label>
                    {categories.length === 0 ? (
                      <div className="text-xs text-rose-600 font-semibold pt-2">
                        No categories found. Please add a category in Categories tab first!
                      </div>
                    ) : (
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E8EDF2] text-sm focus:outline-none focus:border-[#ED3500]"
                      >
                        {categories.map((c) => (
                          <option key={c._id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Show on Homepage Toggle & COA Upload */}
                <div className="p-4 rounded-2xl bg-[#FFFCFB] border border-[#E8EDF2] space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-extrabold text-[#163B5C] uppercase tracking-wider block">
                        Show on Homepage
                      </span>
                      <p className="text-[11px] text-[#64748B]">
                        Display this product in the featured showcase directly below the homepage hero section.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={productForm.showOnHomepage}
                      aria-label="Show on Homepage"
                      onClick={() =>
                        setProductForm((prev) => ({ ...prev, showOnHomepage: !prev.showOnHomepage }))
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                        productForm.showOnHomepage ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                          productForm.showOnHomepage ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="pt-3 border-t border-[#E8EDF2] space-y-2">
                    <label className="text-xs font-bold text-[#163B5C] uppercase tracking-wider block">
                      COA (Certificate of Analysis) File
                    </label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#CBD5E1] hover:border-[#ED3500] bg-white cursor-pointer text-xs font-bold text-[#163B5C] transition-colors">
                        {uploadingCoa ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-[#ED3500]" />
                            <span>Uploading COA...</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 text-[#ED3500]" />
                            <span>{productForm.coaUrl ? 'Replace COA File' : 'Upload COA (PDF / Image)'}</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept=".pdf,application/pdf,image/png,image/jpeg,image/webp"
                          onChange={handleCoaFileChange}
                          disabled={uploadingCoa}
                          className="hidden"
                        />
                      </label>

                      {productForm.coaUrl && (
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <a
                            href={productForm.coaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold hover:bg-emerald-100"
                          >
                            View COA
                          </a>
                          <a
                            href={`${productForm.coaUrl}?download=1`}
                            download
                            className="px-3 py-1.5 rounded-lg bg-slate-100 text-[#163B5C] border border-slate-200 font-semibold hover:bg-slate-200"
                          >
                            Download
                          </a>
                          <button
                            type="button"
                            onClick={() => setProductForm((prev) => ({ ...prev, coaUrl: '' }))}
                            className="px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-[#64748B]">
                      Stored locally on server. Supports PDF, PNG, JPG, or WEBP up to 10 MB.
                    </p>
                    {coaUploadError && (
                      <p className="text-xs font-semibold text-rose-600">{coaUploadError}</p>
                    )}
                  </div>
                </div>

                {/* Product Variants Management Section */}
                <div className="p-4 rounded-2xl bg-[#FFFCFB] border border-[#E8EDF2] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-[#163B5C] uppercase tracking-wider flex items-center gap-1.5">
                        <Tag className="w-4 h-4 text-[#ED3500]" /> Product Variants & Pricing (Optional)
                      </h4>
                      <p className="text-[11px] text-[#64748B]">
                        Add weight/size variants (e.g. 250g, 500g, 1kg) with variant-based pricing & stock.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddVariantRow}
                      className="px-3 py-1.5 rounded-xl bg-[#ED3500]/10 hover:bg-[#ED3500]/20 text-[#ED3500] font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Variant
                    </button>
                  </div>

                  {/* Preset Quick Buttons */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase">Quick Add:</span>
                    {['250g', '500g', '1kg', 'Pack of 2', '100ml', '500ml'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setProductForm((prev) => ({
                            ...prev,
                            variants: [
                              ...prev.variants,
                              { name: preset, mrp: prev.mrp || '299', price: prev.price || '199', quantity: '10' },
                            ],
                          }));
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#E8EDF2] hover:border-[#ED3500] text-[11px] font-semibold text-[#163B5C] hover:text-[#ED3500] transition-colors"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>

                  {/* Variant Rows List */}
                  {productForm.variants.length > 0 && (
                    <div className="space-y-2.5 pt-2">
                      {productForm.variants.map((v, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-3 rounded-xl bg-white border border-[#E8EDF2]"
                        >
                          <div className="sm:col-span-4">
                            <label className="text-[10px] font-bold text-[#64748B] sm:hidden block">Variant Name</label>
                            <input
                              type="text"
                              required
                              placeholder="Variant (e.g. 500g)"
                              value={v.name}
                              onChange={(e) => handleUpdateVariantRow(idx, 'name', e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg border border-[#E8EDF2] text-xs focus:outline-none focus:border-[#ED3500]"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="text-[10px] font-bold text-[#64748B] sm:hidden block">MRP ₹</label>
                            <input
                              type="number"
                              required
                              placeholder="MRP ₹"
                              value={v.mrp}
                              onChange={(e) => handleUpdateVariantRow(idx, 'mrp', e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg border border-[#E8EDF2] text-xs focus:outline-none focus:border-[#ED3500]"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="text-[10px] font-bold text-[#64748B] sm:hidden block">Selling Price ₹</label>
                            <input
                              type="number"
                              required
                              placeholder="Price ₹"
                              value={v.price}
                              onChange={(e) => handleUpdateVariantRow(idx, 'price', e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg border border-[#E8EDF2] text-xs focus:outline-none focus:border-[#ED3500]"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="text-[10px] font-bold text-[#64748B] sm:hidden block">Stock Qty</label>
                            <input
                              type="number"
                              required
                              placeholder="Stock"
                              value={v.quantity}
                              onChange={(e) => handleUpdateVariantRow(idx, 'quantity', e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg border border-[#E8EDF2] text-xs focus:outline-none focus:border-[#ED3500]"
                            />
                          </div>

                          <div className="sm:col-span-1 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveVariantRow(idx)}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Remove Variant"
                            >
                              <Trash2 className="w-4 h-4 mx-auto" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingProduct || categories.length === 0}
                  className="w-full py-3.5 rounded-2xl bg-[#ED3500] hover:bg-[#D02E00] text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-[#ED3500]/25 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmittingProduct ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : editingProduct ? (
                    'Save Product Changes'
                  ) : (
                    'Add Product to Store'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Admin Password Security Challenge Modal */}
      {isSecModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#E8EDF2] space-y-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => {
                setIsSecModalOpen(false);
                setSecPasswordInput('');
                setSecPasswordError('');
              }}
              className="absolute top-4 right-4 p-2 text-[#64748B] hover:text-[#163B5C] rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-[#163B5C]">
                Admin Security Lock
              </h3>
              <p className="text-xs text-[#64748B]">
                Enter your <span className="font-bold text-[#163B5C]">Admin Password</span> to unlock access to the {targetTabAfterUnlock === 'pos' ? 'POS Counter' : 'Billing & Accounting'} section.
              </p>
            </div>

            <form onSubmit={handleVerifySecPassword} className="space-y-4">
              {secPasswordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold text-center">
                  {secPasswordError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#163B5C] uppercase tracking-wider block">
                  Admin Password
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={secPasswordInput}
                  onChange={(e) => setSecPasswordInput(e.target.value)}
                  placeholder="Enter Admin Password"
                  className="w-full px-4 py-3 rounded-xl border border-[#E8EDF2] focus:border-[#ED3500] focus:ring-2 focus:ring-[#ED3500]/20 outline-none text-sm font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={secSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#ED3500] hover:bg-[#D02E00] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#ED3500]/25 transition-all flex items-center justify-center gap-2"
              >
                {secSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  'Unlock Section 🔓'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-[#E8EDF2] py-6 px-4 text-center text-xs text-[#64748B]">
        Admin Portal — BeesHub Farmland Pvt Ltd Management System | GSTIN: 33AAOCB0453D1Z3
      </footer>
    </div>
  );
}
