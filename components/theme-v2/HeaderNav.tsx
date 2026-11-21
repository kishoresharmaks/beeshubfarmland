'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  ChevronDown,
  ShoppingBag,
  Briefcase,
  Search,
  PackageCheck,
  ArrowRight,
  Phone,
  Mail,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

/**
 * Section B: Professional Header / Navigation
 * Single-line typography, dynamic backend product catalog dropdown,
 * Dedicated links for Private Label and Event Gift Hampers.
 * Fully responsive across mobile, tablet, and desktop viewports with zero overflow.
 */
export default function HeaderNav() {
  const {
    cartItemCount,
    setIsCartOpen,
    setIsQuoteModalOpen,
    setIsTrackingModalOpen,
    searchQuery,
    setSearchQuery,
    setSelectedCategory,
    products,
    setQuickViewProduct,
    companyConfig,
  } = useStore();

  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileCatalogOpen, setMobileCatalogOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Handle scroll state for sticky header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Focus search input when overlay opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close overlays on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (searchOpen) setSearchOpen(false);
        if (mobileMenuOpen) setMobileMenuOpen(false);
        if (dropdownOpen) setDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, mobileMenuOpen, dropdownOpen]);

  // Dynamically group products loaded from backend into 2 balanced columns matching DB categories
  const backendPowderProducts = products && products.length > 0
    ? products.filter(
        (p) =>
          (p.category && (p.category.toLowerCase().includes('powder') || p.category.toLowerCase().includes('healthy'))) ||
          p.name.toLowerCase().includes('powder') ||
          p.name.toLowerCase().includes('banana') ||
          p.name.toLowerCase().includes('moringai')
      )
    : [];

  const backendFarmProduce = products && products.length > 0
    ? products.filter((p) => !backendPowderProducts.some((pp) => pp._id === p._id))
    : [];

  // Fallback defaults matching real BeesHub catalog
  const fallbackPowderList = [
    { name: 'Nendran Banana Powder', category: 'Powder', price: 700 },
    { name: 'Red Banana Powder', category: 'Powder', price: 850 },
    { name: 'Sweet Potato Powder', category: 'Powder', price: 1068 },
    { name: 'Dates Coffee Powder', category: 'Powder', price: 210 },
    { name: 'Moringai Leaf Powder', category: 'Powder', price: 400 },
    { name: 'Beetroot Powder', category: 'Powder', price: 650 },
    { name: 'Carrot Powder', category: 'Powder', price: 1050 },
    { name: 'Pineapple Powder', category: 'Healthy Foods', price: 265 },
    { name: 'Dates Natural Powder', category: 'Powder', price: 310 },
  ];

  const fallbackProduceList = [
    { name: 'Pure Forest Honey', category: 'Healthy Foods', price: 399 },
    { name: 'Cold Pressed Virgin Coconut Oil', category: 'Oil', price: 520 },
    { name: 'Cold Pressed Sesame Oil', category: 'Oil', price: 410 },
    { name: 'Cold Pressed Groundnuts Oil', category: 'Oil', price: 300 },
    { name: 'Makhana (Fox Nut) Grade 6', category: 'Product', price: 1250 },
    { name: 'Moringai Powder Capsules', category: 'Product (White Label)', price: 2 },
    { name: 'Handcrafted Botanical Herbal Soaps', category: 'Product (White Label)', price: 80 },
    { name: 'Black Dry Dates', category: 'Healthy Foods', price: 400 },
    { name: 'Organic Jaggery Powder', category: 'Healthy Foods', price: 88 },
  ];

  const activePowderProducts = backendPowderProducts.length > 0 ? backendPowderProducts : fallbackPowderList;
  const activeProduceProducts = backendFarmProduce.length > 0 ? backendFarmProduce : fallbackProduceList;

  const handleProductClick = (item: any) => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.location.href = `/?product=${item._id || ''}#catalog-section`;
      return;
    }
    if (item._id && setQuickViewProduct) {
      setQuickViewProduct(item);
    }
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectCategory = (catName: string) => {
    setSelectedCategory(catName);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.location.href = `/#catalog-section`;
      return;
    }
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSearchSubmit = () => {
    setSearchOpen(false);
    setMobileMenuOpen(false);
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.location.href = `/?search=${encodeURIComponent(searchQuery)}#catalog-section`;
      return;
    }
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Live matching products for the search overlay
  const matchingProducts = searchQuery.trim() && products
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm py-2 sm:py-2.5 border-b border-[#E8EDF2]'
            : 'bg-white py-2.5 sm:py-3.5 border-b border-[#E8EDF2]'
        }`}
      >
        <div className="w-full max-w-[1280px] mx-auto px-3 sm:px-5 flex items-center justify-between gap-2 sm:gap-3">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group">
            <div className="relative h-9 sm:h-10 w-20 sm:w-24 rounded-xl overflow-hidden border border-[#E8EDF2] shadow-2xs bg-white px-1.5 py-0.5 flex items-center justify-center shrink-0">
              <Image
                src="/images/beeshub-logo.png"
                alt="BEES HUB FARMLAND"
                width={160}
                height={70}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                priority
              />
            </div>
            <div className="flex flex-col justify-center whitespace-nowrap">
              <div className="font-heading font-bold text-[#163B5C] text-sm sm:text-base lg:text-lg tracking-tight leading-none">
                BEES HUB <span className="text-[#ED3500]">FARMLAND</span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-medium text-[#64748B] leading-none mt-1 hidden min-[380px]:block">
                Organic Produce & Apiculture
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-3.5 2xl:gap-5 text-[13px] xl:text-[13.5px] font-semibold text-[#163B5C] whitespace-nowrap">
            <Link href="/" className="hover:text-[#ED3500] transition-colors py-1">
              Home
            </Link>

            {/* Wholesale Products Dynamic Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button
                type="button"
                className={`flex items-center gap-1.5 py-1 transition-colors focus:outline-none ${
                  dropdownOpen ? 'text-[#ED3500]' : 'hover:text-[#ED3500]'
                }`}
                aria-expanded={dropdownOpen}
              >
                <span>Products</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180 text-[#ED3500]' : 'text-slate-400'
                  }`}
                />
              </button>

              {/* Dynamic 2-Column Mega Dropdown */}
              {dropdownOpen && (
                <div className="absolute top-full -left-8 w-[520px] bg-white rounded-2xl shadow-xl border border-[#E8EDF2] p-4 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Column 1: Dehydrated Powders & Superfoods */}
                    <div className="space-y-1">
                      <div className="px-2 py-1 text-xs font-semibold text-[#163B5C] border-b border-slate-100 mb-1 flex items-center justify-between">
                        <span>Dehydrated Powders</span>
                        <span className="text-[10px] text-[#10B981] font-bold">
                          {activePowderProducts.length} items
                        </span>
                      </div>
                      <div className="max-h-[220px] overflow-y-auto space-y-1 pr-1">
                        {activePowderProducts.map((item: any, idx: number) => (
                          <button
                            key={item._id || idx}
                            type="button"
                            onClick={() => handleProductClick(item)}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#FFF8F5] transition-colors text-xs font-medium text-[#163B5C] hover:text-[#ED3500] flex items-center justify-between group"
                          >
                            <span className="truncate">{item.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Column 2: Cold-Pressed Oils, Honey & Farm Foods */}
                    <div className="space-y-1">
                      <div className="px-2 py-1 text-xs font-semibold text-[#163B5C] border-b border-slate-100 mb-1 flex items-center justify-between">
                        <span>Oils, Honey & Foods</span>
                        <span className="text-[10px] text-[#10B981] font-bold">
                          {activeProduceProducts.length} items
                        </span>
                      </div>
                      <div className="max-h-[220px] overflow-y-auto space-y-1 pr-1">
                        {activeProduceProducts.map((item: any, idx: number) => (
                          <button
                            key={item._id || idx}
                            type="button"
                            onClick={() => handleProductClick(item)}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#FFF8F5] transition-colors text-xs font-medium text-[#163B5C] hover:text-[#ED3500] flex items-center justify-between group"
                          >
                            <span className="truncate">{item.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Footer Bar */}
                  <div className="mt-3 pt-2.5 border-t border-[#E8EDF2] flex items-center justify-between px-2 text-[11px]">
                    <span className="text-[#64748B]">Need bulk drums or custom specifications?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        setIsQuoteModalOpen(true);
                      }}
                      className="font-bold text-[#ED3500] hover:underline flex items-center gap-1"
                    >
                      <span>Request Quotation</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Link href="/private-label" className="hover:text-[#ED3500] transition-colors py-1">
              Private Label
            </Link>

            <Link href="/gift" className="hover:text-[#ED3500] transition-colors py-1">
              Gift Hampers
            </Link>

            <a href="/#services" className="hover:text-[#ED3500] transition-colors py-1">
              Services
            </a>

            <a href="/#about" className="hover:text-[#ED3500] transition-colors py-1">
              About
            </a>

            <Link href="/blog" className="hover:text-[#ED3500] transition-colors py-1">
              Farm Stories
            </Link>

            <button
              type="button"
              onClick={() => setIsTrackingModalOpen(true)}
              className="hover:text-[#ED3500] transition-colors py-1 text-slate-600"
            >
              <span>Track Order</span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 rounded-full border border-[#E8EDF2] bg-white hover:border-[#ED3500] hover:text-[#ED3500] text-[#163B5C] flex items-center justify-center transition-colors shadow-2xs"
              title="Search products"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Cart Trigger with Active Badge */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative w-9 h-9 rounded-full border border-[#E8EDF2] bg-white hover:border-[#ED3500] hover:text-[#ED3500] text-[#163B5C] flex items-center justify-center transition-colors shadow-2xs"
              title="Shopping Cart"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-[#ED3500] text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Primary CTA Button (Guaranteed zero overflow across all viewports) */}
            <button
              type="button"
              onClick={() => setIsQuoteModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 2xl:px-4 py-2 sm:py-2.5 rounded-full bg-[#ED3500] hover:bg-[#D02E00] text-white font-semibold text-xs whitespace-nowrap shadow-sm shadow-[#ED3500]/25 transition-colors"
            >
              <Briefcase className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden 2xl:inline">Request Quotation</span>
              <span className="2xl:hidden">Request Quote</span>
            </button>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-xl border border-[#E8EDF2] bg-white flex items-center justify-center text-[#163B5C] hover:bg-slate-50 active:scale-95 transition-all"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Full-Width Search Overlay Bar */}
        {searchOpen && (
          <div className="absolute inset-0 z-50 bg-white px-3 sm:px-6 flex items-center shadow-sm border-b border-[#E8EDF2] animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="max-w-[1240px] w-full mx-auto flex items-center gap-2 sm:gap-3">
              <div className="relative flex-1 flex items-center">
                <Search className="w-4 h-4 text-[#ED3500] shrink-0 absolute left-3.5 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search raw honey, spices, oils, or products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchSubmit();
                    } else if (e.key === 'Escape') {
                      setSearchOpen(false);
                    }
                  }}
                  className="w-full bg-[#FFFCFB] border border-[#E8EDF2] focus:border-[#ED3500] rounded-full pl-10 pr-9 py-2 text-xs sm:text-sm text-[#163B5C] placeholder:text-[#64748B] focus:outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 p-1"
                    aria-label="Clear search query"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleSearchSubmit}
                className="px-3.5 sm:px-5 py-2 rounded-full bg-[#ED3500] hover:bg-[#D02E00] text-white text-xs font-semibold whitespace-nowrap transition-colors shrink-0"
              >
                Search
              </button>

              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-[#163B5C] flex items-center justify-center transition-colors shrink-0"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Live Search Instant Results Dropdown */}
        {searchOpen && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-[#E8EDF2] shadow-xl z-50 max-h-[360px] overflow-y-auto animate-in fade-in duration-150">
            <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-3.5">
              {matchingProducts.length > 0 ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-[#64748B] pb-2 border-b border-slate-100">
                    <span>
                      {matchingProducts.length} product{matchingProducts.length > 1 ? 's' : ''} found
                    </span>
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="text-[#ED3500] font-semibold hover:underline"
                    >
                      View in catalog &rarr;
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {matchingProducts.slice(0, 6).map((product) => (
                      <div
                        key={product._id}
                        onClick={() => {
                          setQuickViewProduct(product);
                          setSearchOpen(false);
                        }}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#FFF8F5] border border-transparent hover:border-orange-100 cursor-pointer transition-colors"
                      >
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-contain p-1"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-[#163B5C] truncate">
                            {product.name}
                          </div>
                          <div className="text-[11px] text-[#ED3500] font-bold">
                            ₹{product.price.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-5 text-xs text-[#64748B]">
                  No products matching &ldquo;{searchQuery}&rdquo;. Press Search to view the full catalog.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search Backdrop Overlay */}
        {searchOpen && (
          <div
            className="fixed inset-0 bg-black/25 z-40"
            onClick={() => setSearchOpen(false)}
          />
        )}
      </header>

      {/* Mobile Side Drawer Navigation (Full-Height Side Sheet, Smooth Slide-in from Left) */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Drawer"
        >
          {/* Dimmed Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Side Drawer Panel (From Left, Full Height) */}
          <div className="fixed inset-y-0 left-0 max-w-full flex pr-8 sm:pr-12 z-50">
            <div className="w-screen max-w-[320px] sm:max-w-[360px] bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-left duration-300 ease-out">
              {/* Drawer Header */}
              <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-[#E8EDF2] flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="relative h-9 w-20 rounded-xl overflow-hidden border border-[#E8EDF2] bg-white px-1.5 py-0.5 flex items-center justify-center shrink-0">
                    <Image
                      src="/images/beeshub-logo.png"
                      alt="BEES HUB FARMLAND"
                      width={120}
                      height={55}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-heading font-bold text-[#163B5C] text-xs sm:text-sm leading-tight">
                      BEES HUB <span className="text-[#ED3500]">FARMLAND</span>
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-[#64748B] leading-none mt-0.5">
                      Organic Produce & Apiculture
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#163B5C] hover:bg-slate-100 transition-colors"
                  aria-label="Close navigation drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Search Input */}
              <div className="px-5 pt-4 pb-2 shrink-0">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search raw honey, spices, oils..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchSubmit();
                      }
                    }}
                    className="w-full bg-[#FFFCFB] border border-[#E8EDF2] focus:border-[#ED3500] rounded-full pl-9 pr-8 py-2 text-xs text-[#163B5C] placeholder:text-[#64748B] focus:outline-none transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-1"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable Navigation Body */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-2 space-y-1">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 px-3 rounded-xl hover:bg-slate-50 text-xs font-semibold text-[#163B5C] hover:text-[#ED3500] transition-colors"
                >
                  Home
                </Link>

                {/* Products Accordion */}
                <div className="border border-[#E8EDF2] rounded-xl p-3 bg-[#FFFCFB] space-y-2">
                  <button
                    type="button"
                    onClick={() => setMobileCatalogOpen(!mobileCatalogOpen)}
                    className="w-full flex items-center justify-between text-xs font-bold text-[#163B5C]"
                  >
                    <span>Products</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${mobileCatalogOpen ? 'rotate-180 text-[#ED3500]' : 'text-slate-400'}`} />
                  </button>
                  {mobileCatalogOpen && (
                    <div className="pt-2 border-t border-[#E8EDF2] space-y-1 max-h-[220px] overflow-y-auto">
                      {[...activePowderProducts, ...activeProduceProducts].map((item: any, idx: number) => (
                        <button
                          key={item._id || idx}
                          type="button"
                          onClick={() => handleProductClick(item)}
                          className="w-full text-left py-1.5 px-2 rounded-md hover:bg-white text-xs text-slate-700 hover:text-[#ED3500] flex items-center justify-between transition-colors"
                        >
                          <span className="truncate">{item.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  href="/private-label"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 px-3 rounded-xl hover:bg-slate-50 text-xs font-semibold text-[#163B5C] hover:text-[#ED3500] transition-colors"
                >
                  Private Label & Custom Bottling
                </Link>

                <Link
                  href="/gift"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 px-3 rounded-xl hover:bg-slate-50 text-xs font-semibold text-[#163B5C] hover:text-[#ED3500] transition-colors"
                >
                  Wedding & Event Gift Hampers
                </Link>

                <a
                  href="/#services"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 px-3 rounded-xl hover:bg-slate-50 text-xs font-semibold text-[#163B5C] hover:text-[#ED3500] transition-colors"
                >
                  Services & Contract Supply
                </a>

                <a
                  href="/#about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 px-3 rounded-xl hover:bg-slate-50 text-xs font-semibold text-[#163B5C] hover:text-[#ED3500] transition-colors"
                >
                  About Our Farmlands
                </a>

                <Link
                  href="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 px-3 rounded-xl hover:bg-slate-50 text-xs font-semibold text-[#163B5C] hover:text-[#ED3500] transition-colors"
                >
                  Farm Stories & Blog
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsTrackingModalOpen(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl text-left hover:bg-slate-50 hover:text-[#ED3500] flex items-center gap-2 text-xs font-semibold text-slate-700 transition-colors"
                >
                  <PackageCheck className="w-3.5 h-3.5" />
                  <span>Track Your Order</span>
                </button>
              </div>

              {/* Drawer Bottom Action & Contact Footer */}
              <div className="p-5 border-t border-[#E8EDF2] bg-[#FFFCFB] shrink-0 space-y-3.5">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsQuoteModalOpen(true);
                  }}
                  className="w-full py-3 rounded-full bg-[#ED3500] hover:bg-[#D02E00] text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Request Wholesale Quotation</span>
                </button>

                <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                  <a href={`tel:${companyConfig.phone}`} className="flex items-center gap-1.5 hover:text-[#163B5C]">
                    <Phone className="w-3.5 h-3.5 text-amber-500" />
                    <span>+91 {companyConfig.phone}</span>
                  </a>
                  <a href={`mailto:${companyConfig.email}`} className="flex items-center gap-1.5 hover:text-[#163B5C]">
                    <Mail className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>{companyConfig.email}</span>
                  </a>
                </div>

                <div className="text-[10px] text-slate-600 text-center font-medium">
                  FSSAI Central Lic #{companyConfig.fssai} · ISO 22000 & 9001
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
