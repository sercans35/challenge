# Agent table of contents

## Current project

- `README.md` — run instructions, design choices, and fixture output.
- `PLAN.md` — current implementation plan and spec coverage matrix.
- `src/extract-headings.js` — streaming Markdown heading extractor.
- `bin/markdown-headings.js` — CLI entry point.
- `test/extract-headings.test.js` — automated tests using `node:test`.
- `fixtures/fixture.md` — primary fixture from the task.

## Agent configuration

- `agents.md` — entry point for GitHub Copilot/Codex agents.
- `docs/agent/skills/plan-test-implement/README.md` — plan → tests → code → run loop.
- `docs/agent/skills/project-learning/README.md` — learning/update workflow.
- `scripts/agent-learn.js` — helper script for appending durable project knowledge and reminding the agent to update this TOC.

## Maintenance rule

Whenever a new durable document, script, or architectural decision is added, update this table of contents in the same change.
