## task_096_execute_tooltip_coverage_across_backlog_items_145_to_147 - Execute tooltip coverage across backlog items 145 to 147
> From version: 0.9.30
> Understanding: 96%
> Confidence: 92%
> Progress: 100%
> Complexity: High
> Theme: UX / Accessibility
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_145_define_tooltip_conventions_and_shared_helper.md`
- `logics/backlog/item_146_add_titles_and_aria_labels_across_all_clickable_controls.md`
- `logics/backlog/item_147_add_regression_tests_for_tooltip_coverage.md`

Request reference:
- `logics/request/req_045_tooltips_for_all_clickable_controls.md`

This task enforces a strict invariant: every clickable control has a hover description via `title`, and icon-only clickables also provide `aria-label`.

# Decisions (v1)
- Tooltips use native `title` (no custom renderer in v1).
- Icon-only clickables must include `aria-label` (matching `title`).
- Regression tests must fail CI when a clickable control is missing required metadata.

# Plan
- [x] 1. Execute `item_145` (convention + helper):
  - Pick a minimal helper/wrapper if it reduces repetition.
  - Document any explicit exceptions.
- [x] 2. Execute `item_146` (sweep UI):
  - Add missing `title` across major surfaces.
  - Add missing `aria-label` for icon-only clickables.
  - Ensure disabled controls explain why (when meaningful).
- [x] 3. Execute `item_147` (tests):
  - Add invariant tests for key surfaces.
  - Ensure tests target interactive elements only (avoid false positives).
- [x] FINAL: Run validation

# Validation
Final gate (mandatory at task end):
- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:tests`
- `npm run test:ci`
