---
name: ship
description: Pre-commit pipeline. Runs code review, then security review, then prepares a commit using the house style.
trigger: user says "ship it" or invokes /ship
---

When the user is ready to commit a set of changes:

1. **Confirm the scope.** List the changed files. If any look unrelated to the intent of the change, ask before continuing.
2. **Run `code-reviewer`** on the diff. Surface blocking issues to the user. If anything is blocking, stop here — don't proceed to commit.
3. **Run `security-reviewer`** on the diff. Same rule: surface risks, stop on anything critical or high.
4. **Run the test suite.** If tests fail, stop. Don't try to fix them without the user asking.
5. **Draft the commit message** using the [`commit-message`](commit-message.md) skill.
6. **Show** the user the message and the staged file list. Wait for confirmation before committing.
7. Never `--no-verify` or skip hooks.
8. Never push.

This skill is a composition example — it's worth reading to see how a skill can chain agents. In practice, most of your skills will be simpler than this one.
