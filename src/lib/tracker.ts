'use client';

interface RawLogEntry {
  timestamp: string;
  sessionId: string;
  page: string;
  referrer: string;
  userAgent: string;
  screenSize: string;
  action: string;
  element?: string;
  elementText?: string;
  elementId?: string;
  elementClass?: string;
  data?: Record<string, unknown>;
  error?: string;
  stack?: string;
}

class UserTracker {
  private sessionId: string;
  private buffer: RawLogEntry[] = [];
  private flushInterval: ReturnType<typeof setInterval> | null = null;
  private initialized = false;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    if (typeof window === 'undefined') return 'server';
    const stored = sessionStorage.getItem('tiar_session_id');
    if (stored) return stored;
    const id = `s_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('tiar_session_id', id);
    return id;
  }

  init() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    // Track all clicks
    document.addEventListener('click', (e) => this.trackClick(e), true);

    // Track form inputs (on blur)
    document.addEventListener('blur', (e) => this.trackInput(e), true);

    // Track form submissions
    document.addEventListener('submit', (e) => this.trackSubmit(e), true);

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.log('visibility', { hidden: document.hidden });
    });

    // Track scroll depth
    let maxScroll = 0;
    let scrollTimeout: ReturnType<typeof setTimeout>;
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          this.log('scroll', { depth: maxScroll });
        }, 500);
      }
    });

    // Track errors
    window.addEventListener('error', (e) => {
      this.log('error', {}, e.message, e.error?.stack);
    });

    window.addEventListener('unhandledrejection', (e) => {
      this.log('promise_error', {}, String(e.reason));
    });

    // Track page load
    this.log('page_view', {
      loadTime: performance.now(),
    });

    // Flush buffer every 5 seconds
    this.flushInterval = setInterval(() => this.flush(), 5000);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.log('page_exit', { timeOnPage: performance.now() });
      this.flush(true);
    });
  }

  private trackClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target) return;

    const tagName = target.tagName?.toLowerCase() || '';
    const isInteractive = ['a', 'button', 'input', 'select', 'textarea'].includes(tagName) ||
      target.onclick !== null ||
      target.getAttribute('role') === 'button' ||
      target.closest('button, a, [role="button"]');

    if (!isInteractive && !target.closest('[data-track]')) return;

    const closest = target.closest('button, a, [role="button"], [data-track]') as HTMLElement;
    const el = closest || target;

    this.log('click', {}, undefined, undefined, {
      tag: el.tagName?.toLowerCase(),
      text: el.textContent?.trim().substring(0, 100),
      id: el.id || undefined,
      class: el.className?.toString().substring(0, 100) || undefined,
      href: (el as HTMLAnchorElement).href || undefined,
      dataTrack: el.getAttribute('data-track') || undefined,
    });
  }

  private trackInput(e: Event) {
    const target = e.target as HTMLInputElement;
    if (!target || !['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return;

    const name = target.name || target.id || target.placeholder || 'unknown';
    const type = target.type || 'text';
    
    // Don't log sensitive data
    if (type === 'password') return;

    // For phone fields, track that phone was entered (for abandoned checkout recovery)
    const isPhone = name.toLowerCase().includes('phone') || 
                    target.placeholder?.toLowerCase().includes('phone') ||
                    type === 'tel';

    this.log('input', {
      field: name,
      type,
      hasValue: !!target.value,
      isPhone,
      // Only log length, not actual value for privacy
      valueLength: target.value?.length || 0,
    });
  }

  private trackSubmit(e: Event) {
    const form = e.target as HTMLFormElement;
    this.log('form_submit', {
      formId: form.id || undefined,
      formAction: form.action || undefined,
    });
  }

  log(
    action: string,
    data?: Record<string, unknown>,
    error?: string,
    stack?: string,
    element?: {
      tag?: string;
      text?: string;
      id?: string;
      class?: string;
      href?: string;
      dataTrack?: string;
    }
  ) {
    const entry: RawLogEntry = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      screenSize: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
      action,
      element: element?.tag,
      elementText: element?.text,
      elementId: element?.id,
      elementClass: element?.class,
      data: { ...data, href: element?.href, dataTrack: element?.dataTrack },
      error,
      stack,
    };

    this.buffer.push(entry);

    // Immediate flush for important events
    if (['error', 'form_submit', 'order_attempt', 'order_success', 'order_error'].includes(action)) {
      this.flush();
    }
  }

  // Custom tracking methods for specific events
  trackOrderAttempt(orderData: Record<string, unknown>) {
    this.log('order_attempt', orderData);
  }

  trackOrderSuccess(orderNumber: string, total: number) {
    this.log('order_success', { orderNumber, total });
  }

  trackOrderError(error: string, orderData?: Record<string, unknown>) {
    this.log('order_error', orderData, error);
  }

  trackProductView(productSlug: string, productName: string, price: number) {
    this.log('product_view', { productSlug, productName, price });
  }

  trackAddToCart(productSlug: string, quantity: number) {
    this.log('add_to_cart', { productSlug, quantity });
  }

  trackCheckoutStart(cartItems: number, total: number) {
    this.log('checkout_start', { cartItems, total });
  }

  trackPhoneEntered(hasPhone: boolean) {
    this.log('phone_entered', { hasPhone });
  }

  private async flush(sync = false) {
    if (this.buffer.length === 0) return;

    const logs = [...this.buffer];
    this.buffer = [];

    const payload = JSON.stringify({ logs });

    if (sync && navigator.sendBeacon) {
      navigator.sendBeacon('/api/raw-logs', payload);
      return;
    }

    try {
      await fetch('/api/raw-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });
    } catch (err) {
      // Re-add to buffer on failure
      this.buffer.unshift(...logs);
    }
  }
}

// Singleton instance
export const tracker = new UserTracker();

// React hook for initialization
export function useTracker() {
  if (typeof window !== 'undefined') {
    tracker.init();
  }
  return tracker;
}
