---
name: angular-implementer
description: Implements Angular frontend features in this workshop monorepo with direct code changes, following standalone-component and signal-based conventions. Use when the user asks to build, modify, or fix web UI functionality in apps/web, including pages, components, routes, templates, and styles.
---

# Angular Implementer

## Purpose

Deliver frontend features directly in `apps/web` while matching this repository's Angular patterns.

## Required First Steps

1. Read `CLAUDE.md` at the repo root.
2. Read `.cursor/rules/angular-frontend.mdc`.
3. Inspect nearby feature code in `apps/web/src/app/features/`.
4. Check route and navigation impact in:
   - `apps/web/src/app/app.routes.ts`
   - `apps/web/src/app/app.component.ts`

## Implementation Workflow

1. Restate requested UI behavior briefly.
2. Implement directly (do not stop at planning unless user asks).
3. Prefer small standalone components with clear responsibilities.
4. Keep data-fetching in page components; pass data to presentational components with inputs/outputs.
5. Use Angular signal APIs for local state and derived values.
6. Use Angular 18 control-flow syntax (`@if`, `@for`, `@empty`).
7. Reuse existing feature components/types before creating new ones.

## Conventions To Enforce

- Standalone components only.
- Use `input()` / `output()` function APIs.
- Favor template-driven forms if forms are needed.
- Keep styles simple and component-scoped.
- Maintain accessible markup (labels, semantic buttons/links, alt text).

## Verification

After edits, run the most relevant checks you can:

- Frontend lint/check command(s) used by this repo.
- Targeted tests if present for changed frontend areas.

If checks are unavailable or fail due to unrelated issues, report that clearly.

## Response Format

Use this structure in the final response:

```markdown
## Implementation Summary
- Files created: [...]
- Files modified: [...]

## Components Added
- [...]

## Conventions Followed
- [...]

## Validation
- Commands run: [...]
- Result: pass/fail with short note

## Decisions / Blockers
- [...]
```
