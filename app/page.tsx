'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  Leaf,
  CreditCard,
  QrCode,
  Smartphone,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  PackageCheck,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Facebook,
  Instagram,
} from 'lucide-react';

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
  createdAt?: string;
}

interface CategoryItem {
  _id: string;
  name: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface TrackedOrder {
  _id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  pincode: string;
  items: Array<{ name: string; price: number; quantity: number; gst: number; image?: string }>;
  subtotal: number;
  totalGst: number;
  totalAmount: number;
  paymentMethod: 'COD' | 'UPI';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  transactionId?: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export default function CustomerStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Customer Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals & Drawers State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  // Order Tracking Modal State
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [trackQuery, setTrackQuery] = useState('');
  const [trackedOrders, setTrackedOrders] = useState<TrackedOrder[]>([]);
  const [isSearchingOrders, setIsSearchingOrders] = useState(false);
  const [trackSearched, setTrackSearched] = useState(false);

  // Customer Checkout Form
  const [checkoutForm, setCheckoutForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    shippingAddress: '',
    pincode: '',
    paymentMethod: 'UPI' as 'COD' | 'UPI',
    transactionId: '',
  });

  const [merchantUpiId, setMerchantUpiId] = useState(
    process.env.NEXT_PUBLIC_MERCHANT_UPI_ID || 'beeshubfarmland@upi'
  );
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [formError, setFormError] = useState('');

