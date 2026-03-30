

## Fix: Update Backend Health Check to Use New Database

### What happened
The old Supabase project has been deleted. The backend health check on Render still queries a `customers` table (which doesn't exist on the new DB — it's called `customers_prod`). All references need to point to the new database.

### Changes

**1. `backend/main.py` — Update health check table name**
Change the health probe from querying `customers` to `customers_prod`, matching the table that actually exists on the new Supabase project (`qrkojbfayjrtrlrmgzry`).

```python
endpoint = f"{supabase_url.rstrip('/')}/rest/v1/customers_prod?select=id&limit=1"
```

**2. Render environment variables (manual step)**
On your Render dashboard, update the environment variables for the `tradie-toolbelt-api` service to point to the new Supabase project:
- `SUPABASE_URL` → `https://qrkojbfayjrtrlrmgzry.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` → the legacy JWT service role key from the new project's API settings

### No other cleanup needed
- No references to the old project ID (`sbthgkcmbxjgaqvntjja`) remain in the codebase
- `src/lib/supabase.ts` and `src/lib/authSupabase.ts` already point to the new project as fallbacks
- The `getTable()` helper correctly resolves `customers_prod` / `customers_demo` based on mode

