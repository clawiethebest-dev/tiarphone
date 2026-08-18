'use client';

import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import ProductCard from './ProductCard';
import type { Product, Locale } from '@/types';

interface FeaturedProductsProps {
  products: Product[];
  lang: Locale;
  t: Record<string, string>;
}

export default function FeaturedProducts({ products, lang, t }: FeaturedProductsProps) {
  const isRTL = lang === 'ar';
  const ArrowIcon = isRTL ? ChevronLeftIcon : ChevronRightIcon;

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {t.featuredProducts}
          </h2>
          <Link
            href={`/${lang}/products`}
            className="text-brand-600 font-semibold hover:underline flex items-center gap-1"
          >
            {t.viewAll}
            <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 6).map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              lang={lang}
              t={t}
              animationDelay={index * 75}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
