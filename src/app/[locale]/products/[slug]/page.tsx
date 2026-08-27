'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import ReactMarkdown from 'react-markdown';
import { ShieldCheckIcon, TruckIcon, EyeIcon, FireIcon, ClockIcon } from '@heroicons/react/24/solid';
import { getProductBySlug, ALL_PRODUCTS } from '@/data/products';
import OrderPopup from '@/components/OrderPopup';
import { formatPrice } from '@/lib/utils';
import type { Locale, Product } from '@/types';

export default function ProductPage() {
  const params = useParams();
  const t = useTranslations();
  const slug = params.slug as string;
  const locale = params.locale as Locale;
  
  const [product, setProduct] = useState<Product | null>(getProductBySlug(slug) || null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isOrderOpen, setIsOrderOpen] = useState(false);

  // Fetch dynamic product from API
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(d => {
        if (d.success && Array.isArray(d.data)) {
          const found = d.data.find((p: any) => p.slug === slug);
          if (found) setProduct(found);
        }
      })
      .catch(() => { /* fallback */ });
  }, [slug]);

  // Urgency: Live Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 5, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">{t('productNotFound') || 'Product not found'}</h1>
      </div>
    );
  }

  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 pb-28 md:pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-gray-100">
            <Image
              src={product.images[selectedImage] || '/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-red-600 text-white px-3.5 py-1.5 rounded-full text-sm font-extrabold shadow-lg animate-pulse">
                تخفيض -{discount}%
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition ${
                    selectedImage === index ? 'border-brand-500 shadow-md scale-95' : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <Image src={image} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold mb-3 border border-red-200">
              <FireIcon className="w-4 h-4 text-red-500" />
              عرض حصري لفترة محدودة
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">{product.name}</h1>
            <p className="text-gray-600 mt-2 text-base leading-relaxed">{product.description}</p>
          </div>
          
          {/* Price Box */}
          <div className="bg-gradient-to-r from-brand-50 to-green-50 p-4 rounded-2xl border border-brand-200/60 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs text-gray-500 block mb-0.5">السعر الترويجي الخاص:</span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-green-700">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
            </div>
            {discount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm">
                وفر {formatPrice(product.originalPrice! - product.price)}
              </span>
            )}
          </div>

          {/* Urgency & Scarcity Elements (A3) */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-amber-900 flex items-center gap-1.5">
                <FireIcon className="w-4 h-4 text-amber-600 animate-bounce" />
                الكمية المتبقية في المخزن:
              </span>
              <span className="font-extrabold text-red-600 bg-red-100 px-2 py-0.5 rounded-lg text-xs">
                بقي 3 قطع فقط!
              </span>
            </div>
            {/* Stock Progress Bar */}
            <div className="w-full bg-amber-200/60 h-2.5 rounded-full overflow-hidden">
              <div className="bg-red-500 h-full rounded-full w-1/4 transition-all duration-1000"></div>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center justify-between pt-1 text-xs text-amber-900 border-t border-amber-200/50">
              <span className="flex items-center gap-1 font-medium">
                <ClockIcon className="w-4 h-4 text-amber-700" />
                ينتهي العرض الترويجي خلال:
              </span>
              <div className="flex items-center gap-1 font-mono font-bold text-sm bg-white px-2.5 py-1 rounded-lg border border-amber-200">
                <span>{String(timeLeft.hours).padStart(2, '0')}</span>:
                <span>{String(timeLeft.minutes).padStart(2, '0')}</span>:
                <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          {/* Inspection Guarantee Badge (B1) */}
          <div className="bg-blue-50/90 border-2 border-blue-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow">
                <EyeIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900 text-sm">
                  🔍 افتح العلبة وافحص المنتج قبل الدفع
                </h3>
                <p className="text-blue-800 text-xs mt-0.5 leading-relaxed">
                  معاينة مجانية 100% مع الموزع عند الاستلام للتأكد من الجودة والمطابقة قبل دفع أي دينار.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-200/60 text-xs text-blue-900 font-medium">
              <div className="flex items-center gap-1.5">
                <TruckIcon className="w-4 h-4 text-blue-600" />
                <span>توصيل سريع لجميع الولايات</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheckIcon className="w-4 h-4 text-green-600" />
                <span>ضمان الجودة والاستبدال</span>
              </div>
            </div>
          </div>

          {/* Buy Now Button (Desktop & Inline) */}
          <button
            onClick={() => setIsOrderOpen(true)}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-extrabold py-4 px-8 rounded-2xl text-xl transition-all shadow-xl shadow-green-600/30 hover:scale-[1.02] transform flex items-center justify-center gap-2"
          >
            <span>🛒</span>
            <span>{t('buyNow') || 'اطلب الآن - الدفع عند الاستلام'}</span>
          </button>

          {/* Long Description */}
          {product.longDescription && (
            <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-li:text-gray-700 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <ReactMarkdown>{product.longDescription}</ReactMarkdown>
            </div>
          )}

          {/* Specifications */}
          {product.specifications && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">{t('specifications') || 'المواصفات التقنية'}</h3>
              <dl className="divide-y divide-gray-100 text-sm">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="py-2.5 flex justify-between">
                    <dt className="text-gray-500 font-medium">{key}</dt>
                    <dd className="font-bold text-gray-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Mobile Buy CTA (A1) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div>
            <span className="text-xs text-gray-500 block leading-tight">المجموع:</span>
            <span className="text-xl font-extrabold text-green-700 leading-tight">
              {formatPrice(product.price)}
            </span>
          </div>
          <button
            onClick={() => setIsOrderOpen(true)}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-extrabold py-3 px-5 rounded-xl text-base shadow-lg shadow-green-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <span>🛒</span>
            <span>اطلب الآن (الدفع عند الاستلام)</span>
          </button>
        </div>
      </div>

      {/* Order Popup */}
      <OrderPopup
        isOpen={isOrderOpen}
        onClose={() => setIsOrderOpen(false)}
        product={product}
        lang={locale}
      />
    </div>
  );
}


