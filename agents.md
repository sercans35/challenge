# agents.md

## Project Purpose

A streaming Markdown heading extraction tool.

The project provides:

- Streaming Markdown parsing
- Accurate heading extraction
- Exact UTF-8 byte offset tracking
- Deterministic JSON output
- Large-file support with O(1) memory usage

## Assignment Model

The repository evolves through iterative assignments.

Each new request becomes the active assignment.

The agent must:

1. Understand the requested change.
2. Preserve verified existing behavior unless explicitly changed.
3. Create or update a plan.
4. Create or update tests.
5. Implement the change.
6. Verify the implementation.
7. Update project knowledge when new stable rules are discovered.

Every iteration should leave the project in a better-tested state than before.

## Required workflow

For every implementation task, follow this order:

1. Read the active request.
2. Read relevant project knowledge from `docs/agent/toc.md`.
3. Inspect affected files.
4. Update or create `PLAN.md`.
5. Add or update tests first.
6. Implement the smallest correct change.
7. Run the relevant tests.
8. Run the documented CLI command if applicable.
9. Update documentation if behavior or usage changed.
10. Record stable lessons using `scripts/agent-learn.js`.

## Testing rules

Use native Node.js tooling unless there is a strong reason not to.

Preferred commands:

```bash
npm test