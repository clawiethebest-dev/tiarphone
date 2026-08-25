import { NextRequest, NextResponse } from 'next/server';
import { createParcel, ParcelInput } from '@/lib/easyandspeed';
import { ALGERIA_WILAYAS } from '@/data/wilayas';
import FALLBACK_COMMUNES from '@/data/communes.json';

const allCommunes = (FALLBACK_COMMUNES as any).communes || [];
const allWilayas = (FALLBACK_COMMUNES as any).wilayas || [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    let wilayaId = parseInt(body.to_wilaya_id || body.wilaya_id || '0') || 0;
    let communeId = parseInt(body.to_commune_id || body.commune_id || '0') || 0;
    const wilayaText = (body.wilaya || body.wilaya_name || '').toString().trim();
    const communeText = (body.commune || body.commune_name || '').toString().trim();

    // 1. Resolve wilayaId if missing or 0
    if (!wilayaId && wilayaText) {
      // Check if wilayaText contains a number (e.g. "wilaya_31", "31 - وهران", "31")
      const numMatch = wilayaText.match(/\d+/);
      if (numMatch) {
        const n = parseInt(numMatch[0]);
        if (n >= 1 && n <= 58) {
          wilayaId = n;
        }
      }
      
      if (!wilayaId) {
        const found = ALGERIA_WILAYAS.find(w => 
          w.name_ar === wilayaText || 
          w.name_fr.toLowerCase() === wilayaText.toLowerCase() ||
          wilayaText.includes(w.name_ar) ||
          wilayaText.toLowerCase().includes(w.name_fr.toLowerCase())
        );
        if (found) wilayaId = found.id;
      }
    }

    // Default to 31 (Oran) if still 0
    if (!wilayaId) {
      wilayaId = 31;
    }

    // 2. Resolve communeId
    if (communeText) {
      const numMatch = communeText.match(/\d+/);
      if (numMatch) {
        const cId = parseInt(numMatch[0]);
        const found = allCommunes.find((c: any) => c.id === cId && c.wilaya_id === wilayaId);
        if (found) communeId = found.id;
      }

      if (!communeId) {
        const found = allCommunes.find((c: any) => 
          c.wilaya_id === wilayaId && 
          (c.name.toLowerCase() === communeText.toLowerCase() || communeText.toLowerCase().includes(c.name.toLowerCase()))
        );
        if (found) communeId = found.id;
      }
    }

    // If still no communeId, pick the first deliverable commune for that exact wilaya
    if (!communeId) {
      const defaultCommune = allCommunes.find((c: any) => c.wilaya_id === wilayaId && c.is_deliverable === 1) ||
                             allCommunes.find((c: any) => c.wilaya_id === wilayaId);
      communeId = defaultCommune ? defaultCommune.id : (wilayaId * 100 + 1);
    }

    // Clean and format phone number for EasyAndSpeed (10 digits starting with 0)
    let phone = (body.contact_phone || body.phone || '').toString().replace(/\D/g, '');
    if (phone.startsWith('213')) phone = '0' + phone.slice(3);
    if (!phone.startsWith('0') && phone.length === 9) phone = '0' + phone;
    phone = phone.slice(0, 10);

    const firstname = (body.firstname || body.customer_name || 'زبون').toString().trim();
    const familyname = (body.familyname || firstname).toString().trim();
    const address = (body.address || 'Algeria').toString().trim();
    const productList = (body.product_list || body.products_text || 'هواتف وإكسسوارات').toString().trim();
    const price = parseInt(body.price || body.total || '0') || 0;

    const parcelInput: ParcelInput = {
      order_id: body.order_id || `ORD-${Date.now()}`,
      firstname,
      familyname,
      contact_phone: phone,
      address,
      to_commune_id: communeId,
      to_wilaya_id: wilayaId,
      product_list: productList,
      price,
      declared_value: price,
      freeshipping: !!body.freeshipping,
      stopdesk_id: body.stopdesk_id,
      has_exchange: body.has_exchange,
      product_to_collect: body.product_to_collect,
    };

    const parcel = await createParcel(parcelInput);

    return NextResponse.json({
      success: true,
      data: parcel,
    });
  } catch (error: any) {
    console.error('Error creating parcel:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create parcel' },
      { status: 500 }
    );
  }
}
