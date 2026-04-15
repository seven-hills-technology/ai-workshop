---
name: workshop-plan
description: Transform a feature description, bug report, or improvement idea into a well-structured plan document at docs/plans/. Use when the user asks to plan a feature, draft a spec, or design an implementation approach.
---

# Create a plan for a new feature or bug fix

## Introduction

**Note: The current year is 2026.** Use this when dating plans and searching for recent documentation.

Transform feature descriptions, bug reports, or improvement ideas into well-structured markdown plan files that follow project conventions and best practices. This skill provides flexible detail levels to match your needs.

## Feature Description

Read the user's request from the chat. If empty or vague, ask: "What would you like to plan? Please describe the feature, bug fix, or improvement you have in mind."

Do not proceed until you have a clear feature description from the user.

## Prerequisites Check

Check whether the project configuration file exists:

```bash
test -f workshop.local.md && echo "found" || echo "missing"
```

**If `workshop.local.md` is missing**, ask the user:

> "This project doesn't have a `workshop.local.md` configuration yet. Without it, worker agents and reviewer agents fall back to auto-detection. You can create one by hand at any time — see the README in the cursor plugin folder for the format."

Two paths:
1. **Continue without setup** → Proceed with planning using defaults (the user can create `workshop.local.md` later).
2. **Pause and create one first** → Ask the user to create the file, then re-run.

If found, continue directly to idea refinement.

### 0. Idea Refinement

**Check for brainstorm output first:**

Before asking questions, look for recent brainstorm documents in `docs/brainstorms/` that match this feature:

```bash
ls -la docs/brainstorms/*.md 2>/dev/null | head -10
```

**Relevance criteria:** A brainstorm is relevant if:
- The topic (from filename or YAML frontmatter) semantically matches the feature description
- Created within the last 14 days
- If multiple candidates match, use the most recent one

**If a relevant brainstorm exists:**
1. Read the brainstorm document **thoroughly** — every section matters
2. Announce: "Found brainstorm from [date]: [topic]. Using as foundation for planning."
3. Extract and carry forward **ALL** of the following into the plan:
   - Key decisions and their rationale
   - Chosen approach and why alternatives were rejected
   - Constraints and requirements discovered during brainstorming
   - Open questions (flag these for resolution during planning)
   - Success criteria and scope boundaries
   - Any specific technical choices or patterns discussed
4. **Skip the idea refinement questions below** — the brainstorm already answered WHAT to build
5. Use brainstorm content as the **primary input** to research and planning phases
6. **Critical: The brainstorm is the origin document.** Throughout the plan, reference specific decisions with `(see brainstorm: docs/brainstorms/<filename>)` when carrying forward conclusions. Do not paraphrase decisions in a way that loses their original context — link back to the source.
7. **Do not omit brainstorm content** — if the brainstorm discussed it, the plan must address it (even if briefly). Scan each brainstorm section before finalizing the plan to verify nothing was dropped.

**If multiple brainstorms could match:**
Ask the user which brainstorm to use, or whether to proceed without one.

**If no brainstorm found (or not relevant), run idea refinement:**

Refine the idea through collaborative dialogue:

- Ask questions one at a time to understand the idea fully
- Prefer multiple choice questions when natural options exist
- Focus on understanding: purpose, constraints, and success criteria
- Continue until the idea is clear OR the user says "proceed"

**Enum / lookup table decision (ask for ANY potential enum-like data):**

While refining, actively scan the feature description for any data that looks like it could be represented as a fixed set of values — status fields, types, categories, states, roles, priorities, etc. For **each** one identified, ask:

> "I noticed `[FieldName]` looks like it could be a fixed set of values. Should this be implemented as:
> 1. **Database lookup table** — values stored in the DB, editable at runtime without a deploy (e.g. `StatusTypes` table with FK)
> 2. **Code enum** — values defined in source code, change requires a deploy (e.g. `enum Status { Active, Inactive }`)

