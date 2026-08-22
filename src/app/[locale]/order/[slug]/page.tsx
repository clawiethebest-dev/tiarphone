'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircleIcon, TruckIcon, HomeIcon, BuildingOfficeIcon, ShieldCheckIcon, StarIcon } from '@heroicons/react/24/solid';
import { MinusIcon, PlusIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { getProductBySlug } from '@/data/products';
import { formatPrice } from '@/lib/utils';
import { trackCheckoutStart, trackOrderComplete } from '@/lib/analytics';
import { trackInitiateCheckout, trackPurchase } from '@/lib/pixels';
import type { Product, Locale } from '@/types';

interface Wilaya {
  id: number;
  name: string;
  home_fee: number;
  desk_fee: number;
  is_deliverable: boolean;
}

interface Commune {
  id: number;
  name: string;
  wilaya_id: number;
  has_stop_desk: boolean;
  is_deliverable: boolean;
}

interface OrderPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default function OrderPage({ params }: OrderPageProps) {
  const [lang, setLang] = useState<Locale>('ar');
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showPhone2, setShowPhone2] = useState(false);

  // Delivery data from EasyAndSpeed
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingWilayas, setLoadingWilayas] = useState(true);
  const [loadingCommunes, setLoadingCommunes] = useState(false);

  // Form state
  const [form, setForm] = useState({
    fullName: '',
    phone1: '',
    phone2: '',
    wilayaId: 0,
    communeId: 0,
    address: '',
    deliveryType: 'home' as 'home' | 'desk',
  });

  useEffect(() => {
    params.then(p => {
      setLang(p.locale as Locale);
      const foundProduct = getProductBySlug(p.slug);
      setProduct(foundProduct || null);
      setLoading(false);
      
      // Track checkout start
      if (foundProduct) {
        trackCheckoutStart(foundProduct.price);
        // Track on all pixels
        trackInitiateCheckout(foundProduct.price, 1);
      }
    });
  }, [params]);

  // Fetch wilayas on load
  useEffect(() => {
    async function fetchWilayas() {
      try {
        const response = await fetch('/api/delivery/wilayas');
        const data = await response.json();
        if (data.success) {
          setWilayas(data.data);
        }
      } catch (error) {
        console.error('Error fetching wilayas:', error);
      } finally {
        setLoadingWilayas(false);
      }
    }
    fetchWilayas();
  }, []);

  // Fetch communes when wilaya changes
  useEffect(() => {
    async function fetchCommunes() {
      if (!form.wilayaId) {
        setCommunes([]);
        return;
      }
      
      setLoadingCommunes(true);
      try {
        const response = await fetch(`/api/delivery/communes?wilaya_id=${form.wilayaId}`);
        const data = await response.json();
        if (data.success) {
          setCommunes(data.data);
        }
      } catch (error) {
        console.error('Error fetching communes:', error);
      } finally {
        setLoadingCommunes(false);
      }
    }
    fetchCommunes();
  }, [form.wilayaId]);

  // Calculate prices
  const selectedWilaya = wilayas.find(w => w.id === form.wilayaId);
  const selectedCommune = communes.find(c => c.id === form.communeId);
  
  const deliveryFee = selectedWilaya
    ? form.deliveryType === 'home'
      ? selectedWilaya.home_fee
      : selectedWilaya.desk_fee
    : 0;
  
  const subtotal = product ? product.price * quantity : 0;
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setSubmitting(true);

    try {
      const orderData = {
        fullName: form.fullName,
        phone: form.phone1,
        phone2: form.phone2 || null,
        wilayaId: form.wilayaId,
        wilayaName: selectedWilaya?.name || '',
        communeId: form.communeId,
        communeName: selectedCommune?.name || '',
        address: form.address,
        deliveryType: form.deliveryType,
        items: [{
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            images: product.images,
          },
          quantity,
        }],
        subtotal,
        deliveryFee,
        total,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        const orderResult = await res.json();
        const orderId = orderResult.data?.id || `ORD-${Date.now().toString().slice(-6)}`;
        
        // Track order complete
        trackOrderComplete(total, {
          productId: product.id,
          productName: product.name,
          quantity,
          wilaya: selectedWilaya?.name,
          deliveryType: form.deliveryType,
        });
        
        // Redirect to success page with order details for pixel tracking
        const successUrl = `/${lang}/success?orderId=${orderId}&total=${total}&productId=${product.id}&productName=${encodeURIComponent(product.name)}&quantity=${quantity}`;
        router.push(successUrl);
      }
    } catch (error) {
      console.error('Order error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">المنتج غير موجود</h1>
          <Link href={`/${lang}/products`} className="text-brand-500 hover:underline">
            العودة للمنتجات
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">تم استلام طلبك! ✅</h1>
          <p className="text-gray-600 mb-6">
            سيتصل بك فريقنا للتأكيد
            <br />
            <span className="font-bold text-brand-600">التوصيل خلال 24-48 ساعة 🚚</span>
          </p>
          <Link
            href={`/${lang}`}
            className="inline-block px-8 py-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">🛒 إتمام الطلب</h1>
          <p className="text-gray-500 mt-1">املأ البيانات وسيتصل بك</p>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <ShieldCheckIcon className="w-6 h-6 text-green-500 mx-auto mb-1" />
            <p className="text-xs text-gray-600 font-medium">ضمان سنة</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <TruckIcon className="w-6 h-6 text-blue-500 mx-auto mb-1" />
            <p className="text-xs text-gray-600 font-medium">توصيل 24-48h</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="flex justify-center mb-1">
              {[1,2,3,4,5].map(i => (
                <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
              ))}
            </div>
            <p className="text-xs text-gray-600 font-medium">+100 عميل راضي</p>
          </div>
        </div>

        {/* Delivery Price Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-center">
          <p className="text-blue-800 text-sm">
            📦 <strong>سعر التوصيل:</strong> من 400 إلى 800 دج حسب الولاية
          </p>
        </div>

        {/* Express Delivery Badge */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-4 mb-6 flex items-center gap-3 shadow-lg">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <TruckIcon className="w-7 h-7" />
          </div>
          <div>
            <p className="font-bold text-lg">🚀 توصيل سريع EXPRESS</p>
            <p className="text-green-100 text-sm">24 إلى 48 ساعة لجميع الولايات</p>
          </div>
        </div>

        {/* Product Summary */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex gap-4">
            <div className="w-24 h-24 relative rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
              <Image
                src={product.images[0] || '/placeholder.png'}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-gray-900 line-clamp-2">{product.name}</h2>
              <p className="text-brand-600 font-bold text-lg mt-1">
                {formatPrice(product.price, lang)}
              </p>
              
              {/* Quantity */}
              <div className="flex items-center gap-3 mt-2">
                <span className="text-gray-500 text-sm">الكمية:</span>
                <div className="flex items-center bg-gray-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-200 rounded-r-lg transition"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-bold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-200 rounded-l-lg transition"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-gray-900 text-lg mb-4">📋 معلومات التوصيل</h3>

          {/* Full Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              الاسم الكامل <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.fullName}
              onChange={e => setForm({ ...form, fullName: e.target.value })}
              placeholder="مثال: محمد أحمد"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Phone 1 */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              رقم الهاتف <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={form.phone1}
              onChange={e => setForm({ ...form, phone1: e.target.value })}
              placeholder="0XXX XX XX XX"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              dir="ltr"
            />
          </div>

          {/* Phone 2 - Collapsible */}
          {!showPhone2 ? (
            <button
              type="button"
              onClick={() => setShowPhone2(true)}
              className="text-brand-500 text-sm flex items-center gap-1 hover:underline"
            >
              <PlusIcon className="w-4 h-4" />
              إضافة رقم هاتف ثاني
            </button>
          ) : (
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                رقم هاتف ثاني <span className="text-gray-400 text-sm">(اختياري)</span>
              </label>
              <input
                type="tel"
                value={form.phone2}
                onChange={e => setForm({ ...form, phone2: e.target.value })}
                placeholder="0XXX XX XX XX"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                dir="ltr"
              />
            </div>
          )}

          {/* Wilaya */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              الولاية <span className="text-red-500">*</span>
            </label>
            {loadingWilayas ? (
              <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500">
                جاري تحميل الولايات...
              </div>
            ) : (
              <select
                required
                value={form.wilayaId}
                onChange={e => setForm({ ...form, wilayaId: parseInt(e.target.value), communeId: 0 })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 bg-white"
              >
                <option value={0}>اختر الولاية</option>
                {wilayas.filter(w => w.is_deliverable).map(wilaya => (
                  <option key={wilaya.id} value={wilaya.id}>
                    {wilaya.id.toString().padStart(2, '0')} - {wilaya.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Commune */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              البلدية <span className="text-red-500">*</span>
            </label>
            {loadingCommunes ? (
              <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500">
                جاري تحميل البلديات...
              </div>
            ) : (
              <select
                required
                value={form.communeId}
                onChange={e => setForm({ ...form, communeId: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 bg-white"
                disabled={!form.wilayaId}
              >
                <option value={0}>اختر البلدية</option>
                {communes.filter(c => c.is_deliverable).map(commune => (
                  <option key={commune.id} value={commune.id}>
                    {commune.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Delivery Type */}
          {selectedWilaya && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                نوع التوصيل <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, deliveryType: 'home' })}
                  className={`p-4 rounded-xl border-2 text-center transition ${
                    form.deliveryType === 'home'
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <HomeIcon className="w-8 h-8 mx-auto mb-2 text-brand-500" />
                  <p className="font-bold text-gray-900">باب المنزل</p>
                  <p className="text-brand-600 font-bold mt-1">
                    {selectedWilaya.home_fee} د.ج
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, deliveryType: 'desk' })}
                  className={`p-4 rounded-xl border-2 text-center transition ${
                    form.deliveryType === 'desk'
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <BuildingOfficeIcon className="w-8 h-8 mx-auto mb-2 text-brand-500" />
                  <p className="font-bold text-gray-900">المكتب</p>
                  <p className="text-brand-600 font-bold mt-1">
                    {selectedWilaya.desk_fee} د.ج
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Address */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              العنوان بالتفصيل <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              placeholder="الحي، الشارع، رقم العمارة..."
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none"
            />
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>سعر المنتج:</span>
              <span>{formatPrice(subtotal, lang)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>التوصيل:</span>
              <span className={!form.wilayaId ? 'text-gray-400' : ''}>
                {form.wilayaId ? `${deliveryFee} د.ج` : 'اختر الولاية'}
              </span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between text-xl font-bold">
              <span>المجموع:</span>
              <span className="text-brand-600">{formatPrice(total, lang)}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
            <p className="text-yellow-800 font-medium">
              💵 الدفع عند الاستلام - لا تدفع حتى تستلم!
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !form.wilayaId || !form.communeId}
            className="w-full py-4 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                جاري الإرسال...
              </span>
            ) : (
              <span>✓ تأكيد الطلب - {formatPrice(total, lang)}</span>
            )}
          </button>

          <p className="text-center text-gray-500 text-sm">
            بالضغط على تأكيد الطلب، أنت توافق على شروط الخدمة
          </p>
        </form>

        {/* Customer Reviews */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-bold text-gray-900 mb-3">💬 آراء العملاء</h3>
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex">
                  {[1,2,3,4,5].map(i => (
                    <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
                  ))}
                </div>
                <span className="font-medium text-gray-900">أحمد م.</span>
              </div>
              <p className="text-gray-600 text-sm">منتج ممتاز وتوصيل سريع! 👍</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex">
                  {[1,2,3,4,5].map(i => (
                    <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
                  ))}
                </div>
                <span className="font-medium text-gray-900">سارة ب.</span>
              </div>
              <p className="text-gray-600 text-sm">جودة عالية والسعر مناسب 💯</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
