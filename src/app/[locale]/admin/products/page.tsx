'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PlusIcon, PencilIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { ALL_PRODUCTS } from '@/data/products';
import type { Product } from '@/types';

const ADMIN_KEY = 'tiar2024';

interface PageProps {
  params: Promise<{ locale: string }>;
}

function ProductsContent({ params }: PageProps) {
  const searchParams = useSearchParams();
  const [locale, setLocale] = useState('ar');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>(ALL_PRODUCTS);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    params.then(p => setLocale(p.locale));
  }, [params]);

  useEffect(() => {
    const key = searchParams.get('key');
    if (key === ADMIN_KEY) {
      setIsAuthenticated(true);
    }
  }, [searchParams]);

  const handleDelete = (product: Product) => {
    if (!confirm(`هل أنت متأكد من حذف "${product.name}"؟`)) return;
    
    setDeleting(product.id);
    
    // Simulate delete (in real app, this would be an API call)
    setTimeout(() => {
      setProducts(prev => prev.filter(p => p.id !== product.id));
      setDeleting(null);
    }, 500);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚫</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">الوصول مرفوض</h1>
          <p className="text-gray-500 mb-6">أضف كلمة سرية إلى رابط /admin لزيادة الأمان</p>
          <Link
            href={`/${locale}/admin?key=${ADMIN_KEY}`}
            className="inline-block px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition font-medium"
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}/admin?key=${ADMIN_KEY}`}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">إدارة المنتجات</h1>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition">
            <PlusIcon className="w-5 h-5" />
            <span>إضافة منتج</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="ابحث عن الهواتف، الشواحن، السماعات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">الصورة</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">اسم المنتج</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">الفئة</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">السعر</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">المخزون</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={product.images[0] || '/placeholder.png'}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{product.name}</td>
                    <td className="py-3 px-4 text-gray-500">
                      {product.category === 'accessories' ? 'إكسسوارات الهاتف' : product.category === 'packets' ? 'الباكيتات' : 'الهواتف'}
                    </td>
                    <td className="py-3 px-4 font-medium text-brand-600">
                      {product.price.toLocaleString()} د.ج
                    </td>
                    <td className="py-3 px-4 text-gray-500">{product.stock}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="تعديل"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product)}
                          disabled={deleting === product.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          title="حذف"
                        >
                          {deleting === product.id ? (
                            <span className="animate-spin">⏳</span>
                          ) : (
                            <TrashIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">لا توجد منتجات</p>
          </div>
        )}

        <div className="mt-4 text-center text-sm text-gray-500">
          إجمالي المنتجات: {filteredProducts.length}
        </div>
      </div>
    </div>
  );
}

export default function AdminProductsPage({ params }: PageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full"></div>
      </div>
    }>
      <ProductsContent params={params} />
    </Suspense>
  );
}
