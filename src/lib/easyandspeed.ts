/**
 * EasyAndSpeed (Yalidine) API Integration
 * For delivery cost calculation and automatic order transfer
 *
 * API credentials and delivery fees are configurable via:
 * - Admin Settings -> التوصيل
 * - /api/settings/delivery endpoint
 */

// Import fallback communes data (static JSON for offline/rate-limit resilience)
import FALLBACK_COMMUNES from '@/data/communes.json';

const API_BASE = 'https://api.easyandspeed.app/v1';

// Default credentials (can be overridden via settings)
const DEFAULT_API_ID = '43111994324492430728';
const DEFAULT_API_TOKEN = 'MQ0W3Zz4xgbuAdeHU9tfFTOyaLKvDVicGl7IrpqEYCBm2ko61wS8J5nRjhPsNX';

// Get API credentials (from env or defaults)
const API_ID = process.env.EASYANDSPEED_API_ID || DEFAULT_API_ID;
const API_TOKEN = process.env.EASYANDSPEED_API_TOKEN || DEFAULT_API_TOKEN;

const headers = {
  'X-API-ID': API_ID,
  'X-API-TOKEN': API_TOKEN,
  'Content-Type': 'application/json',
};

// Types
export interface Wilaya {
  id: number;
  name: string;
  zone: number;
  is_deliverable: number;
}

export interface Commune {
  id: number;
  name: string;
  wilaya_id: number;
  wilaya_name: string;
  has_stop_desk: number;
  is_deliverable: number;
  delivery_time_parcel: number;
  delivery_time_payment: number;
}

export interface Center {
  center_id: number;
  name: string;
  address: string;
  gps: string;
  commune_id: number;
  commune_name: string;
  wilaya_id: number;
  wilaya_name: string;
}

export interface DeliveryFee {
  wilaya_id: number;
  wilaya_name: string;
  home_fee: number;
  desk_fee: number;
  is_deliverable: boolean;
}

export interface ParcelInput {
  order_id: string;
  firstname: string;
  familyname: string;
  contact_phone: string;
  address: string;
  to_commune_id: number;
  to_wilaya_id: number;
  product_list: string;
  price: number;
  declared_value?: number;
  freeshipping?: boolean;
  stopdesk_id?: number;
  has_exchange?: boolean;
  product_to_collect?: string;
}

// API Functions
export async function getWilayas(): Promise<Wilaya[]> {
  try {
    const res = await fetch(`${API_BASE}/wilayas`, { headers });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.data)) return data.data;
    }
  } catch (error) {
    console.error('EasyAndSpeed API error:', error);
  }
  return ((FALLBACK_COMMUNES as any).wilayas || []).map((w: any) => ({
    id: w.id,
    name: w.name,
    zone: 2,
    is_deliverable: w.is_deliverable !== false ? 1 : 0
  }));
}

export async function getCommunes(wilayaId?: number): Promise<Commune[]> {
  return getCommunesByWilaya(wilayaId);
}

// Alias for backward compatibility
export async function getCommunesByWilaya(wilayaId?: number): Promise<Commune[]> {
  // Use fallback data directly (API has rate limits and pagination issues)
  const allCommunes: Commune[] = (FALLBACK_COMMUNES as any).communes || [];
  
  if (wilayaId) {
    return allCommunes.filter(c => c.wilaya_id === wilayaId);
  }
  return allCommunes;
}

export async function getDeliveryFees(): Promise<DeliveryFee[]> {
  return getAllDeliveryFees();
}

// Alias for backward compatibility
export async function getAllDeliveryFees(): Promise<DeliveryFee[]> {
  const fallbackWilayas = (FALLBACK_COMMUNES as any).wilayas || [];
  return fallbackWilayas.map((w: any) => ({
    wilaya_id: w.id,
    wilaya_name: w.name,
    home_fee: w.home_fee || 700,
    desk_fee: w.desk_fee || 400,
    is_deliverable: w.is_deliverable !== false,
  }));
}

export async function calculateDeliveryFee(wilayaId: number, toHome: boolean = true): Promise<number> {
  const fees = await getDeliveryFees();
  const fee = fees.find(f => f.wilaya_id === wilayaId);
  if (!fee || !fee.is_deliverable) return 0;
  return toHome ? fee.home_fee : fee.desk_fee;
}

export async function createParcel(parcel: ParcelInput): Promise<any> {
  try {
    const communes = await getCommunes(parcel.to_wilaya_id);
    let validCommune = communes.find(c => c.id === parcel.to_commune_id);
    if (!validCommune) {
      validCommune = communes.find(c => c.is_deliverable === 1) || communes[0];
    }

    const wilayas = await getWilayas();
    const validWilaya = wilayas.find(w => w.id === parcel.to_wilaya_id);

    const communeName = validCommune?.name || 'Oran';
    const wilayaName = validWilaya?.name || validCommune?.wilaya_name || 'Oran';

    const payload = [{
      order_id: parcel.order_id,
      firstname: parcel.firstname,
      familyname: parcel.familyname || parcel.firstname,
      contact_phone: parcel.contact_phone,
      address: parcel.address,
      to_commune_name: communeName,
      to_wilaya_name: wilayaName,
      is_stopdesk: parcel.stopdesk_id ? true : false,
      has_exchange: !!parcel.has_exchange,
      product_list: parcel.product_list || 'هواتف وإكسسوارات',
      price: parcel.price,
      freeshipping: !!parcel.freeshipping,
      declared_value: parcel.declared_value || parcel.price,
      do_insurance: false,
    }];

    const res = await fetch(`${API_BASE}/parcels`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const resData = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = resData.message || resData.error?.message || resData.error || `HTTP ${res.status}`;
      throw new Error(errorMsg);
    }

    // EasyAndSpeed returns { [order_id]: { success: true, tracking: "...", ... } }
    const orderResult = resData[parcel.order_id] || (Object.values(resData)[0] as any);
    if (orderResult) {
      if (orderResult.success === false) {
        throw new Error(orderResult.message || 'فشل في إنشاء الطرد في EasyAndSpeed');
      }
      return orderResult;
    }

    return resData;
  } catch (error) {
    console.error('EasyAndSpeed createParcel error:', error);
    throw error;
  }
}
