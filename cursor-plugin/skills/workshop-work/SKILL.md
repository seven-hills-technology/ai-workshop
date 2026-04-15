---
name: workshop-work
description: Execute a plan document at docs/plans/ — dispatch the right agents, write code, run tests, tick off checkboxes, and finish features. Use when the user asks to implement a plan, work on a feature, or build out a spec.
---

# Workshop Work — Plan Execution

Execute a work plan efficiently while maintaining quality and finishing features.

## Introduction

This skill takes a work document (plan, specification, or todo file) and executes it systematically. The focus is on **shipping complete features** by understanding requirements quickly, following existing patterns, and maintaining quality throughout.

## Input Document

Read the path from the user's message. If empty or vague, ask: "Which plan should I execute? Provide a path under `docs/plans/` or paste the plan content."

## Execution Workflow

### Phase 0: Configuration Check

Before starting, verify the project configuration file exists:

```bash
test -f workshop.local.md && echo "found" || echo "missing"
```

**If `workshop.local.md` is missing**, ask the user:

> "This project doesn't have a `workshop.local.md` configuration yet. Without it, worker agent and reviewer routing falls back to auto-detection. You can create one by hand at any time — see the README in the cursor plugin folder for the format."

Two paths:
1. **Create one first** → Pause and ask the user to create the file, then re-run.
2. **Continue without it** → Proceed with auto-detection. The user can add the file later.

If found, continue to Phase 1.

### Phase 1: Quick Start

1. **Read Plan and Clarify**

   - Read the work document completely
   - Review any references or links provided in the plan
   - If anything is unclear or ambiguous, ask clarifying questions now
   - Get user approval to proceed
   - **Do not skip this** — better to ask questions now than build the wrong thing

   **Enum / lookup table check** — Before starting implementation, scan the plan (or feature description if no plan) for any data that looks like a fixed set of values: status fields, types, categories, states, roles, priorities, etc.

   For each one found, check whether the plan already documents a decision (e.g. in a `## Data Design Decisions` section). If a decision is **missing or unclear**, ask:

   > "I noticed `[FieldName]` looks like it could be a fixed set of values. Should this be implemented as:
   > 1. **Database lookup table** — values stored in the DB, editable at runtime without a deploy
   > 2. **Code enum** — values defined in source code, change requires a deploy"

   Resolve all enum decisions **before writing any code**. If working without a plan, ask about all identified enums up front in a single question batch.

2. **Setup Environment**

   First, check the current branch:

   ```bash
   current_branch=$(git branch --show-current)
   default_branch=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@')

   # Fallback if remote HEAD isn't set
   if [ -z "$default_branch" ]; then
     default_branch=$(git rev-parse --verify origin/main >/dev/null 2>&1 && echo "main" || echo "master")
   fi
   ```

   **If already on a feature branch** (not the default branch):
   - Ask: "Continue working on `[current_branch]`, or create a new branch?"
   - If continuing, proceed to step 3
   - If creating new, follow Option A below

   **If on the default branch**, choose how to proceed:

   **Option A: Create a new branch**
   ```bash
   git pull origin [default_branch]
   git checkout -b feature-branch-name
   ```
   Use a meaningful name based on the work (e.g., `feat/user-authentication`, `fix/email-validation`).

   **Option B: Continue on the default branch**
   - Requires explicit user confirmation
   - Only proceed after the user explicitly says "yes, commit to [default_branch]"
   - Never commit directly to the default branch without explicit permission

3. **Create Todo List**
   - Break the plan into actionable tasks
   - Include dependencies between tasks
   - Prioritize based on what needs to be done first
   - Include testing and quality-check tasks
   - Keep tasks specific and completable

### Phase 2: Execute

