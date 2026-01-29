## task_025_virtual_score_in_setup_modal - Virtual score in setup modal
> From version: 0.8.11
> Understanding: 95%
> Confidence: 93%
> Progress: 100%

# Context
Derived from `logics/backlog/item_023_virtual_score_in_setup_modal.md`

# Plan
- [x] 1. Add a selector/helper to compute the virtual score (sum of all players’ skill levels).
- [x] 2. Render the score line in the setup modal footer with subtle styling.
- [x] 3. Add a UI test to confirm the label/value render and update on state change.
- [x] FINAL: Update related Logics docs if scope changes.

# Test plan
- Unit: virtual score calculation from players’ skill levels.
- UI: setup modal renders "Virtual score: X" and updates on state change.

# Validation
- npm run tests
- npm run lint

# Risks & rollback
- What can break: minor layout shift in setup modal.
- How to detect regressions: UI test + quick visual check.
- Rollback plan: remove the score line and selector.

# Report
- Added virtual score selector and displayed it in the System/Setup modal footer.
- Added selector test and System modal UI coverage for the score line.
- Validation not run yet.

# Estimate
- Size: S
- Drivers:
  - Unknowns: exact setup modal layout constraints.
  - Integration points: state selectors and setup modal component.
  - Migration/rollback risk: low.
