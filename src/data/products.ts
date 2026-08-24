import type { Product } from '@/types';

export const ALL_PRODUCTS: Product[] = [
  {
    id: '1',
    slug: 'pack-infinix-smart10',
    name: '📦 باك Infinix Smart 10',
    description: '📱 هاتف Infinix Smart 10 + ساعة Y36 Ultra3 + سماعات Hishell + Dunth V5.0!',
    longDescription: `## 📱 Infinix Smart 10
هاتف ذكي بأداء ممتاز وبطارية قوية 💪
- شاشة 6.6 بوصة HD+
- كاميرا 13MP
- بطارية 5000mAh

## ⌚ Y36 Ultra3 Smartwatch
ساعة ذكية بشاشة **2.3 بوصة** كبيرة 🔥
- **6 أساور** مختلفة الألوان
- مقاومة للماء
- متابعة النشاط والصحة
- استقبال المكالمات والإشعارات

## 🎧 Hishell True Wireless
سماعات لاسلكية بتصميم أنيق 💎
- علبة شفافة رائعة
- صوت HiFi نقي
- بلوتوث 5.0

## 🎵 Dunth V5.0
سماعات لاسلكية سوداء 🎶
- شاشة LED رقمية
- Auto Connection
- علبة شحن شفافة

---

✨ **باك كامل بسعر خيالي!**

🚚 **توصيل سريع لجميع الولايات**
💯 **ضمان 6 أشهر على جميع المنتجات**`,
    price: 22000,
    originalPrice: 26000,
    category: 'packets',
    images: [
      'https://yibtnsivqbdjlecwgfwx.supabase.co/storage/v1/object/public/products/products/pack-infinix-smart10/main.jpg',
      'https://yibtnsivqbdjlecwgfwx.supabase.co/storage/v1/object/public/products/products/pack-infinix-smart10/infinix.jpg',
      'https://yibtnsivqbdjlecwgfwx.supabase.co/storage/v1/object/public/products/products/pack-infinix-smart10/watch.jpg',
      'https://yibtnsivqbdjlecwgfwx.supabase.co/storage/v1/object/public/products/products/pack-infinix-smart10/dunth.jpg',
      'https://yibtnsivqbdjlecwgfwx.supabase.co/storage/v1/object/public/products/products/pack-infinix-smart10/hishell.jpg',
      'https://yibtnsivqbdjlecwgfwx.supabase.co/storage/v1/object/public/products/products/pack-infinix-smart10/box1.jpg',
      'https://yibtnsivqbdjlecwgfwx.supabase.co/storage/v1/object/public/products/products/pack-infinix-smart10/box2.jpg',
    ],
    specifications: {
      'Infinix Smart 10': 'هاتف 6.6" - 5000mAh',
      'Y36 Ultra3': 'ساعة ذكية 2.3" + 6 أساور',
      'Hishell TWS': 'سماعات HiFi - علبة شفافة',
      'Dunth V5.0': 'سماعات بلوتوث - شاشة LED',
      'الضمان': '6 أشهر على جميع المنتجات',
    },
    inStock: true,
    stock: 50,
    featured: true,
    deal: true,
    rating: 5,
    reviewsCount: 35,
  },
  {
    id: '2',
    slug: 'pack-itel-a50-ultimate',
    name: '📦 باك itel A50 Ultimate',
    description: '📱 هاتف itel A50 4G + ماكينة حلاقة + مكنسة + باور بانك + شاحن + حامل سيارة!',
    longDescription: `## 📱 itel A50 4G
هاتف ذكي بشاشة **6.6 بوصة** وذاكرة **8GB RAM + 128GB** 💪

## 🪒 Kemei 5in1
ماكينة حلاقة متعددة الاستخدامات ✂️
- حلاقة الشعر
- تشذيب اللحية
- تنظيف الأنف والأذن

## 🧹 ZMW 11
مكنسة كهربائية محمولة **120W** قوية 🔥
- شفط قوي
- بطارية قابلة للشحن
- مثالية للسيارة والمنزل

## 🔋 Bovo D40
باور بانك **10000mAh** للشحن أثناء التنقل ⚡
- شحن سريع
- منفذين USB

## 🔌 Bovo G1
شاحن سريع لجميع الأجهزة 🔋

## 🚗 حامل هاتف للسيارة 360°
تثبيت محكم ودوران كامل 📱

---

✨ **كل ما تحتاجه في باك واحد بسعر خيالي!**

🚚 **توصيل سريع لجميع الولايات**
💯 **ضمان على جميع المنتجات**`,
    price: 24900,
    originalPrice: 29000,
    category: 'packets',
    images: [
      '/images/products/pack-itel-a50/1-pack-complete.jpg',
      '/images/products/pack-itel-a50/2-phone-a50.jpg',
      '/images/products/pack-itel-a50/3-gevo-g1.jpg',
      '/images/products/pack-itel-a50/4-powerbank.jpg',
      '/images/products/pack-itel-a50/5-kemei.jpg',
      '/images/products/pack-itel-a50/6-stand.jpg',
      '/images/products/pack-itel-a50/7-vacuum.jpg',
      '/images/products/pack-itel-a50/8-vacuum-uses.jpg',
    ],
    specifications: {
      'itel A50 4G': '8GB RAM + 128GB - شاشة 6.6"',
      'Kemei 5in1': 'ماكينة حلاقة متعددة الاستخدامات',
      'ZMW 11': 'مكنسة كهربائية محمولة 120W',
      'Bovo D40': 'باور بانك 10000mAh',
      'Bovo G1': 'شاحن سريع',
      'حامل سيارة': 'دوران 360° - تثبيت قوي',
      'الضمان': 'على جميع المنتجات',
    },
    inStock: true,
    stock: 50,
    featured: true,
    deal: true,
    rating: 5,
    reviewsCount: 47,
  },
  {
    id: '3',
    slug: 'pack-tech-ultimate',
    name: '📦 باك التكنولوجيا المتكامل',
    description: '📱 كل ما تحتاجه في مكان واحد!',
    longDescription: `## ⚡ باور بانك
شحن سريع وقوة تدوم معك طول اليوم

## 🎵 سماعات وسبيكر
صوت نقي وقوي للاستمتاع بالموسيقى 🎶

## 📲 هواتف ذكية وأساسية
اختيارات متنوعة تناسب جميع الاحتياجات 📞

## ⌚ ساعات ذكية
تابع نشاطك وصحتك بسهولة 💪

## 💧 حافظات مقاومة للماء
حماية لهاتفك في كل الظروف 🌊

## 🔌 شواحن وكابلات
جودة عالية وشحن آمن 🔋

## 🛡️ لواصق حماية الشاشة
حماية قوية ضد الخدوش والصدمات 🧼

---

✨ **جودة عالية** | **أسعار مناسبة** | **ضمان على المنتجات**

🚚 **توصيل سريع لجميع الولايات**`,
    price: 20650,
    originalPrice: 25000,
    category: 'packets',
    images: [
      '/packs/pack-tech-main.jpg',
      '/packs/pack-tech-8.png',
      '/packs/pack-tech-2.jpg',
      '/packs/pack-tech-4.jpg',
      '/packs/pack-tech-1.png',
      '/packs/pack-tech-6.jpg',
      '/packs/pack-tech-5.jpg',
    ],
    specifications: {
      'باور بانك': 'Hoco J101 - 10000mAh - 22.5W',
      'سماعة بلوتوث': 'صوت قوي ونقي',
      'هواتف': 'عادية وذكية',
      'ساعة ذكية': 'تصميم أنيق',
      'حافظة مضادة للماء': 'لحماية هاتفك',
      'شواحن وكوابل': 'أصلية 100%',
      'لواصق + تنظيف': 'مجموعة كاملة',
      'الضمان': 'على جميع المنتجات',
    },
    inStock: true,
    stock: 50,
    featured: true,
    deal: true,
    rating: 5,
    reviewsCount: 47,
  },
  {
    id: '4',
    slug: 'pack-reekoo-note-60',
    name: '📱🔥 باك Reekoo NOTE 60',
    description: '📱 هاتفين + باور بانك + سماعات RGB + إكسسوارات!',
    longDescription: `## 📱 Reekoo NOTE 60
هاتف ذكي بكاميرا **24MP Ultra** وأداء قوي 💪

## 📞 Gevo G1
هاتف صغير عملي:
- **3 شرائح SIM**
- راديو FM 📻
- بطارية طويلة

## 🔋 Gevo P40 Power Bank
سعة **10000mAh** مع:
- 4 مخارج
- كابلات مدمجة ⚡

## 🎧 Cat Ear Wireless Headphone P47M
سماعات لاسلكية بإضاءة **RGB** رائعة 🌈

## 🔌 كابل AUX 1800mm
للسيارة والسبيكر 🎵

## 🚗 شاحن سيارة
اشحن هاتفك أثناء التنقل 🔋

## 🐰 LED Animal Camera
مصباح LED لطيف + حامل أقلام ✨

---

✨ **كل ما تحتاجه في باك واحد!**

🚚 **توصيل سريع لجميع الولايات**`,
    price: 19900,
    originalPrice: 24000,
    category: 'packets',
    images: [
      '/packs/reekoo-note-60/main.jpg',
      '/packs/reekoo-note-60/phone.jpg',
      '/packs/reekoo-note-60/powerbank.jpg',
      '/packs/reekoo-note-60/headphones.jpg',
    ],
    specifications: {
      'Reekoo NOTE 60': 'كاميرا 24MP Ultra',
      'Gevo G1': '3 شرائح SIM + راديو FM',
      'Power Bank': '10000mAh - 4 مخارج',
      'سماعات RGB': 'Cat Ear P47M',
      'كابل AUX': '1800mm',
      'شاحن سيارة': 'شحن سريع',
      'مصباح LED': 'تصميم حيواني لطيف',
    },
    inStock: true,
    stock: 30,
    featured: true,
    deal: true,
    rating: 5,
    reviewsCount: 32,
  },
  {
    id: '5',
    slug: 'pack-media-phone',
    name: '📦 باك Media Phone',
    description: '📱 باك كامل للموبايل مع كل الإكسسوارات!',
    longDescription: `## 📦 باك Media Phone الكامل

✨ **كل ما تحتاجه لهاتفك في مكان واحد!**

### المحتويات:
- 🔋 **باور بانك** عالي السعة
- 🎧 **سماعات بلوتوث** لاسلكية
- 🔌 **شواحن وكابلات** أصلية
- 🛡️ **حماية شاشة** قوية
- 📱 **إكسسوارات متنوعة**

---

🚚 **توصيل سريع لجميع الولايات**
💯 **ضمان على جميع المنتجات**`,
    price: 19700,
    originalPrice: 24000,
    category: 'packets',
    images: [
      '/packs/media-phone/pack-main.jpg',
      '/packs/media-phone/hoco-powerbank.jpg',
      '/packs/media-phone/hoco-earbuds.jpg',
    ],
    specifications: {
      'باور بانك': 'سعة عالية',
      'سماعات': 'بلوتوث لاسلكية',
      'شواحن': 'أصلية 100%',
      'حماية': 'لاصق شاشة',
    },
    inStock: true,
    stock: 25,
    featured: true,
    deal: true,
    rating: 5,
    reviewsCount: 28,
  },
];

// Helper functions
export function getProductBySlug(slug: string): Product | undefined {
  return ALL_PRODUCTS.find(p => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return ALL_PRODUCTS.find(p => p.id === id);
}

export function getFeaturedProducts(): Product[] {
  return ALL_PRODUCTS.filter(p => p.featured);
}

export function getDealProducts(): Product[] {
  return ALL_PRODUCTS.filter(p => p.deal);
}

export function getProductsByCategory(category: string): Product[] {
  return ALL_PRODUCTS.filter(p => p.category === category);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return ALL_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(q) || 
    p.description.toLowerCase().includes(q)
  );
}
