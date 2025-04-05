import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

export const createSupabaseAdmin = () => {
  return createClient(supabaseUrl, supabaseAnonKey);
};
