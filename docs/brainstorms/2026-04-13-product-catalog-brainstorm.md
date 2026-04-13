# Product Catalog Brainstorm

**Date:** 2026-04-13
**Status:** Complete

## What We're Building

A product catalog feature for the workshop app that:

1. **Seeds a SQLite database** with product data from the DummyJSON API (https://dummyjson.com/products)
2. **Exposes products via NestJS API** endpoints (list with filtering, detail by ID)
3. **Displays an e-commerce product grid** in Angular with click-through to product detail pages

### Data Scope

Store most fields from the DummyJSON API per product:
- Core: id, title, description, price, discountPercentage, category, brand, sku
- Media: thumbnail, images array
- Ratings & reviews: rating, reviews (with reviewer name, comment, rating, date)
- Inventory: stock, availabilityStatus
- Tags
- Shipping/warranty/return policy info

Total: ~194 products across multiple categories (beauty, fragrances, furniture, groceries, etc.)

### UI Scope

- **Product grid page**: Card layout with thumbnail, title, price (with discount), rating stars, category badge. Category filter and search bar.
- **Product detail page**: Full product info — image gallery, description, reviews list, price, stock status, shipping info.

## Why This Approach

**Seed-on-startup** was chosen over proxy/cache because:
- Simpler architecture — no runtime dependency on external API
- Teaches the full data pipeline: external API -> seed -> SQLite -> NestJS API -> Angular
- Works offline after initial seed
- Appropriate complexity for a workshop exercise

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Goal | Workshop exercise | Keep simple, demonstrate full-stack flow |
| Database | SQLite via TypeORM | Most common NestJS ORM, good docs, entity decorators |
| Data strategy | Seed-on-startup | Fetch all 194 products once, store locally |
| Data scope | Most fields | Enough for grid + detail pages with reviews |
| UI | Grid + detail pages | Product cards with click-through to full detail |
| Styling | Follow existing patterns | Inline styles in standalone Angular components |

## Technical Notes

### Existing Patterns to Follow
- **API**: Module per feature in `modules/<feature>/` with controller, service, types files. Register in `app.module.ts`.
- **Angular**: Standalone components in `features/<feature>/`. Lazy-loaded routes in `app.routes.ts`. Signals for state. `HttpClient` for API calls. New control-flow syntax (`@for`, `@if`).
- **No existing DB**: This will be the first database in the project. TypeORM + SQLite will be a new dependency.

### API Endpoints Needed
- `GET /products` — list with optional `?category=`, `?search=`, `?skip=`, `?limit=`
- `GET /products/:id` — single product with reviews
- `GET /products/categories` — list of distinct categories

### New Dependencies
- `@nestjs/typeorm`, `typeorm`, `better-sqlite3` (TypeORM SQLite driver)
- No new Angular dependencies expected

## Open Questions

None — all key decisions resolved.
