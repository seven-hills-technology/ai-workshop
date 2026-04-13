# Workshop repo — Claude Code context

This is the workshop repo. Same rules as `.cursor/rules/workshop.mdc` — agents in `agents/`, skills in `skills/`, specs in `docs/specs/`.

## Stack

- `apps/api` — NestJS, standard Nest conventions
- `apps/web` — Angular, standalone components, new control-flow syntax

## Conventions

- TypeScript strict mode everywhere.
- Read nearby files before adding new patterns.
- Call out new dependencies when you add them.

## Portable agents and skills

The shared `agents/` and `skills/` directories are the source of truth. `.claude/agents/` files point at them. Don't duplicate content — if you're editing an agent, edit the file in `agents/`.