Document the decision for each enum-like field in the plan under a `## Data Design Decisions` section.

**Gather signals for research decision.** During refinement, note:

- **User's familiarity**: Do they know the codebase patterns? Are they pointing to examples?
- **User's intent**: Speed vs thoroughness? Exploration vs execution?
- **Topic risk**: Security, payments, external APIs warrant more caution
- **Uncertainty level**: Is the approach clear or open-ended?

**Skip option:** If the feature description is already detailed, offer:
"Your description is clear. Should I proceed with research, or would you like to refine it further?"

## Main Tasks

### 1. Local Research (Always Runs)

Delegate to the `repo-research-analyst` agent with the feature description as context. It will examine the repo's structure, conventions, and similar past work.

**What to look for:**
- **Repo research:** existing patterns, `AGENTS.md` (or `CLAUDE.md`) guidance, technology familiarity, pattern consistency, similar features already implemented.

These findings inform the next step.

### 1.5. Research Decision

Based on signals from Step 0 and findings from Step 1, decide on external research.

**High-risk topics → always research.** Security, payments, external APIs, data privacy. The cost of missing something is too high. This takes precedence over speed signals.

**Strong local context → skip external research.** Codebase has good patterns, `AGENTS.md` has guidance, user knows what they want. External research adds little value.

**Uncertainty or unfamiliar territory → research.** User is exploring, codebase has no examples, new technology. External perspective is valuable.

**Announce the decision and proceed.** Brief explanation, then continue. The user can redirect if needed.

Examples:
- "Your codebase has solid patterns for this. Proceeding without external research."
- "This involves payment processing, so I'll research current best practices first."

### 1.5b. External Research (Conditional)

**Only run if Step 1.5 indicates external research is valuable.**

Delegate to the `framework-docs-researcher` agent for official docs and version-specific constraints on any framework or library involved.

**Handling agent failures (timeouts and internal errors):**

Agent infrastructure can occasionally return `[Tool result missing due to internal error]` or similar failures when a subagent times out or crashes during web fetches. **Do not stall or retry** — treat a failed agent as unavailable and continue. Note the gap in Phase 1.6 and proceed with the available findings.

### 1.6. Consolidate Research

After all research steps complete, consolidate findings:

- Document relevant file paths from repo research (e.g., `apps/api/src/modules/products/products.service.ts:42`)
- Note external documentation URLs and best practices (if external research was done)
- List related issues or PRs discovered
- Capture `AGENTS.md` (or `CLAUDE.md`) conventions
- If any external research agent failed, note: "External research partial — [agent name] unavailable (infrastructure timeout). Proceeding with available findings."

**Optional validation:** Briefly summarize findings and ask if anything looks off or missing before proceeding to planning.

### 2. Plan Title & Structure

**Title & Categorization:**

- [ ] Draft a clear, searchable title using conventional format (e.g., `feat: Add user authentication`, `fix: Cart total calculation`)
- [ ] Determine the type: enhancement, bug, refactor
- [ ] Convert title to filename: add today's date prefix, determine daily sequence number, strip prefix colon, kebab-case, add `-plan` suffix
  - Scan `docs/plans/` for files matching today's date pattern `YYYY-MM-DD-\d{3}-`
  - Find the highest existing sequence number for today
  - Increment by 1, zero-padded to 3 digits (001, 002, etc.)
  - Example: `feat: Add User Authentication` → `2026-01-21-001-feat-add-user-authentication-plan.md`
  - Keep it descriptive (3-5 words after prefix) so plans are findable by context

**Stakeholder Analysis:**

- [ ] Identify who will be affected by this work (end users, developers, operations)
- [ ] Consider implementation complexity and required expertise

**Content Planning:**

- [ ] Choose appropriate detail level based on complexity and audience
- [ ] List all necessary sections for the chosen template
- [ ] Gather supporting materials (error logs, screenshots, design mockups)
- [ ] Prepare code examples or reproduction steps if applicable, naming the mock filenames in the lists

