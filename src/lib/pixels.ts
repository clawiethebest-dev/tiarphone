'use client';

/**
 * Pixel/Tracking Integration
 * Handles Facebook Pixel, TikTok Pixel, and other analytics pixels
 */

// Facebook Pixel ID
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '1035868502633279';
// TikTok Pixel ID  
const TT_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || 'D9SE8ARC77U40SOI9EG0';

// Pixel configuration
export const PIXEL_CONFIG = {
  facebook: [FB_PIXEL_ID],
  tiktok: [TT_PIXEL_ID],
  snapchat: [] as string[],
  google: [] as string[],
  twitter: [] as string[],
};

// Initialize all pixels
export function initAllPixels(config: typeof PIXEL_CONFIG) {
  // Pixels are already initialized via script tags in layout
  // This function can be used for dynamic initialization if needed
  console.log('Pixels initialized with config:', config);
}

// Check if we're in browser
const isBrowser = typeof window !== 'undefined';

// Facebook Pixel helpers
declare global {
  interface Window {
    fbq: any;
    ttq: any;
  }
}

interface AddToCartParams {
  content_id: string;
  content_name: string;
  value: number;
  quantity: number;
  currency: string;
}

interface PurchaseParams {
  content_ids: string[];
  content_name?: string;
  value: number;
  currency: string;
  num_items: number;
  order_id?: string;
}

// Track page view
export function trackPageView() {
  if (!isBrowser) return;
  
  // Facebook Pixel
  if (window.fbq && FB_PIXEL_ID) {
    window.fbq('track', 'PageView');
  }
  
  // TikTok Pixel
  if (window.ttq && TT_PIXEL_ID) {
    window.ttq.track('PageView');
  }
}

// Track add to cart
export function trackAddToCart(params: AddToCartParams) {
  if (!isBrowser) return;
  
  // Facebook Pixel
  if (window.fbq && FB_PIXEL_ID) {
    window.fbq('track', 'AddToCart', {
      content_ids: [params.content_id],
      content_name: params.content_name,
      value: params.value,
      currency: params.currency,
      content_type: 'product',
      num_items: params.quantity,
    });
  }
  
  // TikTok Pixel
  if (window.ttq && TT_PIXEL_ID) {
    window.ttq.track('AddToCart', {
      content_id: params.content_id,
      content_name: params.content_name,
      value: params.value,
      currency: params.currency,
      quantity: params.quantity,
    });
  }
}

// Track initiate checkout
export function trackInitiateCheckout(value: number, numItems: number) {
  if (!isBrowser) return;
  
  // Facebook Pixel
  if (window.fbq && FB_PIXEL_ID) {
    window.fbq('track', 'InitiateCheckout', {
      value,
      currency: 'DZD',
      num_items: numItems,
    });
  }
  
  // TikTok Pixel
  if (window.ttq && TT_PIXEL_ID) {
    window.ttq.track('InitiateCheckout', {
      value,
      currency: 'DZD',
      quantity: numItems,
    });
  }
}

// Track purchase
export function trackPurchase(params: PurchaseParams) {
  if (!isBrowser) return;
  
  // Facebook Pixel
  if (window.fbq && FB_PIXEL_ID) {
    window.fbq('track', 'Purchase', {
      content_ids: params.content_ids,
      value: params.value,
      currency: params.currency,
      content_type: 'product',
      num_items: params.num_items,
    });
  }
  
  // TikTok Pixel
  if (window.ttq && TT_PIXEL_ID) {
    window.ttq.track('Purchase', {
      content_ids: params.content_ids,
      value: params.value,
      currency: params.currency,
      quantity: params.num_items,
    });
  }
}

// Track product view
export function trackProductView(productId: string, productName: string, value: number) {
  if (!isBrowser) return;
  
  // Facebook Pixel
  if (window.fbq && FB_PIXEL_ID) {
    window.fbq('track', 'ViewContent', {
      content_ids: [productId],
      content_name: productName,
      value,
      currency: 'DZD',
      content_type: 'product',
    });
  }
  
  // TikTok Pixel
  if (window.ttq && TT_PIXEL_ID) {
    window.ttq.track('ViewContent', {
      content_id: productId,
      content_name: productName,
      value,
      currency: 'DZD',
    });
  }
}

// Track search
export function trackSearch(searchQuery: string) {
  if (!isBrowser) return;
  
  // Facebook Pixel
  if (window.fbq && FB_PIXEL_ID) {
    window.fbq('track', 'Search', {
      search_string: searchQuery,
    });
  }
  
  // TikTok Pixel
  if (window.ttq && TT_PIXEL_ID) {
    window.ttq.track('Search', {
      query: searchQuery,
    });
  }
}

// Track lead (contact form submission)
export function trackLead(value?: number) {
  if (!isBrowser) return;
  
  // Facebook Pixel
  if (window.fbq && FB_PIXEL_ID) {
    window.fbq('track', 'Lead', {
      value,
      currency: 'DZD',
    });
  }
  
  // TikTok Pixel
  if (window.ttq && TT_PIXEL_ID) {
    window.ttq.track('SubmitForm');
  }
}
