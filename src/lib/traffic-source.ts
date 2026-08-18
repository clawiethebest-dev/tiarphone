'use client';

/**
 * Traffic Source Detection
 * Detects where visitors came from (Facebook, TikTok, Google, Instagram, etc.)
 */

export type TrafficSource = 
  | 'facebook'
  | 'tiktok'
  | 'instagram'
  | 'google'
  | 'direct'
  | 'organic'
  | 'referral'
  | 'unknown';

interface TrafficInfo {
  source: TrafficSource;
  medium?: string;
  campaign?: string;
  clickId?: string;
}

const STORAGE_KEY = 'tiar_traffic_source';

// Get current traffic source from URL params
export function detectTrafficSource(): TrafficInfo {
  if (typeof window === 'undefined') {
    return { source: 'unknown' };
  }

  const params = new URLSearchParams(window.location.search);
  
  // Check for click IDs first (more reliable)
  const fbclid = params.get('fbclid');
  if (fbclid) {
    return {
      source: 'facebook',
      medium: 'paid',
      clickId: fbclid,
    };
  }

  const ttclid = params.get('ttclid');
  if (ttclid) {
    return {
      source: 'tiktok',
      medium: 'paid',
      clickId: ttclid,
    };
  }

  const gclid = params.get('gclid');
  if (gclid) {
    return {
      source: 'google',
      medium: 'paid',
      clickId: gclid,
    };
  }

  const igshid = params.get('igshid');
  if (igshid) {
    return {
      source: 'instagram',
      medium: 'social',
      clickId: igshid,
    };
  }

  // Check UTM parameters
  const utmSource = params.get('utm_source')?.toLowerCase();
  const utmMedium = params.get('utm_medium');
  const utmCampaign = params.get('utm_campaign');

  if (utmSource) {
    let source: TrafficSource = 'referral';
    
    if (utmSource.includes('facebook') || utmSource === 'fb') {
      source = 'facebook';
    } else if (utmSource.includes('tiktok') || utmSource === 'tt') {
      source = 'tiktok';
    } else if (utmSource.includes('instagram') || utmSource === 'ig') {
      source = 'instagram';
    } else if (utmSource.includes('google')) {
      source = 'google';
    }

    return {
      source,
      medium: utmMedium || undefined,
      campaign: utmCampaign || undefined,
    };
  }

  // Check referrer
  const referrer = document.referrer;
  if (!referrer) {
    return { source: 'direct' };
  }

  try {
    const referrerUrl = new URL(referrer);
    const hostname = referrerUrl.hostname.toLowerCase();

    if (hostname.includes('facebook.com') || hostname.includes('fb.com')) {
      return { source: 'facebook', medium: 'social' };
    }
    if (hostname.includes('tiktok.com')) {
      return { source: 'tiktok', medium: 'social' };
    }
    if (hostname.includes('instagram.com')) {
      return { source: 'instagram', medium: 'social' };
    }
    if (hostname.includes('google.')) {
      return { source: 'google', medium: 'organic' };
    }

    return { source: 'referral', medium: hostname };
  } catch {
    return { source: 'unknown' };
  }
}

// Alias for saveTrafficSource
export const storeTrafficSource = saveTrafficSource;

// Save traffic source to localStorage (preserves first touch)
export function saveTrafficSource(): TrafficInfo {
  if (typeof window === 'undefined') {
    return { source: 'unknown' };
  }

  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch {
      // Continue to detect new source
    }
  }

  const trafficInfo = detectTrafficSource();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trafficInfo));
  return trafficInfo;
}

// Get saved traffic source
export function getTrafficSource(): TrafficInfo {
  if (typeof window === 'undefined') {
    return { source: 'unknown' };
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return detectTrafficSource();
    }
  }

  return detectTrafficSource();
}

// Clear traffic source (for testing)
export function clearTrafficSource(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Get traffic source formatted for order submission
export function getTrafficSourceForOrder(): { traffic_source: string; landing_page: string } {
  const info = getTrafficSource();
  const landingPage = typeof window !== 'undefined' ? window.location.pathname : '/';
  
  let sourceStr = info.source;
  if (info.medium) {
    sourceStr += `/${info.medium}`;
  }
  if (info.campaign) {
    sourceStr += ` (${info.campaign})`;
  }
  
  return {
    traffic_source: sourceStr,
    landing_page: landingPage,
  };
}
