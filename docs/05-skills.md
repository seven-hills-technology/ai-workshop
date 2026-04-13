# 5. Skills

**Goal:** tie pieces together. One or two skills wired into your everyday flow.

## Concept

If an agent is a specialist you call on demand, a skill is a piece of procedural knowledge the tool applies automatically when the situation calls for it. Skills come in a few flavors:

- **Workflow skills** — "when I say commit, run these checks, write the message in this style, and never push to main."
- **Domain skills** — "we use our own logger, not console.log; here's the import and the three levels."
- **Composition skills** — skills that call agents. "When I run `/ship`, invoke code-reviewer, then security-reviewer, then write the commit."

Not every tool uses the word "skill." Cursor calls some of this "rules." Claude Code calls it "skills" or configures it via `CLAUDE.md`. The concept is the same — procedural instructions the tool applies automatically.

## Exercise

Open `skills/commit-message.md`. It captures a simple commit-message style.

1. Make a change in any module.
2. Trigger your tool's commit flow (however it works — `/commit` in most tools).
3. Observe the skill being applied.
4. Now compose: open `skills/ship.md`. It calls the `code-reviewer` agent *then* the commit skill. Run it.

## Takeaway

- Skills are the glue. Agents do the work; skills decide when and in what order.
- Start small. One skill you actually use beats ten you wrote and forgot.
- Portable artifact: `skills/*.md`. Same story as agents — it's just markdown, the wiring is tool-specific.

## Where do we go from here?

- **Standardize on one tool once you know what works** — not before. Our session 1 advice was *don't prematurely standardize*, and it still applies. Try a few, then pick.
- **Evaluate quarterly.** The landscape moves fast enough that "we picked X last year" isn't a permanent answer.
- **Keep your agents and skills portable.** If they're plain markdown, switching tools is a couple of file moves, not a migration project.

---

**Back to:** [overview](../README.md)
