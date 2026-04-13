# Skills

Portable skills — procedural instructions the tool applies automatically in specific situations.

## What's here

- [`commit-message.md`](commit-message.md) — how to write a commit message for this repo. Triggered when you run a commit.
- [`ship.md`](ship.md) — composition skill. Runs `code-reviewer`, then `security-reviewer`, then prepares a commit. Example of chaining agents inside a skill.

## Cursor vs. Claude Code vs. everyone else

The files are portable; the wiring isn't.

| Tool | Where skills live | How they trigger |
|---|---|---|
| Cursor | `.cursor/rules/*.mdc` with frontmatter | Globs on file types, or manual `@skill-name` |
| Claude Code | `.claude/skills/*.md` (or referenced in `CLAUDE.md`) | Invoked explicitly or auto-applied per config |
| Codex | `.codex/` (check current docs) | Similar pattern |
| OpenCode / Aider / Goose | Varies | All read markdown — pattern is the same |

This repo uses the shared `skills/` dir as source-of-truth and points the tool-specific folders at it.

## Writing your own

Keep skills small and situational. A skill that tries to cover everything becomes invisible — you forget what it does. Rough template:

```markdown
---
name: my-skill
description: one sentence — what it does, when it triggers
trigger: <the situation that activates it>
---

When <situation>, do the following:

1. <step>
2. <step>
3. <step>

Never <anti-pattern>.
```

Skills can also compose agents — see [`ship.md`](ship.md) for a simple example.
