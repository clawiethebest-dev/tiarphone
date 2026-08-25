import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnnouncementBar from '@/components/AnnouncementBar';
import WhatsAppButton from '@/components/WhatsAppButton';
import LiveSalesNotification from '@/components/LiveSalesNotification';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';
import { PixelProvider } from '@/components/PixelProvider';
import { TrackerProvider } from '@/components/TrackerProvider';
import type { Locale } from '@/types';

const locales = ['ar', 'fr', 'en'];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const t = messages as Record<string, string>;

  const isRTL = locale === 'ar';

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}>
      <head>
        <meta name="facebook-domain-verification" content="p7ntwsatqrd2z1vjd1sn8c1jwmwvv7" />
        {/* Meta (Facebook/Instagram) Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1035868502633279');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1035868502633279&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* TikTok Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                ttq.load('D9SE8ARC77U40SOI9EG0');
                ttq.page();
              }(window, document, 'ttq');
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <NextIntlClientProvider messages={messages}>
          <TrackerProvider>
            <AnalyticsProvider>
              <PixelProvider>
              <AnnouncementBar />
              <Header lang={locale as Locale} t={t} />
              <main className="flex-1">
                <Suspense fallback={<div className="min-h-screen" />}>
                  {children}
                </Suspense>
              </main>
              <Footer lang={locale as Locale} t={t} />
              <WhatsAppButton />
              <LiveSalesNotification locale={locale} />
              </PixelProvider>
            </AnalyticsProvider>
          </TrackerProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
