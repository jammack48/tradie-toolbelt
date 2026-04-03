

## Improvements to Work Mode Flows

This plan covers 7 changes across the job creation, completion, and materials flows.

### 1. Plus button offers "Charge Up" or "Quote" choice
**File**: `src/pages/WorkHome.tsx`

Currently the FAB (line 155-160) navigates directly to `/new-job`. Change it to show a small action sheet/popover with two options:
- **Charge Up** — navigates to `/new-job` (existing flow for immediate work)
- **New Quote** — navigates to `/quote/new` (quote funnel)

The "New Quote" option will be conditionally hidden based on a new `canQuote` flag (see point 2).

### 2. Manager controls whether employees can quote
**File**: `src/contexts/AppModeContext.tsx`

Add an `employeeCanQuote: boolean` field to `SoleTraderPrefs` (or a new settings object). Default `false` for Employee mode. When the user is in "work" (employee) mode, the "New Quote" option in the plus menu is hidden. Managers/owners always see it. This prevents employees from accessing sensitive pricing information.

### 3. Customer name auto-populates address in WorkNewJob
**File**: `src/pages/WorkNewJob.tsx`

The `CustomerPicker` component already does this (line 67-72: `selectCustomer` sets both `setCustomer(c.name)` and `setAddress(c.address)`). The address field is already editable. This is working correctly based on the screenshot. No change needed here.

### 4. Add microphone/dictation to description field in WorkNewJob
**File**: `src/pages/WorkNewJob.tsx`

Add a dictation toggle button (Mic icon) next to the Description label, using the same `SpeechRecognition` pattern already in `JobCompletionFlow.tsx` and `SoleTraderCloseOutFlow.tsx`. When active, append transcribed text to the `description` state.

### 5. "Job Finished" / "Coming Back" auto-advances to next step
**Files**: `src/components/job/JobCompletionFlow.tsx`, `src/components/job/SoleTraderCloseOutFlow.tsx`

Currently clicking "Job Finished" or "Coming Back" only toggles `jobFinished` state — the user must also click "Next". Change:
- **Job Finished** button: set `jobFinished(true)` then auto-advance `setStep(step + 1)` after a brief 300ms delay
- **Coming Back** button: set `jobFinished(false)` — keep current behavior (shows return notes inline, no auto-advance since user needs to fill in notes and choose schedule/book later)

Both flows affected: `JobCompletionFlow` (employee) and `SoleTraderCloseOutFlow` (sole trader).

### 6. Make checklists optional — skip if none relevant
**Files**: `src/components/job/JobCompletionFlow.tsx`, `src/components/job/SoleTraderCloseOutFlow.tsx`

The checklist step already says "optional" but is always shown. Add a "Skip" or auto-skip behavior:
- If no checklist templates match the category, skip the step entirely (filter it out of `activeSteps`)
- Add a visible "No checklists needed — skip" button alongside the template list so users can advance without selecting one

### 7. Materials in completion flow not searching Supabase
**Files**: `src/components/job/SoleTraderCloseOutFlow.tsx`, `src/components/job/JobCompletionFlow.tsx`

The "Add extra item" in both completion flows (lines 520-526 in SoleTrader, 606-627 in Employee) is a plain text input — it does NOT use `MaterialSearch` which queries Supabase `supplier_items`. 

Fix: Replace the plain-text "Add extra item" input with the existing `<MaterialSearch>` component (which queries Supabase via `searchSupplierItems`). Keep a fallback manual text input for items not in the price book. This ensures the completion flow materials step searches the external Supabase just like the Materials tab on the job card.

### 8. Rename "Before photos" to "Initial Inspection" and move to start
**Files**: `src/components/job/JobCompletionFlow.tsx`, `src/components/job/SoleTraderCloseOutFlow.tsx`

- Rename "Before photos" label to "Initial Inspection" in the photos step
- Move the photos step earlier in the step order — place it as step 1 (after status) in both flows, before checklist/materials
- Rename "After photos" to "Completion Photos"

### Technical details

**Step order changes:**
- Employee flow: Status → Photos (renamed) → Checklist → Job Sheet → Parts → Time → PO Review → Compliance
- Sole Trader flow: Status → Photos (renamed) → Checklist → Materials → Time → Paperwork → Certificates → Invoice → Done

**Files modified:**
1. `src/pages/WorkHome.tsx` — FAB becomes action sheet with Charge Up / Quote
2. `src/contexts/AppModeContext.tsx` — add `employeeCanQuote` setting
3. `src/pages/WorkNewJob.tsx` — add dictation to description field
4. `src/components/job/JobCompletionFlow.tsx` — auto-advance on status select, skip checklists, MaterialSearch integration, rename/reorder photos
5. `src/components/job/SoleTraderCloseOutFlow.tsx` — same changes as above

