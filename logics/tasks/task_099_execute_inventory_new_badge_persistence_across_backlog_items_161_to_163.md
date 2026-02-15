## task_099_execute_inventory_new_badge_persistence_across_backlog_items_161_to_163 - Execute inventory NEW badge persistence across backlog items 161 to 163
> From version: 0.9.31
> Understanding: 95%
> Confidence: 88%
> Progress: 0%
> Complexity: Medium
> Theme: UX / Persistence
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_161_req048_add_inventory_badge_state_to_save_contract_and_migrations.md`
- `logics/backlog/item_162_req048_wire_inventory_new_badges_to_persisted_state_and_remove_localstorage_source_of_truth.md`
- `logics/backlog/item_163_req048_legacy_badge_state_import_and_regression_tests.md`

Request reference:
- `logics/request/req_048_persist_inventory_new_item_badges_in_save.md`

This task moves inventory "NEW item" badge state from device-local storage into the persisted save payload so it survives reload, export/import, and cloud sync, without flooding existing players with NEW badges after upgrade.

# Decisions (v1)
- Persist two seen sets in save:
  - per-item: `seenItemIds`
  - menu-level: `seenMenuIds`
- Persisted save payload is the single source of truth for badge state.
- Legacy `localStorage` is only used for one-time migration (if present), then ignored.
- Final delivery requires tests covering serialization + upgrade invariants.

# Plan
- [ ] 1. Execute `item_161` (schema + migrations):
  - Add persisted badge state fields to the save contract.
  - Implement safe defaults + normalization/migrations.
- [ ] 2. Execute `item_162` (runtime wiring):
  - Compute NEW badges from inventory ownership + persisted seen sets.
  - Ensure mark-seen updates game state (persisted), not `localStorage`.
- [ ] 3. Execute `item_163` (legacy import + regression tests):
  - One-time legacy import when save has no badge state.
  - Add tests for round-trip + upgrade behavior + “no flood of NEW”.
- [ ] FINAL: Update related Logics docs (request/backlog/task alignment)

# Validation
Final gate (mandatory at task end):
- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:tests`
- `npm run test:ci`

