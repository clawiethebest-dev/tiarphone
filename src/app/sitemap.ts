import { MetadataRoute } from 'next';
import { ALL_PRODUCTS } from '@/data/products';

const BASE_URL = 'https://www.tiarboutique.shop';
const LOCALES = ['ar', 'fr', 'en'];

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [];

  // Home and static pages for each locale
  for (const locale of LOCALES) {
    routes.push(
      {
        url: `${BASE_URL}/${locale}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${BASE_URL}/${locale}/products`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/${locale}/track`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }
    );

    // Product pages for each locale
    for (const product of ALL_PRODUCTS) {
      routes.push({
        url: `${BASE_URL}/${locale}/products/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.95,
      });
    }
  }

  return routes;
}
