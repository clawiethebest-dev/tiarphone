'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getProductBySlug, ALL_PRODUCTS } from '@/data/products';
import OrderPopup from '@/components/OrderPopup';
import { formatPrice } from '@/lib/utils';
import type { Locale } from '@/types';

export default function ProductPage() {
  const params = useParams();
  const t = useTranslations();
  const slug = params.slug as string;
  const locale = params.locale as Locale;
  
  const product = getProductBySlug(slug);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isOrderOpen, setIsOrderOpen] = useState(false);

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
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={product.images[selectedImage] || '/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                -{discount}%
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                    selectedImage === index ? 'border-blue-500' : 'border-transparent'
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
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-gray-600">{product.description}</p>
          
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-green-600">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xl text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {product.longDescription && (
            <div className="prose prose-sm max-w-none whitespace-pre-line">
              {product.longDescription}
            </div>
          )}

          {product.specifications && (
            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-3">{t('specifications') || 'Specifications'}</h3>
              <dl className="space-y-2">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <dt className="text-gray-600">{key}</dt>
                    <dd className="font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <button
            onClick={() => setIsOrderOpen(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors"
          >
            {t('buyNow') || '🛒 اطلب الآن'}
          </button>
        </div>
      </div>

      <OrderPopup
        isOpen={isOrderOpen}
        onClose={() => setIsOrderOpen(false)}
        product={product}
        lang={locale}
      />
    </div>
  );
}


