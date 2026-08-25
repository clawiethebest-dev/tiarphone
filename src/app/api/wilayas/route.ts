import { NextResponse } from 'next/server';
import COMMUNES_DATA from '@/data/communes.json';
import { ALGERIA_WILAYAS } from '@/data/wilayas';

export async function GET() {
  try {
    const wilayas = (COMMUNES_DATA as any).wilayas || [];
    
    return NextResponse.json({
      success: true,
      wilayas: wilayas.map((w: any) => {
        const arInfo = ALGERIA_WILAYAS.find(item => item.id === w.id);
        const nameAr = arInfo?.name_ar || w.name;
        const code = arInfo?.code || w.id.toString().padStart(2, '0');
        return {
          id: w.id,
          code,
          name: w.name,
          name_ar: nameAr,
          display_name: `${code} - ${nameAr} (${w.name})`,
          home_fee: w.home_fee,
          desk_fee: w.desk_fee,
          is_deliverable: w.is_deliverable !== false,
        };
      }),
    });
  } catch (error) {
    console.error('Wilayas error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wilayas' },
      { status: 500 }
    );
  }
}
