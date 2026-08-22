'use client';

import Image from 'next/image';
import Link from 'next/link';
import { StarIcon, CheckIcon } from '@heroicons/react/24/solid';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import type { Product, Locale } from '@/types';

interface ProductCardProps {
  product: Product;
  lang: Locale;
  t: Record<string, string>;
  animationDelay?: number;
}

export default function ProductCard({ product, lang, t, animationDelay = 0 }: ProductCardProps) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount 
    ? calculateDiscount(product.originalPrice!, product.price) 
    : 0;

  return (
    <div 
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Image */}
      <Link href={`/${lang}/products/${product.slug}`}>
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          <Image
            alt={product.name}
            src={product.images[0] || '/placeholder-product.png'}
            fill
            loading="lazy"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Badges */}
          {discountPercent > 0 && (
            <span className="absolute top-2 left-2 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded">
              -{discountPercent}%
            </span>
          )}
          {product.featured && !hasDiscount && (
            <span className="absolute top-2 left-2 px-2.5 py-1 bg-brand-500 text-white text-xs font-bold rounded">
              {t.featured}
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={`/${lang}/products/${product.slug}`}>
          <h3 className="font-bold text-gray-900 line-clamp-2 text-sm mb-2 group-hover:text-brand-600 transition min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <StarIcon
              key={i}
              className={`w-4 h-4 ${
                i < (product.rating || 4) ? 'text-yellow-400' : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-xs text-gray-500">({product.reviewsCount || 0})</span>
        </div>

        {/* Price */}
        <div className="flex items-end gap-2 mb-2">
          <span className="text-xl font-bold text-brand-600">
            {formatPrice(product.price, lang)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.originalPrice!, lang)}
            </span>
          )}
        </div>

        {/* Free Delivery Badge */}
        <div className="text-xs text-green-600 font-medium flex items-center gap-1">
          <CheckIcon className="w-3.5 h-3.5" />
          {t.freeDeliveryOver}
        </div>
      </div>
    </div>
  );
}
