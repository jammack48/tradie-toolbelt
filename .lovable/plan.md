

## Two Fixes

### Issue 1: Materials not loading in "On the Tools" mode

Both Office (`JobCard`) and Work (`WorkJobCard`) render the same `<MaterialsTab jobId={job.id} />` component, which uses `useAuth()` to gate on `user`. The `MaterialSearch` inside calls `searchSupplierItems` from `supplierService.ts`, which imports the client from `@/lib/supabase`. Since we just fixed `supabase.ts` to point to your external project, this should now work in both modes. 

**However**, I need to verify there isn't a secondary issue — the `MaterialsTab` only loads when `user && jobId` are truthy. If auth state is somehow lost or delayed in work mode, materials won't load. I'll add a defensive check and ensure the search works even without a specific `jobId` match (the search dropdown queries `supplier_items`, not `job_materials`).

**Action**: Verify `supplierService.ts` imports from `@/lib/supabase` (not the Lovable Cloud client). If it does, materials should work now. If there's still an issue, it's likely the auth race condition — I'll gate MaterialSearch on auth readiness.

### Issue 2: No option to choose demo mode after logout

**Root cause**: In `App.tsx` line 82-84, when `!user` the app renders `<LoginPage />` directly. The `SplashPage` component (with "Sign In" / "Try Demo" buttons) exists but is never shown. After logout, users go straight to the login form with no way to enter demo mode.

**Fix**: Replace the `<LoginPage />` fallback with a `SplashPage`-based flow:
- When `!user && !isDemo`: show `SplashPage` with "Sign In" and "Try Demo" buttons
- "Sign In" navigates to `LoginPage`
- "Try Demo" sets `isDemo(true)` and proceeds to `ModePicker`
- When `!user && isDemo`: show `ModePicker` (demo flow)

**Files to change**:

1. **`src/App.tsx`** (lines 80-88) — Replace the `!user` block:
   - If `!isDemo` and no `user`: show `SplashPage` with handlers
   - "Sign In" handler: set local state to show `LoginPage`
   - "Try Demo" handler: call `setIsDemo(true)` 
   - If `isDemo` and no `user`: fall through to `ModePicker`
   - Add a "back" state so LoginPage's `onBack` returns to SplashPage

2. **`src/components/AppHeader.tsx`** (logout handler, line 30-33) — Already calls `sessionStorage.clear()` and `setIsDemo(false)`, which is correct. No change needed.

### Result
- After logout → SplashPage with "Sign In" / "Try Demo"
- Materials search works in both Office and Tools modes via the now-corrected external Supabase client
- No Lovable Cloud involvement anywhere

