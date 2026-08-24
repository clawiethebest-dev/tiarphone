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

// Store form data for lost order recovery
interface FormData {
  name?: string;
  phone?: string;
  phone2?: string;
  wilaya?: string;
  commune?: string;
  address?: string;
  product?: string;
  quantity?: number;
  total?: number;
}

class UserTracker {
  private sessionId: string;
  private buffer: RawLogEntry[] = [];
  private flushInterval: ReturnType<typeof setInterval> | null = null;
  private initialized = false;
  private formData: FormData = {};
  private productsViewed: string[] = [];

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

    // Track form inputs (capture values for recovery)
    document.addEventListener('input', (e) => this.trackInputChange(e), true);
    document.addEventListener('change', (e) => this.trackInputChange(e), true);

    // Track form submissions
    document.addEventListener('submit', (e) => this.trackSubmit(e), true);

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // User leaving - save form data
        this.saveFormSnapshot();
      }
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
      url: window.location.href,
    });

    // Flush buffer every 5 seconds
    this.flushInterval = setInterval(() => this.flush(), 5000);

    // Save form data and flush on page unload
    window.addEventListener('beforeunload', () => {
      this.saveFormSnapshot();
      this.log('page_exit', { 
        timeOnPage: performance.now(),
        formData: this.formData,
        productsViewed: this.productsViewed,
      });
      this.flush(true);
    });

    // Also capture when popup closes
    this.observePopupClose();
  }

  private observePopupClose() {
    // Watch for popup/modal being removed from DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            // Check if it's a popup/modal with form data
            const inputs = node.querySelectorAll('input, select, textarea');
            if (inputs.length > 0 && Object.keys(this.formData).length > 0) {
              this.saveFormSnapshot();
            }
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
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
    const text = el.textContent?.trim().substring(0, 100) || '';

    // Detect checkout/order button clicks
    const isCheckoutButton = text.includes('اشتر') || text.includes('شراء') || 
                              text.includes('تأكيد') || text.includes('طلب') ||
                              text.includes('Order') || text.includes('Buy');

    if (isCheckoutButton) {
      this.saveFormSnapshot();
      this.log('checkout_button_click', {
        buttonText: text,
        formData: this.formData,
      });
    }

    this.log('click', {}, undefined, undefined, {
      tag: el.tagName?.toLowerCase(),
      text,
      id: el.id || undefined,
      class: el.className?.toString().substring(0, 100) || undefined,
      href: (el as HTMLAnchorElement).href || undefined,
      dataTrack: el.getAttribute('data-track') || undefined,
    });
  }

  private trackInputChange(e: Event) {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    if (!target || !['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return;

    const name = (target.name || target.id || (target as HTMLInputElement).placeholder || '').toLowerCase();
    const type = (target as HTMLInputElement).type || 'text';
    const value = target.value;
    
    // Don't log passwords
    if (type === 'password') return;

    // Identify field type and store for recovery
    if (name.includes('name') || name.includes('اسم') || name.includes('nom')) {
      this.formData.name = value;
      this.log('field_input', { field: 'name', value, hasValue: !!value });
    } 
    else if (name.includes('phone') || name.includes('هاتف') || name.includes('tel') || type === 'tel') {
      if (name.includes('2') || name.includes('احتياط')) {
        this.formData.phone2 = value;
        this.log('field_input', { field: 'phone2', value, hasValue: !!value });
      } else {
        this.formData.phone = value;
        // Important event - phone entered
        if (value && value.length >= 9) {
          this.log('phone_entered', { phone: value, hasValue: true });
        } else {
          this.log('field_input', { field: 'phone', value, hasValue: !!value });
        }
      }
    }
    else if (name.includes('wilaya') || name.includes('ولاية')) {
      // Get selected text for select elements
      const displayValue = target.tagName === 'SELECT' 
        ? (target as HTMLSelectElement).options[(target as HTMLSelectElement).selectedIndex]?.text 
        : value;
      this.formData.wilaya = displayValue || value;
      this.log('field_input', { field: 'wilaya', value: displayValue || value, hasValue: !!value });
    }
    else if (name.includes('commune') || name.includes('بلدية')) {
      const displayValue = target.tagName === 'SELECT' 
        ? (target as HTMLSelectElement).options[(target as HTMLSelectElement).selectedIndex]?.text 
        : value;
      this.formData.commune = displayValue || value;
      this.log('field_input', { field: 'commune', value: displayValue || value, hasValue: !!value });
    }
    else if (name.includes('address') || name.includes('عنوان') || name.includes('adresse')) {
      this.formData.address = value;
      this.log('field_input', { field: 'address', value, hasValue: !!value });
    }
    else {
      // Generic input tracking
      this.log('input', {
        field: name,
        type,
        hasValue: !!value,
        valueLength: value?.length || 0,
      });
    }
  }

  private trackSubmit(e: Event) {
    const form = e.target as HTMLFormElement;
    this.saveFormSnapshot();
    this.log('form_submit', {
      formId: form.id || undefined,
      formAction: form.action || undefined,
      formData: this.formData,
    });
  }

  private saveFormSnapshot() {
    if (Object.keys(this.formData).length > 0) {
      this.log('form_snapshot', {
        ...this.formData,
        productsViewed: this.productsViewed,
      });
    }
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
    if (['error', 'form_submit', 'order_attempt', 'order_success', 'order_error', 
         'phone_entered', 'checkout_start', 'checkout_button_click', 'form_snapshot'].includes(action)) {
      this.flush();
    }
  }

  // Custom tracking methods for specific events
  trackOrderAttempt(orderData: Record<string, unknown>) {
    this.formData = { ...this.formData, ...orderData };
    this.log('order_attempt', { ...orderData, formData: this.formData });
  }

  trackOrderSuccess(orderNumber: string, total: number) {
    this.log('order_success', { orderNumber, total, formData: this.formData });
    // Clear form data after successful order
    this.formData = {};
  }

  trackOrderError(error: string, orderData?: Record<string, unknown>) {
    this.log('order_error', { ...orderData, formData: this.formData }, error);
  }

  trackProductView(productSlug: string, productName: string, price: number) {
    this.formData.product = productName;
    this.productsViewed.push(productSlug);
    this.log('product_view', { productSlug, productName, price });
  }

  trackAddToCart(productSlug: string, quantity: number, productName?: string, price?: number) {
    this.formData.product = productName;
    this.formData.quantity = quantity;
    this.formData.total = price ? price * quantity : undefined;
    this.log('add_to_cart', { productSlug, quantity, productName, price });
  }

  trackCheckoutStart(cartItems: number, total: number, productName?: string) {
    this.formData.total = total;
    this.formData.product = productName;
    this.log('checkout_start', { cartItems, total, productName, formData: this.formData });
  }

  trackPopupOpen(productName: string, price: number) {
    this.formData.product = productName;
    this.formData.total = price;
    this.log('popup_open', { productName, price });
  }

  trackPopupClose(completed: boolean) {
    this.saveFormSnapshot();
    this.log('popup_close', { completed, formData: this.formData });
    if (completed) {
      this.formData = {};
    }
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