### 3. Choose Implementation Detail Level

Select how comprehensive you want the plan to be — simpler is mostly better.

#### MINIMAL (Quick Plan)

**Best for:** Simple bugs, small improvements, clear features

**Includes:**

- Problem statement or feature description
- Basic acceptance criteria
- Essential context only

**Structure:**

````markdown
---
title: [Plan Title]
type: [feat|fix|refactor]
status: active
date: YYYY-MM-DD
origin: docs/brainstorms/YYYY-MM-DD-<topic>-brainstorm.md  # if originated from brainstorm, otherwise omit
---

# [Plan Title]

[Brief problem/feature description]

## Acceptance Criteria

- [ ] Core requirement 1
- [ ] Core requirement 2

## Context

[Any critical information]

## MVP

### apps/api/src/modules/example/example.service.ts

```typescript
@Injectable()
export class ExampleService {
  // ...
}
```

## Sources

- **Origin brainstorm:** [docs/brainstorms/YYYY-MM-DD-<topic>-brainstorm.md](path) — include if plan originated from a brainstorm
- Related issue: #[issue_number]
- Documentation: [relevant_docs_url]
````

#### MORE (Standard Plan)

**Best for:** Most features, complex bugs, team collaboration

**Includes everything from MINIMAL plus:**

- Detailed background and motivation
- Technical considerations
- Success metrics
- Dependencies and risks
- Basic implementation suggestions

**Structure:**

```markdown
---
title: [Plan Title]
type: [feat|fix|refactor]
status: active
date: YYYY-MM-DD
origin: docs/brainstorms/YYYY-MM-DD-<topic>-brainstorm.md  # if originated from brainstorm, otherwise omit
---

# [Plan Title]

## Overview

[Comprehensive description]

## Problem Statement / Motivation

[Why this matters]

## Proposed Solution

[High-level approach]

## Technical Considerations

- Architecture impacts
- Performance implications
- Security considerations

## System-Wide Impact

- **Interaction graph**: [What callbacks/middleware/observers fire when this runs?]
- **Error propagation**: [How do errors flow across layers? Do retry strategies align?]
- **State lifecycle risks**: [Can partial failure leave orphaned/inconsistent state?]
- **API surface parity**: [What other interfaces expose similar functionality and need the same change?]
- **Integration test scenarios**: [Cross-layer scenarios that unit tests won't catch]

## Acceptance Criteria

- [ ] Detailed requirement 1
- [ ] Detailed requirement 2
- [ ] Testing requirements

## Success Metrics

[How we measure success]

## Dependencies & Risks

[What could block or complicate this]

## Sources & References

- **Origin brainstorm:** [docs/brainstorms/YYYY-MM-DD-<topic>-brainstorm.md](path) — include if plan originated from a brainstorm
- Similar implementations: [file_path:line_number]
- Best practices: [documentation_url]
- Related PRs: #[pr_number]
```

#### A LOT (Comprehensive Plan)

**Best for:** Major features, architectural changes, complex integrations

**Includes everything from MORE plus:**

- Detailed implementation plan with phases
- Alternative approaches considered
- Extensive technical specifications
- Resource requirements and timeline
- Future considerations and extensibility
- Risk mitigation strategies
- Documentation requirements

**Structure:**

