'use client';

export const dynamic = 'force-dynamic';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import ProductCard from '@/components/ProductCard';
import { ALL_PRODUCTS } from '@/data/products';
import type { Locale } from '@/types';

export default function ProductsPage() {
  const params = useParams();
  const t = useTranslations();
  const locale = params.locale as Locale;
  const translations = { buyNow: t('buyNow'), addToCart: t('addToCart') };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">{t('products')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ALL_PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} lang={locale} t={translations} />
        ))}
      </div>
    </div>
  );
}
