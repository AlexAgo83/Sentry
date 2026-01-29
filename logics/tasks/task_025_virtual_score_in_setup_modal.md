## task_025_virtual_score_in_setup_modal - Virtual score in setup modal
> From version: 0.8.11
> Understanding: 94%
> Confidence: 92%
> Progress: 0%

# Context
Derived from `logics/backlog/item_023_virtual_score_in_setup_modal.md`

# Plan
- [ ] 1. Add a selector/helper to compute the virtual score (sum of all players’ skill levels).
- [ ] 2. Render the score line in the setup modal footer with subtle styling.
- [ ] 3. Add a UI test to confirm the label/value render and update on state change.
- [ ] FINAL: Update related Logics docs if scope changes.

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

# Estimate
- Size: S
- Drivers:
  - Unknowns: exact setup modal layout constraints.
  - Integration points: state selectors and setup modal component.
  - Migration/rollback risk: low.
