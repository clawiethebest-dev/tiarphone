import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, locale: string = 'ar'): string {
  const formatted = new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ').format(price);

  const currencyLabels: Record<string, string> = {
    ar: 'دينار جزائري',
    fr: 'DA',
    en: 'DZD'
  };

  return `${formatted} ${currencyLabels[locale] || currencyLabels.ar}`;
}

export function formatDate(date: string, locale: string = 'ar'): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function calculateDiscount(originalPrice: number, currentPrice: number): number {
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

export function validateAlgerianPhone(phone: string): boolean {
  // Remove spaces and special characters
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // Check for valid Algerian phone formats
  // Mobile: 05, 06, 07 followed by 8 digits
  // With country code: +213 or 00213
  const patterns = [
    /^(05|06|07)\d{8}$/,
    /^(\+213|00213)(5|6|7)\d{8}$/,
  ];

  return patterns.some(pattern => pattern.test(cleaned));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

export function getImageUrl(images: string[] | undefined, index: number = 0): string {
  if (!images || images.length === 0) {
    return '/placeholder-product.png';
  }
  return images[index] || images[0];
}
