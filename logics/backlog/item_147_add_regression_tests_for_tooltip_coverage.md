## item_147_add_regression_tests_for_tooltip_coverage - Add regression tests for tooltip coverage
> From version: 0.9.30
> Understanding: 92%
> Confidence: 88%
> Progress: 0%
> Complexity: Medium
> Theme: Testing
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Without automated checks, tooltip coverage will regress as new controls are added.

# Scope
- In:
- Add a reusable test helper that asserts:
  - every rendered `button` has a non-empty `title`
  - every rendered `a[href]` has a non-empty `title`
  - icon-only clickables have non-empty `aria-label`
- Add at least one app-level regression test that renders key surfaces and enforces the invariant:
  - `SystemModal` settings flow (including navigation to nested modals)
  - `DungeonScreen` controls render
- Ensure false positives are avoided by scoping to interactive elements only.
- Out:
- No end-to-end tooltip screenshot testing.

# Acceptance criteria
- CI fails if a new clickable control is added without a `title`.
- CI fails if an icon-only clickable control is added without an `aria-label`.
- Tests are stable and do not depend on timing/animation.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_045_tooltips_for_all_clickable_controls.md`.
