'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { XMarkIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';
import { ALL_PRODUCTS } from '@/data/products';
import { ALGERIA_WILAYAS } from '@/data/wilayas';

interface SaleEvent {
  name: string;
  wilaya: string;
  productSlug: string;
  productName: string;
  productImage: string;
  timeAgo: string;
}

const SAMPLE_BUYERS = [
  { name: 'محمد ك.', wilayaId: 31 }, // Oran
  { name: 'سارة ب.', wilayaId: 16 }, // Alger
  { name: 'ياسين م.', wilayaId: 19 }, // Setif
  { name: 'عبد الرؤوف ع.', wilayaId: 25 }, // Constantine
  { name: 'خديجة ل.', wilayaId: 5 },  // Batna
  { name: 'أمين ط.', wilayaId: 9 },  // Blida
  { name: 'حمزة ن.', wilayaId: 13 }, // Tlemcen
  { name: 'إيمان ق.', wilayaId: 6 },  // Bejaia
  { name: 'وليد ع.', wilayaId: 23 }, // Annaba
  { name: 'بلال د.', wilayaId: 28 }, // M'Sila
  { name: 'سمير ج.', wilayaId: 2 },  // Chlef
  { name: 'فاطمة م.', wilayaId: 7 },  // Biskra
];

const TIME_AGO_LIST = [
  'منذ دقيقتين',
  'منذ 4 دقائق',
  'منذ 7 دقائق',
  'منذ 11 دقيقة',
  'منذ 15 دقيقة',
  'منذ 22 دقيقة',
];

export default function LiveSalesNotification({ locale = 'ar' }: { locale?: string }) {
  const [currentSale, setCurrentSale] = useState<SaleEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [realOrders, setRealOrders] = useState<any[]>([]);

  // Fetch real confirmed orders dynamically
  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setRealOrders(data.data);
        }
      })
      .catch(() => { /* fallback */ });
  }, []);

  useEffect(() => {
    // Show first toast after 8 seconds, then every 30-45 seconds
    const showNotification = () => {
      let buyerName = '';
      let wilayaName = '';
      let productSlug = '';
      let productName = '';
      let productImage = '';
      const timeAgo = TIME_AGO_LIST[Math.floor(Math.random() * TIME_AGO_LIST.length)];

      if (realOrders.length > 0) {
        const order = realOrders[Math.floor(Math.random() * realOrders.length)];
        const nameParts = (order.customer_name || 'زبون').trim().split(' ');
        buyerName = nameParts[0] + (nameParts[1] ? ' ' + nameParts[1][0] + '.' : '');
        wilayaName = (order.wilaya || 'وهران').replace(/^\d+\s*-\s*/, '').split('(')[0].trim();
        
        // Find matching product
        const matchedProd = ALL_PRODUCTS.find(p => order.products_text?.includes(p.name) || p.name.includes(order.products_text)) || ALL_PRODUCTS[0];
        productSlug = matchedProd.slug;
        productName = matchedProd.name;
        productImage = matchedProd.images[0] || '/placeholder.png';
      } else {
        const buyer = SAMPLE_BUYERS[Math.floor(Math.random() * SAMPLE_BUYERS.length)];
        const product = ALL_PRODUCTS[Math.floor(Math.random() * ALL_PRODUCTS.length)];
        const wilayaInfo = ALGERIA_WILAYAS.find(w => w.id === buyer.wilayaId);
        buyerName = buyer.name;
        wilayaName = wilayaInfo ? wilayaInfo.name_ar : 'وهران';
        productSlug = product.slug;
        productName = product.name;
        productImage = product.images[0] || '/placeholder.png';
      }

      setCurrentSale({
        name: buyerName,
        wilaya: wilayaName,
        productSlug,
        productName,
        productImage,
        timeAgo,
      });

      setVisible(true);

      // Auto-hide after 6.5 seconds
      setTimeout(() => {
        setVisible(false);
      }, 6500);
    };

    const initialTimeout = setTimeout(showNotification, 8000);
    const interval = setInterval(showNotification, 35000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [realOrders]);

  if (!visible || !currentSale) return null;

  return (
    <div 
      className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 max-w-sm bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 p-3.5 transition-all duration-500 animate-slide-up transform hover:scale-105"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/products/${currentSale.productSlug}`} className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
          <Image
            src={currentSale.productImage}
            alt={currentSale.productName}
            fill
            className="object-cover"
          />
        </Link>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-1">
            <p className="text-xs font-bold text-gray-900 truncate">
              {currentSale.name} من <span className="text-brand-600">{currentSale.wilaya}</span>
            </p>
            <button 
              onClick={() => setVisible(false)}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded-md"
              aria-label="إغلاق"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          <Link href={`/${locale}/products/${currentSale.productSlug}`} className="block">
            <p className="text-xs text-gray-700 font-semibold truncate hover:text-brand-600 transition">
              {currentSale.productName}
            </p>
          </Link>

          <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
            <span className="flex items-center gap-1 text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded">
              <CheckBadgeIcon className="w-3.5 h-3.5 text-green-600" />
              طلب مؤكد
            </span>
            <span>•</span>
            <span className="font-mono text-gray-400">{currentSale.timeAgo}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
