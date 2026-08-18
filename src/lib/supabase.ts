import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wlyizmzzapmtwdrvmsff.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create client only if we have credentials
export const supabase = supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Storage URL helper
export const getProductImageUrl = (path: string) => {
  if (path.startsWith('http')) return path;
  return `${supabaseUrl}/storage/v1/object/public/products/${path}`;
};

// Product images base URL
export const PRODUCT_IMAGES_BASE = `${supabaseUrl}/storage/v1/object/public/products/hd`;

// Check if Supabase is configured
export const isSupabaseConfigured = () => !!supabaseAnonKey && supabaseAnonKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';
