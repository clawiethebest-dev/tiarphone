import type { Product } from '@/types';

export const ALL_PRODUCTS: Product[] = [
  {
    id: '1',
    slug: 'pack-tech-ultimate',
    name: '📦 باك التكنولوجيا المتكامل',
    description: '📱 كل ما تحتاجه في مكان واحد!',
    longDescription: `📱 **باور بانك** شحن سريع وقوة تدوم معك طول اليوم ⚡

🎵 **سماعات وسبياكر** صوت نقي وقوي للاستمتاع بالموسيقى 🎶

📲 **هواتف ذكية وأساسية** اختيارات متنوعة تناسب جميع الاحتياجات 📞

⌚ **ساعات ذكية** تابع نشاطك وصحتك بسهولة 💪

💧 **حافظات مقاومة للماء** حماية لهاتفك في كل الظروف 🌊

🔌 **شواحن وكابلات** جودة عالية وشحن آمن 🔋

🛡️ **لواصق حماية الشاشة** حماية قوية ضد الخدوش والصدمات 🧼

✨ **جودة عالية** | **أسعار مناسبة** | **ضمان على المنتجات**

🚚 **توصيل سريع لجميع الولايات**`,
    price: 20650,
    originalPrice: 28000,
    category: 'packets',
    images: [
      'https://www.tiarboutique.shop/packs/pack-tech-main.jpg',
      'https://www.tiarboutique.shop/packs/pack-tech-8.png',
      'https://www.tiarboutique.shop/packs/pack-tech-2.jpg',
      'https://www.tiarboutique.shop/packs/pack-tech-4.jpg',
      'https://www.tiarboutique.shop/packs/pack-tech-1.png',
      'https://www.tiarboutique.shop/packs/pack-tech-6.jpg',
      'https://www.tiarboutique.shop/packs/pack-tech-5.jpg',
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
    id: '2',
    slug: 'pack-reekoo-note-60',
    name: '📱🔥 باك Reekoo NOTE 60',
    description: '📱 هاتفين + باور بانك + سماعات RGB + إكسسوارات!',
    longDescription: `📱 **Reekoo NOTE 60** — هاتف ذكي بكاميرا 24MP Ultra وأداء قوي 💪

📞 **Gevo G1** — هاتف صغير عملي ب 3 شرائح SIM وراديو FM 📻

🔋 **Gevo P40 Power Bank** — سعة 10000mAh مع 4 مخارج وكابلات مدمجة ⚡

🎧 **Cat Ear Wireless Headphone P47M** — سماعات لاسلكية بإضاءة RGB رائعة 🌈

🔌 **كابل AUX 1800mm** — للسيارة والسبيكر 🎵

🚗 **شاحن سيارة** — اشحن هاتفك أثناء التنقل 🔋

🐰 **LED Animal Camera** — مصباح LED لطيف + حامل أقلام ✨

✨ **كل ما تحتاجه في باك واحد!**

🚚 **توصيل سريع لجميع الولايات**`,
    price: 19900,
    originalPrice: 25300,
    category: 'packets',
    images: [
      'https://www.tiarboutique.shop/packs/reekoo-note-60/main.jpg',
      'https://www.tiarboutique.shop/packs/reekoo-note-60/2.jpg',
      'https://www.tiarboutique.shop/packs/reekoo-note-60/3.jpg',
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
    id: '3',
    slug: 'pack-media-phone',
    name: '📦 باك Media Phone',
    description: '📱 باك كامل للموبايل مع كل الإكسسوارات!',
    longDescription: `📱 **باك Media Phone الكامل**

✨ كل ما تحتاجه لهاتفك في مكان واحد!

🔋 باور بانك عالي السعة
🎧 سماعات بلوتوث
🔌 شواحن وكابلات أصلية
🛡️ حماية شاشة
📱 إكسسوارات متنوعة

🚚 **توصيل سريع لجميع الولايات**`,
    price: 19700,
    originalPrice: 24000,
    category: 'packets',
    images: [
      'https://www.tiarboutique.shop/packs/media-phone/pack-main.jpg',
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
    deal: false,
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
