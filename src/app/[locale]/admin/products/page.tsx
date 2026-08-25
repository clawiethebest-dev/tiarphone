'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  PhotoIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

import { ALL_PRODUCTS } from '@/data/products';

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || 'tiar2024';

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  long_description?: string;
  price: number;
  original_price?: number;
  category: string;
  images: string[];
  specifications?: Record<string, string>;
  in_stock: boolean;
  stock: number;
  featured: boolean;
  deal: boolean;
  rating: number;
  reviews_count: number;
  created_at?: string;
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

function ProductsContent({ params }: PageProps) {
  const searchParams = useSearchParams();
  const [locale, setLocale] = useState('ar');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Edit/Create modal
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    longDescription: '',
    price: 0,
    originalPrice: 0,
    category: 'packets',
    images: [''],
    inStock: true,
    stock: 50,
    featured: true,
    deal: true,
  });

  useEffect(() => {
    params.then(p => setLocale(p.locale));
  }, [params]);

  useEffect(() => {
    const key = searchParams.get('key');
    if (key === ADMIN_KEY) {
      setIsAuthenticated(true);
    }
  }, [searchParams]);

  // Fetch products
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchProducts();
  }, [isAuthenticated]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setProducts(data.data);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    
    // Fallback to static products list
    setProducts(ALL_PRODUCTS.map(p => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      long_description: p.longDescription,
      price: p.price,
      original_price: p.originalPrice,
      category: p.category,
      images: p.images,
      specifications: p.specifications,
      in_stock: p.inStock,
      stock: p.stock || 50,
      featured: p.featured || false,
      deal: p.deal || false,
      rating: p.rating || 5,
      reviews_count: p.reviewsCount || 0,
    })));
    setLoading(false);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      longDescription: '',
      price: 0,
      originalPrice: 0,
      category: 'packets',
      images: [''],
      inStock: true,
      stock: 50,
      featured: true,
      deal: true,
    });
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description,
      longDescription: product.long_description || '',
      price: product.price,
      originalPrice: product.original_price || 0,
      category: product.category,
      images: product.images.length > 0 ? product.images : [''],
      inStock: product.in_stock,
      stock: product.stock,
      featured: product.featured,
      deal: product.deal,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const productData = {
        ...formData,
        images: formData.images.filter(img => img.trim() !== ''),
      };

      if (editingProduct) {
        // Update existing product
        const response = await fetch('/api/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: editingProduct.id, ...productData }),
        });
        const data = await response.json();
        if (data.success) {
          setMessage({ type: 'success', text: '✅ تم تحديث المنتج بنجاح!' });
          fetchProducts();
          setShowModal(false);
        } else {
          throw new Error(data.error);
        }
      } else {
        // Create new product
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
        const data = await response.json();
        if (data.success) {
          setMessage({ type: 'success', text: '✅ تم إضافة المنتج بنجاح!' });
          fetchProducts();
          setShowModal(false);
        } else {
          throw new Error(data.error);
        }
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: `❌ خطأ: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`هل أنت متأكد من حذف "${product.name}"؟`)) return;

    try {
      const response = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: '✅ تم حذف المنتج!' });
        fetchProducts();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: `❌ خطأ: ${error.message}` });
    }
  };

  const addImageField = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImageField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const updateImage = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img),
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">🔒 غير مصرح</h1>
          <p className="text-gray-600">يرجى تسجيل الدخول للوصول إلى لوحة التحكم</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}/admin?key=${ADMIN_KEY}`}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6 rotate-180" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">📦 إدارة المنتجات</h1>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            إضافة منتج
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <PhotoIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">لا توجد منتجات</p>
            <button
              onClick={openCreateModal}
              className="mt-4 text-blue-600 hover:underline"
            >
              أضف منتج جديد
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Product Image */}
                <div className="h-48 bg-gray-200 relative">
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PhotoIcon className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  {product.deal && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      عرض
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-1">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-green-600">{product.price.toLocaleString()} دج</span>
                      {product.original_price && product.original_price > product.price && (
                        <span className="text-sm text-gray-400 line-through mr-2">
                          {product.original_price.toLocaleString()} دج
                        </span>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.in_stock ? `متوفر (${product.stock})` : 'نفذ'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(product)}
                      className="flex-1 flex items-center justify-center gap-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="flex items-center justify-center gap-1 bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
                <h2 className="text-xl font-bold">
                  {editingProduct ? '✏️ تعديل المنتج' : '➕ إضافة منتج جديد'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="📦 باك ..."
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug (رابط URL) *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="pack-name"
                    dir="ltr"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوصف القصير *</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="📱 هاتف + سماعات + ..."
                  />
                </div>

                {/* Long Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوصف الكامل (Markdown)</label>
                  <textarea
                    value={formData.longDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, longDescription: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 h-32"
                    placeholder="## المحتويات&#10;- هاتف ...&#10;- سماعات ..."
                  />
                </div>

                {/* Prices */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">السعر (دج) *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      placeholder="19900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">السعر الأصلي (دج)</label>
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: Number(e.target.value) }))}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      placeholder="24000"
                    />
                  </div>
                </div>

                {/* Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الكمية</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock: Number(e.target.value) }))}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="packets">باكات</option>
                      <option value="phones">هواتف</option>
                      <option value="accessories">إكسسوارات</option>
                    </select>
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.inStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, inStock: e.target.checked }))}
                      className="w-5 h-5 rounded"
                    />
                    <span>متوفر</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                      className="w-5 h-5 rounded"
                    />
                    <span>مميز</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.deal}
                      onChange={(e) => setFormData(prev => ({ ...prev, deal: e.target.checked }))}
                      className="w-5 h-5 rounded"
                    />
                    <span>عرض</span>
                  </label>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الصور (روابط URL)</label>
                  <div className="space-y-2">
                    {formData.images.map((img, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={img}
                          onChange={(e) => updateImage(index, e.target.value)}
                          className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                          placeholder="https://... أو /images/..."
                          dir="ltr"
                        />
                        {formData.images.length > 1 && (
                          <button
                            onClick={() => removeImageField(index)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addImageField}
                    className="mt-2 text-blue-600 hover:underline text-sm flex items-center gap-1"
                  >
                    <PlusIcon className="w-4 h-4" />
                    إضافة صورة أخرى
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 p-4 border-t sticky bottom-0 bg-white">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.name || !formData.slug || !formData.price}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-5 h-5" />
                      حفظ
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <ProductsContent params={params} />
    </Suspense>
  );
}
