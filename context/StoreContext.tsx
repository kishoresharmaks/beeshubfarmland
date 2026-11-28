'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CompanyConfig, getCompanyConfig } from '@/lib/companyConfig';
import { normalizeStoreCategory } from '@/lib/productFormatting';

export interface ProductVariant {
  _id?: string;
  name: string;
  mrp: number;
  price: number;
  quantity: number;
  discount?: number;
}

export interface Product {
  _id: string;
  name: string;
  displayName?: string;
  slug?: string;
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
  createdAt?: string;
}

export interface CategoryItem {
  _id: string;
  name: string;
}

export interface BannerItem {
  _id: string;
  title: string;
  image: string;
  link?: string;
}

export interface BlogSummaryItem {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  category: string;
  author: string;
  readTime: string;
  publishedAt: string;
}

export interface SpotlightItem {
  productId: string;
  productName: string;
  badgeText: string;
  headingPrefix: string;
  productTitle: string;
  shortDescription: string;
  productImage: string;
  benefits: Array<{ icon: string; text: string }>;
  ctaLabel: string;
  ctaLink: string;
  price: number;
  mrp: number;
  discount: number;
  quantity: number;
  gst: number;
  variants: ProductVariant[];
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  selectedVariant?: ProductVariant;
  quantity: number;
}

export interface StoreSettings {
  activeTheme?: 'v1' | 'v2';
  enableOnlinePayment?: boolean;
  enableUPI?: boolean;
  enableCOD?: boolean;
  fssaiNumber?: string;
  gstin?: string;
  enableWholesale?: boolean;
}

export interface CheckoutFormState {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  pincode: string;
  paymentMethod: 'COD' | 'RAZORPAY' | 'UPI';
}

export interface TrackedOrder {
  _id: string;
  orderId: string;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Completed' | 'Failed';
  items: Array<{
    name: string;
    variantName?: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
}

export type EnquiryCategory = 'WHOLESALE' | 'PRIVATE_LABEL' | 'GIFT_HAMPER' | 'GENERAL';

interface StoreContextType {
  // Catalog Data
  products: Product[];
  categories: CategoryItem[];
  banners: BannerItem[];
  blogPosts: BlogSummaryItem[];
  spotlightItems: SpotlightItem[];
  settings: StoreSettings;
  companyConfig: CompanyConfig;
  loadingProducts: boolean;
  catalogError: string | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  filteredProducts: Product[];

  // Cart State & Calculations
  cart: CartItem[];
  cartSubtotal: number;
  cartGstTotal: number;
  cartGrandTotal: number;
  cartItemCount: number;
  addToCart: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  updateCartQty: (productId: string, variantName: string | undefined, newQty: number) => void;
  removeFromCart: (productId: string, variantName?: string) => void;
  clearCart: () => void;

  // Checkout State & Actions
  checkoutForm: CheckoutFormState;
  setCheckoutForm: React.Dispatch<React.SetStateAction<CheckoutFormState>>;
  submittingOrder: boolean;
  formError: string;
  setFormError: (err: string) => void;
  orderSuccess: any;
  setOrderSuccess: (order: any) => void;
  handlePlaceOrder: (e: React.FormEvent) => Promise<void>;

  // Modals & Drawers
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isQuoteModalOpen: boolean;
  setIsQuoteModalOpen: (open: boolean) => void;
  quoteModalInitialProduct: string | null;
  setQuoteModalInitialProduct: (productName: string | null) => void;
  quoteModalInitialProductId: string | null;
  setQuoteModalInitialProductId: (id: string | null) => void;
  quoteModalInitialVariant: string | null;
  setQuoteModalInitialVariant: (variantName: string | null) => void;
  quoteModalCategory: 'WHOLESALE' | 'PRIVATE_LABEL' | 'GIFT_HAMPER' | 'GENERAL' | null;
  setQuoteModalCategory: (cat: 'WHOLESALE' | 'PRIVATE_LABEL' | 'GIFT_HAMPER' | 'GENERAL' | null) => void;
  openQuoteModal: (
    productName?: string,
    category?: 'WHOLESALE' | 'PRIVATE_LABEL' | 'GIFT_HAMPER' | 'GENERAL',
    productId?: string,
    variantName?: string
  ) => void;
  isTrackingModalOpen: boolean;
  setIsTrackingModalOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;