1. **Task Execution Loop**

   For each task in priority order:

   ```
   while (tasks remain):
     - Mark task as in_progress
     - Read any referenced files from the plan
     - Determine target stack and dispatch (see Worker Agent Dispatch below)
     - Write tests for new functionality (see Test Requirements below)
     - Run System-Wide Test Check (see below)
     - Run the project's test command after changes
     - Mark task as completed
     - Mark off the corresponding checkbox in the plan file ([ ] -> [x])
     - Evaluate for incremental commit (see below)
   ```

   **Worker Agent Dispatch** — For each task, determine which worker agent should implement it:

   **Step 1: Read config**
   Read `worker_agents` from `workshop.local.md` frontmatter. If no config exists, proceed to auto-detection.

   **Step 2: Determine target stack**

   a. Scan task description for stack keywords:
      - **Angular (frontend)**: "component", "page", "signal", "guard", "interceptor", "frontend", "UI", "@if", "@for"
      - **NestJS (backend)**: "controller", "service", "endpoint", "API", "entity", "module", "guard", "interceptor", "DTO", "TypeORM"

   b. If keywords are ambiguous, scan file paths referenced in the task:
      - Anything under `apps/web/**` → `angular-frontend`
      - Anything under `apps/api/**` → `nestjs-backend`
      - Shared types between them → main agent handles directly (no dedicated worker)

   **Step 3: Dispatch or fallback**

   - If a matching worker agent is configured (or auto-detected), dispatch the task to it. Pass the task description and tell the worker to read `AGENTS.md` (or `CLAUDE.md`) and `workshop.local.md` for project conventions, and to self-check with the appropriate reviewer agent before returning. Limit to two fix cycles.
   - If no matching worker exists, implement directly: look for similar patterns in the codebase and follow conventions.
   - Workers write code only. The main agent handles all git operations after the worker returns.

   **Multi-stack task splitting** — If a task spans both `apps/api` and `apps/web`:
   1. Decompose into ordered sub-tasks
   2. **Backend worker (`nestjs-backend`) runs first** — produces the API contract/types
   3. **Frontend worker (`angular-frontend`) runs second** — receives backend output as context
   4. Main agent verifies integration after both phases complete

   After a worker returns, the main agent:
   - Reviews the worker's self-check summary
   - Runs the project's test command (`npm test` in `apps/api`, `npm run build` for `apps/web`) to verify nothing broke
   - If tests fail, re-dispatches to the same worker with failure context
   - Proceeds with incremental commit evaluation

   **Test Requirements** — For each task that adds or modifies behavior:

   | Change Type | Required Tests |
   |-------------|---------------|
   | New service / business logic | Unit tests covering success, failure, and edge cases |
   | New API endpoint | Integration test verifying request/response contract |
   | New UI component with logic | Component test with user interaction scenarios |
   | Bug fix | Regression test that reproduces the bug before the fix |
   | Refactor (behavior-preserving) | Verify existing tests still pass — no new tests needed |
   | Config / infra only | No tests required |

   If the project has no test infrastructure yet, flag this to the user and suggest setting it up before proceeding. Do not silently skip test writing.

   **Running Tests** — After writing tests or making changes, run the project's test suite directly:

   ```bash
   # Backend (NestJS + Jest)
   cd apps/api && npm test

   # Frontend (Angular)
   cd apps/web && npm run build         # full type-check + bundle
   # cd apps/web && npm test            # if a test runner is configured
   ```

   Fix any failures immediately before moving to the next task.

   **System-Wide Test Check** — Before marking a task done, pause and ask:

   | Question | What to do |
   |----------|------------|
   | **What fires when this runs?** Callbacks, middleware, observers, event handlers — trace two levels out from your change. | Read the actual code (not docs) for callbacks on models you touch, middleware in the request chain, lifecycle hooks, event handlers. |
   | **Do my tests exercise the real chain?** If every dependency is mocked, the test proves your logic works *in isolation* — it says nothing about the interaction. | Write at least one integration test that uses real objects through the full callback/middleware chain. No mocks for the layers that interact. |
   | **Can failure leave orphaned state?** If your code persists state (DB row, cache, file) before calling an external service, what happens when the service fails? Does retry create duplicates? | Trace the failure path with real objects. If state is created before the risky call, test that failure cleans up or that retry is idempotent. |
   | **What other interfaces expose this?** Interfaces, base classes, alternative entry points. | Grep for the method/behavior in related classes. If parity is needed, add it now — not as a follow-up. |
   | **Do error strategies align across layers?** Retry middleware + application fallback + framework error handling — do they conflict or create double execution? | List the specific error classes at each layer. Verify your catch/handle list matches what the lower layer actually throws. |

   **When to skip:** Leaf-node changes with no callbacks, no state persistence, no parallel interfaces. If the change is purely additive (new helper method, new view component), the check takes 10 seconds and the answer is "nothing fires, skip."

   **When this matters most:** Any change that touches models with callbacks (TypeORM `@AfterInsert`, etc.), error handling with fallback/retry, or functionality exposed through multiple interfaces.

   **IMPORTANT**: Always update the original plan document by checking off completed items. Use the Edit tool to change `- [ ]` to `- [x]` for each task you finish. This keeps the plan as a living document showing progress and ensures no checkboxes are left unchecked.

