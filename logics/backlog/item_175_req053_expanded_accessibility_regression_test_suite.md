## item_175_req053_expanded_accessibility_regression_test_suite - req053 expanded accessibility regression test suite
> From version: 0.9.36
> Understanding: 98%
> Confidence: 96%
> Progress: 100%
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

# Delivery
- Expanded axe coverage beyond Inventory panel in `tests/app/accessibility.test.tsx`:
  - `ModalShell`
  - `StartupSplashScreen`
- Added dialog keyboard/focus lifecycle assertions in `tests/app/modalShell.test.tsx`.
- Added startup dialog focus behavior regression tests in `tests/app/startupSplashScreen.test.tsx`.
- Added mobile roster drawer dialog/focus behavior regression tests in `tests/app/appView.mobileRoster.test.tsx`.
- Added keyboard interaction regressions for scoped tab widgets:
  - `tests/app/sidePanelSwitcher.dungeonActive.test.tsx`
  - `tests/app/inventoryControls.test.tsx`
  - `tests/app/statsDashboardPanel.test.tsx`
- Added replay-log semantic control regression in `tests/app/dungeonScreen.controls.test.tsx`.
- Updated compatibility test expectations impacted by stronger modal naming semantics:
  - `tests/app/cloudSaveModal.test.tsx`
