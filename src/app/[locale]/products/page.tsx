'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import ProductCard from '@/components/ProductCard';
import { ALL_PRODUCTS } from '@/data/products';
import type { Locale, Product } from '@/types';

export default function ProductsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const locale = params.locale as Locale;
  const translations = { buyNow: t('buyNow'), addToCart: t('addToCart') };
  const [products, setProducts] = useState<Product[]>(ALL_PRODUCTS);
  const [loading, setLoading] = useState(true);

  const categoryFilter = searchParams.get('category');
  const dealsFilter = searchParams.get('deals');
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(d => {
        if (d.success && Array.isArray(d.data) && d.data.length > 0) {
          setProducts(d.data);
        }
      })
      .catch(() => { /* fallback */ })
      .finally(() => setLoading(false));
  }, []);

  let filteredProducts = [...products];

  if (categoryFilter && categoryFilter !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.category === categoryFilter);
  }

  if (dealsFilter === 'true') {
    filteredProducts = filteredProducts.filter(p => (p.originalPrice && p.originalPrice > p.price) || ((p as any).original_price && (p as any).original_price > p.price));
  }

  if (searchQuery) {
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchQuery) || 
      (p.description && p.description.toLowerCase().includes(searchQuery))
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">{t('products')}</h1>
      {filteredProducts.length === 0 ? (
        <p className="text-center py-12 text-gray-500">لا توجد منتجات مطابقة للبحث</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} lang={locale} t={translations} />
          ))}
        </div>
      )}
    </div>
  );
}
