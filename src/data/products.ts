import type { Product } from '@/types';

export const ALL_PRODUCTS: Product[] = [
  {
    id: '1',
    slug: 'pack-itel-a50-ultimate',
    name: '📦 باك itel A50 Ultimate',
    description: '📱 هاتف itel A50 4G + ماكينة حلاقة + مكنسة + باور بانك + شاحن + حامل سيارة!',
    longDescription: `📱 **itel A50 4G** — هاتف ذكي بشاشة 6.6" وذاكرة 8GB RAM + 128GB 💪

🪒 **Kemei 5in1** — ماكينة حلاقة متعددة الاستخدامات ✂️

🧹 **ZMW 11** — مكنسة كهربائية محمولة 120W قوية 🔥

🔋 **Bovo D40** — باور بانك 10000mAh للشحن أثناء التنقل ⚡

🔌 **Bovo G1** — شاحن سريع لجميع الأجهزة 🔋

🚗 **حامل هاتف للسيارة 360°** — تثبيت محكم ودوران كامل 📱

✨ **كل ما تحتاجه في باك واحد بسعر خيالي!**

🚚 **توصيل سريع لجميع الولايات**
💯 **ضمان على جميع المنتجات**`,
    price: 22000,
    originalPrice: 28000,
    category: 'packets',
    images: [
      '/images/products/pack-itel-a50/main.jpg',
      '/images/products/pack-itel-a50/itel-a50.jpg',
      '/images/products/pack-itel-a50/kemei-5in1.jpg',
      '/images/products/pack-itel-a50/zmw-11.jpg',
      '/images/products/pack-itel-a50/bovo-d40.jpg',
      '/images/products/pack-itel-a50/bovo-g1.jpg',
      '/images/products/pack-itel-a50/car-holder.jpg',
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