  // 1. Restore Session State from localStorage on Mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('beeshub_cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCart(parsed);
        }
      }

      const savedForm = localStorage.getItem('beeshub_checkout_form');
      if (savedForm) {
        setCheckoutForm((prev) => ({ ...prev, ...JSON.parse(savedForm) }));
      }

      const wasCheckoutOpen = localStorage.getItem('beeshub_checkout_open');
      if (wasCheckoutOpen === 'true') {
        setIsCheckoutOpen(true);
      }
    } catch (err) {
      console.error('Error restoring session state:', err);
    }
  }, []);

  // 2. Persist Cart to localStorage
  useEffect(() => {
    try {
      if (cart.length > 0) {
        localStorage.setItem('beeshub_cart', JSON.stringify(cart));
      } else {
        localStorage.removeItem('beeshub_cart');
      }
    } catch (err) {}
  }, [cart]);

  // 3. Persist Checkout Form & Modal state
  useEffect(() => {
    try {
      localStorage.setItem('beeshub_checkout_form', JSON.stringify(checkoutForm));
      localStorage.setItem('beeshub_checkout_open', isCheckoutOpen ? 'true' : 'false');
    } catch (err) {}
  }, [checkoutForm, isCheckoutOpen]);

  // Fetch Dynamic Categories
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch Dynamic Products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/products', window.location.origin);
      if (searchQuery) url.searchParams.append('search', searchQuery);
      if (selectedCategory !== 'All') url.searchParams.append('category', selectedCategory);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchProducts();
  }, [searchQuery, selectedCategory]);

  // Handle Customer Order Tracking Search
  const handleSearchTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;

    try {
      setIsSearchingOrders(true);
      setTrackSearched(true);
      const res = await fetch(`/api/orders/track?query=${encodeURIComponent(trackQuery.trim())}`);
      const data = await res.json();
      if (data.success) {
        setTrackedOrders(data.data);
      } else {
        setTrackedOrders([]);
      }
    } catch (err) {
      console.error('Error tracking order:', err);
    } finally {
      setIsSearchingOrders(false);
    }
  };

  // Cart Management
  const addToCart = (product: Product, quantityToAdd = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product._id === product._id);
      if (existing) {
        const newQty = existing.quantity + quantityToAdd;
        if (newQty > product.quantity) {
          alert(`Sorry, only ${product.quantity} items available in stock.`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.product._id === product._id ? { ...item, quantity: newQty } : item
        );
      } else {
        if (quantityToAdd > product.quantity) {
          alert(`Sorry, only ${product.quantity} items available in stock.`);
          return prevCart;
        }
        return [...prevCart, { product, quantity: quantityToAdd }];
      }
    });
    setIsCartOpen(true);
  };

  const updateCartQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.product._id === productId) {
          if (newQty > item.product.quantity) {
            alert(`Only ${item.product.quantity} units available.`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product._id !== productId));
  };

  // Calculations
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const cartGstTotal = cart.reduce(
    (sum, item) =>
      sum + ((item.product.price * item.quantity) * (item.product.gst !== undefined ? item.product.gst : 0)) / 100,
    0
  );
  const cartGrandTotal = Math.round(cartSubtotal + cartGstTotal);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Sorting & Pagination
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1;
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Copy UPI ID helper
  const handleCopyUpi = () => {
    navigator.clipboard.writeText(merchantUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // UPI Intent URL
  const upiIntentUrl = `upi://pay?pa=${encodeURIComponent(merchantUpiId)}&pn=${encodeURIComponent('BEES HUB FARMLAND PRIVATE LIMITED')}&am=${cartGrandTotal}&cu=INR&tn=${encodeURIComponent('BeesHub Farmland Order')}`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiIntentUrl)}`;

  // Handle Order Submit
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (
      !checkoutForm.customerName ||
      !checkoutForm.customerPhone ||
      !checkoutForm.customerEmail ||
      !checkoutForm.shippingAddress ||
      !checkoutForm.pincode
    ) {
      setFormError('Please fill in all required customer details.');
      return;
    }

    if (checkoutForm.paymentMethod === 'UPI' && !checkoutForm.transactionId.trim()) {
      setFormError('Please enter your 12-digit UPI Reference / UTR Number after completing payment.');
      return;
    }

    try {
      setSubmittingOrder(true);
      const payload = {
        ...checkoutForm,
        items: cart.map((item) => ({
          productId: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          gst: item.product.gst !== undefined ? item.product.gst : 0,
          image: item.product.image,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setOrderSuccess(data.data);
        setCart([]);
        setIsCheckoutOpen(false);
        setIsCartOpen(false);

        // Clear local storage after successful checkout
        try {
          localStorage.removeItem('beeshub_cart');
          localStorage.removeItem('beeshub_checkout_form');
          localStorage.removeItem('beeshub_checkout_open');
        } catch (e) {}

        fetchProducts(); // Refresh stock
      } else {
        setFormError(data.message || 'Failed to place order.');
      }
    } catch (err: any) {
      setFormError(err.message || 'Network error occurred while submitting order.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const dynamicCategoryList = ['All', ...categories.map((c) => c.name)];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FFFCFB] text-[#163B5C]">
      {/* Real E-Commerce Store Header Nav */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E8EDF2] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/logo.jpg"
              alt="BEES HUB FARMLAND PRIVATE LIMITED Logo"
              className="w-10 h-10 object-contain rounded-xl shadow-xs border border-[#E8EDF2] group-hover:scale-105 transition-transform"
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

          {/* Search Bar */}
          <div className="flex-1 max-w-lg hidden md:block relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search products in store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-[#FFFCFB] border border-[#E8EDF2] rounded-full text-sm focus:outline-none focus:border-[#ED3500] focus:ring-2 focus:ring-[#ED3500]/10 transition-all text-[#163B5C] placeholder-[#64748B]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#64748B] hover:text-[#163B5C]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            {/* Track Order Button */}
            <button
              onClick={() => setIsTrackModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#E8EDF2] hover:border-[#163B5C]/30 text-[#163B5C] font-semibold text-xs transition-all bg-white"
            >
              <Truck className="w-4 h-4 text-[#ED3500]" />
              <span className="hidden sm:inline">Track Order</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ED3500] hover:bg-[#D02E00] text-white font-bold text-sm shadow-md shadow-[#ED3500]/20 transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Cart</span>
              {cartItemCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-[#ED3500] text-xs font-black flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2 bg-[#FFFCFB] border border-[#E8EDF2] rounded-full text-sm focus:outline-none focus:border-[#ED3500]"
            />
          </div>
        </div>
      </header>

      {/* Modern E-Commerce Hero Showcase Banner */}
      <section className="bg-gradient-to-br from-[#FFF5F2] via-[#FFFCFB] to-[#FFF8F5] border-b border-[#E8EDF2] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-start justify-between gap-8">
          {/* Main Hero Copy */}
          <div className="space-y-4 text-center sm:text-left max-w-3xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#163B5C] tracking-tight leading-tight">
              Pure & Fresh Organic Produce, <span className="text-[#ED3500] underline decoration-wavy decoration-[#ED3500]/30 underline-offset-8">Delivered Direct To You</span>
            </h1>

            <p className="text-[#64748B] text-sm sm:text-base leading-relaxed">
              Experience handpicked pure honey, organic spices, and farm produce directly from <strong>BeesHub Farmland Pvt Ltd</strong>.
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
              <button
                onClick={() => {
                  window.scrollTo({ top: 450, behavior: 'smooth' });
                }}
                className="px-6 py-3.5 rounded-2xl bg-[#ED3500] hover:bg-[#D02E00] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#ED3500]/25 transition-all flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> Shop Fresh Products
              </button>
              <button
                onClick={() => setIsTrackModalOpen(true)}
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-[#FFFCFB] border border-[#E8EDF2] hover:border-[#163B5C]/30 text-[#163B5C] font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center gap-2"
              >
                <Truck className="w-4 h-4 text-[#ED3500]" /> Track My Order
              </button>
            </div>
          </div>

          {/* E-Commerce Value Proposition Cards (Horizontal 3-Column Row) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-2">
            <div className="p-4 rounded-2xl bg-white border border-[#E8EDF2] shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ED3500]/10 text-[#ED3500] flex items-center justify-center font-bold shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-[#163B5C]">100% Organic</h4>
                <p className="text-[11px] text-[#64748B]">Zero Chemicals & Pure</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E8EDF2] shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center font-bold shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-[#163B5C]">Direct Shipping</h4>
                <p className="text-[11px] text-[#64748B]">Kanyakumari Farmlands</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E8EDF2] shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-[#163B5C]">Instant UPI & COD</h4>
                <p className="text-[11px] text-[#64748B]">GPay, PhonePe & Paytm</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Product Catalog Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* Dynamic Admin Categories & Sorting Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          {/* Dynamic Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto scrollbar-none">
            {dynamicCategoryList.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#ED3500] text-white shadow-md shadow-[#ED3500]/20'
                    : 'bg-white border border-[#E8EDF2] text-[#64748B] hover:text-[#163B5C] hover:border-[#163B5C]/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results count & Sort dropdown */}
          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto text-sm text-[#64748B]">
            <span>
              Showing <strong className="text-[#163B5C]">{paginatedProducts.length}</strong> of{' '}
              <strong className="text-[#163B5C]">{sortedProducts.length}</strong> items
            </span>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#64748B]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-[#E8EDF2] rounded-lg px-3 py-1.5 text-xs font-medium text-[#163B5C] focus:outline-none focus:border-[#ED3500]"
              >
                <option value="newest">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customized Premium Product Cards Grid (Optimized for Mobile & Desktop) */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-white border border-[#E8EDF2] animate-pulse p-4 space-y-4"
              >
                <div className="h-44 bg-[#E8EDF2] rounded-xl"></div>
                <div className="h-4 bg-[#E8EDF2] rounded w-3/4"></div>
                <div className="h-4 bg-[#E8EDF2] rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-[#E8EDF2] max-w-lg mx-auto p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FFF8F5] text-[#ED3500] flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#163B5C]">No products available</h3>
            <p className="text-sm text-[#64748B]">
              No products have been added yet or match your filter.
            </p>
            {searchQuery || selectedCategory !== 'All' ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="px-5 py-2.5 rounded-full bg-[#ED3500] text-white font-medium text-xs hover:bg-[#D02E00] transition-colors"
              >
                Reset Filters
              </button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {paginatedProducts.map((product) => {
                const isOutOfStock = product.quantity <= 0;
                const gstRate = product.gst !== undefined ? product.gst : 0;
                return (
                  <div
                    key={product._id}
                    className="group bg-white rounded-2xl border border-[#E8EDF2] overflow-hidden hover:shadow-xl hover:border-[#ED3500]/40 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Container */}
                      <div className="relative aspect-square bg-[#FFF8F5] overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLElement).setAttribute(
                              'src',
                              'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
                            );
                          }}
                        />
                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {product.discount > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-[#ED3500] text-white text-[10px] sm:text-xs font-extrabold uppercase tracking-wide shadow-sm">
                              {product.discount}% OFF
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[#163B5C] text-[9px] sm:text-[10px] font-bold flex items-center gap-1 shadow-xs">
                            <CheckCircle2 className="w-3 h-3 text-[#10B981]" /> Verified
                          </span>
                        </div>

                        {/* Quick View Button Overlay */}
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="absolute bottom-2 right-2 p-2 rounded-full bg-white/90 hover:bg-[#ED3500] hover:text-white text-[#163B5C] transition-all shadow-md backdrop-blur-xs hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                          title="Quick View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="p-3 sm:p-5 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#64748B] line-clamp-1">
                            {product.category || 'General'}
                          </span>
                          <span className="text-[10px] font-semibold text-[#64748B]">
                            {gstRate === 0 ? '0% GST' : `${gstRate}% GST`}
                          </span>
                        </div>

                        <h3
                          onClick={() => setSelectedProduct(product)}
                          className="font-bold text-xs sm:text-base text-[#163B5C] line-clamp-2 hover:text-[#ED3500] cursor-pointer transition-colors leading-snug"
                        >
                          {product.name}
                        </h3>

                        {/* Stock status */}
                        <div className="text-[10px] sm:text-xs pt-0.5">
                          {isOutOfStock ? (
                            <span className="text-rose-600 font-bold">Out of Stock</span>
                          ) : (
                            <span className="text-[#10B981] font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                              In Stock ({product.quantity})
                            </span>
                          )}
                        </div>

                        {/* Price Breakdown */}
                        <div className="pt-1 flex items-baseline gap-2">
                          <span className="text-base sm:text-xl font-black text-[#ED3500]">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                          {product.mrp > product.price && (
                            <span className="text-[10px] sm:text-xs text-[#64748B] line-through font-medium">
                              ₹{product.mrp.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Add to Cart CTA Button */}
                    <div className="p-3 sm:p-5 pt-0">
                      <button
                        disabled={isOutOfStock}
                        onClick={() => addToCart(product)}
                        className={`w-full py-2 sm:py-2.5 px-3 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                          isOutOfStock
                            ? 'bg-[#E8EDF2] text-[#64748B] cursor-not-allowed'
                            : 'bg-[#ED3500] hover:bg-[#D02E00] text-white shadow-md hover:shadow-lg shadow-[#ED3500]/20 active:scale-95'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {isOutOfStock ? 'Sold Out' : 'Add to Bag'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Storefront Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-[#E8EDF2] text-xs text-[#64748B]">
                <span>
                  Page <strong className="text-[#163B5C]">{currentPage}</strong> of{' '}
                  <strong className="text-[#163B5C]">{totalPages}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage((p) => Math.max(p - 1, 1));
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="px-4 py-2 rounded-xl border border-[#E8EDF2] bg-white font-bold text-[#163B5C] disabled:opacity-40 hover:bg-[#FFF8F5] hover:border-[#ED3500]/30 transition-all flex items-center gap-1 shadow-xs"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#ED3500]" /> Previous
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage((p) => Math.min(p + 1, totalPages));
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="px-4 py-2 rounded-xl border border-[#E8EDF2] bg-white font-bold text-[#163B5C] disabled:opacity-40 hover:bg-[#FFF8F5] hover:border-[#ED3500]/30 transition-all flex items-center gap-1 shadow-xs"
                  >
                    Next <ChevronRight className="w-4 h-4 text-[#ED3500]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Customer Order Tracking Modal */}
      {isTrackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E8EDF2] shadow-2xl p-6 sm:p-8 relative">
            <button
              onClick={() => {
                setIsTrackModalOpen(false);
                setTrackedOrders([]);
                setTrackSearched(false);
                setTrackQuery('');
              }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#E8EDF2] text-[#64748B]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-[#ED3500]">
                  <Truck className="w-6 h-6" />
                  <h3 className="text-2xl font-extrabold text-[#163B5C]">Track Your Order</h3>
                </div>
                <p className="text-xs text-[#64748B] mt-1">
                  Enter your registered Phone Number, Email Address, or Order Number (e.g. ORD-1001) to check live status.
                </p>
              </div>

              {/* Tracking Search Form */}
              <form onSubmit={handleSearchTracking} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 95787 84431 or ORD-1001"
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-2xl border border-[#E8EDF2] text-sm focus:outline-none focus:border-[#ED3500]"
                />
                <button
                  type="submit"
                  disabled={isSearchingOrders}
                  className="px-6 py-3 rounded-2xl bg-[#ED3500] hover:bg-[#D02E00] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#ED3500]/20 flex items-center gap-2 shrink-0"
                >
                  {isSearchingOrders ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4" /> Track
                    </>
                  )}
                </button>
              </form>

              {/* Tracked Results List */}
              {isSearchingOrders ? (
                <div className="py-12 text-center">
                  <RefreshCw className="w-8 h-8 text-[#ED3500] animate-spin mx-auto" />
                  <p className="text-xs text-[#64748B] mt-2">Searching orders...</p>
                </div>
              ) : trackSearched && trackedOrders.length === 0 ? (
                <div className="py-12 text-center bg-[#FFFCFB] rounded-2xl border border-[#E8EDF2] p-6 space-y-2">
                  <PackageCheck className="w-10 h-10 text-[#64748B] mx-auto opacity-40" />
                  <h4 className="font-bold text-[#163B5C]">No matching orders found</h4>
                  <p className="text-xs text-[#64748B]">
                    Please check the phone number, email address, or order number entered.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                  {trackedOrders.map((ord) => (
                    <div
                      key={ord._id}
                      className="p-5 rounded-2xl bg-[#FFFCFB] border border-[#E8EDF2] space-y-4 hover:border-[#ED3500]/30 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8EDF2] pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-base text-[#163B5C]">
                              {ord.orderId}
                            </span>
                            <span
                              className={`px-3 py-0.5 rounded-full text-xs font-extrabold ${
                                ord.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : ord.status === 'Processing'
                                  ? 'bg-blue-100 text-blue-700'
                                  : ord.status === 'Cancelled'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-amber-100 text-amber-700 animate-pulse'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#64748B]">
                            Ordered on {new Date(ord.createdAt).toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-extrabold text-purple-700 block">
                            {ord.paymentMethod === 'UPI' ? 'Online UPI' : 'Cash on Delivery'} (
                            {ord.paymentStatus || 'Pending'})
                          </span>
                          <span className="text-sm font-black text-[#ED3500]">
                            Total: ₹{ord.totalAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-1.5 text-xs text-[#64748B]">
                        <span className="font-bold text-[#163B5C] block text-[11px] uppercase tracking-wider">
                          Items Ordered ({ord.items.length}):
                        </span>
                        {ord.items.map((it, i) => (
                          <div key={i} className="flex justify-between">
                            <span>
                              {it.name} × {it.quantity}
                            </span>
                            <span className="font-semibold text-[#163B5C]">
                              ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Shipping details */}
                      <div className="p-3 rounded-xl bg-white border border-[#E8EDF2] text-xs text-[#64748B] space-y-1">
                        <p>
                          <strong className="text-[#163B5C]">Deliver To:</strong> {ord.customerName} ({ord.customerPhone})
                        </p>
                        <p className="line-clamp-1">{ord.shippingAddress} - {ord.pincode}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#E8EDF2] shadow-2xl relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#FFFCFB] hover:bg-[#E8EDF2] text-[#163B5C] transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Product Image */}
              <div className="bg-[#FFF8F5] p-6 flex items-center justify-center relative">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full max-h-80 object-cover rounded-2xl shadow-md"
                />
              </div>

              {/* Product Info */}
              <div className="p-6 md:p-8 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-[#ED3500]/10 text-[#ED3500] text-xs font-bold uppercase tracking-wider">
                      {selectedProduct.category}
                    </span>
                    <span className="text-xs text-[#10B981] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> BeesHub Farmland
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-[#163B5C] leading-snug">
                    {selectedProduct.name}
                  </h2>

                  <p className="text-sm text-[#64748B] leading-relaxed">
                    {selectedProduct.description}
                  </p>

                  {/* Pricing Breakdown */}
                  <div className="p-4 rounded-2xl bg-[#FFFCFB] border border-[#E8EDF2] space-y-2">
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-black text-[#ED3500]">
                        ₹{selectedProduct.price.toLocaleString('en-IN')}
                      </span>
                      {selectedProduct.mrp > selectedProduct.price && (
                        <span className="text-sm text-[#64748B] line-through">
                          MRP ₹{selectedProduct.mrp.toLocaleString('en-IN')}
                        </span>
                      )}
                      {selectedProduct.discount > 0 && (
                        <span className="px-2 py-0.5 rounded bg-[#10B981]/10 text-[#10B981] text-xs font-extrabold">
                          Save {selectedProduct.discount}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#64748B]">
                      {selectedProduct.gst === 0 ? (
                        <strong className="text-[#10B981]">0% GST (Exempted Item)</strong>
                      ) : (
                        <>
                          Inclusive of <strong>{selectedProduct.gst}% GST</strong> (₹
                          {Math.round(
                            (selectedProduct.price * selectedProduct.gst) / 100
                          )}{' '}
                          tax)
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <button
                    disabled={selectedProduct.quantity <= 0}
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#ED3500] hover:bg-[#D02E00] text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#ED3500]/25 transition-all"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    {selectedProduct.quantity > 0 ? 'Add to Shopping Bag' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white h-full flex flex-col justify-between shadow-2xl border-l border-[#E8EDF2]">
            {/* Header */}
            <div className="p-6 border-b border-[#E8EDF2] flex items-center justify-between bg-[#FFFCFB]">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-[#ED3500]" />
                <h3 className="font-bold text-lg text-[#163B5C]">Your Shopping Bag</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#ED3500] text-white text-xs font-extrabold">
                  {cartItemCount}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full hover:bg-[#E8EDF2] text-[#64748B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <ShoppingBag className="w-12 h-12 text-[#64748B] mx-auto opacity-40" />
                  <p className="font-bold text-lg text-[#163B5C]">Your bag is empty</p>
                  <p className="text-xs text-[#64748B]">Add items to start shopping</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product._id}
                    className="flex gap-4 p-4 rounded-2xl bg-[#FFFCFB] border border-[#E8EDF2] relative"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-xl bg-[#FFF8F5]"
                    />
                    <div className="flex-1 space-y-1">
                      <h4 className="font-bold text-sm text-[#163B5C] line-clamp-1">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-[#64748B]">
                        GST: {item.product.gst !== undefined ? item.product.gst : 0}%
                      </p>
                      <div className="text-sm font-extrabold text-[#ED3500]">
                        ₹{item.product.price.toLocaleString('en-IN')}{' '}
                        <span className="text-[11px] font-normal text-[#64748B]">
                          × {item.quantity}
                        </span>
                      </div>

                      {/* Qty Stepper */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => updateCartQty(item.product._id, item.quantity - 1)}
                          className="w-6 h-6 rounded-md bg-white border border-[#E8EDF2] flex items-center justify-center hover:bg-[#E8EDF2]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold px-2">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQty(item.product._id, item.quantity + 1)}
                          className="w-6 h-6 rounded-md bg-white border border-[#E8EDF2] flex items-center justify-center hover:bg-[#E8EDF2]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product._id)}
                      className="text-[#64748B] hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer Breakdown & Checkout Trigger */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-[#E8EDF2] bg-[#FFFCFB] space-y-4">
                <div className="space-y-1.5 text-xs text-[#64748B]">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-[#163B5C]">
                      ₹{cartSubtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total GST</span>
                    <span className="font-semibold text-[#163B5C]">
                      {cartGstTotal === 0 ? '₹0 (0% GST Exempted)' : `₹${Math.round(cartGstTotal).toLocaleString('en-IN')}`}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#E8EDF2] text-sm text-[#163B5C]">
                    <span className="font-bold">Grand Total</span>
                    <span className="font-black text-[#ED3500] text-lg">
                      ₹{cartGrandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#ED3500] hover:bg-[#D02E00] text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#ED3500]/25 transition-all"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Customer Checkout Modal with Unified UPI Gateway & COD */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-[#E8EDF2] shadow-2xl p-6 sm:p-8 relative">
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#E8EDF2] text-[#64748B]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-[#163B5C]">Checkout & Payment</h3>
                <p className="text-xs text-[#64748B]">
                  Enter delivery address and choose Online UPI or Cash on Delivery.
                </p>
              </div>

              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {formError}
                </div>
              )}

              <form onSubmit={handlePlaceOrder} className="space-y-5">
                {/* Contact & Shipping Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#163B5C]">
                    1. Shipping Information
                  </h4>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#163B5C]">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Sharma"
                      value={checkoutForm.customerName}
                      onChange={(e) =>
                        setCheckoutForm({ ...checkoutForm, customerName: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8EDF2] text-sm focus:outline-none focus:border-[#ED3500]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#163B5C]">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 9876543210"
                        value={checkoutForm.customerPhone}
                        onChange={(e) =>
                          setCheckoutForm({ ...checkoutForm, customerPhone: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E8EDF2] text-sm focus:outline-none focus:border-[#ED3500]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#163B5C]">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="ananya@example.com"
                        value={checkoutForm.customerEmail}
                        onChange={(e) =>
                          setCheckoutForm({ ...checkoutForm, customerEmail: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E8EDF2] text-sm focus:outline-none focus:border-[#ED3500]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#163B5C]">
                      Full Shipping Address *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="House No., Street name, Landmark, City, State"
                      value={checkoutForm.shippingAddress}
                      onChange={(e) =>
                        setCheckoutForm({ ...checkoutForm, shippingAddress: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8EDF2] text-sm focus:outline-none focus:border-[#ED3500]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#163B5C]">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="560001"
                      value={checkoutForm.pincode}
                      onChange={(e) =>
                        setCheckoutForm({ ...checkoutForm, pincode: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8EDF2] text-sm focus:outline-none focus:border-[#ED3500]"
                    />
                  </div>
                </div>

                {/* Payment Option Selection */}
                <div className="space-y-3 pt-2 border-t border-[#E8EDF2]">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#163B5C]">
                    2. Select Payment Method
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Unified UPI Option */}
                    <button
                      type="button"
                      onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: 'UPI' })}
                      className={`p-4 rounded-2xl border flex flex-col items-start gap-2 transition-all ${
                        checkoutForm.paymentMethod === 'UPI'
                          ? 'border-[#ED3500] bg-[#FFF8F5] ring-2 ring-[#ED3500]/20'
                          : 'border-[#E8EDF2] bg-white hover:border-[#163B5C]/20'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <QrCode className="w-6 h-6 text-[#ED3500]" />
                        <span
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            checkoutForm.paymentMethod === 'UPI'
                              ? 'border-[#ED3500] bg-[#ED3500]'
                              : 'border-[#64748B]'
                          }`}
                        >
                          {checkoutForm.paymentMethod === 'UPI' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                          )}
                        </span>
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-sm text-[#163B5C] block">
                          Online UPI / QR
                        </span>
                        <span className="text-[11px] text-[#64748B]">GPay, PhonePe, Paytm</span>
                      </div>
                    </button>

                    {/* Cash on Delivery Option */}
                    <button
                      type="button"
                      onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: 'COD' })}
                      className={`p-4 rounded-2xl border flex flex-col items-start gap-2 transition-all ${
                        checkoutForm.paymentMethod === 'COD'
                          ? 'border-[#ED3500] bg-[#FFF8F5] ring-2 ring-[#ED3500]/20'
                          : 'border-[#E8EDF2] bg-white hover:border-[#163B5C]/20'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <CreditCard className="w-6 h-6 text-[#10B981]" />
                        <span
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            checkoutForm.paymentMethod === 'COD'
                              ? 'border-[#ED3500] bg-[#ED3500]'
                              : 'border-[#64748B]'
                          }`}
                        >
                          {checkoutForm.paymentMethod === 'COD' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                          )}
                        </span>
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-sm text-[#163B5C] block">
                          Cash on Delivery
                        </span>
                        <span className="text-[11px] text-[#64748B]">Pay when delivered</span>
                      </div>
                    </button>
                  </div>

                  {/* Dynamic UPI Gateway Panel */}
                  {checkoutForm.paymentMethod === 'UPI' && (
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 via-white to-orange-50 border border-purple-200 space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                          <QrCode className="w-4 h-4 text-[#ED3500]" /> Unified UPI Payment Gateway
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-200 text-purple-900 text-[10px] font-extrabold">
                          Instant Pay
                        </span>
                      </div>

                      {/* Official Merchant VPA Display (Read-Only) */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 block">
                          Official Merchant UPI VPA ID:
                        </label>
                        <div className="flex items-center justify-between gap-2 p-2.5 bg-white border border-purple-200 rounded-xl shadow-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <code className="text-xs font-mono font-bold text-purple-950">
                              {merchantUpiId}
                            </code>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="px-3 py-1 rounded-lg bg-purple-600 text-white text-xs font-bold flex items-center gap-1 hover:bg-purple-700 transition-colors"
                          >
                            {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedUpi ? 'Copied!' : 'Copy UPI'}
                          </button>
                        </div>
                      </div>

                      {/* UPI QR Code & App Launchers */}
                      <div className="flex flex-col sm:flex-row items-center gap-5 p-3 rounded-xl bg-white border border-purple-100 shadow-xs">
                        <div className="text-center shrink-0">
                          <img
                            src={qrCodeImageUrl}
                            alt="Scan UPI QR Code"
                            className="w-36 h-36 rounded-xl border border-purple-200 p-1 mx-auto bg-white"
                          />
                          <span className="text-[10px] text-slate-500 font-medium block mt-1">
                            Scan with GPay / PhonePe / Paytm
                          </span>
                        </div>

                        <div className="space-y-2 flex-1 w-full text-center sm:text-left">
                          <span className="text-xs text-slate-600 block">
                            Amount to Pay: <strong className="text-[#ED3500] text-base font-black">₹{cartGrandTotal.toLocaleString('en-IN')}</strong>
                          </span>

                          <p className="text-[11px] text-slate-500">
                            Click below to launch your mobile UPI App directly:
                          </p>

                          <div className="grid grid-cols-2 gap-2">
                            <a
                              href={upiIntentUrl}
                              onClick={() => {
                                try {
                                  localStorage.setItem('beeshub_checkout_open', 'true');
                                } catch (e) {}
                              }}
                              className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs text-center border border-blue-200 flex items-center justify-center gap-1.5 transition-all"
                            >
                              <Smartphone className="w-3.5 h-3.5" /> Open GPay / UPI
                            </a>
                            <a
                              href={upiIntentUrl}
                              onClick={() => {
                                try {
                                  localStorage.setItem('beeshub_checkout_open', 'true');
                                } catch (e) {}
                              }}
                              className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs text-center border border-purple-200 flex items-center justify-center gap-1.5 transition-all"
                            >
                              <Smartphone className="w-3.5 h-3.5" /> PhonePe / Paytm
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* UTR Input */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#163B5C] block">
                          Enter 12-Digit UPI UTR / Reference No. *
                        </label>
                        <input
                          type="text"
                          required={checkoutForm.paymentMethod === 'UPI'}
                          placeholder="e.g. 428901928374 (From Payment Receipt)"
                          value={checkoutForm.transactionId}
                          onChange={(e) =>
                            setCheckoutForm({ ...checkoutForm, transactionId: e.target.value })
                          }
                          className="w-full px-4 py-2 rounded-xl border border-purple-300 text-sm focus:outline-none focus:border-[#ED3500] bg-white font-mono"
                        />
                        <span className="text-[10px] text-slate-500 block">
                          Enter UTR / Ref ID received after paying on GPay / PhonePe / Paytm.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Summary Box */}
                <div className="p-4 rounded-2xl bg-[#FFFCFB] border border-[#E8EDF2] space-y-2 text-xs text-[#64748B]">
                  <div className="flex justify-between">
                    <span>Items Subtotal:</span>
                    <span className="font-bold text-[#163B5C]">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total GST Tax:</span>
                    <span className="font-bold text-[#163B5C]">
                      {cartGstTotal === 0 ? '₹0 (0% GST Exempted)' : `₹${Math.round(cartGstTotal).toLocaleString('en-IN')}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#E8EDF2] text-sm">
                    <div>
                      <span className="text-xs text-[#64748B] block font-semibold">Total Payable Amount</span>
                      <span className="text-2xl font-black text-[#ED3500]">
                        ₹{cartGrandTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full font-bold text-xs ${
                        checkoutForm.paymentMethod === 'UPI'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-[#10B981]/10 text-[#10B981]'
                      }`}
                    >
                      {checkoutForm.paymentMethod === 'UPI' ? 'UPI Payment' : 'Cash on Delivery'}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="w-full py-3.5 rounded-2xl bg-[#ED3500] hover:bg-[#D02E00] text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-[#ED3500]/25 transition-all flex items-center justify-center gap-2"
                >
                  {submittingOrder ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    'Confirm & Place Order'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Order Success Overlay */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center border border-[#E8EDF2] shadow-2xl space-y-6">
            <div className="w-20 h-20 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-[#ED3500]/10 text-[#ED3500] text-xs font-bold tracking-widest uppercase">
                Order Confirmed
              </span>
              <h3 className="text-2xl font-black text-[#163B5C]">Thank You!</h3>
              <p className="text-xs text-[#64748B]">
                Your order ID is <strong className="text-[#163B5C]">{orderSuccess.orderId}</strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFCFB] border border-[#E8EDF2] text-left text-xs space-y-2 text-[#64748B]">
              <div className="flex justify-between">
                <span>Customer:</span>
                <strong className="text-[#163B5C]">{orderSuccess.customerName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <strong className="text-purple-700 font-bold">
                  {orderSuccess.paymentMethod === 'UPI' ? 'Online UPI' : 'Cash on Delivery (COD)'} (
                  {orderSuccess.paymentStatus || 'Pending'})
                </strong>
              </div>
              {orderSuccess.paymentMethod === 'UPI' && (
                <div className="flex justify-between">
                  <span>UTR / Ref No:</span>
                  <code className="text-[#163B5C] font-mono text-[11px]">{orderSuccess.transactionId}</code>
                </div>
              )}
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <strong className="text-[#163B5C]">₹{orderSuccess.subtotal?.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between">
                <span>GST Tax:</span>
                <strong className="text-[#163B5C]">
                  {orderSuccess.totalGst === 0 ? '₹0 (0% GST)' : `₹${orderSuccess.totalGst?.toLocaleString('en-IN')}`}
                </strong>
              </div>
              <div className="flex justify-between border-t border-[#E8EDF2] pt-1">
                <span>Total Amount:</span>
                <strong className="text-[#ED3500] text-sm font-black">₹{orderSuccess.totalAmount?.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <button
              onClick={() => setOrderSuccess(null)}
              className="w-full py-3 rounded-2xl bg-[#163B5C] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#163B5C]/90 transition-colors"
            >
              Back to Store
            </button>
          </div>
        </div>
      )}

      {/* Real E-Commerce Footer with Full Registered Address & Contact Details */}
      <footer className="bg-[#FFFFFF] border-t border-[#E8EDF2] pt-12 pb-8 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.jpg"
                  alt="BEES HUB FARMLAND PRIVATE LIMITED Logo"
                  className="w-10 h-10 object-contain rounded-xl shadow-xs border border-[#E8EDF2]"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div>
                  <h3 className="font-extrabold text-base text-[#163B5C]">
                    BEES HUB FARMLAND PRIVATE LIMITED
                  </h3>
                  <span className="text-[10px] uppercase tracking-widest text-[#64748B] font-bold">
                    Pure & Organic Goods
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Directly from authentic farmlands to your doorstep. Committed to freshness, pure quality produce, and GST-compliant fair trade.
              </p>

              {/* Social Media Links */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs font-bold text-[#163B5C]">Follow Us:</span>
                <a
                  href="https://www.facebook.com/Beeshubfarmland/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-xs"
                  title="Follow BeesHub Farmland on Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://www.instagram.com/beeshubfarmland"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 border border-pink-200 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all shadow-xs"
                  title="Follow BeesHub Farmland on Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Registered Address */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-[#163B5C] uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#ED3500]" /> Registered Office Address
              </h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                <strong className="text-[#163B5C] block font-semibold">BEES HUB FARMLAND PRIVATE LIMITED</strong>
                2/26-1, Muhilanvilai, Monikettipottal,<br />
                Kanyakumari District, Tamil Nadu - 629501
              </p>
            </div>

            {/* WhatsApp Contact & Support */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-[#163B5C] uppercase tracking-wider flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#10B981]" /> Customer Support & Orders
              </h4>
              <div className="space-y-2">
                <a
                  href="https://wa.me/919578784431"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#10B981] font-bold text-xs border border-[#10B981]/20 transition-all"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp Us: +91 95787 84431
                </a>
                <p className="text-[11px] text-[#64748B]">
                  Online UPI Payment Gateway & Cash on Delivery Available Nationwide.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#E8EDF2] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
            <div>
              <strong className="text-[#163B5C]">BEES HUB FARMLAND PRIVATE LIMITED</strong> © {new Date().getFullYear()}. All Rights Reserved.
            </div>
            <div className="flex items-center gap-6">
              <span>GST Compliant</span>
              <span>Kanyakumari, Tamil Nadu</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
