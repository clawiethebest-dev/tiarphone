'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CubeIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  EyeIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { ALL_PRODUCTS } from '@/data/products';

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || 'tiar2024';
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'naza2024';

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  total: number;
  status: string;
  created_at: string;
}

interface AnalyticsSummary {
  pageViews: number;
  uniqueVisitors: number;
  productViews: number;
  addToCarts: number;
  orders: number;
  revenue: number;
  averageOrderValue: number;
  conversionRate: string;
}

interface AnalyticsData {
  period: string;
  summary: AnalyticsSummary;
  funnel: {
    pageViews: number;
    productViews: number;
    addToCarts: number;
    checkouts: number;
    orders: number;
  };
  topSources: { source: string; count: number }[];
  topProducts: { id: string; name: string; views: number }[];
  topWilayas?: { id: number; name: string; count: number; percentage: number }[];
  topBuyingWilayas?: { name: string; count: number; revenue: number }[];
  orderStatusCounts?: { new: number; shipped: number; delivered: number; cancelled: number };
  deviceDetails?: { android: number; iphone: number; windows: number; mac: number; other: number };
  peakHours?: { hour: string; hourNum: number; count: number }[];
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

function AdminContent({ params }: PageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [locale, setLocale] = useState('ar');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastOrderCount, setLastOrderCount] = useState<number | null>(null);
  const [newOrderAlert, setNewOrderAlert] = useState<string | null>(null);

  // UTM Generator States
  const [utmProduct, setUtmProduct] = useState(ALL_PRODUCTS[0]?.slug || 'pack-infinix-smart10');
  const [utmPlatform, setUtmPlatform] = useState('tiktok');
  const [utmCampaignName, setUtmCampaignName] = useState('promo_spring');
  const [utmCopied, setUtmCopied] = useState(false);

