import { NextResponse } from 'next/server';
import { getWilayas, getAllDeliveryFees } from '@/lib/easyandspeed';
import { ALGERIA_WILAYAS } from '@/data/wilayas';

export async function GET() {
  try {
    const wilayas = await getWilayas();
    const fees = await getAllDeliveryFees();

    // Combine wilayas with their fees and Arabic translations
    const wilayasWithFees = wilayas.map(wilaya => {
      const fee = fees.find(f => f.wilaya_id === wilaya.id);
      const arInfo = ALGERIA_WILAYAS.find(item => item.id === wilaya.id);
      const nameAr = arInfo?.name_ar || wilaya.name;
      const code = arInfo?.code || wilaya.id.toString().padStart(2, '0');
      
      return {
        id: wilaya.id,
        code,
        name: wilaya.name,
        name_ar: nameAr,
        display_name: `${code} - ${nameAr} (${wilaya.name})`,
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
