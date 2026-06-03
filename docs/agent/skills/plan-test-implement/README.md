# Skill: plan-test-implement

Use this skill for feature tasks and take-home style assignments.

## Steps

1. Extract deliverables and specs from the task document.
2. Write a plan in `PLAN.md` with a spec-to-test matrix.
3. Create failing or meaningful tests before implementation.
4. Implement with the smallest deterministic change.
5. Run the documented command, usually `npm test`.
6. Compare the tests and plan against every spec again.
7. Repeat until the command passes or document an intentional trade-off.

## Test design checklist

- Primary fixture path is covered.
- Every explicit edge case in the task has a test or is documented as intentionally skipped.
- CLI behavior is tested, not just library behavior.
- Output stability is asserted when the task asks for deterministic output.
- Tests avoid hidden network access and avoid machine-specific paths.
