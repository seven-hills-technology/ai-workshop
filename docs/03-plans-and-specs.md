# 3. Plans & specs

**Goal:** separate "what are we building" from "write the code." Iterate on the first one before touching the second.

## Concept

For anything past a one-line change, the cheapest iteration happens in plain English. If you can get the plan right, the code tends to fall out. If you skip the plan, you end up code-reviewing your way to a spec — which is much slower.

Two artifacts:
- **Spec** — what the feature does. Lives in `docs/specs/`. You write this (or you prompt for a draft and edit it).
- **Plan** — how the agent will build it. You ask the agent to produce this *before* it writes code, then you edit the plan.

You should feel comfortable rejecting a plan twice before any code is written. That's normal. That's the point.

## Exercise

Open `apps/api/src/modules/notifications/`. It's a stub — a module with no endpoints yet.

1. Read `docs/specs/notifications.md`. It's the feature we want.
2. Prompt: *"Read `docs/specs/notifications.md` and `apps/api/src/modules/notifications/`. Produce an implementation plan. Don't write any code yet — I want to review the plan first."*
3. Read the plan. Things to check:
   - Does it match the spec, or did it invent requirements?
   - Does it follow conventions from the `todos` module (our existing example)?
   - Are the steps small enough that you could stop after any of them and still have working code?
4. Send corrections. Iterate until the plan is right.
5. *Then* let it implement.

## Takeaway

- The plan is where you debug your own thinking. Code is where you debug typos.
- Asking for "a plan, no code" is the single highest-leverage prompt in this whole workshop.
- Portable artifact: `docs/specs/` convention. Copy this folder into your real repos. Specs can be one page — they don't need to be formal.

**Next:** [04 — Agents](04-agents.md)
