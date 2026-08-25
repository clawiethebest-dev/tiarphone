import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/*/admin',
          '/*/admin/*',
          '/admin',
          '/admin/*',
        ],
      },
    ],
    sitemap: 'https://www.tiarboutique.shop/sitemap.xml',
  };
}
