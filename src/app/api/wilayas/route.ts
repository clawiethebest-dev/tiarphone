import { NextResponse } from 'next/server';
import COMMUNES_DATA from '@/data/communes.json';

export async function GET() {
  try {
    const wilayas = (COMMUNES_DATA as any).wilayas || [];
    
    return NextResponse.json({
      success: true,
      wilayas: wilayas.map((w: any) => ({
        id: w.id,
        name: w.name,
        home_fee: w.home_fee,
        desk_fee: w.desk_fee,
        is_deliverable: w.is_deliverable !== false,
      })),
    });
  } catch (error) {
    console.error('Wilayas error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wilayas' },
      { status: 500 }
    );
  }
}