  // Utilities
  toastMessage: string | null;
  showToast: (msg: string) => void;
  refetchCatalog: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export interface InitialStoreData {
  products?: Product[];
  categories?: CategoryItem[];
  banners?: BannerItem[];
  blogPosts?: BlogSummaryItem[];
  settings?: StoreSettings;
}

export function StoreProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData?: InitialStoreData;
}) {
  // Company Configuration
  const [companyConfig] = useState<CompanyConfig>(getCompanyConfig());

  // Store Catalog
  const [products, setProducts] = useState<Product[]>(initialData?.products || []);
  const [categories, setCategories] = useState<CategoryItem[]>(initialData?.categories || []);
  const [banners, setBanners] = useState<BannerItem[]>(initialData?.banners || []);
  const [blogPosts, setBlogPosts] = useState<BlogSummaryItem[]>(initialData?.blogPosts || []);
  const [spotlightItems, setSpotlightItems] = useState<SpotlightItem[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(
    initialData?.settings || {
      activeTheme: 'v2',
      enableOnlinePayment: true,
      enableUPI: true,
      enableCOD: true,
      enableWholesale: true,
    }
  );
  const [loadingProducts, setLoadingProducts] = useState(
    !(initialData?.products && initialData.products.length > 0)
  );
  const [catalogError, setCatalogError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteModalInitialProduct, setQuoteModalInitialProduct] = useState<string | null>(null);
  const [quoteModalInitialProductId, setQuoteModalInitialProductId] = useState<string | null>(null);
  const [quoteModalInitialVariant, setQuoteModalInitialVariant] = useState<string | null>(null);
  const [quoteModalCategory, setQuoteModalCategory] = useState<'WHOLESALE' | 'PRIVATE_LABEL' | 'GIFT_HAMPER' | 'GENERAL' | null>(null);

  const openQuoteModal = (
    productName?: string,
    category?: 'WHOLESALE' | 'PRIVATE_LABEL' | 'GIFT_HAMPER' | 'GENERAL',
    productId?: string,
    variantName?: string
  ) => {
    setQuoteModalInitialProduct(productName || null);
    setQuoteModalInitialProductId(productId || null);
    setQuoteModalInitialVariant(variantName || null);
    setQuoteModalCategory(category || 'WHOLESALE');
    setIsQuoteModalOpen(true);
  };
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Checkout Form
  const [checkoutForm, setCheckoutForm] = useState<CheckoutFormState>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    shippingAddress: '',
    pincode: '',
    paymentMethod: 'RAZORPAY',
  });
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [formError, setFormError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Initial Data Fetching
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch (err) {
      console.error('Failed to load store settings:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/banners');
      const data = await res.json();
      if (data.success) {
        setBanners(data.data);
      }
    } catch (err) {
      console.error('Failed to load banners:', err);
    }
  };

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/blog?limit=3');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBlogPosts(data.data);
      }
    } catch (err) {
      console.error('Failed to load blog posts:', err);
    }
  };

  const fetchSpotlight = async () => {
    try {
      const res = await fetch('/api/spotlight');
      const data = await res.json();
      if (data.success && data.active && Array.isArray(data.data)) {
        setSpotlightItems(data.data);
      }
    } catch (err) {
      console.error('Failed to load spotlight items:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setCatalogError(null);
      if (products.length === 0) {
        setLoadingProducts(true);
      }
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const targetId = urlParams.get('product') || (window.location.hash.startsWith('#product-') ? window.location.hash.replace('#product-', '') : null);
          if (targetId) {
            const found = data.data.find((p: any) => p._id === targetId || p.slug === targetId);
            if (found) {
              setQuickViewProduct(found);
            }
          }
        }
      } else {
        setCatalogError(data.message || 'Unable to load products right now.');
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      setCatalogError('Unable to reach the product catalog. Please try again.');
    } finally {
      setLoadingProducts(false);
    }
  };

  const refetchCatalog = () => {
    fetchProducts();
    fetchSpotlight();
  };

  useEffect(() => {
    if (!initialData?.settings) fetchSettings();
    if (!initialData?.categories?.length) fetchCategories();
    if (!initialData?.banners?.length) fetchBanners();
    if (!initialData?.blogPosts?.length) fetchBlogs();
    fetchSpotlight();

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlCategory = urlParams.get('category');
      const urlSearch = urlParams.get('search');
      if (urlCategory) setSelectedCategory(urlCategory);
      if (urlSearch) setSearchQuery(urlSearch);
    }

    if (!initialData?.products?.length) {
      fetchProducts();
    } else if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const targetId = urlParams.get('product') || (window.location.hash.startsWith('#product-') ? window.location.hash.replace('#product-', '') : null);
      if (targetId) {
        const found = initialData.products.find((p: any) => p._id === targetId || p.slug === targetId);
        if (found) setQuickViewProduct(found);
      }
    }
  }, []);

  // 2. Cart Persistence (localStorage)
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('beeshub_cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      if (cart.length > 0) {
        localStorage.setItem('beeshub_cart', JSON.stringify(cart));
      } else {
        localStorage.removeItem('beeshub_cart');
      }
    } catch (e) {}
  }, [cart]);

  // Cart Operations
  const addToCart = (product: Product, quantityToAdd = 1, customVariant?: ProductVariant) => {
    const activeVariant = customVariant || (product.variants && product.variants.length > 0 ? product.variants[0] : undefined);
    const resolvedPrice =
      activeVariant && activeVariant.price !== undefined && activeVariant.price !== null
        ? Number(activeVariant.price)
        : Number(product.price ?? 0);

    if (!Number.isFinite(resolvedPrice) || resolvedPrice <= 0) {
      openQuoteModal(product.name, 'GENERAL', product._id, activeVariant?.name);
      showToast(`"${product.displayName || product.name}" is available via enquiry.`);
      return;
    }

    const availableStock = activeVariant ? activeVariant.quantity : product.quantity;

    if (availableStock <= 0) {
      showToast(`Sorry, "${product.displayName || product.name}" is currently out of stock.`);
      return;
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) =>
          item.product._id === product._id &&
          (activeVariant
            ? item.selectedVariant?.name === activeVariant.name
            : !item.selectedVariant)
      );

      if (existingIndex > -1) {
        const newQty = prevCart[existingIndex].quantity + quantityToAdd;
        if (newQty > availableStock) {
          showToast(`Maximum stock limit reached (${availableStock})!`);
          return prevCart;
        }
        const updated = [...prevCart];
        updated[existingIndex].quantity = newQty;
        return updated;
      }

      if (quantityToAdd > availableStock) {
        showToast(`Only ${availableStock} units available.`);
        return prevCart;
      }

      return [...prevCart, { product, selectedVariant: activeVariant, quantity: quantityToAdd }];
    });

    const displayTitle = product.displayName || product.name;
    const label = activeVariant ? `${displayTitle} (${activeVariant.name})` : displayTitle;
    showToast(`Added "${label}" to cart.`);
  };

  const updateCartQty = (productId: string, variantName: string | undefined, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId, variantName);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        const isMatch =
          item.product._id === productId &&
          (variantName
            ? item.selectedVariant?.name === variantName
            : !item.selectedVariant);

        if (!isMatch) return item;

        const maxStock = item.selectedVariant ? item.selectedVariant.quantity : item.product.quantity;
        if (newQty > maxStock) {
          showToast(`Maximum available stock is ${maxStock}.`);
          return { ...item, quantity: maxStock };
        }
        return { ...item, quantity: newQty };
      })
    );
  };

  const removeFromCart = (productId: string, variantName?: string) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) =>
          !(
            item.product._id === productId &&
            (variantName ? item.selectedVariant?.name === variantName : !item.selectedVariant)
          )
      )
    );
    showToast('Item removed from cart.');
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem('beeshub_cart');
    } catch (e) {}
  };

  // Authoritative Calculations
  const cartSubtotal = cart.reduce((sum, item) => {
    const unitPrice = item.selectedVariant ? item.selectedVariant.price : item.product.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  const cartGstTotal = cart.reduce((sum, item) => {
    const unitPrice = item.selectedVariant ? item.selectedVariant.price : item.product.price;
    const gstRate = item.product.gst !== undefined ? item.product.gst : 0;
    return sum + ((unitPrice * item.quantity) * gstRate) / 100;
  }, 0);

  const cartGrandTotal = Math.round(cartSubtotal + cartGstTotal);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Filtered Products (supports both raw DB category and normalized storefront categories)
  const filteredProducts = products.filter((p) => {
    const normalizedCat = normalizeStoreCategory(p);
    const matchCategory =
      selectedCategory === 'All' ||
      p.category === selectedCategory ||
      normalizedCat === selectedCategory;
    const matchSearch =
      !searchQuery.trim() ||
      (p.displayName || p.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      normalizedCat.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Handle Dual-Branch Checkout Order Submit
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (
      !checkoutForm.customerName.trim() ||
      !checkoutForm.customerPhone.trim() ||
      !checkoutForm.customerEmail.trim() ||
      !checkoutForm.shippingAddress.trim() ||
      !checkoutForm.pincode.trim()
    ) {
      setFormError('Please fill in all required customer and delivery details.');
      return;
    }

    const isOnlineAvailable = settings.enableOnlinePayment ?? settings.enableUPI ?? true;

    if (!isOnlineAvailable && !settings.enableCOD) {
      setFormError('Checkout is currently disabled by store administration.');
      return;
    }

    if ((checkoutForm.paymentMethod === 'RAZORPAY' || checkoutForm.paymentMethod === 'UPI') && !isOnlineAvailable) {
      setFormError('Online payment is currently disabled. Please choose Cash on Delivery.');
      return;
    }

    if (checkoutForm.paymentMethod === 'COD' && !settings.enableCOD) {
      setFormError('Cash on Delivery is currently disabled. Please choose Online Payment.');
      return;
    }

    try {
      setSubmittingOrder(true);
      const itemsPayload = cart.map((item) => ({
        productId: item.product._id,
        name: item.selectedVariant ? `${item.product.name} (${item.selectedVariant.name})` : item.product.name,
        variantName: item.selectedVariant ? item.selectedVariant.name : '',
        price: item.selectedVariant ? item.selectedVariant.price : item.product.price,
        quantity: item.quantity,
        gst: item.product.gst !== undefined ? item.product.gst : 0,
        image: item.product.image,
      }));

      // Branch 1: Razorpay Online Payment
      if (checkoutForm.paymentMethod === 'RAZORPAY' || checkoutForm.paymentMethod === 'UPI') {
        const createRes = await fetch('/api/orders/razorpay/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: checkoutForm.customerName,
            customerPhone: checkoutForm.customerPhone,
            customerEmail: checkoutForm.customerEmail,
            shippingAddress: checkoutForm.shippingAddress,
            pincode: checkoutForm.pincode,
            items: itemsPayload,
          }),
        });

        const createData = await createRes.json();
        if (!createData.success) {
          setFormError(createData.message || 'Failed to initiate online payment.');
          setSubmittingOrder(false);
          return;
        }

        if (typeof window === 'undefined' || !(window as any).Razorpay) {
          setFormError('Razorpay checkout SDK is still loading. Please try again in a few seconds.');
          setSubmittingOrder(false);
          return;
        }

        const options = {
          key: createData.keyId,
          amount: createData.amountInPaise,
          currency: createData.currency || 'INR',
          name: companyConfig.name,
          description: `Order ${createData.orderId}`,
          order_id: createData.razorpayOrderId,
          prefill: {
            name: checkoutForm.customerName,
            email: checkoutForm.customerEmail,
            contact: checkoutForm.customerPhone,
          },
          theme: {
            color: '#173F2B',
          },
          modal: {
            ondismiss: () => {
              setSubmittingOrder(false);
              setFormError('Payment was cancelled. You can retry or switch to Cash on Delivery.');
            },
          },
          handler: async (response: any) => {
            try {
              setSubmittingOrder(true);
              const verifyRes = await fetch('/api/orders/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: createData.orderId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                setOrderSuccess(verifyData.data);
                clearCart();
                setIsCheckoutOpen(false);
                setIsCartOpen(false);
                refetchCatalog();
              } else {
                setFormError(verifyData.message || 'Payment verification failed.');
              }
            } catch (err: any) {
              setFormError(err.message || 'Error communicating with payment verification server.');
            } finally {
              setSubmittingOrder(false);
            }
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        return;
      }

      // Branch 2: Cash on Delivery (COD)
      const payload = {
        ...checkoutForm,
        paymentMethod: 'COD',
        items: itemsPayload,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setOrderSuccess(data.data);
        clearCart();
        setIsCheckoutOpen(false);
        setIsCartOpen(false);
        refetchCatalog();
      } else {
        setFormError(data.message || 'Failed to place order.');
      }
    } catch (err: any) {
      setFormError(err.message || 'Network error occurred while submitting order.');
    } finally {
      if (checkoutForm.paymentMethod === 'COD') {
        setSubmittingOrder(false);
      }
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        banners,
        blogPosts,
        spotlightItems,
        settings,
        companyConfig,
        loadingProducts,
        catalogError,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        filteredProducts,
        cart,
        cartSubtotal,
        cartGstTotal,
        cartGrandTotal,
        cartItemCount,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        checkoutForm,
        setCheckoutForm,
        submittingOrder,
        formError,
        setFormError,
        orderSuccess,
        setOrderSuccess,
        handlePlaceOrder,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isQuoteModalOpen,
        setIsQuoteModalOpen,
        quoteModalInitialProduct,
        setQuoteModalInitialProduct,
        quoteModalInitialProductId,
        setQuoteModalInitialProductId,
        quoteModalInitialVariant,
        setQuoteModalInitialVariant,
        quoteModalCategory,
        setQuoteModalCategory,
        openQuoteModal,
        isTrackingModalOpen,
        setIsTrackingModalOpen,
        quickViewProduct,
        setQuickViewProduct,
        toastMessage,
        showToast,
        refetchCatalog,
      }}
    >
      {children}
      {/* Toast Notification Container */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl bg-[#102E20] text-[#F7F4EB] text-xs sm:text-sm font-semibold shadow-2xl border border-[#A97843]/40 animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {toastMessage}
        </div>
      )}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
