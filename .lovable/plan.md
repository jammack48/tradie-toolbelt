

## Plan: Streamline Work Mode Flows

### Problem Summary
1. **New Quote doesn't work** — navigates to `/quote/new` but that route renders `QuotePage` which expects a `:id` param, not "new"
2. **Van Stock / Reconcile Docs are set during mode selection** — they should be in Settings (manager mode) so they persist and apply automatically in Work mode, removing the setup screen from ModePicker
3. **Keyboard covers materials search** — the dialog content has `max-h-[85vh]` and materials section sits mid-page; on mobile the search dropdown is hidden behind the keyboard
4. **Checklists take up a whole step** — should be a collapsible section on another screen (e.g. photos or materials) rather than a dedicated step

### Changes

#### 1. Fix "New Quote" navigation
**File**: `src/pages/WorkHome.tsx`
- Change `navigate("/quote/new")` to `navigate("/quote/new", { state: {} })` — this already works, the QuotePage component handles the "new" id by showing the QuoteFunnel. Verify the route `/quote/:id` with id="new" triggers the funnel. Looking at `QuotePage.tsx`, it checks `id === "new"` to show the funnel, so the route itself works. The issue may be something else — need to verify if there's a guard blocking non-manage modes from the quote page. Will add a console check.

Actually, reviewing the route in `App.tsx` line 140: `<Route path="/quote/:id" element={<QuotePage />} />` — this is inside the manage-mode routes. Work mode has its own route set. The `/quote/new` route is likely not registered under work-mode routes.

**Fix**: Add `<Route path="/quote/:id" element={<QuotePage />} />` to the work-mode route group in `App.tsx`.

#### 2. Move Van Stock / Reconcile Docs to Settings
**Files**: `src/pages/SettingsPage.tsx`, `src/contexts/UserSettingsContext.tsx`, `src/components/ModePicker.tsx`, `src/contexts/AppModeContext.tsx`

- Add `vanStock: boolean` and `reconcileDocs: boolean` to `UserSettings` (persisted in Supabase user_settings table)
- Add toggles in Settings > Team tab (or a new "Work Mode" section in Settings)
- In `SoleTraderCloseOutFlow` and `JobCompletionFlow`, read these from `useUserSettings()` instead of `soleTraderPrefs`
- Remove the "sole-trader-setup" sub-step from `ModePicker` — selecting "On the Tools" goes straight to the app
- Keep `employeeCanQuote` in settings too

#### 3. Fix materials keyboard overlap
**Files**: `src/components/job/SoleTraderCloseOutFlow.tsx`, `src/components/job/JobCompletionFlow.tsx`

- When the materials step is active, render the search input and results at the **top** of the step content (it already is, but the dialog itself scrolls)
- Change the `DialogContent` wrapper for the materials step to use `flex flex-col` with the search pinned at the top and items list scrollable below
- Add `position: sticky; top: 0; z-index: 10` to the search section so it stays visible when keyboard opens
- Reduce `max-h-56` on the items list to give more room for search dropdown results

#### 4. Merge checklists into photos step
**Files**: `src/components/job/SoleTraderCloseOutFlow.tsx`, `src/components/job/JobCompletionFlow.tsx`

- Remove "checklist" as a separate step from `ALL_STEPS` / `STEPS`
- Add a collapsible checklist section at the bottom of the "photos" step
- Use a `Collapsible` with trigger text "Checklist (optional)" that expands to show the `ChecklistStepInline` component
- This removes one full screen from the flow

#### 5. Read settings in completion flows
**Files**: `src/components/job/SoleTraderCloseOutFlow.tsx`, `src/components/job/JobCompletionFlow.tsx`

- Import `useUserSettings` and read `vanStock`, `reconcileDocs` from there instead of from `soleTraderPrefs`
- This means the manager sets it once in Settings, and all work-mode users inherit it

### Step order after changes

**Sole Trader flow**: Status → Photos + Checklist → Materials → Labour → Paperwork (if reconcileDocs) → Certificates → Invoice
**Employee flow**: Status → Photos + Checklist → Job Sheet → Parts → Time → PO Review → Compliance

### Files modified
1. `src/App.tsx` — add quote route to work-mode group
2. `src/pages/SettingsPage.tsx` — add Van Stock / Reconcile Docs / Employee Can Quote toggles to Team tab
3. `src/contexts/UserSettingsContext.tsx` — add new settings fields
4. `src/components/ModePicker.tsx` — remove sole-trader-setup sub-step
5. `src/components/job/SoleTraderCloseOutFlow.tsx` — merge checklist into photos, fix materials layout, read settings from UserSettings
6. `src/components/job/JobCompletionFlow.tsx` — merge checklist into photos, fix materials layout

