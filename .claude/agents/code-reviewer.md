See the canonical definition at [`../../agents/code-reviewer.md`](../../agents/code-reviewer.md).

Claude Code discovers agents in `.claude/agents/`. The file above is the source of truth — this stub exists so Claude Code can find the agent without us duplicating content. When writing your own, either:

- Keep the full content in `.claude/agents/` (single-tool setup), or
- Keep the content in a shared `agents/` dir and reference it here (multi-tool setup — what this repo demonstrates).
