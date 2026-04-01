

## Fix: Customers Not Loading After Login + Replace Hardcoded Quote Materials

### Problem 1: Customers never load in production mode

The network trace proves it: `customers_prod` is queried BEFORE login (at 17:24:18Z with anon key → returns `[]` due to RLS). Login succeeds at 17:24:36Z with a valid JWT, but the customer query never re-fires because `DemoDataContext`'s `useEffect` depends on `isDemo`, which doesn't change on login.

**Fix**: Add `user` (from `useAuth()`) as a dependency to the `useEffect` in `DemoDataContext` so customers re-fetch when the user signs in.

### Problem 2: Quote tab uses hardcoded material catalogue

`QuoteTab.tsx` imports `catalogueItems` from `dummyJobDetails.ts` — hardcoded items like "Copper Pipe 15mm", "PVC Elbow 90°". In production mode, this should search `supplier_items` from the database instead.

**Fix**: Replace the hardcoded `catalogueItems` in `QuoteTab.tsx` with a call to `searchSupplierItems()` from `supplierService.ts`. Use the existing search-as-you-type pattern already implemented in `MaterialSearch.tsx`.

### Changes

**1. `src/contexts/DemoDataContext.tsx`** — Re-fetch customers on auth change
- Import `useAuth` and get `user` from it
- Add `user` to the `useEffect` dependency array that fetches customers
- This ensures that after login, customers are re-fetched with the authenticated JWT

**2. `src/components/job/QuoteTab.tsx`** — Replace hardcoded catalogue with DB search
- Remove `import { catalogueItems } from "@/data/dummyJobDetails"`
- Import `searchSupplierItems` from `supplierService`
- Import `useAuth` to check if in demo mode
- For the material command palette: when in production mode, search `supplier_items` via `searchSupplierItems()` as the user types; when in demo mode, fall back to the existing hardcoded list
- Labour and extras items can remain hardcoded (they're not supplier-sourced)

**3. `src/data/dummyJobDetails.ts`** — No further changes needed
- The hardcoded `catalogueItems` export stays for demo mode and labour/extras; production materials come from DB via the QuoteTab change above

### Why this fixes everything
- **Customers**: Auth state change triggers re-fetch → JWT is present → RLS allows SELECT → customers appear
- **Materials/Price book**: QuoteTab searches real `supplier_items` table → shows your uploaded Fergus price book data
- **No backend changes needed**: This is purely a frontend data-wiring issue

