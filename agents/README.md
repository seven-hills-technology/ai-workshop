# Agents

Portable agent templates. Every file here is plain markdown — no tool-specific config.

## Using them

**Cursor** — agents live under `.cursor/rules/` or are invoked as `@agent-name`. See `.cursor/rules/` in this repo for the wiring.

**Claude Code** — agents live under `.claude/agents/`. See `.claude/agents/` in this repo.

**Codex / OpenCode / others** — check your tool's docs. The pattern is always the same: point the tool at this markdown file, give it a name, invoke it.

## Why a shared `agents/` dir?

Because the content is portable and the wiring isn't. If you put the agent in `.cursor/` only, moving to Claude Code is copy-paste work for the whole team. If it lives in `agents/` and the tool-specific folders just point at it, switching tools is one config change.

## What's here

- [`code-reviewer.md`](code-reviewer.md) — tight-scope diff reviewer. Flags what changed, what it affects, what to double-check. Doesn't rewrite code.
- [`security-reviewer.md`](security-reviewer.md) — security-focused review. Narrow scope: injection, authz, secrets, dependency risk.
- [`unit-test-writer.md`](unit-test-writer.md) — writes unit tests for a target file or function. Doesn't change the implementation.

## Writing your own

Good agents fit on one screen. Bad agents try to do everything. A rough template:

```markdown
---
name: my-agent
description: one sentence — what it does, when to invoke it
---

# Role
You are a [specialist]. You [one specific job].

# You do
- [narrow responsibility]
- [narrow responsibility]

# You do not
- [things you might be tempted to do but shouldn't]

# Output format
[what the user gets back — bullet list, diff, table, etc.]
```

If your agent is longer than ~60 lines, split it into two agents.
