import { NextRequest, NextResponse } from 'next/server';
import { createParcel, ParcelInput } from '@/lib/easyandspeed';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ['order_id', 'firstname', 'familyname', 'contact_phone', 'address', 'to_commune_id', 'to_wilaya_id', 'product_list', 'price'];
    for (const field of required) {
      if (!body[field] && body[field] !== 0) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const parcelInput: ParcelInput = {
      order_id: body.order_id,
      firstname: body.firstname,
      familyname: body.familyname,
      contact_phone: body.contact_phone,
      address: body.address,
      to_commune_id: body.to_commune_id,
      to_wilaya_id: body.to_wilaya_id,
      product_list: body.product_list,
      price: body.price,
      declared_value: body.declared_value,
      freeshipping: body.freeshipping,
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
