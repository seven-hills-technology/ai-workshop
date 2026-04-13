# 1. Setup & basic prompting

**Goal:** everyone in the room has their tool running against this repo and has made a change with a prompt they wrote themselves.

## Concept

A prompt is just instructions + context. The tool turns that into a series of file reads, edits, and shell commands. We're going to prompt small, read the output, and build an intuition for the feedback loop before we add anything fancy.

## Before you start

- Node 20+ installed
- Your tool of choice open (Cursor for the workshop default; Claude Code / Codex / OpenCode all fine)
- Repo cloned, `npm install` run
- `npm run dev` works — you should see the API on `:3000` and the web app on `:4200`

## Exercise

Open `apps/api/src/modules/hello/hello.controller.ts`. It returns `"hello world"`.

1. Prompt your tool: *"Change the hello endpoint to return the current time as an ISO string."*
2. Read the diff before you accept it.
3. Hit the endpoint (`curl localhost:3000/hello`) and confirm.

Now try a vague version:
- *"Make hello better."*

Notice what it does. How much did it touch? Did it read files you didn't expect? This is the same tool — the only thing that changed was your prompt.

## Takeaway

- Small, specific prompts produce small, specific diffs.
- Every time you accept a diff you didn't fully read, you're betting the code is right. Sometimes that bet is fine. Sometimes it isn't. You'll learn when.
- No portable artifact from this section — this is the warm-up.

**Next:** [02 — Tool calls](02-tool-calls.md)
