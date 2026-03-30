

## Fix: Make External Supabase Credentials Available at Build Time

### Problem
`VITE_EXT_SUPABASE_URL` and `VITE_EXT_SUPABASE_ANON_KEY` exist as runtime secrets but Vite requires `VITE_`-prefixed variables at **build time**. The preview build never sees them, so `authSupabase = null` and `supabase = null`, causing "Auth not configured" on login and "Cannot read properties of null" when loading customers.

### Console Errors You Can Ignore
- RS SDK / TikTok