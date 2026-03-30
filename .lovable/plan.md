

## Supplier-Based Materials System — Production Build

This is the right next step. Clean, minimal, and maps directly to your CSV format. Here is the refined plan matched to your actual price book columns.

### 1. External Supabase Tables (3 tables)

**suppliers**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid | auth.uid(), RLS |
| name | text | e.g. "JA Russell" |
| priority | integer | 1 = highest |
| is_default | boolean | default false |
| is_active | boolean | default true |

**supplier_items**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| supplier_id | uuid FK | → suppliers.id |
| sku | text | *ItemCode from CSV |
| name | text | ItemName from CSV |
| cost_price | numeric | PurchasesUnitPrice |
| sell_price | numeric | SalesUnitPrice |
| searchable_text | text | lower(name + ' ' + sku) |

**job_materials**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| job_id | text | reference to job |
| user_id | uuid | auth.uid(), RLS |
| supplier_item_id | uuid FK | → supplier_items.id |
| quantity | integer | default 1 |
| unit_price | numeric | sell_price at time of add |
| cost_price | numeric | cost at time of add |

All three tables get RLS policies scoped to `user_id = auth.uid()`.

### 2. Settings → Suppliers UI

New "Suppliers" section on Settings page:
- List of suppliers with name, priority, default toggle, active toggle
- "Add Supplier" button → inline form (name, priority)
- Edit/deactivate existing suppliers
- Uses external Supabase client (`@/lib/supabase`)

### 3. CSV Price Book Upload (per supplier)

On the Suppliers settings section:
- Select a supplier → "Upload Price Book" button
- Parse CSV, auto-map columns based on the known format:
  - `*ItemCode` → sku
  - `ItemName` → name
  - `PurchasesUnitPrice` → cost_price
  - `SalesUnitPrice` → sell_price
- Generate `searchable_text = lower(name + ' ' + sku)`
- Bulk insert into `supplier_items` for that supplier
- Show count of items imported

### 4. Materials Search on Job Card

Replace the current static "Add Material" button with a search dropdown:
- Text input triggers search on `searchable_text` using `ilike '%term%'`
- Results sorted by supplier priority, then name
- Each result shows: **Supplier Name** | Item Name — $sell_price
- On select: insert into `job_materials` with job_id, supplier_item_id, quantity=1, unit_price, cost_price

### 5. MaterialsTab Refactor

- Fetch `job_materials` joined with `supplier_items` and `suppliers` from external Supabase
- Display: Item name, Qty (editable), Unit price, Total, Supplier
- Totals row sums all line items
- Remove dependency on `MaterialItem` from `dummyJobDetails`

### 6. Files to Create/Modify

| File | Action |
|------|--------|
| Settings page — new Suppliers section | Modify |
| `src/components/job/MaterialsTab.tsx` | Rewrite |
| `src/components/job/MaterialSearch.tsx` | New — search dropdown |
| `src/services/supplierService.ts` | New — CRUD for suppliers + items |
| `src/services/supplierImportService.ts` | New — CSV price book parser |
| `src/services/jobMaterialsService.ts` | New — job_materials CRUD |

### 7. What Gets Removed

- Hardcoded `MaterialItem` type and dummy data from `dummyJobDetails.ts`
- No more static materials arrays — production mode is supplier_items only

