# 4. Agents

**Goal:** build one narrow-scope agent you'd actually use on Monday.

## Concept

An "agent" here just means a markdown file that describes a specialized prompt with a focused job. You invoke it when that job comes up, and it does that job well because it has no other job.

Why bother with agents instead of one big super-prompt?
- **Scope = quality.** A code-reviewer agent that only reviews is better at reviewing than a general assistant that *also* reviews.
- **Reusability.** You write the prompt once. Everyone on the team runs it.
- **Portability.** It's just markdown. Cursor, Claude Code, Codex all read markdown.

### A good entry point for skeptics

If you're pitching AI tools to someone who's decided the output is slop, don't hand them a generator — hand them an **evaluator**. Code review, unit test writing, security review. These have a narrower failure mode (you can see whether the review is useful) and they catch real things.

Our plugin's security-review agent has found real issues in our codebase. Evaluator agents punch above their weight.

### Bad instructions compound

Agents (and rules, and skills — anything the tool reads as guidance) act like ambient context. Every file you generate picks up whatever they say, whether or not the instruction is correct. Wrong guidance in an agent is worse than no agent, because it looks authoritative and it propagates silently.

Concrete example: imagine you write an Angular agent that says *"always use `ngOnInit` for data loading."* That advice is out of date — in modern Angular you'd reach for signals, `effect()`, or resource-style patterns first. But once that line is in the agent, every component the agent touches gets wired through `ngOnInit`. A week later you've got a codebase full of lifecycle-hook-based loaders, subtle bugs around change detection, and reviewers pushing back on every PR — and the root cause is one line in a file nobody's looked at since they wrote it.

The same failure mode shows up everywhere:
- Rules that enforce a deprecated linting config.
- Agents that assume an old ORM version's API.
- "Style guide" skills that reference a framework version you've since upgraded past.

**How to avoid it:**
- Keep agent instructions short. The longer the file, the more places bad guidance can hide.
- Prefer *principles* over *specifics*. "Follow patterns from nearby files" ages better than "always use X."
- Re-read your agents when you upgrade a framework. Treat them like code — they rot.
- When something keeps going wrong in generated code, suspect the rules/agent before blaming the model.

## Exercise

Open `agents/code-reviewer.md`. Read it. This is the full agent — there's nothing else to it.

1. Make a small change in `apps/api/src/modules/reports/` (or generate one with a prompt).
2. Run the code-reviewer against the diff.
   - Cursor: `@code-reviewer review this diff`
   - Claude Code: `/agents code-reviewer` (or invoke via the Agent tool)
   - Other tools: check their docs — the file is the same, the invocation differs
3. Now fork it. Copy `code-reviewer.md` to `code-reviewer-strict.md` and edit its scope — maybe it only cares about test coverage, or it only flags public API changes. Run it on the same diff.

## Takeaway

- A good agent fits on one screen. If yours is longer, it probably does too many things.
- Scope is everything. "Review this code" is a bad agent. "Review this code and only flag things that change public API, break tests, or introduce new dependencies" is a good one.
- Portable artifact: `agents/*.md`. Copy them into your own repo's `.cursor/rules/` or `.claude/agents/` (whatever your tool uses) and go.

**Next:** [05 — Skills](05-skills.md)
