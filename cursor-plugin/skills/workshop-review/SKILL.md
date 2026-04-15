---
name: workshop-review
description: Multi-agent code review of a PR, branch, or recent local changes. Dispatches stack and focus reviewers in parallel and synthesizes findings into a single markdown report. Use when the user asks to review code, audit a PR, or check changes for security / performance / simplicity issues.
---

# Workshop Review

Multi-agent review pass that runs the configured reviewer agents against a PR, branch, or set of local changes, synthesizes the findings, and writes them to a single markdown report under `docs/reviews/`.

## Prerequisites

- Git repository
- For PR reviews: GitHub CLI (`gh`) installed and authenticated
- A `workshop.local.md` at the repo root (optional — without it, the skill uses a default reviewer set)

## Main Tasks

### 1. Determine Review Target

Read the user's argument from the chat. Accepted forms:
- A PR number (numeric) — e.g. `42`
- A GitHub PR URL — e.g. `https://github.com/org/repo/pull/42`
- A branch name — e.g. `feat/auth-login`
- The literal `latest` — review the diff between the current branch and the merge-base with the default branch
- Empty — same as `latest`

Also accepted: a `--serial` flag at the end to force serial execution (default is parallel).

#### Setup steps

- [ ] Determine the target type from the argument
- [ ] Check the current git branch:
  ```bash
  current_branch=$(git branch --show-current)
  default_branch=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@')
  [ -z "$default_branch" ] && default_branch=$(git rev-parse --verify origin/main >/dev/null 2>&1 && echo "main" || echo "master")
  ```
- [ ] If reviewing a PR or named branch and you're not already on it, check it out (`gh pr checkout <number>` for PRs, `git checkout <branch>` for branches). Confirm with the user before switching if there are uncommitted local changes.
- [ ] For PR targets, fetch metadata: `gh pr view <number> --json title,body,files,labels,baseRefName,headRefName`
- [ ] Compute the diff to be reviewed: for PRs, `gh pr diff <number>`; for branches/`latest`, `git diff $(git merge-base HEAD origin/$default_branch)..HEAD`

### 2. Protected Artifacts

The following paths are workshop pipeline artifacts and must never be flagged for deletion, removal, or gitignore by any review agent:

- `docs/plans/*.md` — Plan files created by `/workshop-plan`. Living documents whose checkboxes are ticked off by `/workshop-work`.
- `docs/brainstorms/*.md` — Brainstorm notes that originate plans.
- `docs/reviews/*.md` — Review reports created by this skill.

If a review agent flags any file in these directories for cleanup or removal, discard that finding during synthesis.

### 3. Load Reviewer Roster

Read `workshop.local.md` in the project root. If found, use `review_agents` from the YAML frontmatter. If the markdown body contains review context, pass it to each agent as additional instructions.

If no settings file exists, use this default roster (the agents shipped with the workshop plugin):

- `node-reviewer` — backend / NestJS / Node patterns
- `typescript-reviewer` — type safety, modern TS patterns
- `code-simplicity-reviewer` — YAGNI / minimalism final pass

For security-sensitive changes (auth, permissions, data access, secrets) also run:

- `agent-smith` — security audit

For performance-sensitive changes (hot paths, DB queries, large data, real-time) also run:

- `performance-oracle`

The `code-simplicity-reviewer` should always run last, after all other agents.

### 4. Choose Execution Mode

**Parallel (default):** dispatch all reviewers at once and collect their findings together. Faster, uses more tokens.

**Serial (`--serial` flag, or auto when 6+ agents are configured):** dispatch one at a time. Slower, less context pressure.

Auto-switch to serial when the configured roster has 6 or more agents and tell the user:

> "Running review agents in serial mode (6+ agents configured). Use --parallel to override."

### 5. Dispatch the Reviewers

For each agent in the chosen roster, delegate to it with the diff content and a `Review Context` block containing the markdown body of `workshop.local.md` (if present). Each agent's `description` already states its scope — trust it.

In parallel mode, dispatch all agents in a single batch and wait for all to return. In serial mode, dispatch one at a time.

### 6. Ultra-Think Synthesis

Once all agents have returned:

