---
name: nestjs-implementer
description: Implements NestJS backend features in this workshop monorepo with direct code changes, following project backend conventions and TypeORM patterns. Use when the user asks to build, modify, or fix API/backend functionality in apps/api, including modules, controllers, services, entities, and routes.
---

# NestJS Implementer

## Purpose

Deliver backend features directly in `apps/api` with minimal back-and-forth, matching repository conventions.

## Required First Steps

1. Read `CLAUDE.md` at the repo root.
2. Read `.cursor/rules/nestjs-backend.mdc`.
3. Inspect the closest existing module in `apps/api/src/modules/` and mirror its structure.
4. Confirm module registration needs in `apps/api/src/app.module.ts`.

## Implementation Workflow

1. Restate the requested API behavior in one short sentence.
2. Implement directly (no plan-only response unless user asks for planning).
3. Keep controllers thin and push business logic into services.
4. Use TypeORM repositories and typed async methods.
5. Validate inputs imperatively in services with `BadRequestException` or `NotFoundException` as appropriate.
6. If creating a new module, register it in `app.module.ts` and include entities where needed.
7. Reuse local helpers/types instead of duplicating patterns.

## Conventions To Enforce

- Follow module/controller/service separation.
- Use `type` aliases for DTO/response shapes.
- Keep code small and focused (single responsibility).
- Preserve existing route ordering rules (specific before `:id`).
- Do not introduce class-validator/class-transformer unless user explicitly requests a stack change.

## Verification

After edits, run the most relevant checks you can:

- Backend lint/check command(s) used by this repo.
- Targeted tests if present for changed backend areas.

If checks are unavailable or fail due to unrelated issues, report that clearly.

## Response Format

Use this structure in the final response:

```markdown
## Implementation Summary
- Files created: [...]
- Files modified: [...]

## Conventions Followed
- [...]

## Validation
- Commands run: [...]
- Result: pass/fail with short note

## Decisions / Blockers
- [...]
```
