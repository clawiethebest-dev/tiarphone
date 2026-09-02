import { supabase, isSupabaseConfigured } from './supabase';

// Default pixels configuration
const DEFAULT_PIXELS = {
  facebook: ['1035868502633279'],
  tiktok: ['DA10P6BC77U9J4MASLAG', 'DABICCJC77UDHLL3BCJG', 'D9SE8ARC77U40SOI9EG0'],
  google: [] as string[],
  snapchat: [] as string[],
  twitter: [] as string[],
};

export interface PixelConfig {
  facebook: string[];
  tiktok: string[];
  google: string[];
  snapchat: string[];
  twitter: string[];
}

export async function getPixelsConfig(): Promise<PixelConfig> {
  try {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'pixels_config')
        .maybeSingle();

      if (!error && data && data.value) {
        return {
          facebook: data.value.facebook || DEFAULT_PIXELS.facebook,
          tiktok: data.value.tiktok || DEFAULT_PIXELS.tiktok,
          google: data.value.google || [],
          snapchat: data.value.snapchat || [],
          twitter: data.value.twitter || [],
        };
      }
    }
  } catch (error) {
    console.error('Error fetching pixels config:', error);
  }

  return DEFAULT_PIXELS;
}