2. **Incremental Commits**

   After completing each task, evaluate whether to create an incremental commit:

   | Commit when... | Don't commit when... |
   |----------------|---------------------|
   | Logical unit complete (model, service, component) | Small part of a larger unit |
   | Tests pass + meaningful progress | Tests failing |
   | About to switch contexts (backend → frontend) | Purely scaffolding with no behavior |
   | About to attempt risky/uncertain changes | Would need a "WIP" commit message |

   **Heuristic:** "Can I write a commit message that describes a complete, valuable change? If yes, commit. If the message would be 'WIP' or 'partial X', wait."

   **Commit workflow:**
   ```bash
   # 1. Verify tests pass
   cd apps/api && npm test
   cd apps/web && npm run build

   # 2. Stage only files related to this logical unit (not `git add .`)
   git add <files related to this logical unit>

   # 3. Commit with conventional message
   git commit -m "feat(scope): description of this unit"
   ```

   **Handling merge conflicts:** If conflicts arise during rebasing or merging, resolve them immediately. Incremental commits make conflict resolution easier since each commit is small and focused.

   **Note:** Incremental commits use clean conventional messages without attribution footers. The final Phase 4 commit/PR can include attribution.

3. **Follow Existing Patterns**

   - The plan should reference similar code — read those files first
   - Match naming conventions exactly
   - Reuse existing components where possible
   - Follow project coding standards (see `AGENTS.md` or `CLAUDE.md`)
   - When in doubt, grep for similar implementations

4. **Test Continuously**

   - Run relevant tests after each significant change
   - Don't wait until the end to test
   - Fix failures immediately
   - Add new tests for new functionality — this is NOT optional
   - **Unit tests with mocks prove logic in isolation. Integration tests with real objects prove the layers work together.** If your change touches callbacks, middleware, or error handling — you need both.
   - If a task adds behavior but no tests, the task is NOT complete

5. **Track Progress**
   - Keep your task list updated as you complete work
   - Note any blockers or unexpected discoveries
   - Create new tasks if scope expands
   - Keep the user informed of major milestones

### Phase 3: Quality Check

1. **Run Core Quality Checks**

   Always run before submitting:

   ```bash
   # Backend tests
   cd apps/api && npm test

   # Frontend build (also type-checks)
   cd apps/web && npm run build

   # Linting (if configured)
   cd apps/api && npm run lint
   cd apps/web && npm run lint
   ```

2. **Consider Reviewer Agents** (Optional)

   Use for complex, risky, or large changes. Read agents from `workshop.local.md` frontmatter (`review_agents`). The plugin ships these reviewers:

   | Agent | When to use |
   |-------|------------|
   | `node-reviewer` | Backend changes — async patterns, NestJS conventions, error handling |
   | `typescript-reviewer` | Any `.ts` change — type safety, modern patterns, strict-null handling |
   | `agent-smith` | Security-sensitive code — auth, input validation, secrets, OWASP top 10 |
   | `performance-oracle` | Hot paths, DB queries, large data, scalability concerns |
   | `code-simplicity-reviewer` | Final pass — YAGNI violations and simplification opportunities |

   Dispatch reviewers in parallel and present their findings together.

3. **Final Validation**
   - All tasks marked completed
   - All tests pass
   - Linting passes
   - Code follows existing patterns
   - No console errors or warnings

4. **Prepare Operational Validation Plan** (if shipping to a real environment)
   - Add a `## Post-Deploy Monitoring & Validation` section to the PR description.
   - Include concrete:
     - Log queries / search terms
     - Metrics or dashboards to watch
     - Expected healthy signals
     - Failure signals and rollback / mitigation trigger
     - Validation window and owner
   - For workshop / local-only changes: include the section with `No additional operational monitoring required` and a one-line reason.

