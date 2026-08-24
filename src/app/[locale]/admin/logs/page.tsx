'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface RawLog {
  id: string;
  session_id: string;
  timestamp: string;
  event_type: string;
  event_data: any;
  page_url: string;
  user_agent: string;
}

interface AnalyzedSession {
  id: string;
  session_id: string;
  first_seen: string;
  last_seen: string;
  device_type: string;
  pages_visited: number;
  product_views: number;
  checkout_started: boolean;
  phone_entered: boolean;
  order_completed: boolean;
  lost_order: boolean;
  journey_summary: string;
  // Customer data
  customer_name?: string;
  customer_phone?: string;
  customer_phone2?: string;
  customer_wilaya?: string;
  customer_commune?: string;
  customer_address?: string;
  product_name?: string;
  product_quantity?: number;
  order_total?: number;
  products_viewed?: string[];
  pages_viewed?: string[];
}

export default function LogsPage() {
  const [rawLogs, setRawLogs] = useState<RawLog[]>([]);
  const [sessions, setSessions] = useState<AnalyzedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'raw' | 'sessions'>('sessions');
  const [analyzing, setAnalyzing] = useState(false);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const analyzeRes = await fetch('/api/analyze-logs');
      const analyzeData = await analyzeRes.json();
      
      if (analyzeData.sessions) {
        setSessions(analyzeData.sessions);
      }
      if (analyzeData.raw_logs) {
        setRawLogs(analyzeData.raw_logs);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
    setLoading(false);
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-logs', { method: 'POST' });
      const data = await res.json();
      alert(`تم تحليل ${data.logs_analyzed} سجل\n${data.sessions_created} جلسة\n${data.lost_orders} طلبات ضائعة\n${data.lost_orders_with_phone || 0} مع رقم هاتف`);
      fetchData();
    } catch (error) {
      console.error('Analysis error:', error);
      alert('خطأ في التحليل');
    }
    setAnalyzing(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ar-DZ', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventIcon = (eventType: string) => {
    const icons: Record<string, string> = {
      'page_view': '👁️',
      'product_view': '📦',
      'add_to_cart': '🛒',
      'checkout_start': '💳',
      'popup_open': '🔔',
      'phone_entered': '📱',
      'field_input': '⌨️',
      'order_attempt': '📝',
      'order_success': '✅',
      'order_error': '❌',
      'click': '👆',
      'form_submit': '📤',
      'form_snapshot': '📸',
      'checkout_button_click': '🛍️',
      'popup_close': '🚪',
      'page_exit': '👋',
      'scroll': '📜',
      'error': '⚠️',
      'visibility': '👀',
    };
    return icons[eventType] || '📍';
  };

  const formatPhoneForWhatsApp = (phone: string) => {
    // Remove leading 0 and add Algeria code
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    return `213${cleaned}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const lostOrders = sessions.filter(s => s.lost_order);
  const lostOrdersWithPhone = lostOrders.filter(s => s.customer_phone);

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">📊 سجلات الزوار</h1>
            <p className="text-gray-600">تتبع وتحليل سلوك الزوار - Full Website Spy</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={runAnalysis}
              disabled={analyzing}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {analyzing ? '⏳ جاري التحليل...' : '🔄 تحليل الآن'}
            </button>
            <Link
              href="/ar/admin"
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              ← العودة
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-3xl font-bold text-blue-600">{sessions.length}</div>
            <div className="text-gray-500 text-sm">إجمالي الجلسات</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-3xl font-bold text-orange-600">{lostOrders.length}</div>
            <div className="text-gray-500 text-sm">طلبات ضائعة</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-3xl font-bold text-green-600">{lostOrdersWithPhone.length}</div>
            <div className="text-gray-500 text-sm">مع رقم هاتف</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-3xl font-bold text-purple-600">{rawLogs.length}</div>
            <div className="text-gray-500 text-sm">سجلات خام</div>
          </div>
        </div>

        {/* Lost Orders Alert */}
        {lostOrdersWithPhone.length > 0 && (
          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-bold text-red-600 mb-3">⚠️ طلبات ضائعة مع بيانات الاتصال</h2>
            <div className="space-y-3">
              {lostOrdersWithPhone.slice(0, 5).map((session) => (
                <div key={session.session_id} className="bg-white rounded-lg p-3 border border-red-200">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <span className="text-gray-500">📱</span>
                      <a 
                        href={`tel:${session.customer_phone}`}
                        className="font-bold text-lg text-blue-600 hover:underline mr-1"
                      >
                        {session.customer_phone}
                      </a>
                    </div>
                    {session.customer_name && (
                      <div>
                        <span className="text-gray-500">👤</span>
                        <span className="font-medium mr-1">{session.customer_name}</span>
                      </div>
                    )}
                    {session.product_name && (
                      <div>
                        <span className="text-gray-500">📦</span>
                        <span className="mr-1">{session.product_name}</span>
                      </div>
                    )}
                    {session.order_total && (
                      <div>
                        <span className="text-gray-500">💰</span>
                        <span className="mr-1">{session.order_total.toLocaleString()} د.ج</span>
                      </div>
                    )}
                    <a
                      href={`https://wa.me/${formatPhoneForWhatsApp(session.customer_phone || '')}?text=${encodeURIComponent(
                        `مرحباً ${session.customer_name || ''}،\nلاحظنا أنك كنت مهتماً بـ ${session.product_name || 'منتجاتنا'}. هل تحتاج مساعدة لإتمام طلبك؟`
                      )}`}
                      target="_blank"
                      className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600"
                    >
                      💬 راسل واتساب
                    </a>
                  </div>
                  {(session.customer_wilaya || session.customer_commune || session.customer_address) && (
                    <div className="mt-2 text-sm text-gray-600">
                      📍 {[session.customer_wilaya, session.customer_commune, session.customer_address].filter(Boolean).join(' - ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'sessions'
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-700'
            }`}
          >
            📈 الجلسات المحللة ({sessions.length})
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'raw'
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-700'
            }`}
          >
            📋 السجلات الخام ({rawLogs.length})
          </button>
        </div>

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            {sessions.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="text-gray-500">لا توجد جلسات محللة بعد</p>
                <button
                  onClick={runAnalysis}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  تحليل السجلات
                </button>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.session_id}
                  className={`bg-white rounded-lg shadow overflow-hidden ${
                    session.lost_order ? 'border-2 border-red-500' : ''
                  }`}
                >
                  {/* Session Header */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedSession(
                      expandedSession === session.session_id ? null : session.session_id
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {session.lost_order && (
                            <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-bold">
                              ⚠️ طلب ضائع
                            </span>
                          )}
                          {session.order_completed && (
                            <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-sm">
                              ✅ طلب مكتمل
                            </span>
                          )}
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
                            {session.device_type === 'mobile' ? '📱' : '💻'} {session.device_type}
                          </span>
                        </div>
                        
                        {/* Customer Info */}
                        {(session.customer_phone || session.customer_name) && (
                          <div className="bg-blue-50 rounded-lg p-3 mb-3">
                            <div className="flex flex-wrap items-center gap-4">
                              {session.customer_phone && (
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">📱</span>
                                  <div>
                                    <a 
                                      href={`tel:${session.customer_phone}`}
                                      className="font-bold text-lg text-blue-600 hover:underline"
                                    >
                                      {session.customer_phone}
                                    </a>
                                    {session.customer_phone2 && (
                                      <div className="text-sm text-gray-500">
                                        احتياطي: {session.customer_phone2}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              {session.customer_name && (
                                <div>
                                  <span className="text-gray-500">👤</span>
                                  <span className="font-medium mr-1">{session.customer_name}</span>
                                </div>
                              )}
                              {session.customer_phone && (
                                <a
                                  href={`https://wa.me/${formatPhoneForWhatsApp(session.customer_phone)}?text=${encodeURIComponent(
                                    `مرحباً${session.customer_name ? ' ' + session.customer_name : ''}،\nهل تحتاج مساعدة؟`
                                  )}`}
                                  target="_blank"
                                  className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                >
                                  💬 واتساب
                                </a>
                              )}
                            </div>
                            {(session.customer_wilaya || session.customer_commune || session.customer_address) && (
                              <div className="mt-2 text-sm">
                                <span className="text-gray-500">📍 العنوان:</span>
                                <span className="mr-1">
                                  {[session.customer_wilaya, session.customer_commune].filter(Boolean).join(' - ')}
                                </span>
                                {session.customer_address && (
                                  <div className="text-gray-600 mt-1">{session.customer_address}</div>
                                )}
                              </div>
                            )}
                            {(session.product_name || session.order_total) && (
                              <div className="mt-2 text-sm">
                                {session.product_name && (
                                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded mr-2">
                                    📦 {session.product_name}
                                  </span>
                                )}
                                {session.order_total && (
                                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                                    💰 {session.order_total.toLocaleString()} د.ج
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">الصفحات:</span>
                            <span className="font-bold mr-1">{session.pages_viewed?.length || 0}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">المنتجات:</span>
                            <span className="font-bold mr-1">{session.products_viewed?.length || 0}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">بدأ الطلب:</span>
                            <span className={`font-bold mr-1 ${session.checkout_started ? 'text-green-600' : 'text-red-600'}`}>
                              {session.checkout_started ? '✓' : '✗'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">أدخل الهاتف:</span>
                            <span className={`font-bold mr-1 ${session.phone_entered ? 'text-green-600' : 'text-red-600'}`}>
                              {session.phone_entered ? '✓' : '✗'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-left text-sm text-gray-500 mr-4">
                        <div>{formatDate(session.first_seen)}</div>
                        <div className="text-xs">→ {formatDate(session.last_seen)}</div>
                        <div className="mt-2 text-lg">{expandedSession === session.session_id ? '🔼' : '🔽'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedSession === session.session_id && (
                    <div className="border-t bg-gray-50 p-4">
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>الرحلة:</strong> {session.journey_summary}
                      </div>
                      {session.pages_viewed && session.pages_viewed.length > 0 && (
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>الصفحات:</strong> {session.pages_viewed.join(' → ')}
                        </div>
                      )}
                      {session.products_viewed && session.products_viewed.length > 0 && (
                        <div className="text-sm text-gray-600">
                          <strong>المنتجات المشاهدة:</strong> {session.products_viewed.join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Raw Logs Tab */}
        {activeTab === 'raw' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right">الوقت</th>
                    <th className="px-4 py-3 text-right">النوع</th>
                    <th className="px-4 py-3 text-right">الصفحة</th>
                    <th className="px-4 py-3 text-right">البيانات</th>
                  </tr>
                </thead>
                <tbody>
                  {rawLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        لا توجد سجلات بعد
                      </td>
                    </tr>
                  ) : (
                    rawLogs.slice(0, 200).map((log) => (
                      <tr key={log.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="px-4 py-2">
                          <span className="inline-flex items-center gap-1">
                            {getEventIcon(log.event_type)}
                            <span className="text-xs">{log.event_type}</span>
                          </span>
                        </td>
                        <td className="px-4 py-2 max-w-xs truncate text-xs">
                          {log.page_url?.replace('https://www.tiarboutique.shop', '').replace('/ar', '')}
                        </td>
                        <td className="px-4 py-2 max-w-md">
                          {log.event_data && Object.keys(log.event_data).length > 0 && (
                            <pre className="text-xs bg-gray-100 p-1 rounded overflow-auto max-h-20 whitespace-pre-wrap">
                              {JSON.stringify(log.event_data, null, 2)}
                            </pre>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
