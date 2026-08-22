'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';

interface BannerItem {
  _id: string;
  title: string;
  image: string;
  link?: string;
  createdAt: string;
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
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  pincode: string;
  items: OrderItem[];
  subtotal: number;
  totalGst: number;
  totalAmount: number;
  paymentMethod: 'COD' | 'UPI';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  transactionId?: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'orders' | 'banners'>('products');
  const [isRefreshing, setIsRefreshing] = useState(false);

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
  });
  const [imagePreview, setImagePreview] = useState('');

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

  // Fetch All Dashboard Data
  const fetchAllData = async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([fetchProducts(), fetchCategories(), fetchOrders(), fetchBanners()]);
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
      const res = await fetch('/api/products');
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

  // Handle Banner Image File Selection
  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size too large. Please select an image under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setNewBannerImage(base64String);
        setBannerImagePreview(base64String);
      };
      reader.readAsDataURL(file);
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

  // Handle Image Upload & Conversion to Base64 Data URL
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size too large. Please select an image under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProductForm((prev) => ({ ...prev, image: base64String }));
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
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
    });
    setImagePreview(product.image);
    setProductFormError('');
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
    });
    setImagePreview('');
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
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        setEditingProduct(null);
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
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
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
    router.push('/admin/login');
  };

  // Metrics
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

  return (
    <div className="min-h-screen bg-[#FFFCFB] text-[#163B5C] flex flex-col justify-between">
      {/* Header with Refresh Option */}
      <header className="bg-white border-b border-[#E8EDF2] sticky top-0 z-30">
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
              <h1 className="font-extrabold text-xl text-[#163B5C]">BeesHub Farmland Admin</h1>
              <span className="text-xs text-[#64748B]">Manage Inventory, Categories & Customer Orders</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Dashboard Refresh Button */}
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
              className="text-xs font-semibold text-[#64748B] hover:text-[#ED3500] transition-colors hidden sm:inline"
            >
              View Customer Store ↗
            </Link>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-[#FFF8F5] text-[#ED3500] hover:bg-[#ED3500] hover:text-white border border-[#ED3500]/20 font-bold text-xs flex items-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

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

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-[#E8EDF2]">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('products')}
              className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'products'
                  ? 'border-[#ED3500] text-[#ED3500]'
                  : 'border-transparent text-[#64748B] hover:text-[#163B5C]'
              }`}
            >
              <Package className="w-4 h-4" /> Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'categories'
                  ? 'border-[#ED3500] text-[#ED3500]'
                  : 'border-transparent text-[#64748B] hover:text-[#163B5C]'
              }`}
            >
              <Layers className="w-4 h-4" /> Categories ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'orders'
                  ? 'border-[#ED3500] text-[#ED3500]'
                  : 'border-transparent text-[#64748B] hover:text-[#163B5C]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('banners')}
              className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'banners'
                  ? 'border-[#ED3500] text-[#ED3500]'
                  : 'border-transparent text-[#64748B] hover:text-[#163B5C]'
              }`}
            >
              <ImageIcon className="w-4 h-4" /> Hero Banners ({banners.length})
            </button>
          </div>

          {activeTab === 'products' && (
            <button
              onClick={openAddProductModal}
              className="mb-3 px-4 py-2.5 rounded-xl bg-[#ED3500] hover:bg-[#D02E00] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-[#ED3500]/20 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          )}
        </div>

        {/* Products Management View */}
        {activeTab === 'products' && (
          <div className="space-y-6">
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

        {/* Customer Orders Management View with Pagination */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Filter by status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#64748B]">
                <Filter className="w-4 h-4" /> Status Filter:
                {['All', 'Pending', 'Processing', 'Completed', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setOrderStatusFilter(st);
                      setOrderPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
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
                              order.paymentMethod === 'UPI'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {order.paymentMethod === 'UPI' ? (
                              <>
                                <QrCode className="w-3.5 h-3.5" /> Online UPI
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-3.5 h-3.5" /> Cash on Delivery
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
                          <p className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-[#ED3500]" /> {order.customerEmail}
                          </p>
                          <p className="flex items-start gap-1.5 pt-1 border-t border-[#E8EDF2]">
                            <MapPin className="w-3.5 h-3.5 text-[#ED3500] shrink-0 mt-0.5" />
                            <span>
                              {order.shippingAddress} (Pincode: {order.pincode})
                            </span>
                          </p>

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

      {/* Footer */}
      <footer className="bg-white border-t border-[#E8EDF2] py-6 px-4 text-center text-xs text-[#64748B]">
        Admin Portal — BeesHub Farmland Pvt Ltd Management System
      </footer>
    </div>
  );
}
