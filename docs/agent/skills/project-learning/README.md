# Skill: project-learning

Learning means recording durable instructions, architectural facts, and repeated mistakes so future agent runs improve.

## What to record

Record information when it is likely to help future tasks, for example:

- A project convention or guardrail.
- A recurring failure mode and how to avoid it.
- A new important file, script, or subsystem.
- A design decision that affects future implementation.

Do not record temporary task details, personal notes, or noisy one-off observations.

## How to record

Use the helper script:

```bash
node scripts/agent-learn.js "Short durable lesson"
```

Then update `docs/agent/TOC.md` if the lesson adds or changes navigational structure.

## Review before finishing

Before finalizing a task, check:

- Does `agents.md` still point to the correct workflow?
- Does `docs/agent/TOC.md` include new durable files?
- Did a repeated mistake happen that should become a directive?
