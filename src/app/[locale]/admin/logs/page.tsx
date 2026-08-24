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
  phone_number: string | null;
  products_viewed: string[];
}

export default function LogsPage() {
  const [rawLogs, setRawLogs] = useState<RawLog[]>([]);
  const [sessions, setSessions] = useState<AnalyzedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'raw' | 'sessions'>('sessions');
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch analyzed data
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
      alert(`تم تحليل ${data.logs_analyzed} سجل، ${data.sessions_created} جلسة، ${data.lost_orders} طلبات ضائعة`);
      fetchData();
    } catch (error) {
      console.error('Analysis error:', error);
      alert('خطأ في التحليل');
    }
    setAnalyzing(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ar-DZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'page_view': return '👁️';
      case 'product_view': return '📦';
      case 'add_to_cart': return '🛒';
      case 'checkout_start': return '💳';
      case 'phone_entered': return '📱';
      case 'order_attempt': return '📝';
      case 'order_complete': return '✅';
      case 'click': return '👆';
      case 'input': return '⌨️';
      case 'error': return '❌';
      default: return '📍';
    }
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

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">📊 سجلات الزوار</h1>
            <p className="text-gray-600">تتبع وتحليل سلوك الزوار</p>
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
                  key={session.id}
                  className={`bg-white rounded-lg p-4 shadow ${
                    session.lost_order ? 'border-2 border-red-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {session.lost_order && (
                          <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm">
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
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">الصفحات:</span>
                          <span className="font-bold mr-1">{session.pages_visited}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">المنتجات:</span>
                          <span className="font-bold mr-1">{session.product_views}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">بدأ الطلب:</span>
                          <span className="font-bold mr-1">{session.checkout_started ? '✓' : '✗'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">أدخل الهاتف:</span>
                          <span className="font-bold mr-1">{session.phone_entered ? '✓' : '✗'}</span>
                        </div>
                      </div>

                      {session.phone_number && (
                        <div className="mt-2 text-sm">
                          <span className="text-gray-500">📱 الهاتف:</span>
                          <a 
                            href={`tel:${session.phone_number}`}
                            className="font-bold mr-1 text-green-600 hover:underline"
                          >
                            {session.phone_number}
                          </a>
                          <a
                            href={`https://wa.me/213${session.phone_number.replace(/^0/, '')}`}
                            target="_blank"
                            className="mr-2 text-green-500 hover:text-green-700"
                          >
                            💬 واتساب
                          </a>
                        </div>
                      )}

                      {session.products_viewed && session.products_viewed.length > 0 && (
                        <div className="mt-2 text-sm">
                          <span className="text-gray-500">المنتجات:</span>
                          <span className="mr-1">{session.products_viewed.join(', ')}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-left text-sm text-gray-500">
                      <div>{formatDate(session.first_seen)}</div>
                      <div className="text-xs">→ {formatDate(session.last_seen)}</div>
                    </div>
                  </div>
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
                    rawLogs.slice(0, 100).map((log) => (
                      <tr key={log.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="px-4 py-2">
                          <span className="inline-flex items-center gap-1">
                            {getEventIcon(log.event_type)}
                            {log.event_type}
                          </span>
                        </td>
                        <td className="px-4 py-2 max-w-xs truncate">
                          {log.page_url?.replace('https://www.tiarboutique.shop', '')}
                        </td>
                        <td className="px-4 py-2 max-w-sm">
                          <pre className="text-xs bg-gray-100 p-1 rounded overflow-auto max-h-20">
                            {JSON.stringify(log.event_data, null, 2)}
                          </pre>
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
