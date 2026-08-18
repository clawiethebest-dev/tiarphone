'use client';

import Link from 'next/link';
import ProductCard from './ProductCard';
import type { Product, Locale } from '@/types';

interface DealsSectionProps {
  products: Product[];
  lang: Locale;
  t: Record<string, string>;
}

export default function DealsSection({ products, lang, t }: DealsSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl p-6 md:p-8 text-white shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                ⚡ {t.deals}
              </h2>
              <p className="text-red-100 mt-1">Limited time offers</p>
            </div>
            <Link
              href={`/${lang}/products?deals=true`}
              className="px-5 py-2 rounded-lg bg-white text-red-600 font-semibold hover:bg-gray-100 transition"
            >
              {t.viewAll}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.slice(0, 4).map((product, index) => (
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
      </div>
    </section>
  );
}
