import { NextRequest, NextResponse } from 'next/server';
import { getCommunesByWilaya } from '@/lib/easyandspeed';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const wilayaId = searchParams.get('wilaya_id');

  if (!wilayaId) {
    return NextResponse.json(
      { success: false, error: 'wilaya_id is required' },
      { status: 400 }
    );
  }

  try {
    const communes = await getCommunesByWilaya(parseInt(wilayaId));

    return NextResponse.json({
      success: true,
      data: communes.map(c => ({
        id: c.id,
        name: c.name,
        wilaya_id: c.wilaya_id,
        has_stop_desk: c.has_stop_desk === 1,
        is_deliverable: c.is_deliverable === 1,
      })),
    });
  } catch (error) {
    console.error('Error fetching communes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch communes' },
      { status: 500 }
    );
  }
}
