'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingBagIcon, MagnifyingGlassIcon, Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/lib/cart';
import type { Locale } from '@/types';

interface HeaderProps {
  lang: Locale;
  t: Record<string, string>;
}

const LOCALES = [
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'en', label: 'English', dir: 'ltr' },
];

export default function Header({ lang, t }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const itemCount = useCart((state) => state.getItemCount());

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${lang}/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const switchLanguage = (newLang: string) => {
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(`/${lang}`, `/${newLang}`);
    router.push(newPath);
    setIsLangOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 transition-all duration-300">
      {/* Top Bar */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href={`/${lang}`} className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 relative">
                <div className="w-full h-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:rotate-12 transition-transform">
                  T
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="text-xl font-bold leading-none">طيار بوتيك</div>
                <div className="text-[10px] text-gray-400">Algeria Store</div>
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="flex-grow max-w-2xl hidden md:flex">
              <form onSubmit={handleSearch} className="relative w-full">
                <input
                  type="search"
                  placeholder={t.searchProducts}
                  autoComplete="off"
                  className="w-full pl-4 pr-12 py-2.5 rounded-lg text-gray-900 outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-brand-600"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </button>
              </form>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-white/10 transition"
                >
                  <span className="text-sm font-medium">
                    {LOCALES.find((l) => l.code === lang)?.label}
                  </span>
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
                {isLangOpen && (
                  <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg py-1 min-w-[120px] z-50">
                    {LOCALES.map((locale) => (
                      <button
                        key={locale.code}
                        onClick={() => switchLanguage(locale.code)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                          locale.code === lang ? 'text-brand-600 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {locale.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link
                href={`/${lang}/cart`}
                className="relative p-2 rounded-lg hover:bg-white/10 transition"
              >
                <ShoppingBagIcon className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
              >
                {isMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden md:flex items-center justify-center h-12 gap-8">
            <Link
              href={`/${lang}`}
              className="text-gray-700 hover:text-brand-600 font-medium transition"
            >
              {t.home}
            </Link>
            <Link
              href={`/${lang}/products`}
              className="text-gray-700 hover:text-brand-600 font-medium transition"
            >
              {t.allProducts}
            </Link>
            <Link
              href={`/${lang}/products?category=phones`}
              className="text-gray-700 hover:text-brand-600 font-medium transition"
            >
              {t.phones}
            </Link>
            <Link
              href={`/${lang}/products?category=accessories`}
              className="text-gray-700 hover:text-brand-600 font-medium transition"
            >
              {t.accessories}
            </Link>
            <Link
              href={`/${lang}/products?deals=true`}
              className="text-red-600 hover:text-red-700 font-medium transition"
            >
              🔥 {t.deals}
            </Link>
            <Link
              href={`/${lang}/track`}
              className="text-brand-600 hover:text-brand-700 font-bold transition flex items-center gap-1"
            >
              📦 {lang === 'ar' ? 'تتبع طلبك' : lang === 'fr' ? 'Suivre ma commande' : 'Track Order'}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="search"
                  placeholder={t.searchProducts}
                  className="w-full pl-4 pr-12 py-3 rounded-lg border border-gray-300 text-gray-900"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Mobile Navigation */}
            <nav className="flex flex-col space-y-2">
              <Link
                href={`/${lang}`}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.home}
              </Link>
              <Link
                href={`/${lang}/products`}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.allProducts}
              </Link>
              <Link
                href={`/${lang}/products?category=phones`}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.phones}
              </Link>
              <Link
                href={`/${lang}/products?category=accessories`}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.accessories}
              </Link>
              <Link
                href={`/${lang}/products?deals=true`}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                🔥 {t.deals}
              </Link>
              <Link
                href={`/${lang}/track`}
                className="px-4 py-2 text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg font-bold flex items-center gap-1.5"
                onClick={() => setIsMenuOpen(false)}
              >
                📦 {lang === 'ar' ? 'تتبع طلبك' : lang === 'fr' ? 'Suivre ma commande' : 'Track Order'}
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
