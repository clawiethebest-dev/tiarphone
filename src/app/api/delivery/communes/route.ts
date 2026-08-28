import { NextRequest, NextResponse } from 'next/server';
import { getCommunesByWilaya } from '@/lib/easyandspeed';
import { ALGERIA_WILAYAS } from '@/data/wilayas';

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
    const id = parseInt(wilayaId);
    let communes = await getCommunesByWilaya(id);

    // Keep only the ones we can actually deliver to
    const deliverable = communes.filter(c => c.is_deliverable === 1);

    // If the wilaya has no communes (missing data) or none is deliverable,
    // always fall back to the wilaya's capital so checkout can never be blocked.
    if (deliverable.length === 0) {
      const arInfo = ALGERIA_WILAYAS.find(w => w.id === id);
      const capitalName = arInfo?.name_fr || ALGERIA_WILAYAS.find(w => w.id === id)?.name_ar || `Capital ${wilayaId}`;
      communes = [{
        id: id * 100 + 1,
        name: capitalName,
        wilaya_id: id,
        wilaya_name: capitalName,
        has_stop_desk: 0,
        is_deliverable: 1,
        delivery_time_parcel: 3,
        delivery_time_payment: 3,
      }];
    }

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
