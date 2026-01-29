## task_024_tablet_equipment_slot_and_charges - Tablet equipment slot and charges
> From version: 0.8.11
> Understanding: 92%
> Confidence: 88%
> Progress: 0%

# Context
Derived from `logics/backlog/item_022_tablet_equipment_slot_and_charges.md`

# Plan
- [ ] 1. Extend equipment slot enums/types with Tablet and place slot after Weapons in UI.
- [ ] 2. Add tablet item definitions (IDs, metadata, icons/placeholder).
- [ ] 3. Add tablet charges to state/save schema + migrations.
- [ ] 4. Implement charge depletion on completed actions (incl. offline catch-up) and removal at 0.
- [ ] 5. Surface charges in tooltip and equipment slot badge.
- [ ] 6. Add tests for depletion, persistence, and UI display.
- [ ] FINAL: Update related Logics docs if scope changes.

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

# Estimate
- Size: M
- Drivers:
  - Unknowns: tablet item definitions/assets; migration edge cases.
  - Integration points: core types/state, persistence, UI panels.
  - Migration/rollback risk: medium (schema update).