  const getGeneratedUtmLink = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.tiarboutique.shop';
    return `${baseUrl}/${locale}/products/${utmProduct}?utm_source=${encodeURIComponent(utmPlatform)}&utm_medium=paid_ad&utm_campaign=${encodeURIComponent(utmCampaignName || 'campaign')}`;
  };

  const copyUtmLink = () => {
    const link = getGeneratedUtmLink();
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(link);
      setUtmCopied(true);
      setTimeout(() => setUtmCopied(false), 3000);
    }
  };

  // Play pleasant chime for new orders using Web Audio API
  const playNewOrderSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1320, now + 0.15);
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

  // Fetch orders with live polling (C1)
  const fetchOrders = async (isPolling = false) => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        const newOrders: Order[] = data.data || [];
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

    const interval = setInterval(() => {
      fetchOrders(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated, lastOrderCount, soundEnabled]);

  // Fetch analytics from analyze-logs API
  useEffect(() => {
    if (!isAuthenticated) return;
    
    async function fetchAnalytics() {
      setLoadingAnalytics(true);
      try {
        const res = await fetch(`/api/analyze-logs?period=${analyticsPeriod}`);
        const data = await res.json();
        if (data.success && data.data) {
          const summary = data.data;
          const totalSessions = summary.total_sessions || 0;
          const pageViews = summary.total_page_views || totalSessions;
          const completedOrders = summary.orders_completed || orders.length || 0;
          const conversionRate = totalSessions > 0 
            ? `${((completedOrders / totalSessions) * 100).toFixed(1)}%` 
            : '0%';

          const avgOrderVal = completedOrders > 0 
            ? Math.round((summary.revenue || totalRevenue) / completedOrders) 
            : 0;

          setAnalytics({
            period: analyticsPeriod,
            summary: {
              pageViews: pageViews,
              uniqueVisitors: summary.unique_visitors || 0,
              productViews: summary.total_product_views || 0,
              addToCarts: summary.add_to_cart || summary.checkout_started || 0,
              orders: completedOrders,
              revenue: summary.revenue || 0,
              averageOrderValue: summary.average_order_value || avgOrderVal,
              conversionRate: conversionRate,
            },
            funnel: {
              pageViews: pageViews,
              productViews: summary.total_product_views || 0,
              addToCarts: summary.add_to_cart || summary.checkout_started || 0,
              checkouts: summary.checkout_started || 0,
              orders: completedOrders,
            },
            topSources: summary.top_sources || [],
            topProducts: summary.top_products || [],
            topWilayas: summary.top_wilayas || [],
            topBuyingWilayas: summary.top_buying_wilayas || [],
            orderStatusCounts: summary.order_status_counts,
            deviceDetails: summary.device_details,
            peakHours: summary.peak_hours || [],
          });
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoadingAnalytics(false);
      }
    }
    fetchAnalytics();
  }, [isAuthenticated, analyticsPeriod, orders.length]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      router.push(`/${locale}/admin?key=${ADMIN_KEY}`);
    } else {
      setError('كلمة المرور غير صحيحة');
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
          <p className="text-gray-500 mb-6">أدخل كلمة المرور للوصول</p>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="كلمة مرور الإدارة"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-500"
            />
            <button
              onClick={handleLogin}
              className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition font-medium"
            >
              تسجيل الدخول
            </button>
          </div>
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        </div>
      </div>
    );
  }

  // Calculate stats from real data
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = orders.length;
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">لوحة التحكم</h1>
            <span className="text-xs text-gray-600 bg-green-100 text-green-800 px-2.5 py-1 rounded-full font-bold">
              ✅ مراقبة حية مباشرة
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Sound Toggle */}
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
              <span>{soundEnabled ? '🔔 التنبيه الصوتي مفعل' : '🔕 التنبيه مكتوم'}</span>
            </button>

            <Link
              href={`/${locale}`}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-xs font-medium bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              <span>المتجر</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Live New Order Alert Banner */}
        {newOrderAlert && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-sm shadow-xl flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔔</span>
              <span>{newOrderAlert}</span>
            </div>
            <button 
              onClick={() => setNewOrderAlert(null)}
              className="text-xs bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg"
            >
              إغلاق
            </button>
          </div>
        )}
        {/* Analytics Period Selector */}
        <div className="flex gap-2 mb-6">
          {[
            { value: '1d', label: 'اليوم' },
            { value: '7d', label: '7 أيام' },
            { value: '30d', label: '30 يوم' },
            { value: 'all', label: 'الكل' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setAnalyticsPeriod(value)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                analyticsPeriod === value
                  ? 'bg-brand-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Main Stats (6 Core KPIs) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {/* Revenue */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-bold">إجمالي الإيرادات</span>
              <span className="p-2 bg-green-50 text-green-600 rounded-xl">💰</span>
            </div>
            <p className="text-xl font-extrabold text-gray-900 mt-2">
              {loadingOrders ? '...' : `${totalRevenue.toLocaleString()} د.ج`}
            </p>
          </div>

          {/* Orders */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-bold">إجمالي الطلبات</span>
              <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">📦</span>
            </div>
            <p className="text-xl font-extrabold text-gray-900 mt-2">
              {loadingOrders ? '...' : totalOrders}
            </p>
          </div>

          {/* Average Order Value */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-bold">متوسط السلة (AOV)</span>
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">💳</span>
            </div>
            <p className="text-xl font-extrabold text-emerald-700 mt-2">
              {loadingAnalytics ? '...' : `${(analytics?.summary.averageOrderValue || 0).toLocaleString()} د.ج`}
            </p>
          </div>

          {/* Visitors */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-bold">الزوار الفريدون</span>
              <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">👥</span>
            </div>
            <p className="text-xl font-extrabold text-purple-700 mt-2">
              {loadingAnalytics ? '...' : (analytics?.summary.uniqueVisitors || 0).toLocaleString()}
            </p>
          </div>

          {/* Page Views */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-bold">مشاهدات الصفحات</span>
              <span className="p-2 bg-orange-50 text-orange-600 rounded-xl">👁️</span>
            </div>
            <p className="text-xl font-extrabold text-orange-700 mt-2">
              {loadingAnalytics ? '...' : (analytics?.summary.pageViews || 0).toLocaleString()}
            </p>
          </div>

          {/* Conversion Rate */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-bold">معدل التحويل (CR%)</span>
              <span className="p-2 bg-teal-50 text-teal-600 rounded-xl">🎯</span>
            </div>
            <p className="text-xl font-extrabold text-teal-700 mt-2">
              {loadingAnalytics ? '...' : analytics?.summary.conversionRate || '0%'}
            </p>
          </div>
        </div>

        {/* Conversion Funnel & Traffic Sources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Conversion Funnel */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-5 h-5" />
              مسار التحويل (Funnel)
            </h2>
            {loadingAnalytics ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-10 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: 'زيارات الصفحات', value: analytics?.funnel.pageViews || 0, color: 'bg-blue-500' },
                  { label: 'مشاهدات المنتجات', value: analytics?.funnel.productViews || 0, color: 'bg-purple-500' },
                  { label: 'إضافة للسلة', value: analytics?.funnel.addToCarts || 0, color: 'bg-orange-500' },
                  { label: 'بدء الطلب', value: analytics?.funnel.checkouts || 0, color: 'bg-yellow-500' },
                  { label: 'طلبات مكتملة', value: analytics?.funnel.orders || 0, color: 'bg-green-500' },
                ].map((step, idx) => {
                  const maxValue = analytics?.funnel.pageViews || 1;
                  const percentage = maxValue > 0 ? (step.value / maxValue) * 100 : 0;
                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{step.label}</span>
                        <span className="font-bold">{step.value}</span>
                      </div>
                      <div className="h-6 bg-gray-100 rounded-lg overflow-hidden">
                        <div
                          className={`h-full ${step.color} transition-all duration-500`}
                          style={{ width: `${Math.max(percentage, 2)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {analytics && analytics.summary.conversionRate && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg text-center">
                <span className="text-gray-600">معدل التحويل: </span>
                <span className="font-bold text-green-600">{analytics.summary.conversionRate}</span>
              </div>
            )}
          </div>

          {/* Traffic Sources & UTM Tracker */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <GlobeAltIcon className="w-5 h-5 text-brand-600" />
                  مصادر الزيارات وتتبع الإعلانات (UTM Tracking)
                </h2>
                <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-bold border border-blue-200">
                  مباشر من TikTok / Facebook / Google
                </span>
              </div>

              {loadingAnalytics ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : analytics?.topSources && analytics.topSources.length > 0 ? (
                <div className="space-y-3">
                  {analytics.topSources.map((source, idx) => {
                    const sourceIcons: Record<string, string> = {
                      facebook: '📘',
                      instagram: '📸',
                      tiktok: '🎵',
                      google: '🔍',
                      direct: '🔗',
                      referral: '🌐',
                    };
                    const sourceColors: Record<string, string> = {
                      facebook: 'bg-blue-500',
                      instagram: 'bg-pink-500',
                      tiktok: 'bg-black',
                      google: 'bg-red-500',
                      direct: 'bg-gray-600',
                      referral: 'bg-indigo-500',
                    };
                    const totalSourceVisits = analytics.topSources.reduce((sum, s) => sum + s.count, 0) || 1;
                    const percent = Math.round((source.count / totalSourceVisits) * 100);

                    return (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-2xl">{sourceIcons[source.source] || '🌐'}</span>
                        <div className="flex-1">
                          <div className="flex justify-between items-center text-sm font-bold">
                            <span className="text-gray-900 capitalize">
                              {source.source === 'tiktok' ? '🎵 إعلانات تيك توك (TikTok Ads)' :
                               source.source === 'facebook' ? '📘 إعلانات فيسبوك (Facebook Ads)' :
                               source.source === 'instagram' ? '📸 إنستغرام (Instagram Ads)' :
                               source.source === 'google' ? '🔍 إعلانات جوجل (Google Ads)' :
                               source.source === 'direct' ? '🔗 زيارات مباشرة (Direct Traffic)' : source.source}
                            </span>
                            <span className="text-brand-600 font-mono">{source.count} زيارة ({percent}%)</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${sourceColors[source.source] || 'bg-brand-500'} transition-all duration-500`}
                              style={{
                                width: `${Math.max(percent, 4)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <GlobeAltIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">لا توجد بيانات زيارات إعلانية مسجلة حتى الآن</p>
                </div>
              )}
            </div>

            {/* Interactive UTM Campaign Link Builder Tool (C4) */}
            <div className="pt-5 border-t border-gray-100 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                <span>🛠️</span>
                <span>مولّد روابط الإعلانات المتبوعة (UTM Campaign Link Builder)</span>
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                أنشئ رابط إعلان مخصص وضعه في TikTok Ads Manager أو Facebook Ads لمعرفة مصدر كل طلب بدقة:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
                <div>
                  <label className="text-[11px] text-gray-500 font-bold block mb-1">المنتج المستهدف:</label>
                  <select
                    value={utmProduct}
                    onChange={e => setUtmProduct(e.target.value)}
                    className="w-full text-xs font-medium px-2.5 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-brand-500"
                  >
                    {ALL_PRODUCTS.map(p => (
                      <option key={p.slug} value={p.slug}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-gray-500 font-bold block mb-1">منصة الإعلانات:</label>
                  <select
                    value={utmPlatform}
                    onChange={e => setUtmPlatform(e.target.value)}
                    className="w-full text-xs font-medium px-2.5 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="tiktok">🎵 TikTok Ads (تيك توك)</option>
                    <option value="facebook">📘 Facebook Ads (فيسبوك)</option>
                    <option value="instagram">📸 Instagram Ads (إنستغرام)</option>
                    <option value="google">🔍 Google Ads (جوجل)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-gray-500 font-bold block mb-1">اسم الحملة الإعلانية:</label>
                  <input
                    type="text"
                    value={utmCampaignName}
                    onChange={e => setUtmCampaignName(e.target.value)}
                    placeholder="مثال: campaign_pack_1"
                    className="w-full text-xs font-medium px-2.5 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Generated Link Box */}
              <div className="bg-white p-2.5 rounded-xl border border-blue-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] text-gray-400 block leading-none mb-1">الرابط المتبع الجاهز للنسخ:</span>
                  <p className="text-xs font-mono text-brand-700 truncate select-all">{getGeneratedUtmLink()}</p>
                </div>
                <button
                  onClick={copyUtmLink}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 ${
                    utmCopied 
                      ? 'bg-green-600 text-white' 
                      : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
                  }`}
                >
                  <span>{utmCopied ? '✅ تم النسخ بنجاح' : '📋 نسخ الرابط'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Status & Peak Activity & Device Breakdown (Enterprise Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Live Delivery Status Breakdown */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span>🚚</span>
              <span>توزيع حالات الطلبات والشحن</span>
            </h2>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-yellow-50 rounded-xl border border-yellow-200">
                <span className="font-bold text-yellow-800">📦 طلبات جديدة / قيد الانتظار</span>
                <span className="font-extrabold text-sm text-yellow-900 font-mono">
                  {analytics?.orderStatusCounts?.new ?? orders.filter(o => o.status === 'new' || o.status === 'pending').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-purple-50 rounded-xl border border-purple-200">
                <span className="font-bold text-purple-800">🚚 قيد الشحن مع EasyAndSpeed</span>
                <span className="font-extrabold text-sm text-purple-900 font-mono">
                  {analytics?.orderStatusCounts?.shipped ?? orders.filter(o => o.status === 'shipped').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-green-50 rounded-xl border border-green-200">
                <span className="font-bold text-green-800">✅ تم التسليم بنجاح</span>
                <span className="font-extrabold text-sm text-green-900 font-mono">
                  {analytics?.orderStatusCounts?.delivered ?? orders.filter(o => o.status === 'delivered').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-red-50 rounded-xl border border-red-200">
                <span className="font-bold text-red-800">❌ ملغية</span>
                <span className="font-extrabold text-sm text-red-900 font-mono">
                  {analytics?.orderStatusCounts?.cancelled ?? orders.filter(o => o.status === 'cancelled').length}
                </span>
              </div>
            </div>
          </div>

          {/* Peak Shopping Hours */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span>⚡</span>
              <span>ساعات الذروة والطلب (أفضل أوقات الإعلانات)</span>
            </h2>
            {analytics?.peakHours && analytics.peakHours.length > 0 ? (
              <div className="space-y-2.5 text-xs">
                {analytics.peakHours.map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="font-bold text-gray-800 flex items-center gap-2">
                      <span className="text-[11px] bg-brand-100 text-brand-700 px-2 py-0.5 rounded-md font-mono">#{i + 1}</span>
                      <span>الساعة {h.hour}</span>
                    </span>
                    <span className="font-bold text-brand-600 font-mono">{h.count} تفاعل</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 py-4 text-center">جاري جمع بيانات ساعات النشاط...</p>
            )}
          </div>

          {/* Device Intelligence Breakdown */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span>📱</span>
              <span>أجهزة ومتصفحات الزوار</span>
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>🤖 أجهزة Android (هواتف)</span>
                  <span className="text-green-600 font-mono">{analytics?.deviceDetails?.android || 0}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full" 
                    style={{ width: `${Math.min(100, Math.max(10, ((analytics?.deviceDetails?.android || 1) / Math.max(1, analytics?.summary.pageViews || 1)) * 100))}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>🍎 أجهزة iPhone / iOS</span>
                  <span className="text-gray-900 font-mono">{analytics?.deviceDetails?.iphone || 0}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gray-800 rounded-full" 
                    style={{ width: `${Math.min(100, Math.max(10, ((analytics?.deviceDetails?.iphone || 1) / Math.max(1, analytics?.summary.pageViews || 1)) * 100))}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>💻 أجهزة الكمبيوتر (Windows / Mac)</span>
                  <span className="text-blue-600 font-mono">{((analytics?.deviceDetails?.windows || 0) + (analytics?.deviceDetails?.mac || 0))}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${Math.min(100, Math.max(10, (((analytics?.deviceDetails?.windows || 0) + (analytics?.deviceDetails?.mac || 0)) / Math.max(1, analytics?.summary.pageViews || 1)) * 100))}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products & Top Wilayas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Top Products Viewed */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">🔥 أكثر المنتجات مشاهدة</h2>
            {loadingAnalytics ? (
              <div className="animate-pulse space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : analytics?.topProducts && analytics.topProducts.length > 0 ? (
              <div className="space-y-2.5">
                {analytics.topProducts.map((product, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-sm text-gray-900">{product.name}</span>
                    </div>
                    <span className="font-extrabold text-sm text-brand-600 font-mono">{product.views} مشاهدة</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500 text-sm">لا توجد مشاهدات بعد</p>
            )}
          </div>

          {/* Top Wilayas (Geographic Intelligence) */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🗺️</span>
              <span>أكثر الولايات نشاطاً ودخولاً (Algeria Geo-Tracking)</span>
            </h2>
            {loadingAnalytics ? (
              <div className="animate-pulse space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : analytics?.topWilayas && analytics.topWilayas.length > 0 ? (
              <div className="space-y-2.5">
                {analytics.topWilayas.map((wilaya, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-gray-900 flex items-center gap-2">
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-mono">#{idx + 1}</span>
                        <span>{wilaya.name}</span>
                      </span>
                      <span className="text-emerald-700 font-mono text-xs">{wilaya.count} زيارة ({wilaya.percentage}%)</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${Math.max(wilaya.percentage, 5)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 text-sm">
                <p>جاري تسجيل مواقع ومدن الزوار عبر الـ IP...</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">📦 أحدث الطلبات</h2>
            <Link
              href={`/${locale}/admin/orders?key=${ADMIN_KEY}`}
              className="text-brand-500 text-sm hover:underline"
            >
              عرض الكل
            </Link>
          </div>
          {loadingOrders ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">رقم الطلب</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">العميل</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">المجموع</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium">{order.id}</td>
                      <td className="py-3 px-4">{order.customer_name}</td>
                      <td className="py-3 px-4">{order.total?.toLocaleString()} د.ج</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          order.status === 'delivered' || order.status === 'تم التوصيل'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'new' || order.status === 'جديد'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCartIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>لا توجد طلبات بعد</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href={`/${locale}/admin/products?key=${ADMIN_KEY}`}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center">
              <CubeIcon className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">إدارة المنتجات</h3>
              <p className="text-sm text-gray-500">{ALL_PRODUCTS.length} منتج</p>
            </div>
          </Link>

          <Link
            href={`/${locale}/admin/orders?key=${ADMIN_KEY}`}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <ShoppingCartIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">إدارة الطلبات</h3>
              <p className="text-sm text-gray-500">{totalOrders} طلب</p>
            </div>
          </Link>

          <Link
            href={`/${locale}/admin/settings?key=${ADMIN_KEY}`}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Cog6ToothIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">إعدادات المتجر</h3>
              <p className="text-sm text-gray-500">الإعدادات العامة</p>
            </div>
          </Link>

          <Link
            href={`/${locale}/admin/logs?key=${ADMIN_KEY}`}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">📊 سجلات الزوار</h3>
              <p className="text-sm text-gray-500">تتبع وتحليل السلوك</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage({ params }: PageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full"></div>
      </div>
    }>
      <AdminContent params={params} />
    </Suspense>
  );
}
