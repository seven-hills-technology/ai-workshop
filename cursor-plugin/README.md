# workshop-agents (Cursor plugin)

Pre-built skills + agents for the NestJS + Angular workshop. Mirrors the
`plan -> work -> review` workflow you'd see on a real Seven-Hills-style project,
packaged as a local Cursor plugin.

## What's inside

```
cursor-plugin/
├── .cursor-plugin/plugin.json    # manifest (name + metadata)
├── skills/                       # slash-invocable skills
│   ├── workshop-plan/SKILL.md    # /workshop-plan
│   ├── workshop-work/SKILL.md    # /workshop-work
│   └── workshop-review/SKILL.md  # /workshop-review
├── agents/                       # 9 pre-built agents
│   ├── nestjs-backend.md         # implementer
│   ├── angular-frontend.md       # implementer
│   ├── node-reviewer.md          # stack reviewer
│   ├── typescript-reviewer.md    # stack reviewer
│   ├── agent-smith.md            # security
│   ├── performance-oracle.md     # performance
│   ├── code-simplicity-reviewer.md  # YAGNI / simplicity
│   ├── repo-research-analyst.md  # research
│   └── framework-docs-researcher.md  # research
├── rules/workshop-conventions.mdc  # always-on project conventions
├── mcp.json                      # MCP server registration (empty placeholder)
├── install.sh                    # macOS / Linux — proper plugin install
├── install.ps1                   # Windows           — proper plugin install
├── install-parts.sh              # macOS / Linux — fallback per-component install
├── install-parts.ps1             # Windows           — fallback per-component install
└── README.md                     # this file
```

The layout follows Cursor's per-plugin format from
[cursor/plugin-template](https://github.com/cursor/plugin-template) — no
explicit registration needed in `plugin.json`; components are discovered
from the conventional `skills/`, `agents/`, `rules/`, `mcp.json` folders.

## Install

There are **two install paths**. Try the proper plugin install first; if Cursor
doesn't pick it up after a reload, use the fallback that wires each
component into Cursor's documented user-scoped scan paths.

### Path A — Proper plugin install (preferred)

Symlinks the whole plugin folder into `~/.cursor/plugins/local/workshop-agents`.
This is the format Cursor's plugin docs describe; if your Cursor build's
plugin loader is fully wired, this is the cleanest install.

**macOS / Linux:**
```bash
cd cursor-plugin
./install.sh                # or --force to replace an existing install
```
If git stripped the executable bit: `chmod +x install.sh` first.

**Windows (PowerShell):**
```powershell
cd cursor-plugin
.\install.ps1               # or -Force to replace
```
Uses `mklink /J` (directory junction) — no admin or Developer Mode required.

### Path B — Per-component install (fallback)

Use this when path A doesn't load after `Developer: Reload Window`. It
symlinks each skill folder, agent file, and rule file individually into:

```
~/.cursor/skills/<skill-name>/    <- one per skill
~/.cursor/agents/<agent-name>.md  <- one per agent
~/.cursor/rules/<rule-name>.mdc   <- one per rule
```

These are the canonical user-scoped scan paths documented in Cursor's
bundled `create-skill` and `create-subagent` skills, so they work regardless
of the plugin-loader state.

**macOS / Linux:**
```bash
cd cursor-plugin
./install-parts.sh           # or --force to replace
```

**Windows (PowerShell):**
```powershell
cd cursor-plugin
.\install-parts.ps1          # or -Force to replace
```
Uses `mklink /J` for skill folders and `mklink /H` for agent/rule files —
no admin or Developer Mode required.

The two install paths are independent — installing one does not interfere
with the other, and you can run both if you like (Cursor will see the same
skill twice, which may produce a "duplicate name" warning but is otherwise
harmless).

### After installing

Reload Cursor (`Developer: Reload Window` from the command palette). The
three skills will appear in the slash-command picker, the agents become
dispatchable by bare name, and the rule is loaded as always-on context.

## Usage

Three skills, used in order most of the time:

| Slash command       | What it does                                                                 |
|---------------------|------------------------------------------------------------------------------|
| `/workshop-plan`    | Brainstorm + research a feature, write a concrete plan to `docs/plans/`.     |
| `/workshop-work`    | Execute a plan: dispatch the right agent, write code, mark off checkboxes.   |
| `/workshop-review`  | Run review agents (security, simplicity, perf, stack) against recent changes.|

Example flow in a Cursor chat:

```
/workshop-plan add a /health endpoint to apps/api
... plan written to docs/plans/...

/workshop-work docs/plans/2026-MM-DD-XXX-feat-add-health-endpoint-plan.md
... agent implements, writes tests, ticks the checkboxes.

/workshop-review
... reviewers report findings.
```

The skills look for an optional `workshop.local.md` at the repo root for
worker/reviewer routing. Without it, sensible defaults are used. Create one
when you want to pin specific agents:

```yaml
---
worker_agents: [nestjs-backend, angular-frontend]
review_agents: [node-reviewer, typescript-reviewer, agent-smith, code-simplicity-reviewer]
---

# Review Context
... project-specific notes ...
```

## Iterating on the plugin

Edit any file under `cursor-plugin/` and reload Cursor (`Developer: Reload
Window`) to pick up the changes. Body content of skills/rules is read at
prompt time — you don't need to reload for prose tweaks, only for new files
or frontmatter changes.

The `agents/nestjs-backend.md` and `agents/angular-frontend.md` files are
copies of the same agents that live in `./agents/` at the repo root. Update
both when you iterate, or delete one location to avoid drift.

## Uninstall

### Path A — Proper plugin install

**macOS / Linux:**
```bash
rm ~/.cursor/plugins/local/workshop-agents
```

**Windows (PowerShell):**
```powershell
Remove-Item -Path "$env:USERPROFILE\.cursor\plugins\local\workshop-agents" -Recurse -Force
```

### Path B — Per-component install

**macOS / Linux:**
```bash
for f in workshop-plan workshop-work workshop-review; do
  rm -f "$HOME/.cursor/skills/$f"
done
for f in nestjs-backend angular-frontend node-reviewer typescript-reviewer \
         agent-smith performance-oracle code-simplicity-reviewer \
         repo-research-analyst framework-docs-researcher; do
  rm -f "$HOME/.cursor/agents/$f.md"
done
rm -f "$HOME/.cursor/rules/workshop-conventions.mdc"
```

**Windows (PowerShell):**
```powershell
'workshop-plan','workshop-work','workshop-review' | ForEach-Object {
  Remove-Item -LiteralPath "$env:USERPROFILE\.cursor\skills\$_" -Recurse -Force -ErrorAction SilentlyContinue
}
'nestjs-backend','angular-frontend','node-reviewer','typescript-reviewer',
'agent-smith','performance-oracle','code-simplicity-reviewer',
'repo-research-analyst','framework-docs-researcher' | ForEach-Object {
  Remove-Item -LiteralPath "$env:USERPROFILE\.cursor\agents\$_.md" -Force -ErrorAction SilentlyContinue
}
Remove-Item -LiteralPath "$env:USERPROFILE\.cursor\rules\workshop-conventions.mdc" -Force -ErrorAction SilentlyContinue
```

Then reload Cursor.

## MCP

`mcp.json` is an empty placeholder. To wire up an MCP server, add an entry
under `mcpServers` and reload Cursor:

```json
{
  "mcpServers": {
    "example": {
      "command": "node",
      "args": ["./mcp-servers/example.js"]
    }
  }
}
```
