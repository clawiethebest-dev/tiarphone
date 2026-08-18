'use client';

import Link from 'next/link';
import type { Locale } from '@/types';

interface CategoryBannersProps {
  lang: Locale;
  t: Record<string, string>;
}

const categories = [
  {
    key: 'phones',
    gradient: 'from-blue-600 to-indigo-600',
    icon: '📱',
  },
  {
    key: 'accessories',
    gradient: 'from-purple-600 to-pink-600',
    icon: '🎧',
  },
];

export default function CategoryBanners({ lang, t }: CategoryBannersProps) {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <Link
              key={category.key}
              href={`/${lang}/products?category=${category.key}`}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-r ${category.gradient} p-8 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="relative z-10">
                <span className="text-4xl mb-4 block">{category.icon}</span>
                <h3 className="text-2xl font-bold mb-2">
                  {t[category.key]}
                </h3>
                <span className="inline-flex items-center gap-2 text-white/90 group-hover:text-white transition">
                  {t.shopNow} →
                </span>
              </div>
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
