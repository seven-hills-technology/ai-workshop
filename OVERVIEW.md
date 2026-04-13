# Workshop Overview — For Brian

> Session 2 of the AI tools workshop. Hands-on, mini-exercise format. Three hosts (Jordan, Brian, Brad) on the floor helping groups. Audience primarily uses Cursor.

## The arc we agreed on

Vertical-slice, not horizontal progression. We introduce a concept, do a small exercise around it, move on. Each section leaves them with a portable artifact they can paste into their own repos on Monday.

The messaging throughout: **there are a lot of tools and concepts — you have to wire them up for your own workflow.** We demo in Cursor because that's what they have, but everything we build is plain markdown and works in Claude Code, Codex, OpenCode, etc.

## Running order

| # | Section | Concept | Exercise | Portable artifact |
|---|---|---|---|---|
| 1 | Setup & basic prompting | Get tools installed, inspect what a prompt actually does | Prompt a small change to the `hello` module, watch the diff | — |
| 2 | Tool calls | How the agent sees your repo (read/search/edit), cost of sloppy context | Intentionally vague prompt → observe over-fetching → tighten it | — |
| 3 | Plans & specs | Implementation plans before code; spec-driven iteration | Write a spec for the `notifications` module, have the agent plan it, iterate on the plan before any code runs | `docs/specs/` template |
| 4 | Agents | Tightly-scoped sub-agents, when to reach for them | Build a `code-reviewer` agent from the template, run it on a diff | `agents/*.md` |
| 5 | Skills | Composing skills, hooks, tying workflows together | Wire a `commit-message` skill into their flow | `skills/*.md` |

Roughly 20–25 minutes per section including the exercise. We can compress 1 + 2 if the room is already set up.

## Framing notes (things we talked about that should land in the slides)

- **"Speed is a side effect."** If we talk about speed, it sounds like we're endorsing reckless review. Frame every section in terms of quality/confidence, and speed falls out as a consequence. Brian — you said it best: *"it's not an excuse to be reckless"* covers the whole thing if someone asks about review depth.
- **Review depth is learned, not prescribed.** Deep review for novel code with few examples in the repo; lighter review for the 30th CRUD endpoint following an established pattern. Don't give a universal rule — give the heuristic.
- **Don't prematurely standardize.** This was our advice in session 1 and Anthropic's pricing shifts proved it out. Standardize *after* you know what works. Meanwhile: keep agents/skills in plain `.md` so they port cleanly.
- **Entry points for skeptics.** For the "AI only produces slop" crowd, start them on narrow-scope agents: code review, unit test writer, security review. They're evaluators, not generators — lower stakes, immediate value. Brad's plugin's security-review agent has a good war story here.
- **"Claude Code in Cursor" confusion.** Worth a slide. Same model ≠ same product. Tool-use loops, context management, and sub-agent orchestration differ. The BYOM section (OpenCode/Goose/Aider) is the natural place to call this out.
- **Where things live differs by tool.** Cursor rules vs. Claude Code agents vs. Codex configs — short slide showing the mapping. The concepts port; the file paths don't.

## What's in this repo

- `apps/api` — NestJS skeleton with module stubs per workshop section
- `apps/web` — Angular skeleton with matching feature modules
- `docs/` — one doc per workshop section, including the exercise script
- `agents/` — portable agent templates (code review, security review, unit tests)
- `skills/` — portable skill templates
- `.cursor/` and `.claude/` — tool-specific wiring that points at the shared `agents/` and `skills/` directories, to demonstrate the "one source, many tools" pattern

## Open questions for Monday

1. **What do they actually build?** The modules are stubs. We need to pick one real feature per section so the exercises feel concrete instead of contrived.
2. **Reset strategy.** When an attendee's exercise goes sideways, do we have `git reset` checkpoints? Branches per section?
3. **MCP demo.** Do we wire one up (e.g., filesystem + a hosted one) or skip to keep scope tight?
4. **Pairing or solo?** Pairs mean fewer laptops to help, but solo means everyone gets hands-on.
5. **Handout.** Do they leave with a link to this repo, or a zip, or both?

Jordan will drive repo content with Brian/Brad on Monday and Tuesday. Brian is drafting the script/slides in parallel.
