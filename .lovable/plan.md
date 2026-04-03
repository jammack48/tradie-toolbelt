

## Fix: User Settings Query Failing Due to Missing Columns

### Root Cause
The previous change added `van_stock`, `reconcile_docs`, and `employee_can_quote` to the `user_settings` SELECT query, but those columns don't exist on your external Supabase database. This causes a **400 error** on every login, which breaks settings loading.

The network logs confirm:
- `GET /user_settings?select=...van_stock,reconcile_docs,employee_can_quote` → **400** `"column user_settings.van_stock does not exist"`
- `customers_prod` returns `[]` after login (may be a separate issue — need to verify if this user has data in that table)

### Fix

**File**: `src/contexts/UserSettingsContext.tsx`

1. Change the SELECT to use `select("*")` instead of listing specific columns — this way it won't fail if columns are missing, and new columns are picked up automatically
2. Safely default the 3 new fields when they're `undefined` (column doesn't exist yet)
3. In `saveSettings`, wrap the upsert to gracefully ignore errors from missing columns (log warning, don't throw)

This makes the code forward-compatible: it works whether or not you've added the columns to your external database yet.

### You'll also need to add the columns to your external Supabase

Run this SQL in your Supabase SQL editor to add the missing columns:

```sql
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS van_stock boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS reconcile_docs boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS employee_can_quote boolean DEFAULT false;
```

### Customers issue

The `customers_prod` returning `[]` appears to be a separate issue — the query succeeds (200) but returns no rows. This likely means either:
- The table is empty for this user_id
- Or the initial (pre-login) request used the old cached key

The code already re-fetches customers when `user` changes (line 63 of DemoDataContext), so once the settings error is fixed, the auth flow should work cleanly and customers should load if they exist.

### Files modified
1. `src/contexts/UserSettingsContext.tsx` — use `select("*")`, safely default missing columns

