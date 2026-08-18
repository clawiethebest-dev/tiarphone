export type Locale = 'ar' | 'fr' | 'en';

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  specifications?: Record<string, string>;
  inStock: boolean;
  stock?: number;
  featured?: boolean;
  deal?: boolean;
  rating?: number;
  reviewsCount?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  phone: string;
  phone2?: string;
  wilayaId: number;
  wilayaName: string;
  communeId?: number;
  communeName?: string;
  address: string;
  deliveryType: 'home' | 'desk';
  stopDeskId?: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  customer: CustomerInfo;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
  trackingNumber?: string;
  trafficSource?: string;
  landingPage?: string;
}

export interface DeliveryFee {
  wilaya_id: number;
  wilaya_name: string;
  home_fee: number;
  desk_fee: number;
  is_deliverable: boolean;
}

export interface Wilaya {
  id: number;
  name: string;
  home_fee: number;
  desk_fee: number;
  is_deliverable: boolean;
}

export interface Commune {
  id: number;
  name: string;
  wilaya_id: number;
  has_stop_desk?: boolean;
}

export interface StoreSettings {
  storeName?: string;
  storePhone?: string;
  storeEmail?: string;
  deliveryFees?: Record<string, number>;
  freeDeliveryThreshold?: number;
  currency?: string;
  [key: string]: any;
}

export interface Coupon {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  minOrder?: number;
  expiresAt?: string;
}