```markdown
---
title: [Plan Title]
type: [feat|fix|refactor]
status: active
date: YYYY-MM-DD
origin: docs/brainstorms/YYYY-MM-DD-<topic>-brainstorm.md  # if originated from brainstorm, otherwise omit
---

# [Plan Title]

## Overview

[Executive summary]

## Problem Statement

[Detailed problem analysis]

## Proposed Solution

[Comprehensive solution design]

## Technical Approach

### Architecture

[Detailed technical design]

### Implementation Phases

#### Phase 1: [Foundation]

- Tasks and deliverables
- Success criteria
- Estimated effort

#### Phase 2: [Core Implementation]

- Tasks and deliverables
- Success criteria
- Estimated effort

#### Phase 3: [Polish & Optimization]

- Tasks and deliverables
- Success criteria
- Estimated effort

## Alternative Approaches Considered

[Other solutions evaluated and why rejected]

## System-Wide Impact

### Interaction Graph

[Map the chain reaction: what callbacks, middleware, observers, and event handlers fire when this code runs? Trace at least two levels deep. Document: "Action X triggers Y, which calls Z, which persists W."]

### Error & Failure Propagation

[Trace errors from lowest layer up. List specific error classes and where they're handled. Identify retry conflicts, unhandled error types, and silent failure swallowing.]

### State Lifecycle Risks

[Walk through each step that persists state. Can partial failure orphan rows, duplicate records, or leave caches stale? Document cleanup mechanisms or their absence.]

### API Surface Parity

[List all interfaces (classes, DSLs, endpoints) that expose equivalent functionality. Note which need updating and which share the code path.]

### Integration Test Scenarios

[3-5 cross-layer test scenarios that unit tests with mocks would never catch. Include expected behavior for each.]

## Acceptance Criteria

### Functional Requirements

- [ ] Detailed functional criteria

### Non-Functional Requirements

- [ ] Performance targets
- [ ] Security requirements
- [ ] Accessibility standards

### Quality Gates

- [ ] Test coverage requirements
- [ ] Documentation completeness
- [ ] Code review approval

## Success Metrics

[Detailed KPIs and measurement methods]

## Dependencies & Prerequisites

[Detailed dependency analysis]

## Risk Analysis & Mitigation

[Comprehensive risk assessment]

## Resource Requirements

[Team, time, infrastructure needs]

## Future Considerations

[Extensibility and long-term vision]

## Documentation Plan

[What docs need updating]

## Sources & References

### Origin

- **Brainstorm document:** [docs/brainstorms/YYYY-MM-DD-<topic>-brainstorm.md](path) — include if plan originated from a brainstorm. Key decisions carried forward: [list 2-3 major decisions from brainstorm]

### Internal References

- Architecture decisions: [file_path:line_number]
- Similar features: [file_path:line_number]
- Configuration: [file_path:line_number]

### External References

- Framework documentation: [url]
- Best practices guide: [url]
- Industry standards: [url]

### Related Work

- Previous PRs: #[pr_numbers]
- Related issues: #[issue_numbers]
- Design documents: [links]
```

### 4. Plan Formatting

Apply best practices for clarity and actionability, making the plan easy to scan and understand.

**Content Formatting:**

