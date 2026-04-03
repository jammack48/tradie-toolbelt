

## Fix: Update External Supabase Anon Key

The anon key for your external Supabase project was regenerated (the old key had a different `iat` timestamp). The hardcoded fallback in `src/lib/supabase.ts` still has the old key, which is why every request returns "Invalid API key".

### Change

**File**: `src/lib/supabase.ts`
- Replace the old anon key fallback with the new one:
  - Old: `eyJ...OTUxNjAs...unVw`
  - New: `eyJ...OTcxNTQs...4oA`

That's it — one line change. The URL and project ref are unchanged.

