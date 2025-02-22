import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Export authentication and database services
export const auth = supabase.auth;
export const db = supabase; // Supabase doesn't have a separate Firestore-like API, you directly use the supabase client for database operations.
