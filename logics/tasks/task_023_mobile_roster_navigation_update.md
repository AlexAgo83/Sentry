## task_023_mobile_roster_navigation_update - Mobile roster navigation update
> From version: 0.8.11
> Understanding: 96%
> Confidence: 94%
> Progress: 100%

# Context
Derived from `logics/backlog/item_021_mobile_roster_navigation_update.md`

# Plan
- [x] 1. Locate mobile nav label for Stats and change to Roster at the mobile breakpoint.
- [x] 2. Hide the roster panel outside the Stats/Roster screen on mobile.
- [x] 3. Update any a11y labels/tooltips that expose the Stats label.
- [x] 4. Add a lightweight UI regression test or snapshot update.
- [x] FINAL: Update related Logics docs if scope changes.

# Test plan
- UI: verify "Roster" label renders on mobile breakpoint and "Stats" on desktop.
- UI: roster panel is hidden when non-Stats screen is active on mobile.
- A11y: aria-label/tooltip reflects "Roster" on mobile.

# Validation
- npm run tests
- npm run lint

# Risks & rollback
- What can break: label or panel visibility could drift on desktop or non-mobile layouts.
- How to detect regressions: UI regression test + manual check at 720px breakpoint.
- Rollback plan: revert label + visibility condition to previous behavior.

# Report
- Mobile bottom bar label now shows "Roster" and roster panel hides outside the Stats screen on mobile.
- Added a focused AppView mobile test for label + roster visibility.
- Validation not run yet.

# Estimate
- Size: S
- Drivers:
  - Unknowns: location of label + visibility logic in UI components.
  - Integration points: SidePanelSwitcher + roster panel visibility rules.
  - Migration/rollback risk: low.
