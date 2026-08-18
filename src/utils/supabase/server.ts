import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server-side client with service key for admin operations
export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseServiceKey);
};

export const supabase = createClient();