### Phase 4: Ship It

1. **Create Commit**

   ```bash
   git add .
   git status        # Review what's being committed
   git diff --staged # Check the changes

   git commit -m "feat(scope): description of what and why"
   ```

2. **Capture Screenshots for UI Changes** (recommended for any UI work)

   For design changes, new views, or UI modifications, capture before/after screenshots and include them in the PR description. Start the dev servers (`apps/api`: `npm start`, `apps/web`: `npm start`), navigate to the changed views, and screenshot them.

3. **Create Pull Request**

   ```bash
   git push -u origin feature-branch-name

   gh pr create --title "Feature: [Description]" --body "$(cat <<'EOF'
   ## Summary
   - What was built
   - Why it was needed
   - Key decisions made

   ## Testing
   - Tests added/modified
   - Manual testing performed

   ## Post-Deploy Monitoring & Validation
   - **What to monitor/search**
     - Logs:
     - Metrics/Dashboards:
   - **Validation checks (queries/commands)**
     - `command or query here`
   - **Expected healthy behavior**
     - Expected signal(s)
   - **Failure signal(s) / rollback trigger**
     - Trigger + immediate action
   - **Validation window & owner**
     - Window:
     - Owner:
   - **If no operational impact**
     - `No additional operational monitoring required: <reason>`

   ## Before / After Screenshots
   | Before | After |
   |--------|-------|
   | ![before](URL) | ![after](URL) |
   EOF
   )"
   ```

4. **Update Plan Status**

   If the input document has YAML frontmatter with a `status` field, update it to `completed`:
   ```
   status: active  →  status: completed
   ```

5. **Notify User**
   - Summarize what was completed
   - Link to PR
   - Note any follow-up work needed
   - Suggest next steps if applicable

---

## Key Principles

### Start Fast, Execute Faster

- Get clarification once at the start, then execute
- Don't wait for perfect understanding — ask questions and move
- The goal is to **finish the feature**, not create perfect process

### The Plan is Your Guide

- Work documents should reference similar code and patterns
- Load those references and follow them
- Don't reinvent — match what exists

### Test As You Go

- Run tests after each change, not at the end
- Fix failures immediately
- Continuous testing prevents big surprises

### Quality is Built In

- Follow existing patterns
- Write tests for new code
- Run linting before pushing
- Use reviewer agents for complex / risky changes only

### Ship Complete Features

- Mark all tasks completed before moving on
- Don't leave features 80% done
- A finished feature that ships beats a perfect feature that doesn't

## Quality Checklist

Before creating PR, verify:

- [ ] All clarifying questions asked and answered
- [ ] All tasks marked completed
- [ ] New / modified behavior has corresponding tests (unit and / or integration)
- [ ] Tests pass (`npm test` in `apps/api`, `npm run build` in `apps/web`)
- [ ] Linting passes (`npm run lint` in each app, if configured)
- [ ] Code follows existing patterns
- [ ] Before / after screenshots captured (for UI changes)
- [ ] Commit messages follow conventional format
- [ ] PR description includes summary, testing notes, and (if relevant) Post-Deploy Monitoring & Validation

## When to Use Reviewer Agents

**Don't use by default.** Use reviewer agents only when:

- Large refactor affecting many files (10+)
- Security-sensitive changes (authentication, permissions, data access)
- Performance-critical code paths
- Complex algorithms or business logic
- The user explicitly requests thorough review

For most features: tests + linting + following patterns is sufficient.

## Common Pitfalls to Avoid

- **Analysis paralysis** — Don't overthink, read the plan and execute
- **Skipping clarifying questions** — Ask now, not after building wrong thing
- **Ignoring plan references** — The plan has links for a reason
- **Testing at the end** — Test continuously or suffer later
- **Forgetting the task list** — Track progress or lose track of what's done
- **80% done syndrome** — Finish the feature, don't move on early
- **Over-reviewing simple changes** — Save reviewer agents for complex work
- **Inventing instructions** — Only follow what is in this skill, the plan, `AGENTS.md` / `workshop.local.md`, or the user's explicit prompt. Do not invent "always-do" rules. Do not add network calls or telemetry that the feature doesn't require. Do not modify `node_modules/` directly.
