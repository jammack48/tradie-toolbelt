import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_EXT_SUPABASE_URL || 'https://qrkojbfayjrtrlrmgzry.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_EXT_SUPABASE_ANON_KEY || 'sb_publishable_P8s5LPIKyxYxM9UUwthePA_j12HHtet';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("[supabase] Missing VITE_EXT_SUPABASE_URL or VITE_EXT_SUPABASE_ANON_KEY — external DB features will not work.");
}

export const supabase: SupabaseClient | null = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
