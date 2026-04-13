# 2. Tool calls — seeing what the agent sees

**Goal:** understand that the model only knows what it has read. Context isn't free.

## Concept

Every agentic tool works roughly the same way: the model calls tools (read file, search, run shell) to gather context, then proposes edits. The quality of the output is largely set by what it read on the way in.

Two failure modes show up constantly:
- **Over-fetching** — reading 40 files to fix a typo. Wastes time and tokens, and pollutes the model's focus.
- **Under-fetching** — guessing at the shape of a function without reading it. Produces plausible-looking code that references things that don't exist.

You can watch both of these happen in real time if you pay attention to the tool calls.

## Exercise

Open `apps/api/src/modules/todos/`. It's a minimal CRUD module with an in-memory store.

1. Prompt (vague): *"Add a way to filter todos by status."*
2. **Watch the tool calls.** How many files did it read? Did it search? Did it look at the Angular side?
3. Reject the diff.
4. Re-prompt (tight): *"In `apps/api/src/modules/todos/todos.controller.ts`, add a `status` query param to `GET /todos` that filters by the existing `status` field on `Todo`. Don't touch the service or the types."*
5. Compare the tool-call trail.

## A quick aside: the context isn't just what it reads

Everything the tool pulls in — your prompt, the files it reads, *and* any agents, rules, or skills configured in the repo — ends up in the same pile of context. That means bad context poisons the output just as effectively as missing context does.

An agent file that says *"always use `ngOnInit` for data loading"* in an Angular codebase will silently steer every component it touches, even if that guidance is stale. We come back to this in [section 4](04-agents.md) — for now, just notice that agents/rules are **input**, not just configuration.

## Takeaway

- Point the tool at files. Name them. You almost always know more than the discovery step will tell it.
- If you catch it re-reading the same file three times, your prompt is too vague.
- If it's editing files you didn't mention, either (a) your prompt implied it should, or (b) it's drifting — cut it off.
- Garbage in — whether from your prompt, the files read, or the rules file — is garbage out.

No portable artifact — but you should leave this section with the instinct to skim the tool-call trail before reading the diff.

**Next:** [03 — Plans & specs](03-plans-and-specs.md)
