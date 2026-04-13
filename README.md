# AI Workshop

Hands-on workshop repo. Clone it, follow along, leave with portable agents and skills you can drop into your own projects.

## What's in here

```
.
├── apps/
│   ├── api/           # NestJS app — one module per workshop section
│   └── web/           # Angular app — one feature module per workshop section
├── docs/              # Workshop walkthrough — one doc per section
├── agents/            # Portable agent templates (plain markdown)
├── skills/            # Portable skill templates
├── .cursor/           # Cursor-specific wiring (points at shared agents/ and skills/)
└── .claude/           # Claude Code wiring (same content, different location)
```

## Setup

```bash
# from the repo root
npm install
npm run dev          # runs the NestJS api and Angular web app together
```

Prereqs: Node 20+, your AI tool of choice (Cursor, Claude Code, Codex, OpenCode — all fine).

## Workshop sections

1. [Setup & basic prompting](docs/01-setup-and-prompting.md)
2. [Tool calls — seeing what the agent sees](docs/02-tool-calls.md)
3. [Plans & specs](docs/03-plans-and-specs.md)
4. [Agents](docs/04-agents.md)
5. [Skills](docs/05-skills.md)

Each doc has: the concept, the exercise, and what you take with you.

## Tool-agnostic by design

Agents and skills in this repo are plain `.md` files under `agents/` and `skills/`. Cursor and Claude Code each have their own conventions for where these live — `.cursor/` and `.claude/` in this repo point at the shared directory so you can see the portability pattern. Same content, different wiring.
