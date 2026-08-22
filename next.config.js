// next-intl plugin: يفعّل الترجمة (i18n) للعربية (ar) والفرنسية (fr) والإنجليزية (en)
// ملاحظة: خيار `i18n` القديم أُزيل في Next.js 15 — التوجيه اللغوي يتم عبر next-intl مع مجلد [locale]
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wlyizmzzapmtwdrvmsff.supabase.co',
        pathname: '/storage/v1/object/public/**'
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**'
      },
      {
        protocol: 'https',
        hostname: 'www.tiarboutique.shop',
        pathname: '/packs/**'
      },
      {
        protocol: 'https',
        hostname: 'tiarboutique.shop',
        pathname: '/packs/**'
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      }
    ]
  }
};

module.exports = withNextIntl(nextConfig);
