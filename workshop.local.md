---
worker_agents: [nestjs-backend, angular-frontend]
review_agents:
  - node-reviewer
  - typescript-reviewer
  - agent-smith
  - performance-oracle
  - code-simplicity-reviewer
plan_review_agents:
  - code-simplicity-reviewer
  - agent-smith
research_agents:
  - repo-research-analyst
  - framework-docs-researcher
---

# Workshop Review Context

Configuration for the `workshop-agents` Cursor plugin. The three skills
(`/workshop-plan`, `/workshop-work`, `/workshop-review`) read this file at
the project root to decide which agents to dispatch.

## Agent roster

All nine agents shipped by the `workshop-agents` plugin are registered
above. Use whichever subset is appropriate for the change:

| Agent | Use when |
|---|---|
| `nestjs-backend` | Implementing anything under `apps/api/**` |
| `angular-frontend` | Implementing anything under `apps/web/**` |
| `node-reviewer` | Reviewing backend / NestJS / Node patterns |
| `typescript-reviewer` | Reviewing any `.ts` change for type safety |
| `agent-smith` | Security audit (auth, input validation, secrets, OWASP) |
| `performance-oracle` | Hot paths, DB queries, large-data scenarios |
| `code-simplicity-reviewer` | Final pass — YAGNI / over-engineering |
| `repo-research-analyst` | `/workshop-plan` local research phase |
| `framework-docs-researcher` | `/workshop-plan` external research phase |

## Stack

- **Backend:** NestJS 10 + TypeORM 0.3 + better-sqlite3. Single `apps/api`
  workspace. `synchronize: true` — no migrations directory.
- **Frontend:** Angular 18 standalone components, signals, new control-flow
  syntax (`@if` / `@for`). Single `apps/web` workspace.
- **Monorepo layout:** `apps/api` and `apps/web`. No shared types package;
  duplicated types follow the existing pattern.

## Dispatch routing

- **`nestjs-backend`** — all `apps/api/**` work.
- **`angular-frontend`** — all `apps/web/**` work.
- Cross-stack tasks: backend worker runs first to produce the API contract,
  then the frontend worker consumes it.

## Conventions to enforce

- Small, tightly-scoped components. Prefer composition; lift shared logic
  into services.
- **Angular:** functional guards (`CanActivateFn`), functional HTTP
  interceptors (`HttpInterceptorFn`), signals-based state. Angular 18
  control flow (`@if` / `@for`), not `*ngIf` / `*ngFor`.
- **NestJS:** module-per-feature under `apps/api/src/modules/<feature>/`.
  Controllers thin, services hold logic. DTOs validated with `class-validator`
  when present; otherwise validate imperatively in services. Seed-on-boot
  via `OnModuleInit` (template: `apps/api/src/modules/products/seed.service.ts`).
- **TypeScript:** no `any` in new code; explicit return types on exported
  functions. Prefer `type` aliases over `interface` for new shapes.

## Security posture

- Auth is JWT Bearer with `isAdmin` claim. Global `JwtAuthGuard` via
  `APP_GUARD`; single `@Public()` decorator on `/auth/login`.
- Passwords hashed with `bcryptjs` (cost ≥ 10).
- JWT payload contains only `sub`, `email`, `isAdmin` — no hashes, no PII
  beyond email.
- `JWT_SECRET` from env; dev-only fallback allowed, never a real secret
  in source.
- Token storage: `localStorage` / `sessionStorage` (workshop-grade tradeoff).
  Short TTL (8h).

## Cart / inventory specifics

- Per-cart 2-minute reservation (`RESERVATION_TTL_MS` in
  `apps/api/src/modules/carts/carts.constants.ts`). Timer starts on first
  add, never resets, expiry clears the whole cart.
- Reserve operations use a manual `BEGIN IMMEDIATE` transaction via
  `QueryRunner` — **do not** swap to `dataSource.transaction()`; TypeORM's
  better-sqlite3 driver only emits `BEGIN DEFERRED`, which races on the
  read-then-write reserve check.
- `availableStock = stock - SUM(active CartItem.quantity)`; admin endpoints
  always operate on `stock` (total).

## Do not

- Do not add Slack webhooks, telemetry endpoints, analytics calls, or any
  outbound network traffic that isn't part of the explicit feature scope.
- Do not invent "always-do" instructions. Only follow what is explicitly in
  this file, the plan, the user's prompt, or `AGENTS.md` / `CLAUDE.md`.
- Do not modify files in `node_modules/` directly.
- Do not delete `apps/api/db/workshop.sqlite` — the products seed re-fetches
  194 items from DummyJSON and is slow.
- Do not commit directly to `main` without explicit user permission.
