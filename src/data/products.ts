import type { Product } from '@/types';

export const ALL_PRODUCTS: Product[] = [
  {
    id: '1',
    slug: 'pack-itel-a50-ultimate',
    name: 'ðŸ“¦ Ø¨Ø§Ùƒ itel A50 Ultimate',
    description: 'ðŸ“± Ù‡Ø§ØªÙ itel A50 4G + Ù…Ø§ÙƒÙŠÙ†Ø© Ø­Ù„Ø§Ù‚Ø© + Ù…ÙƒÙ†Ø³Ø© + Ø¨Ø§ÙˆØ± Ø¨Ø§Ù†Ùƒ + Ø´Ø§Ø­Ù† + Ø­Ø§Ù…Ù„ Ø³ÙŠØ§Ø±Ø©!',
    longDescription: `## ðŸ“± itel A50 4G
Ù‡Ø§ØªÙ Ø°ÙƒÙŠ Ø¨Ø´Ø§Ø´Ø© **6.6 Ø¨ÙˆØµØ©** ÙˆØ°Ø§ÙƒØ±Ø© **8GB RAM + 128GB** ðŸ’ª

## ðŸª’ Kemei 5in1
Ù…Ø§ÙƒÙŠÙ†Ø© Ø­Ù„Ø§Ù‚Ø© Ù…ØªØ¹Ø¯Ø¯Ø© Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…Ø§Øª âœ‚ï¸
- Ø­Ù„Ø§Ù‚Ø© Ø§Ù„Ø´Ø¹Ø±
- ØªØ´Ø°ÙŠØ¨ Ø§Ù„Ù„Ø­ÙŠØ©
- ØªÙ†Ø¸ÙŠÙ Ø§Ù„Ø£Ù†Ù ÙˆØ§Ù„Ø£Ø°Ù†

## ðŸ§¹ ZMW 11
Ù…ÙƒÙ†Ø³Ø© ÙƒÙ‡Ø±Ø¨Ø§Ø¦ÙŠØ© Ù…Ø­Ù…ÙˆÙ„Ø© **120W** Ù‚ÙˆÙŠØ© ðŸ”¥
- Ø´ÙØ· Ù‚ÙˆÙŠ
- Ø¨Ø·Ø§Ø±ÙŠØ© Ù‚Ø§Ø¨Ù„Ø© Ù„Ù„Ø´Ø­Ù†
- Ù…Ø«Ø§Ù„ÙŠØ© Ù„Ù„Ø³ÙŠØ§Ø±Ø© ÙˆØ§Ù„Ù…Ù†Ø²Ù„

## ðŸ”‹ Bovo D40
Ø¨Ø§ÙˆØ± Ø¨Ø§Ù†Ùƒ **10000mAh** Ù„Ù„Ø´Ø­Ù† Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„ØªÙ†Ù‚Ù„ âš¡
- Ø´Ø­Ù† Ø³Ø±ÙŠØ¹
- Ù…Ù†ÙØ°ÙŠÙ† USB

## ðŸ”Œ Bovo G1
Ø´Ø§Ø­Ù† Ø³Ø±ÙŠØ¹ Ù„Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ø¬Ù‡Ø²Ø© ðŸ”‹

## ðŸš— Ø­Ø§Ù…Ù„ Ù‡Ø§ØªÙ Ù„Ù„Ø³ÙŠØ§Ø±Ø© 360Â°
ØªØ«Ø¨ÙŠØª Ù…Ø­ÙƒÙ… ÙˆØ¯ÙˆØ±Ø§Ù† ÙƒØ§Ù…Ù„ ðŸ“±

---

âœ¨ **ÙƒÙ„ Ù…Ø§ ØªØ­ØªØ§Ø¬Ù‡ ÙÙŠ Ø¨Ø§Ùƒ ÙˆØ§Ø­Ø¯ Ø¨Ø³Ø¹Ø± Ø®ÙŠØ§Ù„ÙŠ!**

ðŸšš **ØªÙˆØµÙŠÙ„ Ø³Ø±ÙŠØ¹ Ù„Ø¬Ù…ÙŠØ¹ Ø§Ù„ÙˆÙ„Ø§ÙŠØ§Øª**
ðŸ’¯ **Ø¶Ù…Ø§Ù† Ø¹Ù„Ù‰ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª**`,
    price: 24000,
    originalPrice: 28000,
    category: 'packets',
    images: [
      '/packs/itel-a50-pack/itel-a50.jpg',
      '/packs/itel-a50-pack/kemei-5in1.jpg',
      '/packs/itel-a50-pack/vacuum.jpg',
      '/packs/itel-a50-pack/powerbank.jpg',
      '/packs/itel-a50-pack/charger.jpg',
      '/packs/itel-a50-pack/car-holder.jpg',
    ],
    specifications: {
      'itel A50 4G': '8GB RAM + 128GB - Ø´Ø§Ø´Ø© 6.6"',
      'Kemei 5in1': 'Ù…Ø§ÙƒÙŠÙ†Ø© Ø­Ù„Ø§Ù‚Ø© Ù…ØªØ¹Ø¯Ø¯Ø© Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…Ø§Øª',
      'ZMW 11': 'Ù…ÙƒÙ†Ø³Ø© ÙƒÙ‡Ø±Ø¨Ø§Ø¦ÙŠØ© Ù…Ø­Ù…ÙˆÙ„Ø© 120W',
      'Bovo D40': 'Ø¨Ø§ÙˆØ± Ø¨Ø§Ù†Ùƒ 10000mAh',
      'Bovo G1': 'Ø´Ø§Ø­Ù† Ø³Ø±ÙŠØ¹',
      'Ø­Ø§Ù…Ù„ Ø³ÙŠØ§Ø±Ø©': 'Ø¯ÙˆØ±Ø§Ù† 360Â° - ØªØ«Ø¨ÙŠØª Ù‚ÙˆÙŠ',
      'Ø§Ù„Ø¶Ù…Ø§Ù†': 'Ø¹Ù„Ù‰ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª',
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
    slug: 'pack-tech-ultimate',
    name: 'ðŸ“¦ Ø¨Ø§Ùƒ Ø§Ù„ØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠØ§ Ø§Ù„Ù…ØªÙƒØ§Ù…Ù„',
    description: 'ðŸ“± ÙƒÙ„ Ù…Ø§ ØªØ­ØªØ§Ø¬Ù‡ ÙÙŠ Ù…ÙƒØ§Ù† ÙˆØ§Ø­Ø¯!',
    longDescription: `## âš¡ Ø¨Ø§ÙˆØ± Ø¨Ø§Ù†Ùƒ
Ø´Ø­Ù† Ø³Ø±ÙŠØ¹ ÙˆÙ‚ÙˆØ© ØªØ¯ÙˆÙ… Ù…Ø¹Ùƒ Ø·ÙˆÙ„ Ø§Ù„ÙŠÙˆÙ…

## ðŸŽµ Ø³Ù…Ø§Ø¹Ø§Øª ÙˆØ³Ø¨ÙŠÙƒØ±
ØµÙˆØª Ù†Ù‚ÙŠ ÙˆÙ‚ÙˆÙŠ Ù„Ù„Ø§Ø³ØªÙ…ØªØ§Ø¹ Ø¨Ø§Ù„Ù…ÙˆØ³ÙŠÙ‚Ù‰ ðŸŽ¶

## ðŸ“² Ù‡ÙˆØ§ØªÙ Ø°ÙƒÙŠØ© ÙˆØ£Ø³Ø§Ø³ÙŠØ©
Ø§Ø®ØªÙŠØ§Ø±Ø§Øª Ù…ØªÙ†ÙˆØ¹Ø© ØªÙ†Ø§Ø³Ø¨ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø§Ø­ØªÙŠØ§Ø¬Ø§Øª ðŸ“ž

## âŒš Ø³Ø§Ø¹Ø§Øª Ø°ÙƒÙŠØ©
ØªØ§Ø¨Ø¹ Ù†Ø´Ø§Ø·Ùƒ ÙˆØµØ­ØªÙƒ Ø¨Ø³Ù‡ÙˆÙ„Ø© ðŸ’ª

## ðŸ’§ Ø­Ø§ÙØ¸Ø§Øª Ù…Ù‚Ø§ÙˆÙ…Ø© Ù„Ù„Ù…Ø§Ø¡
Ø­Ù…Ø§ÙŠØ© Ù„Ù‡Ø§ØªÙÙƒ ÙÙŠ ÙƒÙ„ Ø§Ù„Ø¸Ø±ÙˆÙ ðŸŒŠ

## ðŸ”Œ Ø´ÙˆØ§Ø­Ù† ÙˆÙƒØ§Ø¨Ù„Ø§Øª
Ø¬ÙˆØ¯Ø© Ø¹Ø§Ù„ÙŠØ© ÙˆØ´Ø­Ù† Ø¢Ù…Ù† ðŸ”‹

## ðŸ›¡ï¸ Ù„ÙˆØ§ØµÙ‚ Ø­Ù…Ø§ÙŠØ© Ø§Ù„Ø´Ø§Ø´Ø©
Ø­Ù…Ø§ÙŠØ© Ù‚ÙˆÙŠØ© Ø¶Ø¯ Ø§Ù„Ø®Ø¯ÙˆØ´ ÙˆØ§Ù„ØµØ¯Ù…Ø§Øª ðŸ§¼

---

âœ¨ **Ø¬ÙˆØ¯Ø© Ø¹Ø§Ù„ÙŠØ©** | **Ø£Ø³Ø¹Ø§Ø± Ù…Ù†Ø§Ø³Ø¨Ø©** | **Ø¶Ù…Ø§Ù† Ø¹Ù„Ù‰ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª**

ðŸšš **ØªÙˆØµÙŠÙ„ Ø³Ø±ÙŠØ¹ Ù„Ø¬Ù…ÙŠØ¹ Ø§Ù„ÙˆÙ„Ø§ÙŠØ§Øª**`,
    price: 24000,
    originalPrice: 28000,
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
      'Ø¨Ø§ÙˆØ± Ø¨Ø§Ù†Ùƒ': 'Hoco J101 - 10000mAh - 22.5W',
      'Ø³Ù…Ø§Ø¹Ø© Ø¨Ù„ÙˆØªÙˆØ«': 'ØµÙˆØª Ù‚ÙˆÙŠ ÙˆÙ†Ù‚ÙŠ',
      'Ù‡ÙˆØ§ØªÙ': 'Ø¹Ø§Ø¯ÙŠØ© ÙˆØ°ÙƒÙŠØ©',
      'Ø³Ø§Ø¹Ø© Ø°ÙƒÙŠØ©': 'ØªØµÙ…ÙŠÙ… Ø£Ù†ÙŠÙ‚',
      'Ø­Ø§ÙØ¸Ø© Ù…Ø¶Ø§Ø¯Ø© Ù„Ù„Ù…Ø§Ø¡': 'Ù„Ø­Ù…Ø§ÙŠØ© Ù‡Ø§ØªÙÙƒ',
      'Ø´ÙˆØ§Ø­Ù† ÙˆÙƒÙˆØ§Ø¨Ù„': 'Ø£ØµÙ„ÙŠØ© 100%',
      'Ù„ÙˆØ§ØµÙ‚ + ØªÙ†Ø¸ÙŠÙ': 'Ù…Ø¬Ù…ÙˆØ¹Ø© ÙƒØ§Ù…Ù„Ø©',
      'Ø§Ù„Ø¶Ù…Ø§Ù†': 'Ø¹Ù„Ù‰ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª',
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
    slug: 'pack-reekoo-note-60',
    name: 'ðŸ“±ðŸ”¥ Ø¨Ø§Ùƒ Reekoo NOTE 60',
    description: 'ðŸ“± Ù‡Ø§ØªÙÙŠÙ† + Ø¨Ø§ÙˆØ± Ø¨Ø§Ù†Ùƒ + Ø³Ù…Ø§Ø¹Ø§Øª RGB + Ø¥ÙƒØ³Ø³ÙˆØ§Ø±Ø§Øª!',
    longDescription: `## ðŸ“± Reekoo NOTE 60
Ù‡Ø§ØªÙ Ø°ÙƒÙŠ Ø¨ÙƒØ§Ù…ÙŠØ±Ø§ **24MP Ultra** ÙˆØ£Ø¯Ø§Ø¡ Ù‚ÙˆÙŠ ðŸ’ª

## ðŸ“ž Gevo G1
Ù‡Ø§ØªÙ ØµØºÙŠØ± Ø¹Ù…Ù„ÙŠ:
- **3 Ø´Ø±Ø§Ø¦Ø­ SIM**
- Ø±Ø§Ø¯ÙŠÙˆ FM ðŸ“»
- Ø¨Ø·Ø§Ø±ÙŠØ© Ø·ÙˆÙŠÙ„Ø©

## ðŸ”‹ Gevo P40 Power Bank
Ø³Ø¹Ø© **10000mAh** Ù…Ø¹:
- 4 Ù…Ø®Ø§Ø±Ø¬
- ÙƒØ§Ø¨Ù„Ø§Øª Ù…Ø¯Ù…Ø¬Ø© âš¡

## ðŸŽ§ Cat Ear Wireless Headphone P47M
Ø³Ù…Ø§Ø¹Ø§Øª Ù„Ø§Ø³Ù„ÙƒÙŠØ© Ø¨Ø¥Ø¶Ø§Ø¡Ø© **RGB** Ø±Ø§Ø¦Ø¹Ø© ðŸŒˆ

## ðŸ”Œ ÙƒØ§Ø¨Ù„ AUX 1800mm
Ù„Ù„Ø³ÙŠØ§Ø±Ø© ÙˆØ§Ù„Ø³Ø¨ÙŠÙƒØ± ðŸŽµ

## ðŸš— Ø´Ø§Ø­Ù† Ø³ÙŠØ§Ø±Ø©
Ø§Ø´Ø­Ù† Ù‡Ø§ØªÙÙƒ Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„ØªÙ†Ù‚Ù„ ðŸ”‹

## ðŸ° LED Animal Camera
Ù…ØµØ¨Ø§Ø­ LED Ù„Ø·ÙŠÙ + Ø­Ø§Ù…Ù„ Ø£Ù‚Ù„Ø§Ù… âœ¨

---

âœ¨ **ÙƒÙ„ Ù…Ø§ ØªØ­ØªØ§Ø¬Ù‡ ÙÙŠ Ø¨Ø§Ùƒ ÙˆØ§Ø­Ø¯!**

ðŸšš **ØªÙˆØµÙŠÙ„ Ø³Ø±ÙŠØ¹ Ù„Ø¬Ù…ÙŠØ¹ Ø§Ù„ÙˆÙ„Ø§ÙŠØ§Øª**`,
    price: 24000,
    originalPrice: 28000,
    category: 'packets',
    images: [
      '/packs/reekoo-note-60/main.jpg',
      '/packs/reekoo-note-60/phone.jpg',
      '/packs/reekoo-note-60/powerbank.jpg',
      '/packs/reekoo-note-60/headphones.jpg',
    ],
    specifications: {
      'Reekoo NOTE 60': 'ÙƒØ§Ù…ÙŠØ±Ø§ 24MP Ultra',
      'Gevo G1': '3 Ø´Ø±Ø§Ø¦Ø­ SIM + Ø±Ø§Ø¯ÙŠÙˆ FM',
      'Power Bank': '10000mAh - 4 Ù…Ø®Ø§Ø±Ø¬',
      'Ø³Ù…Ø§Ø¹Ø§Øª RGB': 'Cat Ear P47M',
      'ÙƒØ§Ø¨Ù„ AUX': '1800mm',
      'Ø´Ø§Ø­Ù† Ø³ÙŠØ§Ø±Ø©': 'Ø´Ø­Ù† Ø³Ø±ÙŠØ¹',
      'Ù…ØµØ¨Ø§Ø­ LED': 'ØªØµÙ…ÙŠÙ… Ø­ÙŠÙˆØ§Ù†ÙŠ Ù„Ø·ÙŠÙ',
    },
    inStock: true,
    stock: 30,
    featured: true,
    deal: true,
    rating: 5,
    reviewsCount: 32,
  },
  {
    id: '4',
    slug: 'pack-media-phone',
    name: 'ðŸ“¦ Ø¨Ø§Ùƒ Media Phone',
    description: 'ðŸ“± Ø¨Ø§Ùƒ ÙƒØ§Ù…Ù„ Ù„Ù„Ù…ÙˆØ¨Ø§ÙŠÙ„ Ù…Ø¹ ÙƒÙ„ Ø§Ù„Ø¥ÙƒØ³Ø³ÙˆØ§Ø±Ø§Øª!',
    longDescription: `## ðŸ“¦ Ø¨Ø§Ùƒ Media Phone Ø§Ù„ÙƒØ§Ù…Ù„

âœ¨ **ÙƒÙ„ Ù…Ø§ ØªØ­ØªØ§Ø¬Ù‡ Ù„Ù‡Ø§ØªÙÙƒ ÙÙŠ Ù…ÙƒØ§Ù† ÙˆØ§Ø­Ø¯!**

### Ø§Ù„Ù…Ø­ØªÙˆÙŠØ§Øª:
- ðŸ”‹ **Ø¨Ø§ÙˆØ± Ø¨Ø§Ù†Ùƒ** Ø¹Ø§Ù„ÙŠ Ø§Ù„Ø³Ø¹Ø©
- ðŸŽ§ **Ø³Ù…Ø§Ø¹Ø§Øª Ø¨Ù„ÙˆØªÙˆØ«** Ù„Ø§Ø³Ù„ÙƒÙŠØ©
- ðŸ”Œ **Ø´ÙˆØ§Ø­Ù† ÙˆÙƒØ§Ø¨Ù„Ø§Øª** Ø£ØµÙ„ÙŠØ©
- ðŸ›¡ï¸ **Ø­Ù…Ø§ÙŠØ© Ø´Ø§Ø´Ø©** Ù‚ÙˆÙŠØ©
- ðŸ“± **Ø¥ÙƒØ³Ø³ÙˆØ§Ø±Ø§Øª Ù…ØªÙ†ÙˆØ¹Ø©**

---

ðŸšš **ØªÙˆØµÙŠÙ„ Ø³Ø±ÙŠØ¹ Ù„Ø¬Ù…ÙŠØ¹ Ø§Ù„ÙˆÙ„Ø§ÙŠØ§Øª**
ðŸ’¯ **Ø¶Ù…Ø§Ù† Ø¹Ù„Ù‰ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª**`,
    price: 24000,
    originalPrice: 28000,
    category: 'packets',
    images: [
      '/packs/media-phone/pack-main.jpg',
      '/packs/media-phone/hoco-powerbank.jpg',
      '/packs/media-phone/hoco-earbuds.jpg',
    ],
    specifications: {
      'Ø¨Ø§ÙˆØ± Ø¨Ø§Ù†Ùƒ': 'Ø³Ø¹Ø© Ø¹Ø§Ù„ÙŠØ©',
      'Ø³Ù…Ø§Ø¹Ø§Øª': 'Ø¨Ù„ÙˆØªÙˆØ« Ù„Ø§Ø³Ù„ÙƒÙŠØ©',
      'Ø´ÙˆØ§Ø­Ù†': 'Ø£ØµÙ„ÙŠØ© 100%',
      'Ø­Ù…Ø§ÙŠØ©': 'Ù„Ø§ØµÙ‚ Ø´Ø§Ø´Ø©',
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

