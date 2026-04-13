# Inventory Management Brainstorm

**Date:** 2026-04-13
**Status:** Complete

## What We're Building

Add inventory tracking and admin/management pages to the product catalog:

1. **Extend the Product entity** with a configurable `lowStockThreshold` column
2. **Derive availability status** automatically from `stock` + `lowStockThreshold` (source of truth on the backend; storefront displays derived value)
3. **Admin API endpoints** for updating stock, threshold, and bulk adjustments
4. **Four admin pages** under `/admin`:
   - **Inventory list** — all products, stock levels, thresholds, sortable/filterable, low-stock highlighted
   - **Edit individual product** — form to update stock + threshold + availability for one product
   - **Low-stock dashboard** — filtered view showing only products at or below threshold
   - **Bulk adjustments** — select multiple products, apply stock changes at once

## Why This Approach

**Extend Product (not a separate Inventory entity)** because:
- Scope is "just stock + threshold" — no history, no multi-location, no reservations
- Avoids unnecessary JOINs and YAGNI complexity
- Matches the workshop's simplicity goal

**Auto-computed availability** because:
- Single source of truth (stock vs threshold)
- Admin only needs to adjust one number (stock)
- Frontend and backend both derive the same label

**No auth** for the workshop:
- Admin pages are publicly accessible at `/admin/*`
- Keeps scope tight; can layer auth later if needed

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Inventory depth | Stock + threshold only | No history/reservations/warehouses — YAGNI |
| Schema change | Add `lowStockThreshold` to Product | Simpler than separate entity |
| Availability status | Auto-computed from stock + threshold | One source of truth |
| Auth | None | Workshop scope; `/admin/*` public |
| Admin pages | All four (list, edit, low-stock, bulk) | User selected all |
| Default threshold | 10 (on existing seeded products) | Matches current hardcoded frontend value |

## Admin Page Details

### Inventory List (`/admin/inventory`)
- Table: thumbnail, title, category, stock, threshold, status
- Sortable columns, search/filter by category and name
- Low-stock rows highlighted (e.g., amber background)
- Click row → edit page

### Edit Product Inventory (`/admin/inventory/:id`)
- Form: stock (number), lowStockThreshold (number)
- Shows derived availability status
- Save button calls `PATCH /products/:id/inventory`

### Low-Stock Dashboard (`/admin/inventory/low-stock`)
- Same table style as inventory list, filtered to `stock <= lowStockThreshold`
- Quick-link to edit each item
- Count badge in nav

### Bulk Adjustments (`/admin/inventory/bulk`)
- Checkbox selection on inventory list (or dedicated page)
- Actions: "Set stock to X", "Add X to stock", "Subtract X from stock"
- Confirmation before applying

## Technical Notes

### Schema Change
- Add `lowStockThreshold: number` column to Product (default: 10)
- Remove `availabilityStatus` storage from Product (or keep for backward compat but stop using it) — derive on read
- Migration note: since `synchronize: true`, SQLite will add the column; existing rows need a default

### API Endpoints (New)
- `PATCH /products/:id/inventory` — update stock and/or threshold
- `POST /products/inventory/bulk` — `{ productIds: number[], operation: 'set' | 'add' | 'subtract', value: number }`
- `GET /products?lowStock=true` — filter to low-stock items (or new dedicated endpoint)

### Storefront Impact
- Product grid and detail pages should read the derived `availabilityStatus` from the API (not compute client-side)
- Remove the hardcoded `stock <= 10` threshold in frontend code

## Open Questions

None — all key decisions resolved.
