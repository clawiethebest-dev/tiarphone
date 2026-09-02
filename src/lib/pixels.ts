'use client';

/**
 * Pixel/Tracking Integration
 * Handles Facebook Pixel, TikTok Pixel, and other analytics pixels
 */

// Facebook Pixel ID
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '1035868502633279';

// TikTok Pixel IDs - All 3 pixels
const TT_PIXEL_IDS = [
  'DA10P6BC77U9J4MASLAG', // Mazi pixie - Primary
  'DABICCJC77UDHLL3BCJG', // Tiar Boutique Pixel
  'D9SE8ARC77U40SOI9EG0', // Original Pixel
];

// Legacy single pixel ID for backward compatibility
const TT_PIXEL_ID = TT_PIXEL_IDS[0];

// Pixel configuration
export const PIXEL_CONFIG = {
  facebook: [FB_PIXEL_ID],
  tiktok: TT_PIXEL_IDS,
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
    __TIKTOK_PIXEL_IDS__?: string[];
  }
}

// Get TikTok pixel IDs from window (set by server) or fallback to defaults
function getTikTokPixelIds(): string[] {
  if (isBrowser && window.__TIKTOK_PIXEL_IDS__?.length) {
    return window.__TIKTOK_PIXEL_IDS__;
  }
  return TT_PIXEL_IDS;
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
  
  // TikTok Pixels - track on all instances (from database or defaults)
  if (window.ttq) {
    const pixelIds = getTikTokPixelIds();
    pixelIds.forEach(pixelId => {
      try {
        window.ttq.instance(pixelId).track('PageView');
      } catch (e) {
        // Fallback to default tracking
        window.ttq.track('PageView');
      }
    });
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
  
  // TikTok Pixels - track on all instances
  if (window.ttq) {
    const ttData = {
      content_id: params.content_id,
      content_name: params.content_name,
      value: params.value,
      currency: params.currency,
      quantity: params.quantity,
    };
    const pixelIds = getTikTokPixelIds();
    pixelIds.forEach(pixelId => {
      try {
        window.ttq.instance(pixelId).track('AddToCart', ttData);
      } catch (e) {
        window.ttq.track('AddToCart', ttData);
      }
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
  
  // TikTok Pixels - track on all instances
  if (window.ttq) {
    const ttData = { value, currency: 'DZD', quantity: numItems };
    const pixelIds = getTikTokPixelIds();
    pixelIds.forEach(pixelId => {
      try {
        window.ttq.instance(pixelId).track('InitiateCheckout', ttData);
      } catch (e) {
        window.ttq.track('InitiateCheckout', ttData);
      }
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
  
  // TikTok Pixels - track on all instances
  if (window.ttq) {
    const ttData = {
      content_ids: params.content_ids,
      value: params.value,
      currency: params.currency,
      quantity: params.num_items,
    };
    const pixelIds = getTikTokPixelIds();
    pixelIds.forEach(pixelId => {
      try {
        window.ttq.instance(pixelId).track('CompletePayment', ttData);
      } catch (e) {
        window.ttq.track('CompletePayment', ttData);
      }
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
  
  // TikTok Pixels - track on all instances
  if (window.ttq) {
    const ttData = {
      content_id: productId,
      content_name: productName,
      value,
      currency: 'DZD',
    };
    const pixelIds = getTikTokPixelIds();
    pixelIds.forEach(pixelId => {
      try {
        window.ttq.instance(pixelId).track('ViewContent', ttData);
      } catch (e) {
        window.ttq.track('ViewContent', ttData);
      }
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
  
  // TikTok Pixels - track on all instances
  if (window.ttq) {
    const ttData = { query: searchQuery };
    const pixelIds = getTikTokPixelIds();
    pixelIds.forEach(pixelId => {
      try {
        window.ttq.instance(pixelId).track('Search', ttData);
      } catch (e) {
        window.ttq.track('Search', ttData);
      }
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
  
  // TikTok Pixels - track on all instances
  if (window.ttq) {
    const pixelIds = getTikTokPixelIds();
    pixelIds.forEach(pixelId => {
      try {
        window.ttq.instance(pixelId).track('SubmitForm');
      } catch (e) {
        window.ttq.track('SubmitForm');
      }
    });
  }
}
