import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_EXT_SUPABASE_URL || 'https://qrkojbfayjrtrlrmgzry.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_EXT_SUPABASE_ANON_KEY || 'sb_publishable_P8s5LPIKyxYxM9UUwthePA_j12HHtet';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
