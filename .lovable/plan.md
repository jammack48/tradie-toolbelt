

## Fix: Customers Not Loading, Price Book Not Saving, Hardcoded Materials in Production

### Root Causes

1. **Two separate Supabase clients** — `authSupabase` (handles login) and `supabase` (handles data) are independent `createClient` instances pointing to the same project. When a user logs in via `authSupabase`, the data client `supabase` has no session. RLS policies on `customers_prod`, `suppliers`, `supplier_items`, and `job_materials` require `auth.uid()`, which returns null on the sessionless data client. Result: all queries silently return empty or fail.

2. **Null client not guarded** — `supabase` is typed as `SupabaseClient | null` but supplier/material services call `.from()` without null checks, causing crashes.

3. **Hardcoded materials in job details** — `getJobDetail()` returns items from `materialsPool` (hardcoded catalogue) for every job. In production mode, materials should come exclusively from the `MaterialsTab` component (which queries `job_materials` from DB).

### Changes

**1. Merge into a single Supabase client** (`src/lib/supabase.ts`)
- Remove the separate `authSupabase` client file
- Export one non-null `supabase` client (with hardcoded fallbacks, it's always created)
- Change the export type from `SupabaseClient | null` to `SupabaseClient`
- Remove the null check conditional

**2. Update `src/lib/authSupabase.ts`**
- Re-export the single client: `export { supabase as authSupabase } from "@/lib/supabase"`
- This means login session and data queries share the same client, so RLS sees `auth.uid()` correctly

**3. Update `src/contexts/AuthContext.tsx`**
- Import from the unified client (no change needed if `authSupabase` re-export works)

**4. Remove null guards in services**
- `supplierService.ts`, `supplierImportService.ts`, `jobMaterialsService.ts`, `dbDemoService.ts` — remove `as any` casts where they exist for null safety; the client is now guaranteed non-null

**5. Remove hardcoded materials from production job details**
- In `getJobDetail()` (`src/data/dummyJobDetails.ts`): when called for production jobs, set `materials: []` — the `MaterialsTab` component already handles fetching real materials from `job_materials` table
- Keep hardcoded materials only for demo mode jobs (controlled by checking if the caller passes a flag, or simply always return empty materials since `MaterialsTab` is the source of truth for the UI)

**6. Clean up `DemoDataContext` materials reference**
- `materials: materialsSeed` is only used for demo mode display — keep as-is for demo, but ensure production views don't reference it

### Why This Fixes Everything
- **Customers**: Same client holds the auth session → `auth.uid()` resolves → RLS allows `SELECT` on `customers_prod`
- **Suppliers/Price Book**: Same fix — authenticated session flows through to `suppliers` and `supplier_items` tables
- **Materials**: `MaterialsTab` already queries `job_materials` from DB; removing hardcoded materials from `getJobDetail()` ensures production shows only real data

