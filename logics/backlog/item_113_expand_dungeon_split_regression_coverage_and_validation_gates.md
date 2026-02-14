## item_113_expand_dungeon_split_regression_coverage_and_validation_gates - Expand dungeon split regression coverage and validation gates
> From version: 0.9.24
> Understanding: 96%
> Confidence: 94%
> Progress: 0%
> Complexity: Medium
> Theme: Testing
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Without explicit regression gates, splitting `dungeon.ts` can introduce subtle behavior drift in tick sequencing, replay truncation, or lifecycle transitions.

# Scope
- In:
- Add/update tests for extracted modules:
  - formulas/replay helpers unit tests
  - lifecycle/state integration tests
  - tick non-regression checks (ordering and outcomes)
- Enforce validation gates for split work:
  - lint/typecheck/typecheck:tests/tests/test:ci
- Keep coverage parity or improve on touched dungeon modules.
- Out:
- No gameplay feature additions.

# Acceptance criteria
- Refactor-critical dungeon paths are covered by dedicated tests.
- Full validation commands pass on split branches.
- Regression risk is documented and materially reduced.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_038_split_core_dungeon_module_into_domain_focused_files.md`.
- Quality gate for items `item_107` through `item_112`.
