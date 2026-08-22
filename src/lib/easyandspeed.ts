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
    if (!res.ok) throw new Error('Failed to fetch wilayas');
    return res.json();
  } catch (error) {
    console.error('EasyAndSpeed API error:', error);
    return [];
  }
}

export async function getCommunes(wilayaId?: number): Promise<Commune[]> {
  return getCommunesByWilaya(wilayaId);
}

// Alias for backward compatibility
export async function getCommunesByWilaya(wilayaId?: number): Promise<Commune[]> {
  try {
    const url = wilayaId 
      ? `${API_BASE}/communes?wilaya_id=${wilayaId}`
      : `${API_BASE}/communes`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error('Failed to fetch communes');
    return res.json();
  } catch (error) {
    console.error('EasyAndSpeed API error:', error);
    // Return fallback data
    return (FALLBACK_COMMUNES as any).communes || [];
  }
}

export async function getDeliveryFees(): Promise<DeliveryFee[]> {
  return getAllDeliveryFees();
}

// Alias for backward compatibility
export async function getAllDeliveryFees(): Promise<DeliveryFee[]> {
  try {
    const res = await fetch(`${API_BASE}/deliveryfees`, { headers });
    if (!res.ok) throw new Error('Failed to fetch delivery fees');
    return res.json();
  } catch (error) {
    console.error('EasyAndSpeed API error:', error);
    return [];
  }
}

export async function calculateDeliveryFee(wilayaId: number, toHome: boolean = true): Promise<number> {
  const fees = await getDeliveryFees();
  const fee = fees.find(f => f.wilaya_id === wilayaId);
  if (!fee || !fee.is_deliverable) return 0;
  return toHome ? fee.home_fee : fee.desk_fee;
}

export async function createParcel(parcel: ParcelInput): Promise<any> {
  try {
    // Validate commune_id before sending to EasyAndSpeed
    // Get communes for this wilaya to verify the commune_id is valid
    const communes = await getCommunes(parcel.to_wilaya_id);
    const validCommune = communes.find(c => c.id === parcel.to_commune_id);
    
    let finalParcel = { ...parcel };
    
    if (!validCommune) {
      // Commune ID not found - try to find a valid commune for this wilaya
      console.warn(`Invalid commune_id ${parcel.to_commune_id} for wilaya ${parcel.to_wilaya_id}. Looking for alternative...`);
      
      // Find the first deliverable commune for this wilaya
      const deliverableCommune = communes.find(c => 
        c.wilaya_id === parcel.to_wilaya_id && c.is_deliverable === 1
      );
      
      if (deliverableCommune) {
        console.log(`Using alternative commune: ${deliverableCommune.name} (ID: ${deliverableCommune.id})`);
        finalParcel.to_commune_id = deliverableCommune.id;
      } else {
        throw new Error(`No valid commune found for wilaya ${parcel.to_wilaya_id}. Please check the commune selection.`);
      }
    }
    
    const res = await fetch(`${API_BASE}/parcels`, {
      method: 'POST',
      headers,
      body: JSON.stringify(finalParcel),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errorMsg = errorData.message || errorData.error || `HTTP ${res.status}`;
      throw new Error(errorMsg);
    }
    
    return res.json();
  } catch (error) {
    console.error('EasyAndSpeed API error:', error);
    throw error;
  }
}
