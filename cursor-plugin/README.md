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
├── install.sh                    # macOS / Linux installer
├── install.ps1                   # Windows installer (junction, no admin)
└── README.md                     # this file
```

Cursor auto-discovers the conventional folders (`skills/`, `agents/`,
`rules/`, `mcp.json`) — there's nothing to register in `plugin.json` beyond
the name and metadata.

## Install

### macOS / Linux

```bash
cd cursor-plugin
./install.sh                # symlinks into ~/.cursor/plugins/local/workshop-agents
./install.sh --force        # replace an existing install
```

If git stripped the executable bit: `chmod +x install.sh` first.

### Windows (PowerShell)

```powershell
cd cursor-plugin
.\install.ps1               # junctions into %USERPROFILE%\.cursor\plugins\local\workshop-agents
.\install.ps1 -Force        # replace an existing install
```

The Windows script uses `mklink /J` (a directory junction) so it works
without admin or Developer Mode.

### After installing

Reload Cursor (`Developer: Reload Window` from the command palette). The
three skills will appear in the slash-command picker.

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

### macOS / Linux

```bash
rm ~/.cursor/plugins/local/workshop-agents
```

### Windows (PowerShell)

```powershell
Remove-Item -Path "$env:USERPROFILE\.cursor\plugins\local\workshop-agents" -Recurse -Force
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
