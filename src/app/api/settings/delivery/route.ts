import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Default delivery pricing settings (from Biskra - official pricing)
const DEFAULT_DELIVERY_SETTINGS = {
  apiId: process.env.EASYANDSPEED_API_ID || '43111994324492430728',
  apiToken: process.env.EASYANDSPEED_API_TOKEN || 'MQ0W3Zz4xgbuAdeHU9tfFTOyaLKvDVicGl7IrpqEYCBm2ko61wS8J5nRjhPsNX',
  zone0Home: 500,   // Biskra
  zone0Desk: 450,
  zone1Home: 600,   // Batna, M'Sila, Khenchela
  zone1Desk: 550,
  zone2Home: 800,   // Alger, Blida, etc.
  zone2Desk: 750,
  zone3Home: 950,   // Oran, Tlemcen, etc.
  zone3Desk: 900,
  zone4Home: 1750,  // Tamanrasset, etc.
  zone4Desk: 1650,
};

export async function GET() {
  try {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'delivery_settings')
        .maybeSingle();

      if (!error && data && data.value) {
        return NextResponse.json({ success: true, data: data.value });
      }
    }

    return NextResponse.json({ success: true, data: DEFAULT_DELIVERY_SETTINGS });
  } catch (error: any) {
    console.error('Get delivery settings error:', error);
    return NextResponse.json({ success: true, data: DEFAULT_DELIVERY_SETTINGS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'delivery_settings',
          value: body,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'key',
        });

      if (error) {
        console.error('Supabase save delivery settings error:', error);
      }
    }

    return NextResponse.json({ success: true, message: 'Settings saved successfully', data: body });
  } catch (error: any) {
    console.error('Save delivery settings error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
