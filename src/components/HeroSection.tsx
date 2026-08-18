'use client';

import Link from 'next/link';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import type { Locale } from '@/types';

interface HeroSectionProps {
  lang: Locale;
  t: Record<string, string>;
}

export default function HeroSection({ lang, t }: HeroSectionProps) {
  const isRTL = lang === 'ar';
  const ArrowIcon = isRTL ? ArrowLeftIcon : ArrowRightIcon;

  return (
    <section className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-brand-900 text-white overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center py-12">
          <div className="animate-slide-up">
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/30 text-brand-300 text-sm font-semibold mb-4 border border-brand-500/30">
              🎉 {t.deals}
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Tiar Boutique
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8">
              {t.heroSubtitle}
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href={`/${lang}/products`}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-bold transition hover:scale-105 transform shadow-lg shadow-brand-500/30"
              >
                {t.shopNow}
                <ArrowIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
