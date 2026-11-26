'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
  ChevronDown,
  ShoppingBag,
  Search,
  PackageCheck,
  ArrowRight,
  Phone,
  Mail,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { STORE_CATEGORIES, formatProductDisplayName, getProductSlugUrl } from '@/lib/productFormatting';

/**
 * Section 2: Main Navigation
 * Desktop links: Home, Shop (category dropdown), Wholesale, Private Label, Our Farm, About Us, Contact
 * Right-side actions: Search, Account (Track Order / Staff Portal), Cart, Request a Quote CTA
 */
export default function HeaderNav() {
  const {
    cartItemCount,
    setIsCartOpen,
    openQuoteModal,
    setIsTrackingModalOpen,
    searchQuery,
    setSearchQuery,
    setSelectedCategory,
    products,
    companyConfig,
  } = useStore();

  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const shopDropdownRef = useRef<HTMLDivElement>(null);
  const hoverOpenedAtRef = useRef<number>(0);

  useEffect(() => {
    setMobileMenuOpen(false);
    setShopDropdownOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setMobileMenuOpen(false);
        setShopDropdownOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (shopDropdownRef.current && !shopDropdownRef.current.contains(e.target as Node)) {
        setShopDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCategoryNavigate = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShopDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push(categoryId === 'All' ? '/shop' : `/shop?category=${encodeURIComponent(categoryId)}`);
  };

  const handleSearchSubmit = () => {
    setSearchOpen(false);
    setMobileMenuOpen(false);
    const q = searchQuery.trim();
    router.push(q ? `/shop?search=${encodeURIComponent(q)}` : '/shop');
  };

  const matchingProducts =
    searchQuery.trim() && products
      ? products.filter((p) => {
          const display = formatProductDisplayName(p.name).toLowerCase();
          const q = searchQuery.toLowerCase();
          return (
            display.includes(q) ||
            p.name.toLowerCase().includes(q) ||
            (p.category && p.category.toLowerCase().includes(q)) ||
            (p.description && p.description.toLowerCase().includes(q))
          );
        })
      : [];

  const navLinkClass = (active: boolean) =>
    `px-2 xl:px-2.5 py-1.5 rounded-lg text-[12.5px] xl:text-[13.5px] font-medium transition-colors whitespace-nowrap ${
      active
        ? 'text-[#173F2B] font-semibold bg-[#E8EFE6]'
        : 'text-[#202820] hover:text-[#173F2B] hover:bg-[#F7F4EB]'
    }`;

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm py-2.5 border-b border-[#E4E7E1]'
            : 'bg-white py-3 border-b border-[#E4E7E1]'
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#173F2B] rounded-lg">
            <div className="relative h-9 sm:h-10 w-20 sm:w-24 rounded-lg overflow-hidden border border-[#E4E7E1] bg-white px-1.5 py-0.5 flex items-center justify-center shrink-0">
              <Image
                src="/images/beeshub-logo.png"
                alt="Bees Hub Farmland Logo"
                width={160}
                height={70}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                priority
              />
            </div>
            <div className="hidden sm:flex lg:hidden xl:flex flex-col justify-center whitespace-nowrap">
              <span className="font-serif font-bold text-[#173F2B] text-base xl:text-lg tracking-tight leading-none">
                Bees Hub Farmland
              </span>
              <span className="text-[10px] font-medium text-[#6B756B] leading-none mt-1">
                Kanyakumari · Tamil Nadu
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Primary Navigation" className="hidden lg:flex items-center gap-0.5 xl:gap-1.5">
            <Link href="/" className={navLinkClass(pathname === '/')}>
              Home
            </Link>

            {/* Shop Dropdown */}
            <div
              ref={shopDropdownRef}
              className="relative"
              onMouseEnter={() => {
                hoverOpenedAtRef.current = Date.now();
                setShopDropdownOpen(true);
              }}
              onMouseLeave={() => setShopDropdownOpen(false)}
            >
              <div className="flex items-center">
                <Link
                  href="/shop"
                  className={`${navLinkClass(pathname === '/shop')} flex items-center gap-1`}
                >
                  <span>Shop</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (shopDropdownOpen && Date.now() - hoverOpenedAtRef.current < 400) {
                      return;
                    }
                    setShopDropdownOpen((prev) => !prev);
                  }}
                  className="p-1 rounded-md text-[#6B756B] hover:text-[#173F2B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#173F2B]"
                  aria-expanded={shopDropdownOpen}
                  aria-haspopup="true"
                  aria-label="Toggle shop categories menu"
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      shopDropdownOpen ? 'rotate-180 text-[#173F2B]' : ''
                    }`}
                  />
                </button>
              </div>

              {shopDropdownOpen && (
                <div
                  role="menu"
                  className="absolute top-full left-0 mt-1 w-[320px] bg-white rounded-2xl shadow-xl border border-[#E4E7E1] p-3 z-50"
                >
                  <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#6B756B] border-b border-[#E4E7E1] mb-1.5">
                    Product Categories
                  </div>
                  <div className="space-y-1">
                    {STORE_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        role="menuitem"
                        onClick={() => handleCategoryNavigate(cat.id)}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F7F4EB] text-xs font-medium text-[#202820] hover:text-[#173F2B] flex items-center justify-between transition-colors"
                      >
                        <span>{cat.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#A97843]" />
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-[#E4E7E1]">
                    <button
                      type="button"
                      onClick={() => handleCategoryNavigate('All')}
                      className="w-full px-3 py-2 rounded-xl bg-[#E8EFE6] hover:bg-[#173F2B] text-[#173F2B] hover:text-white text-xs font-semibold flex items-center justify-between transition-colors"
                    >
                      <span>View All Products</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Link href="/services" className={navLinkClass(pathname === '/services')}>
              Wholesale
            </Link>

            <Link href="/private-label" className={navLinkClass(pathname === '/private-label')}>
              Private Label
            </Link>

            <Link href="/#our-farm" className={navLinkClass(false)}>
              Our Farm
            </Link>

            <Link href="/about" className={navLinkClass(pathname === '/about')}>
              About Us
            </Link>

            <Link href="/contact" className={navLinkClass(pathname === '/contact')}>
              Contact
            </Link>
          </nav>

          {/* Right-Side Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 rounded-full border border-[#E4E7E1] bg-white hover:border-[#173F2B] hover:bg-[#F7F4EB] text-[#202820] flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#173F2B]"
              title="Search products"
              aria-label="Search products"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Cart */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative w-9 h-9 rounded-full border border-[#E4E7E1] bg-white hover:border-[#173F2B] hover:bg-[#F7F4EB] text-[#202820] flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#173F2B]"
              title="Shopping Cart"
              aria-label={`View shopping cart (${cartItemCount} items)`}
            >
              <ShoppingBag className="w-4 h-4" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#A97843] text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Primary B2B CTA */}
            <button
              type="button"
              onClick={() => openQuoteModal(undefined, 'WHOLESALE')}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#173F2B] hover:bg-[#102E20] text-white font-semibold text-xs whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A97843]"
            >
              <span>Request a Quote</span>
            </button>

            {/* Mobile Drawer Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-lg border border-[#E4E7E1] bg-white flex items-center justify-center text-[#202820] hover:bg-[#F7F4EB] transition-colors"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Full-Width Search Bar */}
        {searchOpen && (
          <div className="absolute inset-0 z-50 bg-white px-4 sm:px-6 flex items-center shadow-sm border-b border-[#E4E7E1]">
            <div className="max-w-[1240px] w-full mx-auto flex items-center gap-2.5">
              <div className="relative flex-1 flex items-center">
                <Search className="w-4 h-4 text-[#173F2B] shrink-0 absolute left-3.5 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search honey, superfood powders, cold-pressed oils..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearchSubmit();
                    if (e.key === 'Escape') setSearchOpen(false);
                  }}
                  aria-label="Search products"
                  className="w-full bg-[#F7F4EB]/60 border border-[#E4E7E1] focus:border-[#173F2B] rounded-full pl-10 pr-9 py-2 text-xs sm:text-sm text-[#202820] placeholder:text-[#6B756B] focus:outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 text-[#6B756B] hover:text-[#202820] p-1"
                    aria-label="Clear search query"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleSearchSubmit}
                className="px-4 sm:px-5 py-2 rounded-full bg-[#173F2B] hover:bg-[#102E20] text-white text-xs font-semibold whitespace-nowrap transition-colors shrink-0"
              >
                Search
              </button>

              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="w-9 h-9 rounded-full bg-[#F7F4EB] hover:bg-[#E8EFE6] text-[#202820] flex items-center justify-center transition-colors shrink-0"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Instant Search Results */}
        {searchOpen && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-[#E4E7E1] shadow-xl z-50 max-h-[360px] overflow-y-auto">
            <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-4">
              {matchingProducts.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#6B756B] pb-2 border-b border-[#E4E7E1]">
                    <span>
                      {matchingProducts.length} product{matchingProducts.length > 1 ? 's' : ''} found
                    </span>
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="text-[#173F2B] font-semibold hover:underline"
                    >
                      View all in shop &rarr;
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {matchingProducts.slice(0, 6).map((product) => (
                      <Link
                        key={product._id}
                        href={getProductSlugUrl(product)}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F7F4EB] border border-transparent hover:border-[#E4E7E1] transition-colors"
                      >
                        <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-white border border-[#E4E7E1] shrink-0">
                          {product.image && (
                            <Image
                              src={product.image}
                              alt={formatProductDisplayName(product.name)}
                              fill
                              className="object-contain p-1"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-[#202820] truncate">
                            {formatProductDisplayName(product.name)}
                          </div>
                          <div className="text-[11px] text-[#173F2B] font-bold">
                            ₹{product.price.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-5 text-xs text-[#6B756B]">
                  No products matching &ldquo;{searchQuery}&rdquo;. Press Search to browse our full shop.
                </div>
              )}
            </div>
          </div>
        )}

        {searchOpen && (
          <div className="fixed inset-0 bg-black/25 z-40" onClick={() => setSearchOpen(false)} />
        )}
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Drawer"
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 max-w-full flex pr-8 z-50">
            <div className="w-screen max-w-[330px] bg-white shadow-2xl flex flex-col h-full">
              {/* Drawer Header */}
              <div className="px-5 py-4 border-b border-[#E4E7E1] flex items-center justify-between bg-[#F7F4EB] shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="relative h-9 w-20 rounded-lg overflow-hidden border border-[#E4E7E1] bg-white px-1.5 py-0.5 flex items-center justify-center shrink-0">
                    <Image
                      src="/images/beeshub-logo.png"
                      alt="Bees Hub Farmland"
                      width={120}
                      height={55}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-serif font-bold text-[#173F2B] text-sm leading-tight">
                      Bees Hub Farmland
                    </span>
                    <span className="text-[10px] text-[#6B756B] leading-none mt-0.5">
                      Kanyakumari, Tamil Nadu
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full border border-[#E4E7E1] bg-white flex items-center justify-center text-[#202820]"
                  aria-label="Close navigation drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Search */}
              <div className="px-5 pt-4 pb-2 shrink-0">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-[#6B756B] absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search honey, powders, oils..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearchSubmit();
                    }}
                    className="w-full bg-[#F7F4EB]/70 border border-[#E4E7E1] focus:border-[#173F2B] rounded-full pl-9 pr-8 py-2 text-xs text-[#202820] placeholder:text-[#6B756B] focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 text-[#6B756B] p-1"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Links */}
              <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 px-3 rounded-xl hover:bg-[#F7F4EB] text-sm font-medium text-[#202820]"
                >
                  Home
                </Link>

                {/* Shop Category Accordion */}
                <div className="border border-[#E4E7E1] rounded-xl p-3 bg-[#F7F4EB]/50 space-y-2">
                  <button
                    type="button"
                    onClick={() => setMobileShopOpen(!mobileShopOpen)}
                    className="w-full flex items-center justify-between text-sm font-semibold text-[#173F2B]"
                    aria-expanded={mobileShopOpen}
                  >
                    <span>Shop Categories</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        mobileShopOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {mobileShopOpen && (
                    <div className="pt-2 border-t border-[#E4E7E1] space-y-1">
                      {STORE_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleCategoryNavigate(cat.id)}
                          className="w-full text-left py-1.5 px-2 rounded-lg hover:bg-white text-xs text-[#202820] hover:text-[#173F2B]"
                        >
                          {cat.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleCategoryNavigate('All')}
                        className="w-full text-left py-1.5 px-2 rounded-lg bg-[#E8EFE6] text-xs font-semibold text-[#173F2B]"
                      >
                        All Products
                      </button>
                    </div>
                  )}
                </div>

                <Link
                  href="/services"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 px-3 rounded-xl hover:bg-[#F7F4EB] text-sm font-medium text-[#202820]"
                >
                  Wholesale Supply
                </Link>
                <Link
                  href="/private-label"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 px-3 rounded-xl hover:bg-[#F7F4EB] text-sm font-medium text-[#202820]"
                >
                  Private Label
                </Link>
                <Link
                  href="/gift"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 px-3 rounded-xl hover:bg-[#F7F4EB] text-sm font-medium text-[#202820]"
                >
                  Gift Hampers
                </Link>
                <Link
                  href="/#our-farm"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 px-3 rounded-xl hover:bg-[#F7F4EB] text-sm font-medium text-[#202820]"
                >
                  Our Farm
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 px-3 rounded-xl hover:bg-[#F7F4EB] text-sm font-medium text-[#202820]"
                >
                  About Us
                </Link>
                <Link
                  href="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 px-3 rounded-xl hover:bg-[#F7F4EB] text-sm font-medium text-[#202820]"
                >
                  Farm Stories &amp; Blog
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 px-3 rounded-xl hover:bg-[#F7F4EB] text-sm font-medium text-[#202820]"
                >
                  Contact
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsTrackingModalOpen(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl text-left hover:bg-[#F7F4EB] flex items-center gap-2 text-sm font-medium text-[#173F2B]"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>Track Your Order</span>
                </button>
              </div>

              {/* Drawer Footer */}
              <div className="p-5 border-t border-[#E4E7E1] bg-[#F7F4EB] shrink-0 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openQuoteModal(undefined, 'WHOLESALE');
                  }}
                  className="w-full py-3 rounded-full bg-[#173F2B] hover:bg-[#102E20] text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Request a Quote</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center justify-between text-[11px] text-[#6B756B]">
                  <a href={`tel:+91${companyConfig.phone.replace(/\D/g, '')}`} className="flex items-center gap-1 hover:text-[#173F2B]">
                    <Phone className="w-3.5 h-3.5 text-[#A97843]" />
                    <span>+91 {companyConfig.phone}</span>
                  </a>
                  <a href={`mailto:${companyConfig.email}`} className="flex items-center gap-1 hover:text-[#173F2B]">
                    <Mail className="w-3.5 h-3.5 text-[#173F2B]" />
                    <span className="truncate max-w-[140px]">{companyConfig.email}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
