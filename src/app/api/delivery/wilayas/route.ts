import { NextResponse } from 'next/server';
import { getWilayas, getAllDeliveryFees } from '@/lib/easyandspeed';

export async function GET() {
  try {
    const wilayas = await getWilayas();
    const fees = await getAllDeliveryFees();

    // Combine wilayas with their fees
    const wilayasWithFees = wilayas.map(wilaya => {
      const fee = fees.find(f => f.wilaya_id === wilaya.id);
      return {
        id: wilaya.id,
        name: wilaya.name,
        zone: wilaya.zone,
        is_deliverable: wilaya.is_deliverable === 1,
        home_fee: fee?.home_fee || 600,
        desk_fee: fee?.desk_fee || 400,
      };
    });

    return NextResponse.json({
      success: true,
      data: wilayasWithFees,
    });
  } catch (error) {
    console.error('Error fetching wilayas:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wilayas' },
      { status: 500 }
    );
  }
}
