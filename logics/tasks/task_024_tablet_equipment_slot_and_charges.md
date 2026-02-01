## task_024_tablet_equipment_slot_and_charges - Tablet equipment slot and charges
> From version: 0.8.11
> Understanding: 95%
> Confidence: 92%
> Progress: 100%

# Context
Derived from `logics/backlog/item_022_tablet_equipment_slot_and_charges.md`.

# Plan
- [x] 1. Extend equipment slot enums/types with Tablet and place slot after Weapons in UI.
- [x] 2. Add tablet item definitions (IDs, metadata, icons/placeholder).
- [x] 3. Add tablet charges to state/save schema + migrations.
- [x] 4. Implement charge depletion on completed actions (incl. offline catch-up) and removal at 0.
- [x] 5. Surface charges in tooltip and equipment slot badge.
- [x] 6. Add tests for depletion, persistence, and UI display.
- [x] FINAL: Update related Logics docs if scope changes.

# Test plan
- Unit: charge decrement on completed action; removal at 0 after action completes.
- Integration: offline catch-up consumes charges correctly; unequip/re-equip preserves charges.
- Migration: older saves load with empty tablet slot and no charge errors.
- UI: tooltip and slot badge show charges.

# Validation
- npm run tests
- npm run lint
- npm run typecheck

# Risks & rollback
- What can break: save migrations for equipment/charges; action loop consuming charges incorrectly.
- How to detect regressions: unit/integration tests + manual offline simulation.
- Rollback plan: revert schema changes and remove tablet slot from UI (keep old saves compatible).

# Report
- Added Tablet equipment slot, slot icon, and moved Invocation Tablet to the Tablet slot.
- Added charge tracking in equipment state, charge depletion on actions, and removal at 0.
- Surfaced charges in equipment slot badge and inventory detail row; tests cover charges and UI.
- Validation not run yet.

# Estimate
- Size: M
- Drivers:
  - Unknowns: tablet item definitions/assets; migration edge cases.
  - Integration points: core types/state, persistence, UI panels.
  - Migration/rollback risk: medium (schema update).

# Notes
