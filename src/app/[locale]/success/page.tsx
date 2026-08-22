'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon, TruckIcon, PhoneIcon, HomeIcon } from '@heroicons/react/24/solid';
import { trackPurchase } from '@/lib/pixels';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const total = searchParams.get('total');
  const productId = searchParams.get('productId');
  const productName = searchParams.get('productName');
  const quantity = searchParams.get('quantity');

  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    // Fire purchase pixel only once
    if (!tracked && orderId && total) {
      trackPurchase({
        content_ids: productId ? [productId] : [],
        content_name: productName || 'Order',
        value: parseFloat(total),
        num_items: quantity ? parseInt(quantity) : 1,
        currency: 'DZD',
        order_id: orderId,
      });
      setTracked(true);
      console.log('Purchase tracked:', { orderId, total, productId });
    }
  }, [orderId, total, productId, productName, quantity, tracked]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircleIcon className="w-16 h-16 text-green-500" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">تم الطلب بنجاح! 🎉</h1>
        
        {/* Order ID */}
        {orderId && (
          <div className="bg-gray-100 rounded-xl p-3 mb-4">
            <p className="text-gray-500 text-sm">رقم الطلب</p>
            <p className="font-mono font-bold text-lg text-gray-900">{orderId}</p>
          </div>
        )}

        {/* Total */}
        {total && (
          <div className="bg-green-50 rounded-xl p-4 mb-6">
            <p className="text-green-700 text-sm">المبلغ الإجمالي</p>
            <p className="font-bold text-2xl text-green-600">{parseFloat(total).toLocaleString('ar-DZ')} د.ج</p>
          </div>
        )}

        {/* Info Cards */}
        <div className="space-y-3 mb-6 text-right">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
            <TruckIcon className="w-8 h-8 text-blue-500 flex-shrink-0" />
            <div>
              <p className="font-bold text-gray-900">التوصيل خلال 24-48 ساعة</p>
              <p className="text-gray-500 text-sm">سيتم الاتصال بك قبل التوصيل</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl">
            <PhoneIcon className="w-8 h-8 text-yellow-500 flex-shrink-0" />
            <div>
              <p className="font-bold text-gray-900">الدفع عند الاستلام</p>
              <p className="text-gray-500 text-sm">لا تدفع إلا عند استلام طلبك</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/ar"
            className="block w-full py-4 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition shadow-lg"
          >
            <HomeIcon className="w-5 h-5 inline ml-2" />
            العودة للرئيسية
          </Link>
          
          <Link
            href="/ar/products"
            className="block w-full py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            تصفح منتجات أخرى
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-6 text-gray-400 text-sm">
          شكراً لثقتك في Media Phone 💙
        </p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
