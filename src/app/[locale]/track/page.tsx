'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon, 
  TruckIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  PhoneIcon,
  ShieldCheckIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/solid';
import { formatPrice } from '@/lib/utils';

interface TrackedOrder {
  id: string;
  order_number: string;
  customer_name: string;
  phone_masked: string;
  wilaya: string;
  commune: string;
  address: string;
  products_text: string;
  total: number;
  status: string;
  tracking?: string;
  created_at: string;
}

export default function TrackOrderPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<TrackedOrder[] | null>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setOrders(null);

    try {
      const res = await fetch(`/api/orders/track?query=${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (data.success && data.orders) {
        setOrders(data.orders);
      } else {
        setError(data.error || 'لم يتم العثور على أي طلب مسجل بهذا الرقم.');
      }
    } catch (err: any) {
      console.error('Tracking search error:', err);
      setError('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const getStepProgress = (status: string) => {
    switch (status) {
      case 'new':
      case 'pending':
        return 1;
      case 'confirmed':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 1;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <TruckIcon className="w-9 h-9" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            📦 تتبع حالة شحنتك وطلبك
          </h1>
          <p className="text-gray-600 text-sm mt-2">
            أدخل رقم هاتفك أو رقم طلبك للاطلاع على حالة التوصيل في الوقت الفعلي
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleTrack} className="bg-white rounded-2xl p-4 shadow-md border border-gray-200 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                required
                placeholder="أدخل رقم الهاتف (مثال: 06XXXXXXXX) أو رقم الطلب TBQ-..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-4 pr-11 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent text-gray-900 text-sm font-medium"
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>جاري البحث...</span>
                </>
              ) : (
                <span>تتبع الطلب 🚀</span>
              )}
            </button>
          </div>
        </form>

        {/* Error / Not Found */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 p-5 rounded-2xl mb-8 text-center text-sm">
            <p className="font-bold">{error}</p>
            <p className="text-xs text-red-500 mt-1">تأكد من كتابة الرقم بنفس الصيغة التي طلبت بها</p>
          </div>
        )}

        {/* Results */}
        {orders && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => {
              const currentStep = getStepProgress(order.status);
              const isCancelled = order.status === 'cancelled';

              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-6">
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
                    <div>
                      <span className="text-xs text-gray-400 block">رقم الطلب:</span>
                      <p className="font-mono font-bold text-gray-900 text-base">{order.order_number}</p>
                    </div>
                    <div className="text-left">
                      <span className="text-xs text-gray-400 block">تاريخ التسجيل:</span>
                      <p className="text-xs text-gray-700 font-medium">
                        {new Date(order.created_at).toLocaleDateString('ar-DZ', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  {!isCancelled ? (
                    <div className="py-4">
                      <div className="grid grid-cols-4 gap-2 text-center relative">
                        {[
                          { step: 1, label: 'تم الاستلام', desc: 'وصلنا طلبك', icon: '📝' },
                          { step: 2, label: 'تم التأكيد', desc: 'مجهز للشحن', icon: '📞' },
                          { step: 3, label: 'قيد الشحن', desc: 'مع شركة التوصيل', icon: '🚚' },
                          { step: 4, label: 'تم التسليم', desc: 'استلم الزبون', icon: '📦' },
                        ].map((item) => {
                          const isDone = currentStep >= item.step;
                          const isCurrent = currentStep === item.step;

                          return (
                            <div key={item.step} className="flex flex-col items-center">
                              <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all shadow-md ${
                                  isDone
                                    ? 'bg-green-600 text-white shadow-green-600/30'
                                    : 'bg-gray-100 text-gray-400'
                                } ${isCurrent ? 'ring-4 ring-green-200 animate-pulse scale-105' : ''}`}
                              >
                                {item.icon}
                              </div>
                              <p className={`text-xs font-bold mt-2 ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                                {item.label}
                              </p>
                              <p className="text-[10px] text-gray-500 hidden sm:block">{item.desc}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 p-4 rounded-xl text-center text-red-700 font-bold text-sm">
                      ❌ تم إلغاء هذا الطلب
                    </div>
                  )}

                  {/* Order Summary Box */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">المنتج:</span>
                      <span className="font-bold text-gray-900">{order.products_text}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">المبلغ المطلوب عند الاستلام:</span>
                      <span className="font-extrabold text-brand-600 text-base">{formatPrice(order.total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">عنوان التوصيل:</span>
                      <span className="font-medium text-gray-800">
                        {[order.wilaya, order.commune, order.address].filter(Boolean).join(' - ')}
                      </span>
                    </div>
                    {order.tracking && (
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="text-gray-500 font-medium">رقم تتبع EasyAndSpeed:</span>
                        <span className="font-mono font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg text-xs">
                          {order.tracking}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Guarantee notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-center gap-3 text-xs text-blue-900">
                    <ShieldCheckIcon className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <span>
                      <strong>تذكير مهم:</strong> يحق لك فتح الطرد وفحص كافة المنتجات قبل الدفع للموزع.
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link href="/ar" className="text-sm font-bold text-brand-600 hover:underline">
            ← العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
