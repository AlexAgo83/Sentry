## item_175_req053_expanded_accessibility_regression_test_suite - req053 expanded accessibility regression test suite
> From version: 0.9.36
> Understanding: 95%
> Confidence: 90%
> Progress: 0%
> Complexity: Medium
> Theme: Testing / Accessibility
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Current automated accessibility coverage is too narrow and mostly validates one panel. Critical flows (dialogs, tabs, mobile drawer, replay interactions) can regress without CI detection.

# Scope
- In:
- Expand accessibility-focused tests for:
  - modal shell semantics and keyboard behavior,
  - startup splash dialog behavior,
  - tab widgets (side switcher/inventory/stats),
  - replay log interaction semantics.
- Add targeted keyboard navigation assertions where axe alone is insufficient.
- Keep test runtime stable and deterministic in CI.
- Out:
- New feature development unrelated to accessibility hardening.
- Visual/UI redesign work.

# Acceptance criteria
- Accessibility regression tests cover all critical flows listed in scope.
- CI catches structural a11y regressions beyond InventoryPanel.
- Added tests are stable (no flaky keyboard/timing assumptions).

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_053_accessibility_compliance_hardening_for_dialogs_tabs_and_keyboard_flows.md`.
- Likely touch points:
  - `tests/app/accessibility.test.tsx`
  - `tests/app/modalShell.test.tsx`
  - additional `tests/app/*` suites for tabs/dungeon replay interactions
