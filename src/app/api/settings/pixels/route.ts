import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Default pixels configuration
const DEFAULT_PIXELS = {
  facebook: ['1035868502633279'],
  tiktok: ['DA10P6BC77U9J4MASLAG', 'DABICCJC77UDHLL3BCJG', 'D9SE8ARC77U40SOI9EG0'],
  google: [],
  snapchat: [],
  twitter: [],
};

export async function GET() {
  try {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'pixels_config')
        .maybeSingle();

      if (!error && data && data.value) {
        return NextResponse.json({ success: true, data: data.value });
      }
    }

    return NextResponse.json({ success: true, data: DEFAULT_PIXELS });
  } catch (error: any) {
    console.error('Get pixels settings error:', error);
    return NextResponse.json({ success: true, data: DEFAULT_PIXELS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Filter out empty strings from arrays
    const cleanedPixels = {
      facebook: (body.facebook || []).filter((p: string) => p && p.trim()),
      tiktok: (body.tiktok || []).filter((p: string) => p && p.trim()),
      google: (body.google || []).filter((p: string) => p && p.trim()),
      snapchat: (body.snapchat || []).filter((p: string) => p && p.trim()),
      twitter: (body.twitter || []).filter((p: string) => p && p.trim()),
    };

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'pixels_config',
          value: cleanedPixels,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'key',
        });

      if (error) {
        console.error('Supabase save pixels error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'Pixels saved successfully', data: cleanedPixels });
  } catch (error: any) {
    console.error('Save pixels error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
