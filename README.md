# Tiar Boutique - طيار بوتيك

متجر إلكتروني جزائري للهواتف الذكية وإكسسواراتها.

## 🚀 البدء السريع

```bash
# تثبيت الحزم
npm install

# نسخ ملف البيئة
cp .env.example .env

# تشغيل المشروع
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) في متصفحك.

## 📁 هيكل المشروع

```
tiarphone-recovered/
├── public/                    # الملفات الثابتة
├── src/
│   ├── app/                   # صفحات Next.js App Router
│   │   ├── [locale]/          # صفحات مترجمة (ar/fr/en)
│   │   │   ├── page.tsx       # الصفحة الرئيسية
│   │   │   ├── products/      # صفحة المنتجات
│   │   │   └── cart/          # صفحة السلة
│   │   ├── layout.tsx         # التخطيط الرئيسي
│   │   └── globals.css        # الأنماط العامة
│   ├── components/            # المكونات
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   └── ...
│   ├── lib/                   # المكتبات والأدوات
│   │   ├── supabase.ts        # اتصال Supabase
│   │   ├── api.ts             # استدعاءات API
│   │   ├── cart.ts            # إدارة السلة (Zustand)
│   │   └── utils.ts           # دوال مساعدة
│   ├── i18n/                  # الترجمة (next-intl)
│   │   ├── messages/          # ملفات الترجمة
│   │   │   ├── ar.json
│   │   │   ├── fr.json
│   │   │   └── en.json
│   │   ├── config.ts
│   │   ├── request.ts
│   │   └── routing.ts
│   └── types/                 # TypeScript types
│       └── index.ts
├── tailwind.config.js         # إعدادات Tailwind
├── next.config.js             # إعدادات Next.js
├── package.json
└── tsconfig.json
```

## 🔧 التقنيات المستخدمة

- **Next.js 15** - إطار عمل React
- **React 19** - مكتبة واجهة المستخدم
- **TypeScript** - للكتابة الآمنة
- **Tailwind CSS 3.4** - للتنسيق
- **Supabase** - قاعدة البيانات والتخزين
- **next-intl** - الترجمة متعددة اللغات
- **Zustand** - إدارة حالة السلة
- **Heroicons** - الأيقونات

## 🌍 اللغات المدعومة

- 🇩🇿 العربية (ar) - الافتراضية، RTL
- 🇫🇷 الفرنسية (fr)
- 🇬🇧 الإنجليزية (en)

## 🎨 الألوان

الموقع يستخدم لوحة `brand` (teal):
- brand-500: `#14B8A6`
- brand-600: `#0D9488`
- brand-700: `#0F766E`

## 📦 قاعدة البيانات (Supabase)

### جداول مطلوبة:

1. **products** - المنتجات
2. **orders** - الطلبات
3. **settings** - إعدادات المتجر
4. **coupons** - كوبونات الخصم

### Storage Buckets:

- `products` - صور المنتجات

## 🔗 روابط API (Supabase)

- URL: `https://wlyizmzzapmtwdrvmsff.supabase.co`
- Storage: `${URL}/storage/v1/object/public/products/hd/`

## 📱 الميزات

- ✅ عرض المنتجات مع التصفية والبحث
- ✅ صفحة تفاصيل المنتج
- ✅ سلة التسوق (Zustand + localStorage)
- ✅ نموذج الطلب مع اختيار الولاية
- ✅ حساب تكلفة التوصيل حسب الولاية
- ✅ دعم متعدد اللغات (ar/fr/en)
- ✅ تصميم متجاوب (responsive)
- ✅ دعم RTL للعربية

## 📄 الملفات المستعادة vs المعاد بناؤها

### ✅ مستعادة بالكامل:
- CSS والأنماط
- ألوان العلامة التجارية
- هيكل الصفحات والمسارات
- النصوص والترجمات
- روابط الصور من Supabase
- روابط التواصل الاجتماعي
- قائمة الولايات وتكاليف التوصيل

### 🔄 معاد بناؤها (من DOM/سلوك الموقع):
- مكونات React
- منطق السلة
- نماذج الطلب
- إعدادات API

## 📞 معلومات الاتصال

- الهاتف: +213 540 000 000
- البريد: contact@tiarboutique.dz
- Instagram: [@tiar.boutique07](https://www.instagram.com/tiar.boutique07)
- TikTok: [@tiarmohamed07](https://www.tiktok.com/@tiarmohamed07)
- Facebook: [Tiar Boutique](https://www.facebook.com/share/1EZuNXHhTC/)

---

تم استرجاع وإعادة بناء هذا المشروع من الموقع المنشور على Vercel.
