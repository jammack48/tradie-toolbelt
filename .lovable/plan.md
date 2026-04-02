
Goal

- Make the app use only your external Supabase for auth, demo data, and production data.
- Remove the code path that is currently defaulting to the managed backend.

What I’ll change

1. Lock the shared frontend client to your Supabase only
- Update `src/lib/supabase.ts` so it uses only your external credentials (`VITE_EXT_SUPABASE_URL` / `VITE_EXT_SUPABASE_ANON_KEY`) plus an external-only hardcoded fallback if needed for preview reliability.
- Remove all reads of `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from app code.
- Replace the current error text so it no longer mentions the managed env vars.

2. Add the hardcoded warning comment at the top of the key file
- Put a clear header comment at the top of `src/lib/supabase.ts`, for example:
```ts
/**
 * DO NOT USE LOVABLE CLOUD.
 * This app must use the customer's external Supabase only.
 * Auth, demo data, and production data all live there.
 */
```
- Mirror the same warning in `src/lib/authSupabase.ts` so future edits do not reintroduce the wrong client.

3. Keep auth and data on the same external session
- Keep `src/lib/authSupabase.ts` as a thin alias to the same external-only client so login, reset password, JWT helpers, and table queries all share one session.
- This keeps RLS/auth working correctly for `customers_prod`, `suppliers`, `supplier_items`, `job_materials`, and `user_settings`.

4. Keep demo data in your Supabase, not in a second backend
- Leave the `_demo` / `_prod` table routing in `src/lib/modeTable.ts` as-is.
- `dbDemoService`, `servicingService`, `variationsService`, `customerImportService`, `supplierService`, `supplierImportService`, `jobMaterialsService`, and `UserSettingsContext` already point at `@/lib/supabase`, so once step 1 is fixed they will all hit your Supabase automatically.

5. Remove app-level dependency on the managed generated client
- Do not import `@/integrations/supabase/client` anywhere in runtime code.
- Do not wire app logic to the generated managed types/client.
- Leave platform-managed generated files physically present if required, but make them completely unused by the app.

Expected result

- Login connects to your Supabase.
- Customers connect to your Supabase.
- Materials and supplier search connect to your Supabase.
- Demo tables like `customers_demo`, `service_reminders_demo`, and `variations_demo` stay in your Supabase.
- Production tables like `customers_prod`, `suppliers`, `supplier_items`, `job_materials`, and `user_settings` stay in your Supabase.
- No app code will fall back to the managed backend anymore.

Technical details

- The main break is centralized in `src/lib/supabase.ts`: it currently prefers `VITE_SUPABASE_*` before `VITE_EXT_*`, and `src/lib/authSupabase.ts` re-exports that same client.
- Because nearly all auth/data code already flows through this shared client, this is a focused wiring fix, not a schema rebuild.
- No database migration is needed for this change.
- I will keep the main shared client untyped against the generated managed schema so the app does not depend on the wrong database definitions.
