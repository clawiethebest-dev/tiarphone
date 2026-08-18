'use client';

// Analytics Event Types
export type AnalyticsEventType =
  | 'page_view'
  | 'product_view'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'checkout_start'
  | 'order_complete'
  | 'button_click'
  | 'search';

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  page?: string;
  productId?: string;
  productName?: string;
  productPrice?: number;
  quantity?: number;
  cartTotal?: number;
  searchQuery?: string;
  buttonId?: string;
  metadata?: Record<string, any>;
}

// Get UTM parameters from URL
function getUTMParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const utmParams: Record<string, string> = {};

  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(key => {
    const value = params.get(key);
    if (value) utmParams[key] = value;
  });

  // Also check for fbclid (Facebook), gclid (Google), etc.
  const adParams = ['fbclid', 'gclid', 'ttclid', 'igshid'];
  adParams.forEach(key => {
    const value = params.get(key);
    if (value) {
      utmParams[key] = value;
      // Auto-detect source from click IDs
      if (key === 'fbclid' && !utmParams.utm_source) utmParams.utm_source = 'facebook';
      if (key === 'gclid' && !utmParams.utm_source) utmParams.utm_source = 'google';
      if (key === 'ttclid' && !utmParams.utm_source) utmParams.utm_source = 'tiktok';
      if (key === 'igshid' && !utmParams.utm_source) utmParams.utm_source = 'instagram';
    }
  });

  return utmParams;
}

// Get device info
function getDeviceInfo(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  const ua = navigator.userAgent;
  let device = 'desktop';
  if (/Mobile|Android|iPhone/i.test(ua)) device = 'mobile';
  else if (/Tablet|iPad/i.test(ua)) device = 'tablet';

  return {
    device,
    language: navigator.language,
    screenWidth: window.screen.width.toString(),
    screenHeight: window.screen.height.toString(),
  };
}

// Get or create visitor ID
function getVisitorId(): string {
  if (typeof window === 'undefined') return '';

  let visitorId = localStorage.getItem('tiar_visitor_id');
  if (!visitorId) {
    visitorId = 'v_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('tiar_visitor_id', visitorId);
  }
  return visitorId;
}

// Track event to Supabase
export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const payload = {
      ...event,
      visitorId: getVisitorId(),
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer,
      ...getUTMParams(),
      ...getDeviceInfo(),
    };

    // Send to analytics API
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Analytics error:', error);
  }
}

// Convenience functions
export const trackPageView = (page: string) => trackEvent({ type: 'page_view', page });
export const trackProductView = (productId: string, productName: string, productPrice: number) =>
  trackEvent({ type: 'product_view', productId, productName, productPrice });
export const trackAddToCart = (productId: string, productName: string, productPrice: number, quantity: number) =>
  trackEvent({ type: 'add_to_cart', productId, productName, productPrice, quantity });
export const trackRemoveFromCart = (productId: string) =>
  trackEvent({ type: 'remove_from_cart', productId });
export const trackCheckoutStart = (cartTotal: number) =>
  trackEvent({ type: 'checkout_start', cartTotal });
export const trackOrderComplete = (cartTotal: number, metadata?: Record<string, any>) =>
  trackEvent({ type: 'order_complete', cartTotal, metadata });
export const trackSearch = (searchQuery: string) =>
  trackEvent({ type: 'search', searchQuery });
export const trackButtonClick = (buttonId: string) =>
  trackEvent({ type: 'button_click', buttonId });
