'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import HeroSection from '@/components/HeroSection';
import FeaturesBanner from '@/components/FeaturesBanner';
import DealsSection from '@/components/DealsSection';
import FeaturedProducts from '@/components/FeaturedProducts';
import CategoryBanners from '@/components/CategoryBanners';
import CustomerReviews from '@/components/CustomerReviews';
import WhyChooseUs from '@/components/WhyChooseUs';
import { ALL_PRODUCTS } from '@/data/products';
import type { Locale, Product } from '@/types';

export default function HomePage() {
  const params = useParams();
  const t = useTranslations();
  const locale = params.locale as Locale;
  const [products, setProducts] = useState<Product[]>(ALL_PRODUCTS);
  
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(d => {
        if (d.success && Array.isArray(d.data) && d.data.length > 0) {
          setProducts(d.data);
        }
      })
      .catch(() => { /* fallback to catalog */ });
  }, []);

  const translations = {
    heroTitle: t('heroTitle'),
    heroSubtitle: t('heroSubtitle'),
    featuredProducts: t('featuredProducts'),
    deals: t('deals'),
    buyNow: t('buyNow'),
    addToCart: t('addToCart'),
    shopNow: t('shopNow'),
    viewAll: t('viewAll'),
    fastDelivery: t('fastDelivery'),
    secureCheckout: t('secureCheckout'),
    qualityGuarantee: t('qualityGuarantee'),
    support: t('support'),
    phones: t('phones'),
    accessories: t('accessories'),
    whyChooseUs: t('whyChooseUs'),
    footerAbout: t('footerAbout'),
    onlyAlgeria: t('onlyAlgeria'),
    currency: t('currency'),
  };

  const featuredProducts = products.filter(p => p.featured);
  const dealsProducts = products.filter(p => (p.originalPrice && p.originalPrice > p.price) || ((p as any).original_price && (p as any).original_price > p.price));

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection lang={locale} t={translations} />

      {/* Features Banner */}
      <FeaturesBanner t={translations} />

      {/* Deals Section */}
      <DealsSection products={dealsProducts} lang={locale} t={translations} />

      {/* Featured Products */}
      <FeaturedProducts products={featuredProducts} lang={locale} t={translations} />

      {/* Category Banners */}
      <CategoryBanners lang={locale} t={translations} />

      {/* Real Algerian Customer Reviews (Social Proof) */}
      <CustomerReviews />

      {/* Why Choose Us */}
      <WhyChooseUs t={translations} />
    </div>
  );
}
