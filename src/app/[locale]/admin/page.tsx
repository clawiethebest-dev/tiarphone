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

const ADMIN_KEY = 'tiar2024';
const ADMIN_PASSWORD = 'naza2024';

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
  const [analyticsPeriod, setAnalyticsPeriod] = useState('7d');

  useEffect(() => {
    params.then(p => setLocale(p.locale));
  }, [params]);

  useEffect(() => {
    const key = searchParams.get('key');
    if (key === ADMIN_KEY) {
      setIsAuthenticated(true);
    }
  }, [searchParams]);

  // Fetch orders
  useEffect(() => {
    if (!isAuthenticated) return;
    
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (data.success) {
          setOrders(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoadingOrders(false);
      }
    }
    fetchOrders();
  }, [isAuthenticated]);

  // Fetch analytics
  useEffect(() => {
    if (!isAuthenticated) return;
    
    async function fetchAnalytics() {
      setLoadingAnalytics(true);
      try {
        const res = await fetch(`/api/analytics?period=${analyticsPeriod}&type=summary`);
        const data = await res.json();
        if (data.success) {
          setAnalytics(data.data);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoadingAnalytics(false);
      }
    }
    fetchAnalytics();
  }, [isAuthenticated, analyticsPeriod]);

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
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">لوحة التحكم</h1>
            <span className="text-sm text-gray-500 bg-green-100 text-green-700 px-2 py-1 rounded-full">
              ✅ بيانات حقيقية
            </span>
          </div>
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span>تسجيل الخروج</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
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

        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Revenue */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {loadingOrders ? '...' : `${totalRevenue.toLocaleString()} د.ج`}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {loadingOrders ? '...' : totalOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingCartIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Visitors */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">الزوار</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {loadingAnalytics ? '...' : analytics?.summary.uniqueVisitors || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Page Views */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">مشاهدات الصفحات</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {loadingAnalytics ? '...' : analytics?.summary.pageViews || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <EyeIcon className="w-6 h-6 text-orange-600" />
              </div>
            </div>
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

          {/* Traffic Sources */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <GlobeAltIcon className="w-5 h-5" />
              مصادر الزيارات
            </h2>
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
                  };
                  const sourceColors: Record<string, string> = {
                    facebook: 'bg-blue-500',
                    instagram: 'bg-pink-500',
                    tiktok: 'bg-black',
                    google: 'bg-red-500',
                    direct: 'bg-gray-500',
                  };
                  return (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-2xl">{sourceIcons[source.source] || '🌐'}</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 capitalize">{source.source}</p>
                        <div className="h-2 bg-gray-200 rounded-full mt-1">
                          <div
                            className={`h-full rounded-full ${sourceColors[source.source] || 'bg-brand-500'}`}
                            style={{
                              width: `${(source.count / (analytics.topSources[0]?.count || 1)) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <span className="font-bold text-gray-700">{source.count}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <GlobeAltIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>لا توجد بيانات بعد</p>
                <p className="text-sm mt-1">استخدم UTM parameters في روابط الإعلانات</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products Viewed */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🔥 أكثر المنتجات مشاهدة</h2>
          {loadingAnalytics ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : analytics?.topProducts && analytics.topProducts.length > 0 ? (
            <div className="space-y-2">
              {analytics.topProducts.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-medium">{product.name}</span>
                  </div>
                  <span className="font-bold text-gray-600">{product.views} مشاهدة</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-gray-500">لا توجد مشاهدات بعد</p>
          )}
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
