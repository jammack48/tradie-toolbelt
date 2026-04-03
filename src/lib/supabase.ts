/**
 * !! DO NOT USE LOVABLE CLOUD !!
 * This app must use the customer's external Supabase project ONLY.
 * Auth, demo data, and production data all live on project qrkojbfayjrtrlrmgzry.
 * Never import from @/integrations/supabase/client in runtime code.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  import.meta.env.VITE_EXT_SUPABASE_URL ||
  'https://qrkojbfayjrtrlrmgzry.supabase.co';

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_EXT_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFya29qYmZheWpydHJscm1nenJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTcxNTQsImV4cCI6MjA4ODU3MzE1NH0.xVKR6dILRdUkdUmUCANysKqlviWxfATrSKo-SvyT4oA';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
