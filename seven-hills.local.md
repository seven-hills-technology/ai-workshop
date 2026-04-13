---
review_agents: [node-reviewer, typescript-reviewer, test-reviewer, code-simplicity-reviewer, agent-smith, performance-oracle]
worker_agents: [node-worker]
plan_review_agents: [architecture-strategist, spec-flow-analyzer]
---

# Review Context

Add project-specific review instructions here.
These notes are passed to all review and worker agents during /sht:review and /sht:work.

- Monorepo: `apps/api` is NestJS, `apps/web` is Angular (standalone components, new control-flow syntax)
- TypeScript strict mode everywhere
- Angular uses standalone components — check for proper imports and no NgModule patterns
- NestJS follows standard Nest conventions
