import { supabase, isSupabaseConfigured } from './supabase';
import { ALL_PRODUCTS, getProductBySlug, getProductsByCategory, getFeaturedProducts, getDealProducts, searchProducts } from '@/data/products';
import type { Product, Order, CustomerInfo, StoreSettings, Coupon } from '@/types';

// Products API
export async function getProducts(options?: {
  category?: string;
  featured?: boolean;
  deals?: boolean;
  search?: string;
  limit?: number;
}): Promise<Product[]> {
  // Use static data (can be replaced with Supabase later)
  let filtered = [...ALL_PRODUCTS];

  if (options?.category && options.category !== 'all') {
    filtered = filtered.filter((p) => p.category === options.category);
  }
  if (options?.featured) {
    filtered = filtered.filter((p) => p.featured);
  }
  if (options?.deals) {
    filtered = filtered.filter((p) => p.deal);
  }
  if (options?.search) {
    const search = options.search.toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(search));
  }
  if (options?.limit) {
    filtered = filtered.slice(0, options.limit);
  }

  return filtered;
}

export async function getProduct(slug: string): Promise<Product | null> {
  return getProductBySlug(slug) || null;
}

export async function getRelatedProducts(category: string, excludeSlug: string, limit = 4): Promise<Product[]> {
  return ALL_PRODUCTS
    .filter((p) => p.category === category && p.slug !== excludeSlug)
    .slice(0, limit);
}

// Orders API
export async function createOrder(order: {
  items: Array<{ productId: string; quantity: number; price: number }>;
  customer: CustomerInfo;
  subtotal: number;
  deliveryCost: number;
  total: number;
  couponCode?: string;
  discount?: number;
  notes?: string;
}) {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      id: `ORD-${Date.now()}`,
      ...order,
      status: 'pending',
      created_at: new Date().toISOString()
    };
  }

  const { data, error } = await supabase
    .from('orders')
    .insert([{
      ...order,
      status: 'pending',
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get store settings
export async function getStoreSettings(): Promise<StoreSettings> {
  // Default settings
  return {
    storeName: 'Tiarphone',
    storePhone: '+213 555 123 456',
    storeEmail: 'contact@tiarphone.com',
    freeDeliveryThreshold: 5000,
    defaultDeliveryCost: 500
  };
}

// Validate coupon
export async function validateCoupon(code: string): Promise<Coupon | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('coupons')
    .select()
    .eq('code', code.toUpperCase())
    .eq('active', true)
    .single();

  if (error || !data) return null;
  return data as Coupon;
}
