'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, CheckIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const ADMIN_KEY = 'tiar2024';

interface PageProps {
  params: Promise<{ locale: string }>;
}

function SettingsContent({ params }: PageProps) {
  const searchParams = useSearchParams();
  const [locale, setLocale] = useState('ar');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'store' | 'social' | 'pixels' | 'delivery' | 'payment'>('store');

  // Settings state
  const [settings, setSettings] = useState({
    storeName: 'Tiar Boutique',
    phone: '0562983259',
    email: 'tiarnour082@gmail.com',
    address: 'Algérie',
    adminPassword: '5',
    instagram: 'instagram.com/tiar.boutique07?igsh=MTduNTEwcjJybTVwMw==',
    tiktok: 'www.tiktok.com/@tiarmohamed07?_r=1&_t=ZS-98E3r9rLckH',
    facebook: 'https://www.facebook.com/share/1EZuNXHhTC',
    whatsapp: 'https://wa.me/213562983259',
    telegram: '',
    youtube: '',
    cashOnDelivery: true,
    algeriaOnly: true,
  });

  // Multiple Pixels state
  const [pixels, setPixels] = useState({
    facebook: [''],
    tiktok: [''],
    google: [''],
    snapchat: [''],
    twitter: [''],
  });

  // EasyAndSpeed API settings (from Biskra - official pricing Aug 2026)
  const [deliverySettings, setDeliverySettings] = useState({
    apiId: '43111994324492430728',
    apiToken: 'MQ0W3Zz4xgbuAdeHU9tfFTOyaLKvDVicGl7IrpqEYCBm2ko61wS8J5nRjhPsNX',
    zone0Home: 500,   // Biskra
    zone0Desk: 450,
    zone1Home: 600,   // Batna, M'Sila, Khenchela
    zone1Desk: 550,
    zone2Home: 800,   // Alger, Blida, etc.
    zone2Desk: 750,
    zone3Home: 950,   // Oran, Tlemcen, etc.
    zone3Desk: 900,
    zone4Home: 1750,  // Tamanrasset, etc.
    zone4Desk: 1650,
  });
  const [showApiToken, setShowApiToken] = useState(false);

  useEffect(() => {
    params.then(p => setLocale(p.locale));
  }, [params]);

  useEffect(() => {
    const key = searchParams.get('key');
    if (key === ADMIN_KEY) {
      setIsAuthenticated(true);
      // Load delivery settings
      fetch('/api/settings/delivery')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setDeliverySettings(data.data);
          }
        })
        .catch(err => console.error('Error loading delivery settings:', err));
    }
  }, [searchParams]);

  // Add new pixel ID
  const addPixel = (platform: keyof typeof pixels) => {
    setPixels(prev => ({
      ...prev,
      [platform]: [...prev[platform], ''],
    }));
  };

  // Remove pixel ID
  const removePixel = (platform: keyof typeof pixels, index: number) => {
    setPixels(prev => ({
      ...prev,
      [platform]: prev[platform].filter((_, i) => i !== index),
    }));
  };

  // Update pixel ID
  const updatePixel = (platform: keyof typeof pixels, index: number, value: string) => {
    setPixels(prev => ({
      ...prev,
      [platform]: prev[platform].map((v, i) => i === index ? value : v),
    }));
  };

  const handleSave = async () => {
    // In production, save to database/API
    console.log('Saving settings:', settings);
    console.log('Saving pixels:', pixels);
    console.log('Saving delivery settings:', deliverySettings);
    
    // Save delivery settings to API
    try {
      await fetch('/api/settings/delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deliverySettings),
      });
    } catch (error) {
      console.error('Error saving delivery settings:', error);
    }
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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

  const pixelPlatforms = [
    { key: 'facebook' as const, name: 'Facebook/Meta Pixel', icon: '📘', placeholder: '123456789012345' },
    { key: 'tiktok' as const, name: 'TikTok Pixel', icon: '🎵', placeholder: 'XXXXXXXXXXXXXXXX' },
    { key: 'google' as const, name: 'Google Ads', icon: '🔍', placeholder: 'AW-XXXXXXXXX' },
    { key: 'snapchat' as const, name: 'Snapchat Pixel', icon: '👻', placeholder: 'xxxxxxxx-xxxx-xxxx' },
    { key: 'twitter' as const, name: 'Twitter/X Pixel', icon: '🐦', placeholder: 'xxxxx' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}/admin?key=${ADMIN_KEY}`}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">إعدادات المتجر</h1>
          </div>
          <button
            onClick={handleSave}
            className={`px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              saved 
                ? 'bg-green-500 text-white' 
                : 'bg-brand-500 text-white hover:bg-brand-600'
            }`}
          >
            {saved ? (
              <>
                <CheckIcon className="w-5 h-5" />
                تم الحفظ
              </>
            ) : (
              'حفظ التغييرات'
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'store', label: '🏪 المتجر' },
              { id: 'social', label: '📱 التواصل' },
              { id: 'pixels', label: '📊 البيكسلات' },
              { id: 'delivery', label: '🚚 التوصيل' },
              { id: 'payment', label: '💳 الدفع' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition border-b-2 ${
                  activeTab === tab.id
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Store Settings Tab */}
        {activeTab === 'store' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">إعدادات المتجر</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">اسم المتجر</label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => setSettings({...settings, storeName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">هاتف المتجر</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({...settings, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({...settings, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">عنوان المتجر</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings({...settings, address: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Social Links Tab */}
        {activeTab === 'social' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">روابط التواصل الاجتماعي</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">📸 Instagram</label>
                <input
                  type="text"
                  value={settings.instagram}
                  onChange={(e) => setSettings({...settings, instagram: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">🎵 TikTok</label>
                <input
                  type="text"
                  value={settings.tiktok}
                  onChange={(e) => setSettings({...settings, tiktok: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">📘 Facebook</label>
                <input
                  type="text"
                  value={settings.facebook}
                  onChange={(e) => setSettings({...settings, facebook: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">💬 WhatsApp</label>
                <input
                  type="text"
                  value={settings.whatsapp}
                  onChange={(e) => setSettings({...settings, whatsapp: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">✈️ Telegram</label>
                <input
                  type="text"
                  value={settings.telegram}
                  onChange={(e) => setSettings({...settings, telegram: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500"
                  placeholder="https://t.me/..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">📺 YouTube</label>
                <input
                  type="text"
                  value={settings.youtube}
                  onChange={(e) => setSettings({...settings, youtube: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500"
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Pixels Tab */}
        {activeTab === 'pixels' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-bold text-blue-800 mb-2">📊 بيكسلات التتبع</h3>
              <p className="text-blue-700 text-sm">
                أضف معرفات البيكسل لكل منصة لتتبع التحويلات. يمكنك إضافة عدة معرفات لكل منصة.
              </p>
            </div>

            {pixelPlatforms.map(platform => (
              <div key={platform.key} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span>{platform.icon}</span>
                    {platform.name}
                  </h2>
                  <button
                    onClick={() => addPixel(platform.key)}
                    className="flex items-center gap-1 text-brand-500 hover:text-brand-600 text-sm font-medium"
                  >
                    <PlusIcon className="w-4 h-4" />
                    إضافة معرف
                  </button>
                </div>
                
                <div className="space-y-3">
                  {pixels[platform.key].map((pixelId, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={pixelId}
                        onChange={(e) => updatePixel(platform.key, index, e.target.value)}
                        placeholder={platform.placeholder}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500 font-mono text-sm"
                      />
                      {pixels[platform.key].length > 1 && (
                        <button
                          onClick={() => removePixel(platform.key, index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {platform.key === 'facebook' && (
                  <p className="text-xs text-gray-500 mt-3">
                    💡 تجد Pixel ID في Facebook Events Manager → Data Sources → Your Pixel
                  </p>
                )}
                {platform.key === 'tiktok' && (
                  <p className="text-xs text-gray-500 mt-3">
                    💡 تجد Pixel ID في TikTok Ads Manager → Assets → Events → Web Events
                  </p>
                )}
                {platform.key === 'google' && (
                  <p className="text-xs text-gray-500 mt-3">
                    💡 تجد Conversion ID في Google Ads → Tools → Conversions (يبدأ بـ AW-)
                  </p>
                )}
              </div>
            ))}

            {/* Events Tracked */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">📈 الأحداث المتتبعة</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { event: 'PageView', desc: 'مشاهدة الصفحة' },
                  { event: 'ViewContent', desc: 'مشاهدة المنتج' },
                  { event: 'AddToCart', desc: 'إضافة للسلة' },
                  { event: 'InitiateCheckout', desc: 'بدء الطلب' },
                  { event: 'Purchase', desc: 'إتمام الشراء' },
                  { event: 'Lead', desc: 'عميل محتمل' },
                  { event: 'Search', desc: 'بحث' },
                ].map(item => (
                  <div key={item.event} className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <p className="font-mono text-xs text-green-700">{item.event}</p>
                    <p className="text-xs text-green-600 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Delivery Tab */}
        {activeTab === 'delivery' && (
          <div className="space-y-6">
            {/* EasyAndSpeed API */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🚚</span>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">EasyAndSpeed API</h2>
                  <p className="text-sm text-gray-500">إعدادات الربط مع شركة التوصيل</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">API ID</label>
                  <input
                    type="text"
                    value={deliverySettings.apiId}
                    onChange={(e) => setDeliverySettings({...deliverySettings, apiId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500 font-mono text-sm"
                    placeholder="43111994324492430728"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">API Token</label>
                  <div className="flex gap-2">
                    <input
                      type={showApiToken ? 'text' : 'password'}
                      value={deliverySettings.apiToken}
                      onChange={(e) => setDeliverySettings({...deliverySettings, apiToken: e.target.value})}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500 font-mono text-sm"
                      placeholder="MQ0W3Z...PsNX"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiToken(!showApiToken)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition"
                    >
                      {showApiToken ? '🔒 إخفاء' : '👁️ إظهار'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 تجد API ID و Token في لوحة تحكم EasyAndSpeed → الإعدادات → API
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Fees */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">💰 أسعار التوصيل (من بسكرة)</h2>
              <p className="text-sm text-gray-500 mb-4">الأسعار الرسمية من EasyAndSpeed - أوت 2026</p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-right">المنطقة</th>
                      <th className="px-3 py-2 text-center">الولايات</th>
                      <th className="px-3 py-2 text-center">باب المنزل</th>
                      <th className="px-3 py-2 text-center">المكتب</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b bg-green-50">
                      <td className="px-3 py-2 font-medium">Zone 0</td>
                      <td className="px-3 py-2 text-center text-gray-600 text-xs">بسكرة (محلي)</td>
                      <td className="px-3 py-2 text-center">
                        <input type="number" value={deliverySettings.zone0Home} onChange={(e) => setDeliverySettings({...deliverySettings, zone0Home: Number(e.target.value)})} className="w-16 px-1 py-1 border border-gray-200 rounded text-center text-sm" />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input type="number" value={deliverySettings.zone0Desk} onChange={(e) => setDeliverySettings({...deliverySettings, zone0Desk: Number(e.target.value)})} className="w-16 px-1 py-1 border border-gray-200 rounded text-center text-sm" />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-3 py-2 font-medium">Zone 1</td>
                      <td className="px-3 py-2 text-center text-gray-500 text-xs">باتنة، مسيلة، خنشلة</td>
                      <td className="px-3 py-2 text-center">
                        <input type="number" value={deliverySettings.zone1Home} onChange={(e) => setDeliverySettings({...deliverySettings, zone1Home: Number(e.target.value)})} className="w-16 px-1 py-1 border border-gray-200 rounded text-center text-sm" />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input type="number" value={deliverySettings.zone1Desk} onChange={(e) => setDeliverySettings({...deliverySettings, zone1Desk: Number(e.target.value)})} className="w-16 px-1 py-1 border border-gray-200 rounded text-center text-sm" />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-3 py-2 font-medium">Zone 2</td>
                      <td className="px-3 py-2 text-center text-gray-500 text-xs">الجزائر، البليدة، بجاية، قسنطينة...</td>
                      <td className="px-3 py-2 text-center">
                        <input type="number" value={deliverySettings.zone2Home} onChange={(e) => setDeliverySettings({...deliverySettings, zone2Home: Number(e.target.value)})} className="w-16 px-1 py-1 border border-gray-200 rounded text-center text-sm" />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input type="number" value={deliverySettings.zone2Desk} onChange={(e) => setDeliverySettings({...deliverySettings, zone2Desk: Number(e.target.value)})} className="w-16 px-1 py-1 border border-gray-200 rounded text-center text-sm" />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-3 py-2 font-medium">Zone 3</td>
                      <td className="px-3 py-2 text-center text-gray-500 text-xs">وهران، تلمسان، الشلف، أدرار...</td>
                      <td className="px-3 py-2 text-center">
                        <input type="number" value={deliverySettings.zone3Home} onChange={(e) => setDeliverySettings({...deliverySettings, zone3Home: Number(e.target.value)})} className="w-16 px-1 py-1 border border-gray-200 rounded text-center text-sm" />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input type="number" value={deliverySettings.zone3Desk} onChange={(e) => setDeliverySettings({...deliverySettings, zone3Desk: Number(e.target.value)})} className="w-16 px-1 py-1 border border-gray-200 rounded text-center text-sm" />
                      </td>
                    </tr>
                    <tr className="bg-red-50">
                      <td className="px-3 py-2 font-medium">Zone 4</td>
                      <td className="px-3 py-2 text-center text-gray-600 text-xs">تمنراست، إليزي، جانت...</td>
                      <td className="px-3 py-2 text-center">
                        <input type="number" value={deliverySettings.zone4Home} onChange={(e) => setDeliverySettings({...deliverySettings, zone4Home: Number(e.target.value)})} className="w-16 px-1 py-1 border border-gray-200 rounded text-center text-sm" />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input type="number" value={deliverySettings.zone4Desk} onChange={(e) => setDeliverySettings({...deliverySettings, zone4Desk: Number(e.target.value)})} className="w-16 px-1 py-1 border border-gray-200 rounded text-center text-sm" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ تأكد من مطابقة الأسعار مع لوحة تحكم EasyAndSpeed لتجنب الخسائر
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Tab */}
        {activeTab === 'payment' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">إعدادات الدفع</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.cashOnDelivery}
                  onChange={(e) => setSettings({...settings, cashOnDelivery: e.target.checked})}
                  className="w-5 h-5 text-brand-500 rounded"
                />
                <div>
                  <p className="font-medium text-gray-900">💵 الدفع عند الاستلام</p>
                  <p className="text-sm text-gray-500">السماح للعملاء بالدفع نقداً عند استلام الطلب</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.algeriaOnly}
                  onChange={(e) => setSettings({...settings, algeriaOnly: e.target.checked})}
                  className="w-5 h-5 text-brand-500 rounded"
                />
                <div>
                  <p className="font-medium text-gray-900">🇩🇿 الجزائر فقط</p>
                  <p className="text-sm text-gray-500">التوصيل متاح فقط داخل الجزائر</p>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage({ params }: PageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full"></div>
      </div>
    }>
      <SettingsContent params={params} />
    </Suspense>
  );
}
