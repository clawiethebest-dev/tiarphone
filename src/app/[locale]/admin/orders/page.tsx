'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, EyeIcon, CheckCircleIcon, TruckIcon, XCircleIcon } from '@heroicons/react/24/outline';

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || 'tiar2024';

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  phone2?: string;
  wilaya: string;
  wilaya_id: number;
  commune: string;
  commune_id: number;
  address: string;
  total: number;
  subtotal: number;
  delivery_fee: number;
  delivery_type: string;
  products_text: string;
  status: 'new' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | string;
  tracking?: string;
  created_at: string;
  notes?: string;
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

function OrdersContent({ params }: PageProps) {
  const searchParams = useSearchParams();
  const [locale, setLocale] = useState('ar');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastOrderCount, setLastOrderCount] = useState<number | null>(null);
  const [newOrderAlert, setNewOrderAlert] = useState<string | null>(null);

  // Play pleasant chime for new orders using Web Audio API (no external file required)
  const playNewOrderSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); // A5
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1320, now + 0.15); // E6
      gain2.gain.setValueAtTime(0.3, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.6);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  };

  useEffect(() => {
    params.then(p => setLocale(p.locale));
  }, [params]);

  useEffect(() => {
    const key = searchParams.get('key');
    if (key === ADMIN_KEY) {
      setIsAuthenticated(true);
    }
  }, [searchParams]);

  // Fetch orders from API with live auto-polling every 10 seconds (C1)
  const fetchOrders = async (isPolling = false) => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      if (data.success) {
        const newOrders: Order[] = data.data || [];
        
        // Check if a new order arrived
        if (isPolling && lastOrderCount !== null && newOrders.length > lastOrderCount) {
          const newest = newOrders[0];
          if (soundEnabled) {
            playNewOrderSound();
          }
          setNewOrderAlert(`🔔 وصل طلب جديد الآن: ${newest.customer_name} (${newest.total?.toLocaleString()} د.ج)`);
          setTimeout(() => setNewOrderAlert(null), 8000);
        }

        setOrders(newOrders);
        setLastOrderCount(newOrders.length);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchOrders(false);

    // Live polling every 10s for immediate order detection
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated, lastOrderCount, soundEnabled]);

  // Export orders to CSV / Excel (C3)
  const exportToCSV = () => {
    if (orders.length === 0) {
      alert('لا توجد طلبات لتصديرها');
      return;
    }

    const headers = [
      'رقم الطلب',
      'العميل',
      'الهاتف',
      'الهاتف 2',
      'الولاية',
      'البلدية',
      'العنوان',
      'المنتجات',
      'المجموع الفرعي (د.ج)',
      'رسوم التوصيل (د.ج)',
      'المجموع الكلي (د.ج)',
      'نوع التوصيل',
      'الحالة',
      'رقم التتبع',
      'تاريخ الطلب',
      'ملاحظات'
    ];

    const rows = orders.map(o => [
      `"${o.id}"`,
      `"${(o.customer_name || '').replace(/"/g, '""')}"`,
      `"${o.phone}"`,
      `"${o.phone2 || ''}"`,
      `"${(o.wilaya || '').replace(/"/g, '""')}"`,
      `"${(o.commune || '').replace(/"/g, '""')}"`,
      `"${(o.address || '').replace(/"/g, '""')}"`,
      `"${(o.products_text || '').replace(/"/g, '""')}"`,
      o.subtotal || o.total,
      o.delivery_fee || 0,
      o.total,
      o.delivery_type === 'home' ? 'باب المنزل' : 'المكتب',
      getStatusText(o.status),
      `"${o.tracking || ''}"`,
      `"${new Date(o.created_at).toLocaleString('ar-DZ')}"`,
      `"${(o.notes || '').replace(/"/g, '""')}"`
    ]);

    // UTF-8 BOM (\uFEFF) for Arabic Excel compatibility
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tiar_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format phone number for EasyAndSpeed (must be 10 digits starting with 0)
  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Handle international format (+213 or 213)
    if (cleaned.startsWith('213')) {
      cleaned = '0' + cleaned.slice(3);
    }
    
    // Ensure it starts with 0
    if (!cleaned.startsWith('0') && cleaned.length === 9) {
      cleaned = '0' + cleaned;
    }
    
    // Take only first 10 digits
    cleaned = cleaned.slice(0, 10);
    
    return cleaned;
  };

  // Confirm order and send to EasyAndSpeed
  const confirmOrder = async (order: Order) => {
    setLoading(order.id);
    setMessage(null);

    try {
      // Split customer name - handle single-word names
      const nameParts = order.customer_name.trim().split(' ').filter(p => p.length > 0);
      const firstname = nameParts[0] || order.customer_name;
      const familyname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0] || order.customer_name;

      // Format phone number
      const formattedPhone = formatPhoneNumber(order.phone);
      
      // Validate phone number
      if (formattedPhone.length !== 10 || !formattedPhone.startsWith('0')) {
        throw new Error(`رقم الهاتف غير صالح: ${order.phone} → ${formattedPhone}`);
      }

      // Calculate product price only (subtotal) so EasyAndSpeed doesn't charge delivery fee twice!
      const productPriceOnly = order.subtotal || (order.total - (order.delivery_fee || 0));

      const response = await fetch('/api/delivery/create-parcel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: order.id,
          firstname,
          familyname,
          contact_phone: formattedPhone,
          address: order.address,
          to_commune_id: order.commune_id,
          to_wilaya_id: order.wilaya_id,
          wilaya_name: order.wilaya,
          commune_name: order.commune,
          product_list: order.products_text || 'هواتف وإكسسوارات',
          price: productPriceOnly, // سعر السلعة فقط بدون توصيل
          declared_value: productPriceOnly,
          freeshipping: false,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const trackingCode = data.data?.tracking || data.data?.tracking_code || 'EASY-' + order.id;
        // Update order in database
        await fetch('/api/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            status: 'shipped',
            tracking: trackingCode,
          }),
        });
        
        // Update local state
        setOrders(prev =>
          prev.map(o =>
            o.id === order.id
              ? { ...o, status: 'shipped' as const, tracking: trackingCode }
              : o
          )
        );
        setMessage({
          type: 'success',
          text: `✅ تم تأكيد الطلب وإرساله في EasyAndSpeed! رقم التتبع: ${trackingCode}`,
        });
      } else {
        throw new Error(data.error || 'فشل الاتصال بشركة التوصيل');
      }
    } catch (error: any) {
      console.error('Error confirming order:', error);
      setMessage({
        type: 'error',
        text: `❌ فشل إرسال الطلب عبر EasyAndSpeed: ${error.message} (يمكنك التأكيد يدوياً)`,
      });
    } finally {
      setLoading(null);
    }
  };

  // Confirm order manually
  const confirmOrderManually = async (order: Order) => {
    setLoading(order.id);
    setMessage(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          status: 'confirmed',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOrders(prev =>
          prev.map(o =>
            o.id === order.id ? { ...o, status: 'confirmed' as const } : o
          )
        );
        setMessage({
          type: 'success',
          text: `✅ تم تأكيد الطلب ${order.id} يدوياً`,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error confirming order manually:', error);
      setMessage({
        type: 'error',
        text: `❌ فشل تأكيد الطلب: ${error.message}`,
      });
    } finally {
      setLoading(null);
    }
  };

  // Cancel order
  const cancelOrder = async (order: Order) => {
    if (!confirm(`هل أنت متأكد من إلغاء الطلب ${order.id}؟`)) return;
    
    setLoading(order.id);
    setMessage(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          status: 'cancelled',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOrders(prev =>
          prev.map(o =>
            o.id === order.id ? { ...o, status: 'cancelled' as const } : o
          )
        );
        setMessage({
          type: 'success',
          text: `✅ تم إلغاء الطلب ${order.id}`,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      setMessage({
        type: 'error',
        text: `❌ فشل إلغاء الطلب: ${error.message}`,
      });
    } finally {
      setLoading(null);
    }
  };

  // Delete order permanently
  const deleteOrder = async (order: Order) => {
    if (!confirm(`هل أنت متأكد من حذف الطلب ${order.id} نهائياً؟\nلا يمكن التراجع عن هذا الإجراء!`)) return;
    
    setLoading(order.id);
    setMessage(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOrders(prev => prev.filter(o => o.id !== order.id));
        setMessage({
          type: 'success',
          text: `✅ تم حذف الطلب ${order.id}`,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error deleting order:', error);
      setMessage({
        type: 'error',
        text: `❌ فشل حذف الطلب: ${error.message}`,
      });
    } finally {
      setLoading(null);
    }
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

  const getStatusColor = (status: Order['status'] | string) => {
    switch (status) {
      case 'new':
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700';
      case 'shipped':
        return 'bg-purple-100 text-purple-700';
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: Order['status'] | string) => {
    switch (status) {
      case 'new':
        return 'جديد';
      case 'pending':
        return 'جديد (معلق)';
      case 'confirmed':
        return 'مؤكد';
      case 'shipped':
        return 'قيد التوصيل';
      case 'delivered':
        return 'تم التوصيل';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}/admin?key=${ADMIN_KEY}`}
              className="text-gray-500 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">إدارة الطلبات</h1>
              <p className="text-xs text-gray-500">مراقبة وتأكيد الشحنات المباشرة</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Sound Toggle (C1) */}
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playNewOrderSound();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                soundEnabled 
                  ? 'bg-green-100 text-green-800 border border-green-300' 
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}
              title={soundEnabled ? 'التنبيه الصوتي مفعل للطلبات الجديدة' : 'التنبيه الصوتي مكتوم'}
            >
              <span>{soundEnabled ? '🔔 التنبيه الصوتي شغال' : '🔕 التنبيه مكتوم'}</span>
            </button>

            {/* Export CSV / Excel Button (C3) */}
            <button
              onClick={exportToCSV}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              title="تصدير جميع الطلبات لملف Excel"
            >
              <span>📥</span>
              <span>تصدير إلى Excel (CSV)</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200">
              <TruckIcon className="w-4 h-4 text-blue-600" />
              <span>EasyAndSpeed متصل</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Live New Order Sound & Alert Banner (C1) */}
        {newOrderAlert && (
          <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm shadow-lg flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔔</span>
              <span>{newOrderAlert}</span>
            </div>
            <button 
              onClick={() => setNewOrderAlert(null)}
              className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-md"
            >
              إغلاق
            </button>
          </div>
        )}
        {/* Message */}
        {message && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">رقم الطلب</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">العميل</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">الولاية</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">المنتجات</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">المجموع</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">الحالة</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">التاريخ</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const cleanPhone = (order.phone || '').replace(/\D/g, '');
                  const duplicates = orders.filter(o => o.phone && cleanPhone && o.phone.replace(/\D/g, '') === cleanPhone);
                  const isDuplicate = duplicates.length > 1;

                  return (
                    <tr key={order.id} className={`border-b border-gray-100 hover:bg-gray-50 ${isDuplicate ? 'bg-amber-50/40' : ''}`}>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{order.id}</p>
                          {order.tracking && (
                            <p className="text-xs text-brand-600 font-mono font-bold">{order.tracking}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-gray-900">{order.customer_name}</p>
                            {isDuplicate && (
                              <span className="bg-red-100 text-red-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border border-red-200">
                                ⚠️ مكرر ({duplicates.length})
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 font-mono">{order.phone}</p>
                          {order.phone2 && (
                            <p className="text-xs text-purple-600 font-mono">2: {order.phone2}</p>
                          )}
                        </div>
                      </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-gray-700">{order.wilaya}</p>
                        <p className="text-xs text-gray-500">{order.commune}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm max-w-[200px] truncate">
                      {order.products_text || 'طلب منتجات'}
                    </td>
                    <td className="py-3 px-4 font-medium text-brand-600">
                      {(order.total || 0).toLocaleString()} د.ج
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-sm">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('ar-DZ', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      }) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="عرض التفاصيل"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {(order.status === 'new' || order.status === 'pending') && (
                          <>
                            <button
                              onClick={() => confirmOrder(order)}
                              disabled={loading === order.id}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm disabled:opacity-50 font-medium"
                              title="تأكيد وإرسال لشركة التوصيل EasyAndSpeed"
                            >
                              {loading === order.id ? (
                                <span className="animate-spin">⏳</span>
                              ) : (
                                <CheckCircleIcon className="w-4 h-4" />
                              )}
                              <span>تأكيد EasyAndSpeed</span>
                            </button>
                            <button
                              onClick={() => confirmOrderManually(order)}
                              disabled={loading === order.id}
                              className="px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm disabled:opacity-50 font-medium"
                              title="تأكيد يدوي بدون إرسال إلى EasyAndSpeed"
                            >
                              تأكيد يدوي
                            </button>
                          </>
                        )}
                        {(order.status === 'new' || order.status === 'pending') && (
                          <button 
                            onClick={() => cancelOrder(order)}
                            disabled={loading === order.id}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition disabled:opacity-50"
                            title="إلغاء الطلب"
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        )}
                        {/* زر الحذف - يظهر لكل الحالات */}
                        <button 
                          onClick={() => deleteOrder(order)}
                          disabled={loading === order.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          title="حذف الطلب نهائياً"
                        >
                          {loading === order.id ? (
                            <span className="animate-spin text-sm">⏳</span>
                          ) : (
                            <span className="text-sm">🗑️</span>
                          )}
                        </button>
                      </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {loadingOrders ? (
          <div className="text-center py-12">
            <p className="text-gray-500">جاري تحميل الطلبات...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">لا توجد طلبات</p>
          </div>
        ) : null}

        {/* Legend */}
        <div className="mt-6 p-4 bg-white rounded-xl border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-3">كيفية العمل:</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>عندما يصل طلب جديد، يظهر بحالة <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">جديد</span></li>
            <li>اضغط على زر <span className="px-2 py-0.5 bg-green-500 text-white rounded text-xs">تأكيد</span> لإرسال الطلب إلى EasyAndSpeed</li>
            <li>سيتم إنشاء طرد تلقائياً ويظهر رقم التتبع</li>
            <li>يمكنك متابعة الطلب من لوحة EasyAndSpeed</li>
          </ol>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">تفاصيل الطلب</h2>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <XCircleIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">رقم الطلب</p>
                  <p className="font-bold text-gray-900">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">الحالة</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4">
                <h3 className="font-bold text-gray-900 mb-2">معلومات العميل</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">الاسم:</span> {selectedOrder.customer_name}</p>
                  <p><span className="text-gray-500">الهاتف:</span> <a href={`tel:${selectedOrder.phone}`} className="text-brand-600">{selectedOrder.phone}</a></p>
                  <p><span className="text-gray-500">الولاية:</span> {selectedOrder.wilaya}</p>
                  <p><span className="text-gray-500">البلدية:</span> {selectedOrder.commune}</p>
                  <p><span className="text-gray-500">العنوان:</span> {selectedOrder.address}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h3 className="font-bold text-gray-900 mb-2">المنتجات</h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedOrder.products_text}</p>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h3 className="font-bold text-gray-900 mb-2">المبلغ</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">المجموع الفرعي:</span>
                    <span>{(selectedOrder.subtotal || 0).toLocaleString()} د.ج</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">رسوم التوصيل ({selectedOrder.delivery_type === 'desk' ? 'المكتب' : 'باب المنزل'}):</span>
                    <span>{(selectedOrder.delivery_fee || 0).toLocaleString()} د.ج</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2 mt-2">
                    <span>المجموع:</span>
                    <span className="text-brand-600">{(selectedOrder.total || 0).toLocaleString()} د.ج</span>
                  </div>
                </div>
              </div>

              {selectedOrder.tracking && (
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="font-bold text-gray-900 mb-2">رقم التتبع</h3>
                  <p className="text-brand-600 font-mono bg-brand-50 p-3 rounded-lg font-bold">{selectedOrder.tracking}</p>
                </div>
              )}

              {selectedOrder.notes && (
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="font-bold text-gray-900 mb-2">ملاحظات</h3>
                  <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4 text-xs text-gray-400">
                <p>تاريخ الطلب: {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString('ar-DZ') : '-'}</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 space-y-3">
              {(selectedOrder.status === 'new' || selectedOrder.status === 'pending') && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => { confirmOrder(selectedOrder); setSelectedOrder(null); }}
                    className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-bold text-center"
                  >
                    ✓ تأكيد وإرسال في EasyAndSpeed
                  </button>
                  <button
                    onClick={() => { confirmOrderManually(selectedOrder); setSelectedOrder(null); }}
                    className="px-4 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-bold"
                  >
                    تأكيد يدوي
                  </button>
                  <button
                    onClick={() => { cancelOrder(selectedOrder); setSelectedOrder(null); }}
                    className="px-4 py-3 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition font-medium"
                  >
                    إلغاء
                  </button>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  إغلاق
                </button>
                <button
                  onClick={() => { deleteOrder(selectedOrder); setSelectedOrder(null); }}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
                >
                  🗑️ حذف نهائي
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage({ params }: PageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full"></div>
      </div>
    }>
      <OrdersContent params={params} />
    </Suspense>
  );
}
