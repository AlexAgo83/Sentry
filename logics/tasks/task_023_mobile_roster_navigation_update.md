## task_023_mobile_roster_navigation_update - Mobile roster navigation update
> From version: 0.8.11
> Understanding: 94%
> Confidence: 92%
> Progress: 0%

# Context
Derived from `logics/backlog/item_021_mobile_roster_navigation_update.md`

# Plan
- [ ] 1. Locate mobile nav label for Stats and change to Roster at the mobile breakpoint.
- [ ] 2. Hide the roster panel outside the Stats/Roster screen on mobile.
- [ ] 3. Update any a11y labels/tooltips that expose the Stats label.
- [ ] 4. Add a lightweight UI regression test or snapshot update.
- [ ] FINAL: Update related Logics docs if scope changes.

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

# Estimate
- Size: S
- Drivers:
  - Unknowns: location of label + visibility logic in UI components.
  - Integration points: SidePanelSwitcher + roster panel visibility rules.
  - Migration/rollback risk: low.