1. **Collect findings** from every agent.
2. **Discard any finding** that targets a protected artifact (`docs/plans/`, `docs/brainstorms/`, `docs/reviews/`).
3. **Categorize** by type: security, performance, architecture, quality / simplicity, type safety, tests, other.
4. **Assign severity:**
   - **P1 — Critical** (blocks merge): security vulnerabilities, data-corruption risks, breaking changes, broken auth.
   - **P2 — Important** (should fix): perf bottlenecks, architectural concerns, significant code-quality issues, missing tests on new behavior.
   - **P3 — Nice-to-have**: minor improvements, cleanup, documentation tweaks.
5. **De-duplicate**: collapse overlapping findings from different agents into a single entry, citing each contributor.
6. **Estimate effort** per finding: Small / Medium / Large.

Put yourself in each stakeholder's shoes when synthesizing:

- **Developer**: How easy is this to understand and modify? Are the APIs intuitive? Can I test this?
- **Operations**: How do I deploy this safely? What metrics and logs are available?
- **End user**: Is it intuitive? Are error messages helpful? Is performance acceptable?
- **Security**: What's the attack surface? How is data protected?

And explicitly walk the failure scenarios:

- Happy path — Invalid inputs — Boundary conditions — Concurrent access — Scale (10x, 100x) — Network issues — Resource exhaustion — Security attacks — Data corruption — Cascading failures

### 7. Write the Report

Save the synthesized findings to a single markdown file:

```bash
mkdir -p docs/reviews/
today=$(date +%Y-%m-%d)
last_seq=$(ls docs/reviews/${today}-*.md 2>/dev/null | grep -oP "${today}-\K\d{3}" | sort -n | tail -1)
next_seq=$(printf "%03d" $(( ${last_seq:-0} + 1 )))
```

Filename: `docs/reviews/YYYY-MM-DD-NNN-review-<short-target-slug>.md` — e.g. `2026-04-14-001-review-pr-42.md` or `2026-04-14-002-review-feat-auth-login.md`.

**Report structure:**

````markdown
---
date: YYYY-MM-DD
target: <PR #N | branch-name | latest>
agents: [list of reviewers run]
status: open
---

# Code Review — <target description>

## Summary

- **Total findings:** N
- **P1 (Critical, blocks merge):** N
- **P2 (Important, should fix):** N
- **P3 (Nice-to-have):** N

## P1 — Critical (blocks merge)

### 1. <Title>

- **Files:** `path/to/file.ts:42`, `other/file.ts:88`
- **Reported by:** agent-smith, node-reviewer
- **Effort:** Small | Medium | Large
- **Problem:** ...
- **Why it matters:** ...
- **Recommendation:** ...
- **Acceptance criteria:** [checkable list]

### 2. <Title>
...

## P2 — Important

### 3. <Title>
...

## P3 — Nice-to-have

### N. <Title>
...

## Stakeholder Notes
[Anything cross-cutting that didn't fit into a single finding — e.g. "this PR is generally well-typed but the test coverage is uneven across modules"]

## Scenarios Considered
[Brief notes on the failure-scenario checklist — what was checked, what surfaced, what didn't]
````

### 8. Present Summary

After writing the report, print a short summary in chat:

```
Code Review Complete

Target:        <description>
Report:        docs/reviews/<filename>.md
Findings:      N total — N P1, N P2, N P3
Reviewers:     [list]

P1 findings (blocks merge):
  1. <Title>            — <files>
  2. <Title>            — <files>

Next steps:
  1. Address P1 findings before merging.
  2. Open the report for full detail and recommended actions.
  3. When fixes are in, re-run /workshop-review to verify.
```

If there are no P1 findings, say so explicitly: "No P1 findings — safe to merge from a review perspective."

## Optional Follow-ups

- **End-to-end browser smoke** for UI changes — not part of this skill, but you can suggest the user start the dev servers (`apps/api`: `npm start`, `apps/web`: `npm start`) and walk the affected pages manually.
- **Re-run after fixes** — once the user has addressed findings, re-run `/workshop-review` to confirm everything is resolved. The new report will be a fresh file with a higher sequence number.

## What this skill does NOT do

- It does not write the fixes itself. That's `/workshop-work`.
- It does not block the user — even with P1 findings, the user decides when to merge. The skill flags severity and explains why; the human is in charge.
- It does not invent additional tooling, network calls, or telemetry. If a finding requires a new agent that isn't configured, the skill notes that as a follow-up rather than silently bringing in unconfigured agents.
