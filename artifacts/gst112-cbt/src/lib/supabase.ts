import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

/** True when both env vars are present — gates all Supabase calls. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Only instantiate the client when credentials are present.
// Calling createClient('', '') throws at runtime, so we guard it.
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as SupabaseClient);
