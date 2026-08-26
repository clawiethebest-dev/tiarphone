'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || 'tiar2024';

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

function LogsContent() {
  const searchParams = useSearchParams();
  const [rawLogs, setRawLogs] = useState<RawLog[]>([]);
  const [sessions, setSessions] = useState<AnalyzedSession[]>([]);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [period, setPeriod] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sessions' | 'raw'>('sessions');
  const [analyzing, setAnalyzing] = useState(false);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [filterSearch, setFilterSearch] = useState('');
  const [crmStatuses, setCrmStatuses] = useState<Record<string, string>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<Record<string, string>>({});

  const key = searchParams.get('key') || ADMIN_KEY;

  // Load CRM statuses from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tiar_crm_statuses');
      if (saved) setCrmStatuses(JSON.parse(saved));
    } catch (e) { /* ignore */ }
  }, []);

  const updateCrmStatus = (sessionId: string, status: string) => {
    const next = { ...crmStatuses, [sessionId]: status };
    setCrmStatuses(next);
    try {
      localStorage.setItem('tiar_crm_statuses', JSON.stringify(next));
    } catch (e) { /* ignore */ }
  };

  const deleteLostSession = async (sessionId: string, phone?: string) => {
    if (!confirm(`هل أنت متأكد من حذف هذا السجل / الرقم (${phone || sessionId}) نهائياً من قاعدة البيانات؟`)) return;

    try {
      setSessions(prev => prev.filter(s => s.session_id !== sessionId));
      
      const res = await fetch('/api/analyze-logs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, phone }),
      });

      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert('حدث خطأ أثناء الحذف: ' + data.error);
        fetchData();
      }
    } catch (e: any) {
      console.error('Delete error:', e);
      alert('خطأ في الاتصال');
      fetchData();
    }
  };

  const getWhatsAppMessage = (session: AnalyzedSession, type: string = 'help') => {
    const name = session.customer_name ? ` ${session.customer_name}` : '';
    const product = session.product_name || 'المنتجات';

    if (type === 'free_shipping') {
      return `مرحباً${name}، هدية خاصة لك من متجر طيار بوتيك 🎁!\nأكد طلبك لـ "${product}" الآن وسنوفر لك توصيل سريع مجاني لباب منزلك مع فحص الطرد قبل الدفع.`;
    }
    if (type === 'discount') {
      const discountedTotal = session.order_total ? session.order_total - 500 : 0;
      return `مرحباً${name}، عرض استثنائي لك من طيار بوتيك 🔥!\nلحفظ طلبك لـ "${product}" قبل نفاد المخزون، خصمنا لك 500 دج.\nالمبلغ بعد التخفيض: ${discountedTotal.toLocaleString()} د.ج (والتوصيل لباب منزلك مع حق المعاينة).`;
    }
    // Default help
    return `مرحباً${name}، متجر طيار بوتيك يتمنى لك يوماً سعيداً!\nلاحظنا أنك كنت مهتماً بـ "${product}". هل واجهتك أي صعوبة في تأكيد الطلب لنساعدك في إتمامه فوراً؟`;
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const analyzeRes = await fetch(`/api/analyze-logs?period=${period}`);
      const analyzeData = await analyzeRes.json();
      
      if (analyzeData.data) {
        setSummaryData(analyzeData.data);
      }
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

  const [rawLimit, setRawLimit] = useState<number>(500);

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-logs', { method: 'POST' });
      const data = await res.json();
      alert(`✅ تم إنجاز التحليل الشامل بنجاح!\n\n📊 السجلات التي تم تحليلها: ${(data.logs_analyzed || 0).toLocaleString()} سجل\n👥 إجمالي الجلسات المكتشفة: ${(data.sessions_created || 0).toLocaleString()} جلسة\n⚠️ الطلبات الضائعة: ${(data.lost_orders || 0).toLocaleString()}\n📱 طلبات ضائعة برقم هاتف: ${(data.lost_orders_with_phone || 0).toLocaleString()}`);
      fetchData();
    } catch (error) {
      console.error('Analysis error:', error);
      alert('خطأ أثناء تشغيل التحليل');
    }
    setAnalyzing(false);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
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
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('213')) return cleaned;
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    return `213${cleaned}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل سجلات الزوار وتتبع الأحداث...</p>
        </div>
      </div>
    );
  }

  const lostOrders = sessions.filter(s => s.lost_order);
  const lostOrdersWithPhone = lostOrders.filter(s => s.customer_phone);

  const filteredSessions = sessions.filter(s => {
    if (!filterSearch) return true;
    const term = filterSearch.toLowerCase();
    return (
      s.session_id.toLowerCase().includes(term) ||
      (s.customer_phone && s.customer_phone.includes(term)) ||
      (s.customer_name && s.customer_name.toLowerCase().includes(term)) ||
      (s.product_name && s.product_name.toLowerCase().includes(term)) ||
      (s.customer_wilaya && s.customer_wilaya.toLowerCase().includes(term))
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">📊 سجلات الزوار (Live Spy Tracker)</h1>
            <p className="text-gray-600">تتبع ومراقبة وتحليل سلوك الزوار في الوقت الفعلي</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={runAnalysis}
              disabled={analyzing}
              className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 disabled:opacity-50 font-medium"
            >
              {analyzing ? '⏳ جاري التحليل...' : '🔄 تحليل شامل للبيانات'}
            </button>
            <Link
              href={`/ar/admin?key=${key}`}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium"
            >
              ← العودة للوحة الإدارة
            </Link>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { value: '1d', label: 'اليوم' },
            { value: '7d', label: '7 أيام' },
            { value: '30d', label: '30 يوم' },
            { value: '90d', label: '90 يوم' },
            { value: 'all', label: 'كل الأرشيف الدائم' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={`px-4 py-2 rounded-xl font-medium transition ${
                period === value
                  ? 'bg-brand-600 text-white shadow'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-blue-600">
              {(summaryData?.total_sessions || sessions.length).toLocaleString()}
            </div>
            <div className="text-gray-500 text-sm mt-1">إجمالي الجلسات</div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-orange-600">
              {(summaryData?.lost_orders || lostOrders.length).toLocaleString()}
            </div>
            <div className="text-gray-500 text-sm mt-1">طلبات ضائعة</div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-green-600">
              {(summaryData?.lost_orders_with_phone || lostOrdersWithPhone.length).toLocaleString()}
            </div>
            <div className="text-gray-500 text-sm mt-1">مع رقم هاتف للاتصال</div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-purple-600">
              {(summaryData?.total_raw_logs || rawLogs.length).toLocaleString()}
            </div>
            <div className="text-gray-500 text-sm mt-1">سجلات أحداث خام (دائمة)</div>
          </div>
        </div>

        {/* Lost Orders Alert */}
        {lostOrdersWithPhone.length > 0 && (
          <div className="bg-red-50 border-2 border-red-500 rounded-xl p-5 mb-6 shadow-sm">
            <h2 className="text-lg font-bold text-red-700 mb-3 flex items-center gap-2">
              <span>⚠️</span>
              <span>طلبات ضائعة لم تكتمل (فرص استعادة المبيعات المباشرة)</span>
            </h2>
            <div className="space-y-4">
              {lostOrdersWithPhone.slice(0, 30).map((session) => {
                const currentTemplate = selectedTemplate[session.session_id] || 'free_shipping';
                const currentStatus = crmStatuses[session.session_id] || 'pending';

                return (
                  <div 
                    key={session.session_id} 
                    className={`bg-white rounded-2xl p-5 border-2 shadow-sm transition ${
                      currentStatus === 'recovered' 
                        ? 'border-green-400 bg-green-50/20' 
                        : currentStatus === 'contacted'
                        ? 'border-blue-300'
                        : currentStatus === 'no_answer'
                        ? 'border-gray-200 opacity-75'
                        : 'border-red-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      {/* Customer and Order info */}
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          {session.customer_name && (
                            <span className="font-extrabold text-base text-gray-900 bg-gray-100 px-3 py-1 rounded-xl">
                              👤 {session.customer_name}
                            </span>
                          )}
                          {session.product_name && (
                            <span className="font-bold text-gray-800 bg-purple-50 text-purple-700 px-3 py-1 rounded-xl text-sm border border-purple-200">
                              📦 {session.product_name}
                            </span>
                          )}
                          {session.order_total && (
                            <span className="font-extrabold text-brand-700 bg-brand-50 px-3 py-1 rounded-xl text-sm border border-brand-200">
                              💰 {session.order_total.toLocaleString()} د.ج
                            </span>
                          )}
                          <span className="text-xs text-gray-400 font-mono">
                            {formatDate(session.last_seen || session.first_seen)}
                          </span>
                        </div>

                        {/* Phone Numbers with instant WhatsApp & Call */}
                        <div className="flex flex-wrap items-center gap-4 pt-1">
                          {session.customer_phone && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 flex items-center gap-3">
                              <div>
                                <span className="text-gray-500 text-[11px] block leading-none mb-1">الهاتف الأساسي 1:</span>
                                <a 
                                  href={`tel:${session.customer_phone}`}
                                  className="font-extrabold text-blue-700 text-base hover:underline font-mono"
                                >
                                  {session.customer_phone}
                                </a>
                              </div>
                              <a
                                href={`https://wa.me/${formatPhoneForWhatsApp(session.customer_phone)}?text=${encodeURIComponent(
                                  getWhatsAppMessage(session, currentTemplate)
                                )}`}
                                target="_blank"
                                className="bg-[#25D366] hover:bg-[#128C7E] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1"
                              >
                                <span>💬 واتساب 1</span>
                              </a>
                            </div>
                          )}

                          {session.customer_phone2 && (
                            <div className="bg-purple-50 border border-purple-200 rounded-xl p-2.5 flex items-center gap-3">
                              <div>
                                <span className="text-gray-500 text-[11px] block leading-none mb-1">الهاتف الثاني 2 (الاحتياطي):</span>
                                <a 
                                  href={`tel:${session.customer_phone2}`}
                                  className="font-extrabold text-purple-700 text-base hover:underline font-mono"
                                >
                                  {session.customer_phone2}
                                </a>
                              </div>
                              <a
                                href={`https://wa.me/${formatPhoneForWhatsApp(session.customer_phone2)}?text=${encodeURIComponent(
                                  getWhatsAppMessage(session, currentTemplate)
                                )}`}
                                target="_blank"
                                className="bg-[#25D366] hover:bg-[#128C7E] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1"
                              >
                                <span>💬 واتساب 2</span>
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Full Address details */}
                        {(session.customer_wilaya || session.customer_commune || session.customer_address) && (
                          <div className="text-xs text-gray-700 flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                            <span>📍</span>
                            <span className="font-bold text-gray-900">العنوان:</span>
                            <span>{[session.customer_wilaya, session.customer_commune, session.customer_address].filter(Boolean).join(' - ')}</span>
                          </div>
                        )}
                      </div>

                      {/* CRM Controls and Template Selector (B3, C2) */}
                      <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-2.5 min-w-[240px]">
                        <div>
                          <label className="text-[11px] text-gray-500 font-bold block mb-1">قالب رسالة الواتساب:</label>
                          <select
                            value={currentTemplate}
                            onChange={e => setSelectedTemplate({ ...selectedTemplate, [session.session_id]: e.target.value })}
                            className="w-full text-xs font-medium px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-brand-500"
                          >
                            <option value="free_shipping">🎁 عرض توصيل مجاني</option>
                            <option value="discount">💰 تخفيض فوري 500 دج</option>
                            <option value="help">💬 استفسار ومساعدة في الطلب</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] text-gray-500 font-bold block mb-1">حالة المتابعة (CRM):</label>
                          <select
                            value={currentStatus}
                            onChange={e => updateCrmStatus(session.session_id, e.target.value)}
                            className={`w-full text-xs font-bold px-2.5 py-1.5 rounded-lg border focus:outline-none ${
                              currentStatus === 'recovered' 
                                ? 'bg-green-100 text-green-800 border-green-300' 
                                : currentStatus === 'contacted'
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : currentStatus === 'no_answer'
                                ? 'bg-gray-100 text-gray-600 border-gray-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                          >
                            <option value="pending">⏳ لم يتم التواصل بعد</option>
                            <option value="contacted">📞 جاري التواصل والمتابعة</option>
                            <option value="recovered">✅ تم استرجاع الطلب بنجاح</option>
                            <option value="no_answer">❌ لم يرد / غير مهتم</option>
                          </select>
                        </div>

                        <button
                          onClick={() => deleteLostSession(session.session_id, session.customer_phone)}
                          className="w-full text-center text-xs text-red-600 hover:text-red-800 hover:bg-red-50 py-1.5 rounded-lg border border-red-200 font-medium transition"
                          title="حذف هذا الرقم / السجل نهائياً"
                        >
                          🗑️ حذف هذا الرقم
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter and Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-5 py-2.5 rounded-xl font-bold transition ${
                activeTab === 'sessions'
                  ? 'bg-brand-600 text-white shadow'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              📈 الجلسات المحللة ({sessions.length})
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`px-5 py-2.5 rounded-xl font-bold transition ${
                activeTab === 'raw'
                  ? 'bg-brand-600 text-white shadow'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              📋 السجلات الخام ({rawLogs.length})
            </button>
          </div>

          <div className="w-full sm:w-72">
            <input
              type="search"
              placeholder="🔍 بحث بالهاتف، الاسم أو المنتج..."
              value={filterSearch}
              onChange={e => setFilterSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            {filteredSessions.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <p className="text-gray-500 text-lg">لا توجد جلسات مطابقة</p>
              </div>
            ) : (
              filteredSessions.map((session) => (
                <div
                  key={session.session_id}
                  className={`bg-white rounded-xl shadow-sm border overflow-hidden transition hover:shadow ${
                    session.lost_order ? 'border-orange-300' : 'border-gray-100'
                  }`}
                >
                  {/* Session Header */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedSession(
                      expandedSession === session.session_id ? null : session.session_id
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {session.lost_order && (
                            <span className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full text-xs font-bold">
                              ⚠️ لم يكتمل
                            </span>
                          )}
                          {session.order_completed && (
                            <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold">
                              ✅ طلب مكتمل
                            </span>
                          )}
                          <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-medium">
                            {session.device_type === 'mobile' ? '📱 هاتف' : '💻 كمبيوتر'}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">
                            {session.session_id}
                          </span>
                        </div>
                        
                        {/* Customer Info */}
                        {(session.customer_phone || session.customer_phone2 || session.customer_name) && (
                          <div className="bg-blue-50 rounded-xl p-3 mb-2">
                            <div className="flex flex-wrap items-center gap-4">
                              {session.customer_phone && (
                                <div className="flex items-center gap-2 font-bold text-blue-700">
                                  <span>📱 هاتف 1:</span>
                                  <a href={`tel:${session.customer_phone}`} className="hover:underline font-mono">
                                    {session.customer_phone}
                                  </a>
                                  <a
                                    href={`https://wa.me/${formatPhoneForWhatsApp(session.customer_phone)}`}
                                    target="_blank"
                                    className="text-xs bg-[#25D366] text-white px-2 py-0.5 rounded font-bold"
                                  >
                                    واتساب
                                  </a>
                                </div>
                              )}
                              {session.customer_phone2 && (
                                <div className="flex items-center gap-2 font-bold text-purple-700">
                                  <span>📞 هاتف 2:</span>
                                  <a href={`tel:${session.customer_phone2}`} className="hover:underline font-mono">
                                    {session.customer_phone2}
                                  </a>
                                  <a
                                    href={`https://wa.me/${formatPhoneForWhatsApp(session.customer_phone2)}`}
                                    target="_blank"
                                    className="text-xs bg-[#25D366] text-white px-2 py-0.5 rounded font-bold"
                                  >
                                    واتساب
                                  </a>
                                </div>
                              )}
                              {session.customer_name && (
                                <div className="text-gray-800 font-medium">
                                  <span>👤 {session.customer_name}</span>
                                </div>
                              )}
                              {session.product_name && (
                                <div className="text-gray-700 font-medium">
                                  <span>📦 {session.product_name}</span>
                                </div>
                              )}
                              {session.order_total && (
                                <div className="text-brand-600 font-bold">
                                  <span>💰 {session.order_total.toLocaleString()} د.ج</span>
                                </div>
                              )}
                            </div>
                            {(session.customer_wilaya || session.customer_commune || session.customer_address) && (
                              <div className="mt-2 pt-1 border-t border-blue-100 text-xs text-gray-600">
                                📍 {[session.customer_wilaya, session.customer_commune, session.customer_address].filter(Boolean).join(' - ')}
                              </div>
                            )}
                          </div>
                        )}

                        <p className="text-gray-700 text-sm font-medium">
                          {session.journey_summary}
                        </p>
                      </div>

                      <div className="text-left text-xs text-gray-400">
                        <p>{formatDate(session.last_seen || session.first_seen)}</p>
                        <span className="text-brand-600 font-medium mt-1 inline-block">
                          {expandedSession === session.session_id ? '▲ إخفاء التفاصيل' : '▼ عرض التفاصيل'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expandedSession === session.session_id && (
                    <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3 text-sm">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <span className="text-gray-500 block text-xs">بداية الجلسة:</span>
                          <span className="font-mono text-xs">{formatDate(session.first_seen)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-xs">آخر نشاط:</span>
                          <span className="font-mono text-xs">{formatDate(session.last_seen)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-xs">الصفحات المزارة:</span>
                          <span>{session.pages_visited || session.pages_viewed?.length || 1}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-xs">المنتجات المشاهدة:</span>
                          <span>{session.product_views || session.products_viewed?.length || 0}</span>
                        </div>
                      </div>

                      {session.pages_viewed && session.pages_viewed.length > 0 && (
                        <div>
                          <span className="text-gray-500 block text-xs mb-1">مسار الصفحات:</span>
                          <div className="flex flex-wrap gap-1">
                            {session.pages_viewed.map((p, i) => (
                              <span key={i} className="bg-white border border-gray-200 px-2 py-0.5 rounded text-xs">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-3 border-t border-gray-200 flex justify-end">
                        <button
                          onClick={() => deleteLostSession(session.session_id, session.customer_phone)}
                          className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 font-medium transition"
                        >
                          🗑️ حذف هذه الجلسة وسجلاتها نهائياً
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Raw Logs Tab */}
        {activeTab === 'raw' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-sm">
              <span className="text-gray-600 font-medium">
                عرض {Math.min(rawLimit, rawLogs.length).toLocaleString()} سجل من إجمالي {(summaryData?.total_raw_logs || rawLogs.length).toLocaleString()}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs">عدد السطور:</span>
                <select
                  value={rawLimit}
                  onChange={e => setRawLimit(parseInt(e.target.value))}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:border-brand-500"
                >
                  <option value={100}>100 سجل</option>
                  <option value={500}>500 سجل</option>
                  <option value={1000}>1000 سجل</option>
                  <option value={5000}>5000 سجل</option>
                  <option value={20000}>عرض الكل</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[750px]">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">الوقت</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">نوع الحدث</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">الصفحة</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">البيانات</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">الجلسة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rawLogs.slice(0, rawLimit).map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-4 text-xs text-gray-500 whitespace-nowrap font-mono">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">
                          <span>{getEventIcon(log.event_type)}</span>
                          <span>{log.event_type}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-xs text-gray-700 max-w-[200px] truncate">
                        {log.page_url}
                      </td>
                      <td className="py-2.5 px-4 text-xs text-gray-600 max-w-[300px] truncate font-mono">
                        {log.event_data ? JSON.stringify(log.event_data) : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-xs text-gray-400 font-mono">
                        {log.session_id?.substring(0, 15)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LogsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    }>
      <LogsContent />
    </Suspense>
  );
}