- [ ] Use clear, descriptive headings with proper hierarchy (##, ###)
- [ ] Include code examples in triple backticks with language syntax highlighting
- [ ] Add screenshots/mockups if UI-related (drag & drop or use image hosting)
- [ ] Use task lists (- [ ]) for trackable items that can be checked off
- [ ] Add collapsible sections for lengthy logs or optional details using `<details>` tags

**Cross-Referencing:**

- [ ] Link to related issues/PRs using #number format
- [ ] Reference specific commits with SHA hashes when relevant
- [ ] Link to code using GitHub's permalink feature (press 'y' for permanent link)
- [ ] Add links to external resources with descriptive text

**Code & Examples:**

````markdown
# Good example with syntax highlighting and line references

```typescript
// apps/api/src/modules/users/users.service.ts:42
async findById(id: number): Promise<User> {
  return this.userRepo.findOneOrFail({ where: { id } });
}
```

# Collapsible error logs

<details>
<summary>Full error stacktrace</summary>

`Error details here...`

</details>
````

### 5. Final Review

**Brainstorm cross-check (if plan originated from a brainstorm):**

Before finalizing, re-read the brainstorm document and verify:
- [ ] Every key decision from the brainstorm is reflected in the plan
- [ ] The chosen approach matches what was decided in the brainstorm
- [ ] Constraints and requirements from the brainstorm are captured in acceptance criteria
- [ ] Open questions from the brainstorm are either resolved or flagged
- [ ] The `origin:` frontmatter field points to the brainstorm file
- [ ] The Sources section includes the brainstorm with a summary of carried-forward decisions

**Pre-submission Checklist:**

- [ ] Title is searchable and descriptive
- [ ] All template sections are complete
- [ ] Links and references are working
- [ ] Acceptance criteria are measurable
- [ ] Add names of files in pseudo code examples and todo lists
- [ ] Add an ERD mermaid diagram if applicable for new model changes

## Write Plan File

**REQUIRED: Write the plan file to disk before presenting any options.**

```bash
mkdir -p docs/plans/
# Determine daily sequence number
today=$(date +%Y-%m-%d)
last_seq=$(ls docs/plans/${today}-*-plan.md 2>/dev/null | grep -oP "${today}-\K\d{3}" | sort -n | tail -1)
next_seq=$(printf "%03d" $(( ${last_seq:-0} + 1 )))
```

Save the complete plan to `docs/plans/YYYY-MM-DD-NNN-<type>-<descriptive-name>-plan.md` (where NNN is `$next_seq` from the bash command above). This step is mandatory and cannot be skipped — even when running as part of an automated pipeline.

Confirm: "Plan written to docs/plans/[filename]"

**Pipeline mode:** If invoked from an automated workflow, skip all interactive questions. Make decisions automatically and proceed to writing the plan without prompts.

## Output Format

**Filename:** Use the date, daily sequence number, and kebab-case filename from Step 2.

```
docs/plans/YYYY-MM-DD-NNN-<type>-<descriptive-name>-plan.md
```

Examples:
- `docs/plans/2026-01-15-001-feat-user-authentication-flow-plan.md`
- `docs/plans/2026-02-03-001-fix-checkout-race-condition-plan.md`
- `docs/plans/2026-03-10-002-refactor-api-client-extraction-plan.md`

## Post-Generation Options

After writing the plan file, present these options:

**Question:** "Plan ready at `docs/plans/YYYY-MM-DD-NNN-<type>-<name>-plan.md`. What would you like to do next?"

**Options:**
1. **Open plan in editor** — Open the plan file for review.
2. **Start `/workshop-work`** — Begin implementing this plan.
3. **Create Issue** — Create issue in project tracker (GitHub/Linear).
4. **Refine the plan** — Free-form edits.

Based on selection:
- **Open plan in editor** → Run `open docs/plans/<plan_filename>.md` to open the file in the user's default editor.
- **`/workshop-work`** → Run the `/workshop-work` skill with the plan file path.
- **Create Issue** → See "Issue Creation" section below.
- **Refine the plan** → Accept free text for rework or specific changes; loop back to options after applying.

## Issue Creation

When the user selects "Create Issue", detect their project tracker from `AGENTS.md` (or `CLAUDE.md` if you also use Claude Code):

1. **Check for tracker preference** in the project's `AGENTS.md` (or `CLAUDE.md`):
   - Look for `project_tracker: github` or `project_tracker: linear`
   - Or look for mentions of "GitHub Issues" or "Linear" in the workflow section

2. **If GitHub:**

   Use the title and type from Step 2 (already in context — no need to re-read the file):

   ```bash
   gh issue create --title "<type>: <title>" --body-file <plan_path>
   ```

3. **If Linear:**

   ```bash
   linear issue create --title "<title>" --description "$(cat <plan_path>)"
   ```

4. **If no tracker configured:**
   Ask the user: "Which project tracker do you use? (GitHub/Linear/Other)"
   - Suggest adding `project_tracker: github` or `project_tracker: linear` to their `AGENTS.md`.

5. **After creation:**
   - Display the issue URL.
   - Ask if they want to proceed to `/workshop-work`.

NEVER CODE! Just research and write the plan.
