

## Diagnosis: App Likely Crashing on Missing Env Vars

The most probable cause of the blank screen is `src/lib/supabase.ts` line 6-8 — it throws a hard error if `VITE_EXT_SUPABASE_URL` or `VITE_EXT_SUPABASE_ANON_KEY` are not available at build time. Unlike `authSupabase.ts` (which gracefully warns and exports `null`), this file crashes the entire app.

The secrets exist in Lovable's secret store, but the `throw` is aggressive — if there's any timing issue or if the preview loads before secrets are injected, everything breaks.

### Fix

**File: `src/lib/supabase.ts`**

Make it match the graceful pattern used by `authSupabase.ts`:
- Replace the `throw` with a `console.warn`
- Export `null` when env vars are missing instead of crashing
- Update the type export so consumers can handle `null`

```ts
const SUPABASE_URL = import.meta.env.VITE_EXT_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_EXT_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("[supabase] Missing VITE_EXT_SUPABASE_URL or VITE_EXT_SUPABASE_ANON_KEY — external DB features will not work.");
}

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { ... })
  : null;
```

This single change should stop the crash and let the app load. The supplier/materials features will simply show "Sign in to manage..." or empty states when the external DB isn't reachable, rather than killing the entire app.

### Files changed
- `src/lib/supabase.ts` — replace `throw` with `console.warn`, export `null` gracefully

